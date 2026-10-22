/**
 * NEXO PAY - Configurações da aplicação.
 */

/**
 * Modo demonstração.
 * Quando false, remove:
 * - 'Simular leitura válida'
 * - 'Testar erro'
 * - Aviso demonstrativo do leitor
 * - Chips de pré-visualização de estados em Resultado
 * - Selo AMBIENTE DEMONSTRATIVO
 */
export const DEMO_MODE = true;

/**
 * Modo da câmera no leitor de QR Code:
 * - 'real': usa navigator.mediaDevices.getUserMedia com BarcodeDetector/jsQR.
 *           Oculta botões de simulação e a nota 'Protótipo demonstrativo'.
 * - 'simulated': exibe botões de simulação sem acessar câmera (comportamento W1).
 */
export const CAMERA_MODE: 'real' | 'simulated' = 'real';
