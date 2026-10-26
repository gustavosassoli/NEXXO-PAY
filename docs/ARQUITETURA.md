# NEXO PAY — Arquitetura de Pagamentos (Etapa W6)

Documento técnico de arquitetura para desacoplamento de domínio, eliminação de ponto flutuante financeiro, injeção de serviços e integração de provedores reais (Web3, Backend e Pix).

---

## 1. Diagrama da Máquina de Estados (State Machine)

A máquina de estados modela o ciclo de vida rigoroso de uma transição de pagamento Pix financiada com criptomoedas:

```text
                  [ Leitura do BR Code Pix ]
                              │
                              ▼
                         ┌─────────┐
                         │ CREATED │
                         └────┬────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
          ┌─────────┐                   ┌─────────┐
          │ QUOTED  │                   │ FAILED* │
          └────┬────┘                   └─────────┘
               │ (45s expira)
               ├─────────────────────────────┐
               ▼                             ▼
     ┌──────────────────┐               ┌─────────┐
     │ AWAITING_CRYPTO  │               │ EXPIRED*│
     └─────────┬────────┘               └─────────┘
               │
               ▼
     ┌──────────────────┐
     │ CRYPTO_CONFIRMED │
     └─────────┬────────┘
               │
               ├─────────────────────────────┐
               ▼                             ▼
        ┌─────────────┐                ┌───────────┐
        │ PAYING_PIX  │                │ REFUNDING │
        └──────┬──────┘                └─────┬─────┘
               │                             │
       ┌───────┴───────┐              ┌──────┴──────┐
       ▼               ▼              ▼             ▼
 ┌───────────┐  ┌─────────────┐ ┌───────────┐ ┌─────────┐
 │ COMPLETED*│  │ PIX_PENDING │ │ REFUNDED* │ │ FAILED* │
 └───────────┘  └──────┬──────┘ └───────────┘ └─────────┘
                       │              ▲
                       └──────────────┘ (apenas em falha confirmada)

(*) Estados terminais / finais (sem transições de saída).
```

### Regras de Transição e Invariantes Críticas

| Estado Origem | Transições Permitidas | Descrição / Condição |
| :--- | :--- | :--- |
| **CREATED** | `QUOTED`, `FAILED` | Cobrança Pix reconhecida e primeira cotação solicitada. |
| **QUOTED** | `AWAITING_CRYPTO`, `EXPIRED`, `FAILED` | Reserva de 45s ativa. O usuário clica em Confirmar ou a reserva expira. |
| **AWAITING_CRYPTO** | `CRYPTO_CONFIRMED`, `EXPIRED`, `FAILED` | Carteira do usuário acionada para assinatura do débito do token. |
| **CRYPTO_CONFIRMED** | `PAYING_PIX`, `REFUNDING` | Débito on-chain confirmado; pronto para liquidar Pix ou estornar caso falhe o pré-envio. |
| **PAYING_PIX** | `COMPLETED`, `PIX_PENDING`, `REFUNDING` | Requisição submetida ao PSP/Banco Central. |
| **PIX_PENDING** | `COMPLETED`, `REFUNDING` | Status incerto, fila de liquidação ou timeout de rede. |
| **REFUNDING** | `REFUNDED`, `FAILED` | Estorno do token cripto para a carteira do usuário. |
| **COMPLETED** | *(Terminal)* | Liquidação finalizada com comprovante Pix emitido. |
| **REFUNDED** | *(Terminal)* | Estorno devolvido ao usuário com hash on-chain comprovado. |
| **EXPIRED** | *(Terminal)* | Cotação expirada sem confirmação. |
| **FAILED** | *(Terminal)* | Erro irrecuperável antes do débito de ativos. |

### Regra de Segurança Inegociável (Anti-Duplo Gasto)
> **`REFUNDING` só é atingível após confirmação definitiva de falha na liquidação do Pix.**  
> Se a comunicação com a API do PSP ou SPI/Banco Central sofrer timeout, interrupção ou resposta ambígua, o sistema transiciona **obrigatoriamente para `PIX_PENDING`**, jamais para `REFUNDING`.  
> *Motivo financeiro:* Um estorno antecipado enquanto o Pix ainda pode ser liquidado geraria duplicidade de perda patrimonial para o protocolo.

---

## 2. Eliminação de Ponto Flutuante em Dinheiro

Todas as variáveis financeiras utilizam inteiros matemáticos exatos:

1. **BRL (Real Brasileiro):**  
   - Armazenado estritamente como **centavos inteiros** (`number` inteiro: `amountCents`, `chargeBrlCents`, `totalFeesBrlCents`).  
   - Exemplo: `R$ 128,40` = `12840`.  
   - Proibido o uso de `parseFloat`, `Math.round`, `toFixed` e multiplicações arbitrárias por 100 em código de negócio.
   - Tag 54 do Pix BR Code analisada com `parsePixAmountToCents()` via parsing puramente textual com expressão regular restritiva (`/^\d+(\.\d{1,2})?$/`). Rejeita 3 casas decimais, negativos, zero e pontuações inválidas.

