import { describe, it, expect } from 'vitest';
import { parsePixQRCode, crc16Ccitt } from './brcode';

describe('BR Code Pix Parser (src/lib/brcode.ts)', () => {
  const SAMPLE_A =
    '00020101021226580014br.gov.bcb.pix013611111111-2222-4333-8444-5555555555555204000053039865406128.405802BR5917MERCADO VILA NOVA6009SAO PAULO62120508NEXO184263046550';
  const SAMPLE_B =
    '00020101021226580014br.gov.bcb.pix013611111111-2222-4333-8444-555555555555520400005303986540586.005802BR5916RESTAURANTE MOMA6009SAO PAULO62120508NEXO00076304B10F';

  it('calculates correct CRC16 for sample A and B', () => {
    const payloadA = SAMPLE_A.slice(0, SAMPLE_A.lastIndexOf('6304') + 4);
    expect(crc16Ccitt(payloadA)).toBe('6550');

    const payloadB = SAMPLE_B.slice(0, SAMPLE_B.lastIndexOf('6304') + 4);
    expect(crc16Ccitt(payloadB)).toBe('B10F');
  });

  it('correctly parses sample A (MERCADO VILA NOVA, R$ 128,40, txid NEXO1842)', () => {
    const res = parsePixQRCode(SAMPLE_A);
    expect(res.isValid).toBe(true);
    expect(res.status).toBe('valido');
    expect(res.visualState).toBe('identified');
    expect(res.data).toBeDefined();
    expect(res.data?.receiverName).toBe('MERCADO VILA NOVA');
    expect(res.data?.receiverCity).toBe('SAO PAULO');
    expect(res.data?.amount).toBe(128.4);
    expect(res.data?.txid).toBe('NEXO1842');
  });

  it('correctly parses sample B (RESTAURANTE MOMA, R$ 86,00, txid NEXO0007)', () => {
    const res = parsePixQRCode(SAMPLE_B);
    expect(res.isValid).toBe(true);
    expect(res.status).toBe('valido');
    expect(res.visualState).toBe('identified');
    expect(res.data).toBeDefined();
    expect(res.data?.receiverName).toBe('RESTAURANTE MOMA');
    expect(res.data?.receiverCity).toBe('SAO PAULO');
    expect(res.data?.amount).toBe(86.0);
    expect(res.data?.txid).toBe('NEXO0007');
  });

  it('detects altered CRC and maps to invalid state', () => {
    // Alter last digit of CRC
    const tampered = SAMPLE_A.slice(0, -1) + (SAMPLE_A.endsWith('0') ? '1' : '0');
    const res = parsePixQRCode(tampered);
    expect(res.isValid).toBe(false);
    expect(res.status).toBe('crc_invalido');
    expect(res.visualState).toBe('invalid');
  });

  it('detects truncated payload / truncated TLV', () => {
    const truncated = SAMPLE_A.slice(0, 40);
    const res = parsePixQRCode(truncated);
    expect(res.isValid).toBe(false);
    expect(res.status).toBe('incompleto');
    expect(res.visualState).toBe('invalid');
  });

  it('rejects random URL and maps to unrecognized', () => {
    const res = parsePixQRCode('https://exemplo.com/pix-checkout/1234');
    expect(res.isValid).toBe(false);
    expect(res.status).toBe('nao_e_pix');
    expect(res.visualState).toBe('unrecognized');
  });

  it('rejects missing amount (tag 54) and maps to unrecognized', () => {
    // Replace tag 54 with another tag or remove it
    const withoutAmount = SAMPLE_A.replace('5406128.40', '');
    // Need to recompute CRC or let it fail
    const payloadWithoutCrc = withoutAmount.slice(0, withoutAmount.lastIndexOf('6304') + 4);
    const newCrc = crc16Ccitt(payloadWithoutCrc);
    const fullWithoutAmount = payloadWithoutCrc + newCrc;

    const res = parsePixQRCode(fullWithoutAmount);
    expect(res.isValid).toBe(false);
    expect(res.status).toBe('sem_valor');
    expect(res.visualState).toBe('unrecognized');
  });

  it('rejects invalid currency (not 986)', () => {
    const alteredCurrency = SAMPLE_A.replace('5303986', '5303840'); // 840 is USD
    const payload = alteredCurrency.slice(0, alteredCurrency.lastIndexOf('6304') + 4);
    const newCrc = crc16Ccitt(payload);
    const full = payload + newCrc;

    const res = parsePixQRCode(full);
    expect(res.isValid).toBe(false);
    expect(res.status).toBe('moeda_invalida');
    expect(res.visualState).toBe('unrecognized');
  });
});
