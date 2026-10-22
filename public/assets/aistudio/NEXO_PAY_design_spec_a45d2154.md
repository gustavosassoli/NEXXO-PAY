# NEXO PAY: especificação de design para o app Android

Fonte: protótipo React/CSS do NEXO PAY. Este arquivo descreve o design com medidas exatas para ser recriado em Kotlin + Jetpack Compose. As imagens de referência (pasta `capturas/`) mostram o resultado esperado de cada tela; quando houver dúvida entre texto e imagem, vale a imagem.

## 0. Regras de fidelidade

- 1 px do protótipo = 1 dp. Tamanhos de texto em px = sp. Largura de referência: 390 dp; o layout é fluido (largura total, margem lateral de 20 dp) e funciona de 360 a 412 dp.
- Tema único, escuro. Cores, raios, espaçamentos e fontes exatamente como abaixo. Nada de Material You, cores dinâmicas ou componentes Material com estilo padrão: use `MaterialTheme` só como base e substitua cores, formas e tipografia pelos tokens deste arquivo.
- Fonte: Inter (400, 500, 600, 700, 800). Incluir em `res/font` ou como fonte baixável do Google Fonts.
- Ícones: os 33 ícones do apêndice, desenhados em 24x24, traço de 1.8, pontas e junções arredondadas, sem preenchimento, cor herdada do texto. Não substituir por Material Icons.
- **Piso de texto (`MIN_TEXT_SP`)**: o protótipo usa fontes de 7 a 10 px, pequenas demais para Android. Regra padrão: qualquer texto menor que 11 sp é desenhado com 11 sp, mantendo pesos e cores. Se for pedido "idêntico ao protótipo", use `MIN_TEXT_SP = 0`. Deixe essa constante em um único lugar (`Dimens.kt`).
- Textos em português do Brasil, exatamente como escritos aqui, num arquivo `strings.xml`.
- Os dados são de exemplo (modo demonstração). Mantenha o selo "AMBIENTE DEMONSTRATIVO" onde aparece.
- Única correção de design permitida: na tela do leitor, a barra de navegação inferior cobre o último item da lista no protótipo. No app, o conteúdo dessa tela deve ter a mesma folga inferior das outras telas com barra (112 dp).

## 1. Tokens

### Cores

| Token | Valor | Uso |
| --- | --- | --- |
| bg | #0B1020 | Fundo de todas as telas |
| surface | #141C2F | Cartões, listas |
| surface2 | #182238 | Botão secundário, início do degradê do cartão de perfil |
| surface3 | #1D2942 | Ícones em caixa, aba ativa do seletor, bolinhas |
| accent | #36E0B5 | Cor principal (verde), botões, destaques |
| onAccent | #06231E | Texto e ícone sobre accent |
| text | #F5F7FA | Texto principal |
| muted | #929DB2 | Texto secundário |
| line | #A8B7D2 a 12% | Bordas e divisores (rgba(168,183,210,0.12)) |
| warning | #F3C969 | Avisos |
| danger | #EE6D78 | Erros, ações destrutivas |

Cores auxiliares usadas em pontos específicos:

| Valor | Onde |
| --- | --- |
| #070B15 | Fundo atrás do app (fora da tela) |
| #0D1425 | Trilho do seletor de ativos (USDT/USDC/ETH) |
| #121A2C | Fundo do bottom sheet |
| #060913 | Fundo da câmera |
| #B1BBCC | Rótulo "Saldo disponível" |
| #C3CADA | Valor em reais abaixo do saldo |
| #CBD2DF | Valor em dólar dos ativos pequenos |
| #69758B | Abas inativas da navegação e títulos de grupo ("HOJE") |
| #D5DCEC | Ícone de atividade de saída |
| #AD9CFF sobre rgba(133,112,237,0.12) | Ícone de atividade de conversão |
| #B7C3D7 | Texto do selo DEMONSTRATIVO |
| #D8C58D | Texto dos avisos amarelos |
| #A9B5C8 | Texto do cartão de informação |
| #AAB6CA | Tempo dos parceiros |
| #BCC5D5 | Título do estado vazio |
| #B6C0D2 | Ícones do menu do perfil |
| #243650 | Fundo do avatar do perfil |
| #263653 | Fundo do logo do parceiro |
| #303A4E / #AAB2C0 | Interruptor desligado (trilho / bolinha) |
| #3A4456 | Alça do bottom sheet |
| #F8FAFC / #0B1020 | QR de exemplo (fundo / módulos) |
| #1C8772 (texto #CFFFF3) | Moeda USDT |
| #2775CA (texto #D8EDFF) | Moeda USDC |
| #6658B5 (texto #E7E2FF) | Moeda ETH |

