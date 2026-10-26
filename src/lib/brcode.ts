/**
 * NEXO PAY - Analisador e Validador de BR Code (Pix EMV QRCPS)
 * Processamento estrito em centavos inteiros sem ponto flutuante.
 */

import { formatBrl } from './money';

export type PixParseStatus =
  | 'valido'
  | 'crc_invalido'
  | 'nao_e_pix'
  | 'incompleto'
  | 'sem_valor'
  | 'moeda_invalida';

export interface PixParsedData {
  raw: string;
  receiverName: string;
  receiverCity: string;
  amountCents: number; // Centavos inteiros (ex.: 12840 para R$ 128,40)
  amountFormatted: string; // Ex.: "R$ 128,40"
  txid: string; // Ex.: "NEXO1842"
  pixKey?: string;
  gui?: string;
}

export interface PixParseResult {
  status: PixParseStatus;
  isValid: boolean;
  message: string;
  visualState: 'identified' | 'invalid' | 'unrecognized';
  data?: PixParsedData;
}

/**
 * Calcula CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF).
 * Processa a string como sequência de bytes ASCII/UTF-8.
 */
export function crc16Ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Parser de estrutura TLV (Tag-Length-Value) simples
 */
export function parseTLV(str: string): { tags: Record<string, string>; isTruncated: boolean } {
  const tags: Record<string, string> = {};
  let i = 0;
  while (i < str.length) {
    if (i + 4 > str.length) {
      return { tags, isTruncated: true };
    }
    const tag = str.slice(i, i + 2);
    const lenStr = str.slice(i + 2, i + 4);
    const len = parseInt(lenStr, 10);
    if (isNaN(len) || len < 0) {
      return { tags, isTruncated: true };
    }
    i += 4;
    if (i + len > str.length) {
      return { tags, isTruncated: true };
    }
    const val = str.slice(i, i + len);
    tags[tag] = val;
    i += len;
  }
  return { tags, isTruncated: false };
}

/**
 * Analisa estritamente o valor textual do campo 54 do Pix BR Code para centavos inteiros (amountCents).
 * Regras:
 * - Leitura puramente textual sem parseFloat ou Math.round.
 * - Formato: dígitos com ponto decimal opcional e no máximo 2 casas decimais (ex.: "128.40", "86.00", "15", "10.5").
 * - Rejeita se tiver mais de 2 casas decimais (ex.: "128.405").
 * - Rejeita se for negativo ou contiver sinais.
 * - Rejeita se for zero ("0", "0.00").
 * - Rejeita caracteres inválidos, letras ou vírgula.
 */
export function parsePixAmountToCents(amountStr: string | undefined): {
  isValid: boolean;
  amountCents?: number;
  errorMessage?: string;
} {
  if (!amountStr) {
    return {
      isValid: false,
      errorMessage: 'QR Code Pix sem valor definido não é suportado nesta versão.',
    };
  }

  const trimmed = amountStr.trim();
  // Aceita apenas inteiros ou inteiros com 1 ou 2 casas decimais separadas por ponto
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Valor com formato inválido na cobrança Pix (esperado até 2 casas decimais).',
    };
  }

  const parts = trimmed.split('.');
  const wholePart = parts[0];
  const decimalPart = parts.length === 2 ? parts[1].padEnd(2, '0') : '00';

  const centsText = `${wholePart}${decimalPart}`;
  const amountCents = parseInt(centsText, 10);

  if (amountCents <= 0) {
    return {
      isValid: false,
      errorMessage: 'Valor deve ser estritamente maior que zero.',
    };
  }

  return {
    isValid: true,
    amountCents,
  };
}

/**
 * Analisa e valida uma string de QR Code Pix (BR Code)
 */