2. **Criptoativos (Tokens):**  
   - Armazenados na **menor unidade atômica (BigInt)**:
     - **USDT / USDC:** 6 casas decimais ($10^6$ minimal units por token). Ex.: $25,393\text{ USDT} = 25\,393\,000\text{n}$.
     - **ETH:** 18 casas decimais ($10^{18}$ wei por token). Ex.: $0,00990\text{ ETH} = 9\,900\,000\,000\,000\,000\text{n}$.
   - Divisões aritméticas utilizam arredondamento simétrico no ponto médio:  
     $$\text{units} = \frac{\text{brlMillicents} \times \text{displayScale} + \frac{\text{rate}}{2}}{\text{rate}}$$

---

## 3. Contratos de Serviços (`src/services/types.ts`)

```typescript
export interface QuoteService {
  getQuote(
    amountCents: number,
    asset: PaymentAsset,
    now?: () => number
  ): Promise<PaymentQuote>;
  invalidate(amountCents: number, asset: PaymentAsset): void;
  clearCache(): void;
}

export interface BalanceService {
  getBalance(asset: PaymentAsset): Promise<bigint>;
  hasSufficientBalance(amountUnits: bigint, asset: PaymentAsset): Promise<boolean>;
  formatBalance(asset: PaymentAsset): Promise<string>;
}

export interface PaymentService {
  create(
    pixData: PaymentPixData,
    asset: PaymentAsset,
    now?: () => number
  ): Promise<Payment>;
  confirm(paymentId: string, now?: () => number): Promise<Payment>;
  get(paymentId: string): Promise<Payment | undefined>;
  subscribe(paymentId: string, listener: (payment: Payment) => void): () => void;
  reset(): void;
}

export interface ServicesContainer {
  quoteService: QuoteService;
  balanceService: BalanceService;
  paymentService: PaymentService;
}
```

---

## 4. Guia de Migração: Mock para Produção Real

Para alternar a aplicação do modo mock para o modo de produção, altere em `src/config.ts`:
```typescript
export const SERVICES_MODE: 'mock' | 'real' = 'real';
```

Em `src/services/index.tsx`, plugue as implementações de infraestrutura:

```text
┌────────────────────────────────────────────────────────┐
│                      NEXO PAY UI                       │
│     (ReviewPaymentScreen, ProcessingScreen, etc.)      │
└──────────────────────────┬─────────────────────────────┘
                           │ Consome via useServices()
                           ▼
┌────────────────────────────────────────────────────────┐
│                    ServicesContext                     │
└──────────────┬───────────────────┬─────────────────────┘
               │                   │
    [SERVICES_MODE: 'mock']   [SERVICES_MODE: 'real']
               │                   │
               ▼                   ▼
       ┌───────────────┐   ┌─────────────────────────────┐
       │ Mock Services │   │   1. RealBalanceService     │
       │  (Em memória) │   │      (viem / wagmi / ethers)│
       └───────────────┘   │   2. RealQuoteService       │
                           │      (Orderbook / Dex Agg)  │
                           │   3. RealPaymentService     │
                           │      (Backend Gateway / PSP)│
                           └─────────────────────────────┘
```

### Onde plugar cada integração:

1. **Carteira & Web3 (`RealBalanceService` & Assinatura de Transações):**
   - **Localização:** Criar `src/services/real/RealBalanceService.ts`.
   - **Biblioteca recomendada:** `viem` + `wagmi` ou `@solana/web3.js` dependendo da rede alvo.
   - **Métodos:**
     - `getBalance(asset)`: consulta `balanceOf(userAddress)` diretamente do smart contract ERC-20 (USDT/USDC) ou saldo de ETH (`getBalance`).
     - No momento do `confirm()`, aciona `walletClient.sendTransaction()` ou `writeContract({ functionName: 'transfer' })`.

2. **Cotação em Tempo Real (`RealQuoteService`):**
   - **Localização:** Criar `src/services/real/RealQuoteService.ts`.
   - **Integração:** API REST ou WebSocket com oráculo/formador de mercado (ex.: Binance API, CoinGecko Pro, 1inch Spot API ou backend proprietário Nexo).
   - Mantém o cache de 45 segundos e calcula o slippage tolerance garantido.

3. **Backend & Provedor Pix (`RealPaymentService`):**
   - **Localização:** Criar `src/services/real/RealPaymentService.ts`.
   - **Integração:** Gateway de pagamento via Pix Dict / API Pix Bacen (ex.: Stark Bank, Celcoin, Ebanx, Itaú / Banco do Brasil Pix).
   - **Eventos em Tempo Real:** Conectar o método `subscribe()` a uma conexão WebSocket ou Server-Sent Events (SSE) `/api/payments/{id}/events`.
   - Conforme o backend recebe o webhook do Banco Central (`PIX_RECEBIDO`, `PIX_LIQUIDADO`), despacha a transição para a máquina de estados local.
