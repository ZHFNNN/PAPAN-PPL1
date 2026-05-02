const BILLION = 1_000_000_000;
const MILLION = 1_000_000;

const formatAbbreviated = (value: number, unit: number): string => {
  const intValue = Math.trunc(value);
  const whole = Math.trunc(intValue / unit);
  const remainder = intValue - whole * unit;
  const decimalUnit = unit / 100;
  // Truncate to 2 decimals without rounding.
  const decimals = Math.trunc(remainder / decimalUnit);

  if (decimals === 0) return String(whole);

  const decimalText = String(decimals).padStart(2, '0').replace(/0+$/, '');
  return `${whole}.${decimalText}`;
};

export function formatPrice(input: number | string): string {
  const numeric = typeof input === 'string' ? Number(input.replace(/[^0-9-]/g, '')) : input;
  if (!Number.isFinite(numeric)) return String(input);

  const sign = numeric < 0 ? '-' : '';
  const absValue = Math.abs(numeric);

  if (absValue >= BILLION) {
    return `${sign}Rp${formatAbbreviated(absValue, BILLION)} M`;
  }
  if (absValue >= MILLION) {
    return `${sign}Rp${formatAbbreviated(absValue, MILLION)} Jt`;
  }

  const whole = Math.trunc(absValue);
  return `${sign}Rp${whole.toLocaleString('id-ID')}`;
}