Transparências recorrentes do accent: 5%, 6%, 7%, 8%, 9%, 10% (fundos de ícones e cartões), 25% a 45% (bordas). Do warning: 7% (fundo), 15% (borda), 8% e 20% (ícone de pendente). Do danger: 8% (fundo) e 20% (borda).

### Raios

8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 25, 28 dp conforme cada componente; "pílula" = 100 dp.

### Sombras e brilhos

- Cartão de saldo: sombra 0/22/45, preto a 19%.
- Botão primário: sombra 0/10/25, accent a 12%.
- Ação rápida primária: 0/12/28, accent a 15%.
- Aba Pagar da barra inferior: 0/8/25, accent a 25%.
- Brilho do cartão de saldo: círculo de 180 dp, accent a 8%, desfocado, canto superior direito (right -60, top -70).

### Tipografia (Inter)

Pesos: 400 texto, 600 destaque médio, 650 título da barra superior, 700 negrito, 800 marca e moedas. Valores grandes usam espaçamento de letras negativo (em: -0.045 no saldo, -0.04 no valor da cobrança).

| Uso | Tamanho | Peso |
| --- | --- | --- |
| Saldo (início e carteira) | 32 / 31 | 700, -0.045em |
| Valor da cobrança, resultado | 29 / 31 | 700, -0.04em |
| Valor do ativo (detalhe) | 25 | 700 |
| Valor do detalhe da atividade | 28 | 700 |
| Título de tela (h1) | 20 a 22 | 700 |
| Título de seção (h2) | 16 | 700, -0.02em |
| Título da barra superior | 15 | 650 |
| Marca "NEXO PAY" | 15 | 800, +0.12em |
| Nome do recebedor | 15 | 700 |
| Texto de linha (nome, rótulo de dado) | 10 a 11 | 400 a 600 |
| Texto secundário | 8 a 10 | 400 |

Com o piso `MIN_TEXT_SP = 11`, todo valor abaixo de 11 vira 11.

### Espaçamento

- Tela: margem lateral 20, topo 20, base 36 (112 nas telas com barra inferior). Fundo da tela: cor bg com um degradê vertical de rgba(27,39,66,0.2) para transparente nos primeiros 180 dp.
- Espaço entre seções: 21 a 29 dp (ver cada tela).

## 2. Componentes