export function parsePixQRCode(raw: string): PixParseResult {
  const trimmed = raw.trim();

  // Verifica se a string tem o mínimo de características de um BR Code
  if (!trimmed || trimmed.length < 20) {
    return {
      status: 'nao_e_pix',
      isValid: false,
      message: 'O código fornecido não é um código Pix válido.',
      visualState: 'unrecognized',
    };
  }

  // Se não começa com a tag 00 (Payload Format Indicator), não é Pix
  if (!trimmed.startsWith('0002') && !trimmed.startsWith('00')) {
    return {
      status: 'nao_e_pix',
      isValid: false,
      message: 'O código não possui formato EMV / Pix.',
      visualState: 'unrecognized',
    };
  }

  // Verifica CRC16
  const crcIndex = trimmed.lastIndexOf('6304');
  if (crcIndex === -1 || crcIndex + 8 > trimmed.length) {
    return {
      status: 'incompleto',
      isValid: false,
      message: 'O código Pix está incompleto ou corrompido.',
      visualState: 'invalid',
    };
  }

  const payloadUpToCrc = trimmed.slice(0, crcIndex + 4);
  const expectedCrc = trimmed.slice(crcIndex + 4, crcIndex + 8).toUpperCase();
  const calculatedCrc = crc16Ccitt(payloadUpToCrc);

  if (calculatedCrc !== expectedCrc) {
    return {
      status: 'crc_invalido',
      isValid: false,
      message: 'Checksum (CRC16) inválido. O código pode ter sido corrompido.',
      visualState: 'invalid',
    };
  }

  // Parse TLV do corpo (incluindo tag 63 e seus 4 dígitos de valor)
  const fullPayload = trimmed.slice(0, crcIndex + 8);
  const { tags, isTruncated } = parseTLV(fullPayload);
  if (isTruncated) {
    return {
      status: 'incompleto',
      isValid: false,
      message: 'O código Pix está incompleto.',
      visualState: 'invalid',
    };
  }

  // Tag 00 deve ser "01" (Payload Format Indicator)
  if (tags['00'] !== '01') {
    return {
      status: 'nao_e_pix',
      isValid: false,
      message: 'Versão do formato EMV incompatível.',
      visualState: 'unrecognized',
    };
  }

  // Procura campo de informação de conta Pix (tags 26 a 51)
  let pixAccountField: string | undefined;
  for (let t = 26; t <= 51; t++) {
    const tagKey = t.toString().padStart(2, '0');
    if (tags[tagKey]) {
      pixAccountField = tags[tagKey];
      break;
    }
  }

  if (!pixAccountField) {
    return {
      status: 'nao_e_pix',
      isValid: false,
      message: 'Nenhum campo de arranjo Pix foi encontrado.',
      visualState: 'unrecognized',
    };
  }

  // Subcampos do campo da conta
  const subTLVs = parseTLV(pixAccountField);
  const gui = subTLVs.tags['00'];
  if (!gui || gui.toLowerCase() !== 'br.gov.bcb.pix') {
    return {
      status: 'nao_e_pix',
      isValid: false,
      message: 'Domínio do arranjo não corresponde ao Pix (br.gov.bcb.pix).',
      visualState: 'unrecognized',
    };
  }

  const pixKey = subTLVs.tags['01'];

  // Tag 53: Moeda deve ser "986" (BRL)
  if (tags['53'] && tags['53'] !== '986') {
    return {
      status: 'moeda_invalida',
      isValid: false,
      message: 'Moeda da cobrança não é Real Brasileiro (986).',
      visualState: 'unrecognized',
    };
  }

  // Tag 58: País deve ser "BR"
  if (tags['58'] && tags['58'].toUpperCase() !== 'BR') {
    return {
      status: 'nao_e_pix',
      isValid: false,
      message: 'País do recebedor não é Brasil (BR).',
      visualState: 'unrecognized',
    };
  }

  // Tag 54: Valor da cobrança (analisado estritamente em centavos sem ponto flutuante)
  const amountValidation = parsePixAmountToCents(tags['54']);
  if (!amountValidation.isValid || amountValidation.amountCents === undefined) {
    return {
      status: 'sem_valor',
      isValid: false,
      message: amountValidation.errorMessage || 'Valor inválido na cobrança Pix.',
      visualState: 'unrecognized',
    };
  }

  const amountCents = amountValidation.amountCents;

  // Tag 59: Recebedor
  const receiverName = tags['59'] || 'Recebedor Pix';

  // Tag 60: Cidade
  const receiverCity = tags['60'] || 'Brasil';

  // Tag 62: Dados adicionais (sub-tag 05 = txid)
  let txid = '';
  if (tags['62']) {
    const addtl = parseTLV(tags['62']);
    txid = addtl.tags['05'] || '';
  }

  const amountFormatted = formatBrl(amountCents);

  return {
    status: 'valido',
    isValid: true,
    message: 'Cobrança Pix reconhecida com segurança.',
    visualState: 'identified',
    data: {
      raw: trimmed,
      receiverName,
      receiverCity,
      amountCents,
      amountFormatted,
      txid,
      pixKey,
      gui,
    },
  };
}
