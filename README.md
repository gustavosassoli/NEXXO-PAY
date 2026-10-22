# NEXO PAY

Aplicativo de pagamentos Pix com liquidação em criptoativos (USDT, USDC, ETH), construído com React, TypeScript, Vite e Tailwind CSS.

## Instalação como Aplicativo (PWA)

O NEXO PAY é um Progressive Web App (PWA) instalável diretamente do navegador para a tela de início do seu dispositivo:

### No Android (Google Chrome)
1. Abra o NEXO PAY no navegador Google Chrome.
2. Toque no menu de três pontos no canto superior direito.
3. Selecione **"Adicionar à tela inicial"** ou **"Instalar app"**.
4. Confirme para fixar o ícone na sua gaveta de aplicativos e na tela inicial.

### No iOS (Apple Safari)
1. Abra o NEXO PAY no navegador Safari.
2. Toque no botão **Compartilhar** (ícone com quadrado e seta para cima) na barra inferior.
3. Role para baixo e selecione **"Adicionar à Tela de Início"**.
4. Toque em **"Adicionar"** no canto superior direito. O aplicativo funcionará em tela cheia (standalone) com o ícone oficial da NEXO.

---

## Leitura de QR Code Pix e Câmera

- O leitor de QR Code Pix utiliza a câmera traseira do dispositivo via `navigator.mediaDevices.getUserMedia` com decodificação rápida por `BarcodeDetector` nativo e fallback universal para `jsQR`.
- **Atenção sobre HTTPS**: APIs modernas de câmera exigem um contexto seguro. Para testar o leitor de QR Code em celulares ou dispositivos externos na rede local, a aplicação deve ser servida via **HTTPS** ou executada em **localhost**.
- Também é possível escanear cobranças Pix importando arquivos de imagem salvos na galeria do aparelho.