**Marca (Brand)**: quadrado 27x27, raio 9, fundo accent; dentro, duas barras escuras (#0B1020), 17x5, raio 5, giradas 42°: a primeira em left 2, top 8; a segunda em left 8, top 14. Ao lado, o texto "NEXO" em text e "PAY" em accent, 15 sp, 800, +0.12em. Versão compacta (nas barras superiores): só o quadrado, 32x32.

**Botão**: altura mínima 51, raio 16, texto 12 sp 700 centralizado, ícone opcional de 18 antes do texto (espaço 9), toque reduz a escala para 0.985.
- Primário: fundo accent, texto onAccent, sombra do token.
- Secundário: fundo surface2, texto text, borda line.
- Fantasma: transparente, texto muted.
- Perigo: fundo danger, texto branco.
- Largura total por padrão.

**Botão de ícone**: 40x40 (36x36 nas barras superiores), raio 13, borda line, fundo rgba(20,28,47,0.8).

**Barra superior**: altura 47, três colunas 44 / 1fr / 44, margem inferior 18. Esquerda: botão voltar (ícone `back`) ou a marca compacta. Centro: título 15 sp 650. Direita: ação opcional (ícone).

**Barra inferior**: altura 82, padding 10/13/15, borda superior line, fundo rgba(11,16,32,0.95) com desfoque de 18, cinco colunas iguais. Cada item: ícone 21 numa caixa de 31 dp de altura e rótulo de 9 sp (piso aplicado). Inativo #69758B; ativo accent. Itens: Início (`home`), Carteira (`wallet`), Pagar (`scan`), Atividade (`activity`), Perfil (`user`). A aba Pagar tem o ícone numa caixa 50x50, raio 17, fundo accent, ícone onAccent, deslocada 25 dp para cima, com a sombra do token; o rótulo dela sobe 24 dp. A barra aparece nas telas Início, Carteira, Pagar (leitor), Atividade e Perfil.

**Selo demonstrativo (DemoBadge)**: texto "AMBIENTE DEMONSTRATIVO", 8 sp 700, +0.09em, cor #B7C3D7, borda line, fundo branco a 2.5%, pílula, padding 5/8.

**Cartão (surface)**: borda line, fundo surface, raio 18. Lista (list-card): raio 19, bordas internas line entre itens.

**Linha de dado (DataRow)**: altura mínima 36, texto 10 sp, rótulo em muted e valor em 600 alinhado à direita, espaço 20. Variante forte: altura 52, rótulo 13 sp, valor em accent 15 sp.

**Aviso (warning)**: ícone `shield` 19 + texto 9 sp, entrelinha 1.5, padding 13, raio 15, texto #D8C58D, fundo warning a 7%, borda warning a 15%. **Info**: ícone + texto #A9B5C8, fundo rgba(66,107,166,0.08), borda rgba(105,137,186,0.12), margem vertical 15.

**Seletor de ativos (segmentado)**: três botões iguais num trilho #0D1425, padding 4, raio 15; botão altura 37, raio 11, texto 10 sp 600 muted; ativo: fundo surface3, texto text, sombra 0/4/10 preto a 15%.

**Moeda (coin)**: círculo 34 (57 no detalhe do ativo) com a inicial do código em 12 sp 800 (19 no grande), cores da tabela de cores auxiliares.

**Item de atividade**: padding 14, três colunas 39 / 1fr / auto, espaço 11. Ícone 39x39, raio 13, fundo surface3. Título 11 sp 600; abaixo, "{detalhe} · {data}" 8 sp muted. À direita, valor 11 sp 600 e quantidade cripto 8 sp muted, alinhados à direita. Tons: saída (padrão), entrada (ícone accent sobre accent a 10%), conversão (roxo da tabela).

**Linha do tempo (Processando)**: cartão raio 20, padding 15; cada etapa altura mínima 57, bolinha 29 dp e texto; linha vertical de 1 dp (line) ligando as bolinhas, exceto na última. Estados: pendente (bolinha com número, borda line, texto muted), atual (borda accent, número accent, halo de 4 dp accent a 8%, título accent), concluída (bolinha accent com `check` 14 em onAccent).

**Bottom sheet de confirmação**: fundo escurecido rgba(2,5,11,0.78) com desfoque 4; sheet #121A2C, raios 25/25/0/0, borda line, padding 10/22/25, centralizado: alça 38x4 (#3A4456, margem inferior 23), caixa de ícone 54x54 raio 17 (fundo warning a 8%, ícone `shield` 26 warning), título 18 sp "Confirmar ação" (margem 14/7), texto 10 sp muted entrelinha 1.6 (margem lateral 12, inferior 20), botão perigo com o nome da ação, botão fantasma "Cancelar". Entrada: sobe de baixo em 250 ms (ease-out).

**Interruptor**: 40x23, padding 3, raio pílula; desligado: trilho #303A4E, bolinha #AAB2C0; ligado: trilho accent, bolinha #092720 deslocada 17 dp; transição 200 ms.

## 3. Animações

| Elemento | Animação |
| --- | --- |
| Linha de varredura do leitor | Desloca de -86 dp a +86 dp no eixo vertical e volta, 2 s, ease-in-out, repetindo; opacidade 0.35 a 1 |
| Spinner do processamento | Gira 360° em 1.2 s, linear, repetindo |
| Bottom sheet | Sobe de baixo, 250 ms, ease-out |
| Botões e interruptor | Transição de 200 ms |
| Etapas do processamento | Avançam uma a cada 1.1 s |
| "Endereço copiado" | Volta ao normal depois de 1.6 s |

## 4. Telas

Fluxo de navegação: Início → Pagar (leitor) → Revisar pagamento → Processando → Resultado → Início. Pelas abas: Início, Carteira, Pagar, Atividade, Perfil. De Início: "Receber cripto" → Receber; "Adicionar fundos" → Adicionar fundos; "Ver carteira" → Carteira; "Ver todas" → Atividade; cartão de ativo → Detalhe do ativo; item de atividade → Detalhe da atividade; avatar → Perfil. De Carteira: Receber → Receber; Enviar → Adicionar fundos; ativo → Detalhe do ativo. Voltar: Detalhe do ativo, Adicionar fundos e Receber voltam para Carteira; Detalhe da atividade volta para Atividade; Leitor volta para Início; Revisar volta para o Leitor.

### 4.1 Início (`01-inicio`)

1. Cabeçalho (margem 4/0/22): à esquerda a marca completa e, abaixo (margem 12), "Olá, Gustavo" 14 sp muted. À direita, botão de ícone `bell` com ponto accent de 6 dp (borda 2 dp surface) em top 8, right 9, e avatar 42x42, raio 14, borda accent a 25%, degradê 135° #253753 para #142131, texto "GM" accent 700 (abre o Perfil).
2. Cartão de saldo: altura mínima 207, padding 22, raio 24, degradê 145° #192640 para #11192B, borda rgba(124,153,195,0.16). Linha: "Saldo disponível" 13 sp #B1BBCC e à direita o ícone `eye` (18) que alterna para `eyeOff` e esconde os valores ("US$ ••••••", "R$ ••••••"). Valor "US$ 1.284,50" (margem superior 17). Abaixo "≈ R$ 6.622,60" 14 sp #C3CADA seguido de "cotação estimada" 10 sp muted. Rodapé fixo a 19 da base e 22 dos lados, com borda superior line e padding superior 15: ponto accent de 6 dp com brilho + "Carteira protegida" 10 sp muted, e à direita o selo demonstrativo.
3. Ações rápidas (margem 14/0/29): grade 1.25 / 1 / 1, espaço 10; cada cartão altura mínima 102, padding 12/8, raio 18, fundo surface, borda line, conteúdo centralizado em coluna (espaço 9): caixa de ícone 37x37 raio 12 (ícone accent, fundo accent a 8%) e rótulo 10 sp 600. "Pagar com Pix" (`scan` 24) é o primário: fundo e borda accent, texto e ícone #05211D, rótulo 11 sp, caixa do ícone rgba(7,39,35,0.1). "Receber cripto" (`arrowDown` 22), "Adicionar fundos" (`plus` 22).
4. "Seus ativos" (título 16 sp) com "Ver carteira" à direita (accent 11 sp). Três cartões iguais, espaço 9, margem inferior 29: padding 12/11, raio 17, fundo surface, borda line; moeda à esquerda; código (11 sp 700) e nome (8 sp muted); embaixo o valor em dólar, 9 sp 700 #CBD2DF.
5. "Atividade recente" com "Ver todas": lista com as três primeiras atividades.

### 4.2 Leitor / Pagar com Pix (`03` a `07`)

Barra superior: voltar, título "Pagar com Pix", botão de ícone `help`. Abaixo (centralizado, margem 15) aviso em warning 9 sp com ícone `info` 15: "Protótipo demonstrativo — a câmera não é acessada".

Área da câmera: altura 385, raio 25, fundo #060913, borda line, conteúdo centralizado. Camada de fundo: círculo radial em 60%/30% de #273345 para transparente até 40%, sobre degradê 155° #17202E para #05070D, opacidade 0.8 (no estado de permissão, desfocado em 7). Moldura central 228x228, raio 28, borda branca a 10%, com quatro cantos de 45x45 em accent, traço 3, cantos externos de raio 24, deslocados -2. Estado "câmera ativa": linha de varredura (left/right 10, 1 dp, accent com brilho 11). Estado "código identificado": círculo accent 66 com `check` 32 em #08231F e halo de 12 dp accent a 10%. Botão "Lanterna" (ícone `flash` 18) a 18 da base: pílula, borda branca a 18%, fundo rgba(9,14,25,0.65), desfoque 8, 10 sp, padding 8/13; ao tocar, o estado vira "câmera ativa".

Texto abaixo (centralizado, padding 20/20/15): título 16 sp 700 e subtítulo 11 sp muted (margem superior 6):

| Estado | Título | Subtítulo |
| --- | --- | --- |
| Permissão | Permissão da câmera | Precisamos de acesso à câmera para ler o QR Code Pix. |
| Ativa | Câmera ativa | Aponte a câmera para o QR Code Pix |
| Identificado | Código identificado | Cobrança Pix reconhecida com segurança. |
| Inválido | Código inválido | Este código parece estar incompleto ou expirado. |
| Não reconhecido | QR Code não reconhecido | Não identificamos uma cobrança Pix neste código. |

Botões: no estado de permissão, botão primário "Continuar demonstração". No identificado, primário "Revisar pagamento" (vai para Revisar). Nos demais, uma linha com botão secundário "Simular leitura válida" (ícone `scan`, ocupa o espaço restante) e o botão pequeno "Testar erro" (altura 51, raio 13, borda line, texto muted 9 sp, padding 11) que alterna entre Inválido e Não reconhecido.

Alternativas (margem 15, borda superior line, padding superior 9): duas linhas, colunas 30 / 1fr / 20, espaço 8, padding 11/3, texto muted. Ícone `keyboard`, "Inserir código Pix" (11 sp, cor text) e "Copia e cola" (9 sp); ícone `image`, "Selecionar da galeria" e "Importe uma imagem"; ícone `chevron` à direita. (Sem ação nesta versão.)

### 4.3 Revisar pagamento (`08` a `10`)

Barra: voltar, "Revisar pagamento". Selo demonstrativo centralizado (margem inferior 17). Recebedor: caixa 52x52 raio 17 (fundo accent a 10%, ícone `store` 25 accent), "Você está pagando para" 9 sp muted, "Mercado Vila Nova" 15 sp 700, "Comercial Vila Nova LTDA" 9 sp muted. Cartão de dados (padding 9/15): CNPJ "12.***.***/0001-45"; Instituição "Banco Parceiro S.A."; Descrição "Compra balcão 1842"; Data "Hoje, 10:48". Valor: "Valor da cobrança" 10 sp muted e "R$ 128,40" (padding 22/0/18, centralizado). Aviso: "Confira o recebedor e os valores antes de continuar. Esta é uma simulação." (margem inferior 23). Título "Você pagará com" e o seletor USDT / USDC / ETH (USDT selecionado). Cartão de pagamento (margem inferior 8), linhas:

| Rótulo | USDT / USDC | ETH |
| --- | --- | --- |
| Saldo em {ativo} | 850,00 USDT / 334,50 USDC | 0,039 ETH |
| Cotação utilizada | 1 {ativo} = R$ 5,155 | 1 ETH = R$ 13.218,00 |
| Valor convertido | 24,908 {ativo} | 0,00971 ETH |
| Taxa de conversão | R$ 1,28 | R$ 1,28 |
| Taxa de rede | R$ 0,42 | R$ 0,42 |
| Tarifa do serviço | R$ 0,80 | R$ 0,80 |

Divisor e linha forte "Total estimado": 25,393 {ativo} (ETH: 0,00990 ETH). Nota 8 sp muted centralizada: "A cotação é reservada por 45 segundos e pode variar até a confirmação." Botão primário com ícone `lock`: "Confirmar pagamento" (vai para Processando).

### 4.4 Processando (`11`, `12`)

Barra: marca compacta à esquerda, título "Processando" (sem voltar). Selo demonstrativo. Visual (altura 150, centralizado): spinner 78 (borda 2 surface3, topo accent, brilho accent a 8%); concluído: anel 78 com borda accent 2, fundo accent a 7% e `check` 34 accent. Título 20 sp: "Estamos cuidando de tudo" (concluído: "Simulação concluída"); subtítulo 10 sp muted: "Não feche o aplicativo durante a simulação." (concluído: "Veja como seria o estado após a confirmação dos provedores."). Linha do tempo com 5 etapas: Verificando a cobrança Pix; Solicitando autorização da carteira; Processando a conversão; Enviando o pagamento Pix; Confirmando a liquidação. Subtítulos: "Concluída na simulação", "Em andamento...", "Pendente". Cartão de informação com ícone `clock`: "O tempo de processamento pode variar conforme a rede e os serviços parceiros." Ao concluir, botão primário "Ver resultado demonstrativo".

### 4.5 Resultado (`13` a `16`)

Centralizado, padding superior 35. Selo demonstrativo (margem inferior 27). Ícone circular 84 (margem inferior 18) com ícone 38: confirmado `check` accent (fundo accent a 10%, borda accent a 25%, brilho); pendente `clock` warning (fundo a 8%, borda a 20%); recusado `close` danger; expirado `clock` danger. Título 21 sp, texto 10 sp muted, e "Resultado demonstrativo" 8 sp warning:

| Estado | Título | Texto |
| --- | --- | --- |
| Confirmado | Pagamento confirmado | A confirmação Pix foi recebida. |
| Pendente | Pagamento pendente | Aguardando confirmação do provedor. |
| Recusado | Pagamento recusado | A autorização não pôde ser concluída. |
| Expirado | Cobrança expirada | O prazo deste QR Code terminou. |

Valor (margem 24/0/18): "Mercado Vila Nova" 9 sp muted; "R$ 128,40" 31 sp; "25,393 USDT debitados" 9 sp muted. Cartão de recibo (alinhado à esquerda, padding 10/15): Valor convertido "24,908 USDT"; Taxas totais "0,485 USDT"; Data e horário "18 jun 2025, 10:49"; ID cripto "0x8F2A...91C4"; End-to-End Pix "E000...4X9P". Nota com ícone `info` 17: "A referência cripto e a confirmação Pix são identificadores distintos." Botões: secundário com `file` "Ver comprovante"; primário "Voltar ao início" (espaço 9). Rodapé do protótipo: "Pré-visualizar estados" com quatro chips ("Confirmado", "Pendente", "Recusado", "Expirado"; borda line, raio 8, 7 sp, ativo em accent), mantidos só no modo demonstração.

### 4.6 Carteira (`17`)

Barra: marca compacta, título "Carteira", ação `settings`. Total centralizado (padding 15/0/25): "Patrimônio total" 10 sp muted, "US$ 1.284,50" 31 sp, "≈ R$ 6.622,60" 10 sp muted + "+1,8% hoje" accent (margem 5), selo demonstrativo (margem superior 12). Três ações (grade igual, espaço 10, margem inferior 28): caixa 45x45 raio 15 (ícone accent, fundo accent a 9%) e rótulo 10 sp 700: Receber (`arrowDown`), Enviar (`arrowUp`), Trocar (`swap`). "Seus ativos" e lista (raio 20): linhas padding 15, colunas 39 / 1fr / auto / 17, espaço 10: moeda; código 11 sp 700 e quantidade 8 sp muted; valor em dólar 11 sp 700 e em reais 8 sp muted, alinhados à direita; `chevron` 17. Cartão de informação (`info` 18): "Valores de referência. Cotações podem variar entre os serviços parceiros."

| Código | Nome | Quantidade | Dólar | Reais | Cor |
| --- | --- | --- | --- | --- | --- |
| USDT | Tether | 850,00 USDT | US$ 850,00 | R$ 4.381,75 | verde |
| USDC | USD Coin | 334,50 USDC | US$ 334,50 | R$ 1.724,86 | azul |
| ETH | Ethereum | 0,039 ETH | US$ 100,00 | R$ 515,50 | roxo |

### 4.7 Detalhe do ativo (`18`)

Barra: voltar, "Tether", `settings`. Herói centralizado (padding 12/0/25): moeda grande com "T", "Saldo disponível" 9 sp muted, "850,00 USDT" 25 sp, "US$ 850,00 · R$ 4.381,75" 10 sp muted. Três ações como na Carteira. Cartão de mercado (surface, padding 16, raio 18, margem inferior 27): "Cotação de referência" 8 sp muted, "R$ 5,155" 17 sp 700, no canto superior direito "+0,12% hoje" accent 9 sp; gráfico de 8 barras de altura total 42, espaço 6, alturas 25%, 42%, 34%, 61%, 52%, 78%, 68%, 90%, cantos superiores 3, degradê accent para accent a 5%, opacidade 0.5. "Histórico" e lista com as 3 primeiras atividades. Aviso (margem superior 15): "Antes de enviar, confirme se o destino aceita USDT na rede selecionada. Transferências incompatíveis podem ser perdidas."

### 4.8 Adicionar fundos (`19`, `20`)

Barra: voltar, "Adicionar fundos". Selo. Introdução (margem 10/0/24): "Como deseja adicionar?" 22 sp 700 e "Escolha um serviço parceiro para comprar criptoativos." 10 sp muted. Parceiros (espaço 10): cartão raio 18, padding 14, colunas 42 / 1fr / 22; logo 40x40 raio 13 fundo #263653 com "N" accent 800; nome 11 sp 700; informação 8 sp muted; chip de tempo com `clock` 13, 8 sp #AAB6CA; círculo de seleção 20 (selecionado: fundo accent com `check` 14 em #05211D). Selecionado: borda accent a 45% e degradê 135° accent a 8% para surface. "Parceiro Alpha" / "Cartão ou Pix · taxa a partir de 1,8%" / "5–15 min" (selecionado por padrão); "Parceiro Orbit" / "Pix · taxa a partir de 1,2%" / "Até 10 min". Cartão de dados: Ativo a receber "USDT"; Rede "Polygon"; Disponibilidade "Demonstrativa". Aviso com `info`: "Taxas, limites e disponibilidade são definidos pelo parceiro e apresentados antes da compra." Botão primário "Continuar no parceiro". Nota: "Nenhuma compra real será iniciada neste protótipo."

### 4.9 Receber cripto (`21`, `22`)

Barra: voltar, "Receber cripto". Selo. Campo "Criptoativo" (rótulo 10 sp 600): seletor USDT / USDC / ETH. Campo "Rede": três botões (Polygon, Ethereum, Arbitrum), espaço 7, altura 38, raio 12, 9 sp, borda line, fundo surface; ativo com texto accent, borda accent a 35% e fundo accent a 6%. Cartão do QR (raio 22, padding 22/18/18, centralizado): QR 150x150, raio 14, fundo #F8FAFC, padding 13, grade 8x8 com espaço 2; célula preenchida (#0B1020, raio 1) quando `(i*7 + i%3) % 5 < 2` para i de 0 a 63. "Endereço de recebimento" 11 sp 700; endereço "0x71A4C8D205FA3E7819B4C04F" 9 sp muted, +0.04em, quebrando linha; botão accent (raio 12, padding 10/14, 9 sp 700) com `copy` 17 e "Copiar endereço", que por 1.6 s vira `check` e "Endereço copiado". Aviso: título "Envie apenas {ativo} pela rede {rede}" (9 sp 700) e "Ativo ou rede incompatíveis podem causar perda permanente dos fundos." Nota: "Nunca compartilhe sua frase secreta de recuperação."

### 4.10 Atividade (`23`)

Barra: marca compacta, "Atividade", ação `download`. Filtros em linha rolável (margem 4/-20/23, padding lateral 20, espaço 7): "Todas" (ativo), "Pagamentos Pix", "Recebimentos", "Transferências", "Conversões"; pílulas padding 8/12, 9 sp, borda line, fundo surface; ativo com fundo accent e texto onAccent. Grupo "HOJE" (8 sp 700, +0.08em, #69758B) com a primeira atividade; grupo "ANTERIORES" com as outras três; cada grupo com margem inferior 21. Estado informativo (borda tracejada line, raio 18, padding 22, centralizado, muted): ícone `activity`, "Filtros prontos para explorar" (10 sp, #BCC5D5) e "Os dados exibidos são apenas demonstrativos." (8 sp).

| Ícone | Título | Detalhe | Data | Valor | Cripto | Tom |
| --- | --- | --- | --- | --- | --- | --- |
| store | Mercado Vila Nova | Pagamento Pix | Hoje, 10:42 | - R$ 128,40 | − 24,92 USDT | saída |
| restaurant | Restaurante Moma | Pagamento Pix | Ontem, 20:16 | - R$ 86,00 | − 16,70 USDC | saída |
| arrowDown | Recebimento | Carteira externa | 12 Jun, 14:08 | + US$ 250,00 | + 250,00 USDT | entrada |
| swap | Conversão | ETH → USDT | 10 Jun, 09:31 | US$ 100,00 | 0,039 ETH | conversão |

### 4.11 Detalhe da atividade (`24`)

Barra: voltar, "Detalhes da atividade", `download`. Cabeçalho centralizado (padding 12/0/25): ícone `store` em caixa 39, "Pagamento Pix" 9 sp muted, "− R$ 128,40" 28 sp, pílula de status (accent, fundo accent a 8%, ponto de 5) "Confirmado". Cartão de dados: Recebedor "Mercado Vila Nova"; Data "Hoje, 10:42"; Ativo utilizado "USDT"; Quantidade "25,393 USDT"; Cotação "R$ 5,155"; Taxas totais "0,485 USDT". Título "Identificadores"; cartão (padding 5/14) com três linhas, cada uma com rótulo 8 sp muted, valor 9 sp 700 e botão `copy` 16 à direita: "ID da operação" "NXP-2025-0618-1842"; "Referência cripto" "0x8F2A...91C4"; "Confirmação Pix" "E000...4X9P". Cartão de informação: "Liquidação Pix confirmada no ambiente demonstrativo." Botão secundário com `file`: "Ver comprovante".

### 4.12 Perfil (`25`, `26`)

Barra: marca compacta, "Perfil", `settings`. Cartão de perfil (colunas 56 / 1fr / 24, degradê 135° surface2 para surface, borda line, raio 20, padding 16, margem inferior 25): avatar 54x54 raio 18 fundo #243650 "GM" accent 700; "Gustavo Martins" 13 sp 700; "gustavo@exemplo.com" 9 sp muted; "CONTA DEMONSTRATIVA" 7 sp accent, +0.07em, maiúsculas; `chevron`. Seção "Segurança": cartão de menu (raio 19) com duas linhas: `lock` "Biometria do dispositivo" / "Autorizar pagamentos" com interruptor (ligado), e `shield` "Segurança da conta" / "Senha e dispositivos" com `chevron`. Seção "Preferências e suporte": `wallet` "Carteiras conectadas" / "1 carteira"; `swap` "Moeda de preferência" / "BRL"; `bell` "Notificações" / "Ativadas"; `activity` "Limites de pagamento" / "R$ 5.000/dia"; `help` "Central de ajuda"; `file` "Termos e privacidade"; todas com `chevron`. Linha de menu: altura mínima 57, padding 10/13, colunas 33 / 1fr / auto, espaço 10; caixa de ícone 33x33 raio 11, fundo surface3, ícone #B6C0D2; título 10 sp 600; subtítulo 8 sp muted. Cartão de ações sensíveis (título e ícone em danger): `wallet` "Desconectar carteira" e `logout` "Encerrar sessão"; tocar em qualquer uma abre o bottom sheet de confirmação (texto: "Deseja realmente desconectar carteira? Esta é uma ação sensível e requer confirmação." e equivalente para "encerrar sessão"). Rodapé: `shield` 15 + "O NEXO PAY nunca solicita sua frase secreta." 8 sp muted, centralizado.

## 5. Apêndice: ícones (24x24, traço 1.8, sem preenchimento, pontas e junções arredondadas)

Cada linha é o `pathData` completo do ícone (subcaminhos concatenados).

- `home`: `M3 11l 9-8 9 8M5 10v10h14V10M9 20v-6h6v6`
- `wallet`: `M6 6H18a3 3 0 0 1 3 3V17a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V9a3 3 0 0 1 3 -3ZM17 11h4v5h-4a2.5 2.5 0 0 1 0-5ZM6 6V5a2 2 0 0 1 2-2h9`
- `scan`: `M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3M7 12h10`
- `activity`: `M4 18V9M10 18V5M16 18v-7M22 18V3M2 21h21`
- `user`: `M8 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M4 21a8 8 0 0 1 16 0`
- `bell`: `M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4`
- `eye`: `M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12ZM9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0`
- `eyeOff`: `M3 3l 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-2 2.8M6.6 6.6C3.6 8.3 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8`
- `arrowUp`: `M12 19lV5M6 11l6-6 6 6`
- `arrowDown`: `M12 5v14M18 13l-6 6-6-6`
- `plus`: `M12 5v14M5 12h14`
- `chevron`: `M9 18l 6-6-6-6`
- `copy`: `M10 8H18a2 2 0 0 1 2 2V18a2 2 0 0 1 -2 2H10a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2ZM16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2`
- `flash`: `M13 2l-8 12h7l-1 8 8-12h-7l1-8Z`
- `image`: `M6 4H18a3 3 0 0 1 3 3V17a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3ZM7 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M3 16l 4-4 4 4 3-3 7 7`
- `keyboard`: `M5 5H19a3 3 0 0 1 3 3V16a3 3 0 0 1 -3 3H5a3 3 0 0 1 -3 -3V8a3 3 0 0 1 3 -3ZM6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h4M7 16h10`
- `shield`: `M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10ZM9 12l 2 2 4-4`
- `check`: `M5 12l 4 4L19 6`
- `clock`: `M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 7v5l3 2`
- `close`: `M6 6l 12 12M18 6 6 18`
- `store`: `M4 10v10h16V10M3 4h18l-2 6H5L3 4ZM9 20v-6h6v6`
- `restaurant`: `M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M17 3c-3 2-3 8 0 9`
- `swap`: `M7 7l 3-3 3 3M10 4v12M17 17l-3 3-3-3M14 20V8`
- `send`: `M22 2l-7 20-4-9-9-4 20-7ZM22 2 11 13`
- `settings`: `M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z`
- `help`: `M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M9.8 9a2.3 2.3 0 1 1 3.5 2c-1.3.7-1.3 1.2-1.3 2M12 17h.01`
- `logout`: `M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4`
- `lock`: `M7 10H17a3 3 0 0 1 3 3V18a3 3 0 0 1 -3 3H7a3 3 0 0 1 -3 -3V13a3 3 0 0 1 3 -3ZM8 10V7a4 4 0 0 1 8 0v3`
- `file`: `M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5`
- `back`: `M15 18l-6-6 6-6`
- `info`: `M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 11v6M12 7h.01`
- `download`: `M12 3v12M7 10l5 5 5-5M5 21h14`
- `refresh`: `M20 7h-6V1M4 17h6v6M20 7a9 9 0 0 0-15-2M4 17a9 9 0 0 0 15 2`

