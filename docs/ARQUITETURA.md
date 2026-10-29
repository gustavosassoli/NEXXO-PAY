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

---

## 5. Arquitetura Web3 & Conexão de Carteira (Etapa W7)

### 5.1 Registro Extensível de Redes e Ativos (`src/config/chains.ts`, `src/config/assets.ts`)

A arquitetura Web3 do NEXO PAY adota um registro central e extensível de redes e ativos, isolando configurações de rede e contratos:

- **Rede MVP:** Polygon PoS (Chain ID `137`, com RPC configurável via `VITE_POLYGON_RPC_URL` ou fallback público).
- **Ativo MVP:** USD Coin nativo da Polygon (símbolo `USDC`, contrato `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`, 6 decimais — não o bridged USDC.e).
- **Ativos Reservados:** USDT e ETH permanecem no registro com `enabled: false` e badge "Em breve" na interface.

#### Invariante de Código:
> **O Chain ID `137` e o endereço do contrato do USDC nativo na Polygon (`0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`) NUNCA devem ser codificados de forma literal fora de `src/config/`.**  
> Todo o resto do aplicativo (telas, serviços, componentes, utilitários) consome `POLYGON_CHAIN_ID` de `src/config/chains` e `getAsset()` / `getEnabledAssets()` de `src/config/assets`.

#### Como Adicionar uma Nova Rede (ex.: Arbitrum, Base, Optimism):
1. **Definir no registro de redes (`src/config/chains.ts`):**
   ```typescript
   export const ARBITRUM_CHAIN_ID = 42161;
   export const CHAINS: Record<number, ChainConfig> = {
     // ...
     [ARBITRUM_CHAIN_ID]: {
       id: ARBITRUM_CHAIN_ID,
       name: 'Arbitrum One',
       shortName: 'Arbitrum',
       nativeSymbol: 'ETH',
       rpcUrl: import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
       explorerUrl: 'https://arbiscan.io',
       enabled: true,
     },
   };
   ```
2. **Associar os endereços de contrato dos tokens em `src/config/assets.ts`:**
   ```typescript
   ASSETS.USDC.addresses[ARBITRUM_CHAIN_ID] = getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831');
   ```
3. O cliente Wagmi (`src/config/wagmi.ts`) e o `RealBalanceService` derivam automaticamente as redes ativas através de `getEnabledChains()`, sem necessidade de refatoração na UI.

---

### 5.2 Modelo Econômico de Taxas (Fee Model & Gas Sponsorship)

No fluxo de conversão Pix para cripto, a experiência do usuário elimina a barreira do gás nativo:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          Total em USDC Pago                            │
│  ┌───────────────────────┬──────────────────────┬───────────────────┐  │
│  │    Cotação Pix BRL    │   Taxa de Serviço    │   Taxa de Rede    │  │
│  │    (ex: 24,908 USDC)  │   (ex: 0,320 USDC)   │ (ex: 0,165 USDC)  │  │
│  └───────────────────────┴──────────────────────┴───────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Total Unificado em USDC:**
   - O usuário paga 100% da operação em USDC.
   - O usuário **NÃO precisa ter saldo de POL** (token nativo da Polygon) para cobrir gas.
2. **Patrocínio de Gás por Relayer (Nas etapas de execução):**
   - Um serviço relayer (ex.: meta-transações ERC-2771 / EIP-712 ou ERC-3009 `transferWithAuthorization` ou Paymaster ERC-4337) paga a taxa de gas nativa da rede em POL.
   - O relayer se reembolsa a partir da parcela `networkFee` em USDC já descontada no montante total autorizado pelo usuário.

---

### 5.3 Regras de Segurança e Invariantes da W7

1. **Somente Leitura (Read-Only Protocol):**
   - A etapa W7 executa unicamente chamadas `readContract` (`balanceOf`) e listeners de conexão de carteira via Wagmi/viem.
   - Nenhuma função de escrita (`sendTransaction`, `writeContract`), aprovação (`approve`) ou assinatura de mensagem/dados (`signMessage`, `signTypedData`) é chamada.
2. **Sem Custódia e Sem Chaves:**
   - O app não armazena, solicita nem processa chaves privadas ou seed phrases. A custódia permanece 100% com a carteira externa do usuário (MetaMask, Rainbow, Coinbase Wallet, etc.).
3. **Observador de Troca de Carteira/Rede (`PaymentWalletWatcher`):**
   - Se o usuário trocar a conta ativa ou mudar para uma rede diferente durante o estado `QUOTED`, a cotação é cancelada imediatamente com uma notificação discreta (toast: *"A cotação foi cancelada porque a conta ou rede da carteira foi alterada."*).
   - Estados posteriores à cotação (`CRYPTO_CONFIRMED`, `PAYING_PIX`, etc.) não são interrompidos pelo watcher para proteger transações ativas.
4. **Mapeamento Calmo de Erros Web3:**
   - Erros do provedor de carteira (como código `4001` de cancelamento de solicitação pelo usuário) recebem tratamento neutro e acolhedor (*"Conexão cancelada na carteira."*), sem alarmes ou jargões técnicos.
5. **Polled Balance Sync:**
   - O saldo do ativo ativo é sincronizado automaticamente a cada 30 segundos, ao reconectar, e em eventos de foco da janela (`focus`) e retorno de visibilidade (`visibilitychange`).

