const CNPJ_FIRST_CHECK_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_CHECK_DIGIT_WEIGHTS = [6, ...CNPJ_FIRST_CHECK_DIGIT_WEIGHTS];

const getCnpjCheckDigit = (base: string, weights: number[]) => {
  const remainder =
    [...base].reduce(
      (total, digit, index) => total + Number(digit) * weights[index],
      0,
    ) % 11;

  return remainder < 2 ? 0 : 11 - remainder;
};

export const isValidCnpj = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');

  if (!/^\d{14}$/.test(digits) || /^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const base = digits.slice(0, 12);
  const firstCheckDigit = getCnpjCheckDigit(
    base,
    CNPJ_FIRST_CHECK_DIGIT_WEIGHTS,
  );
  const secondCheckDigit = getCnpjCheckDigit(
    `${base}${firstCheckDigit}`,
    CNPJ_SECOND_CHECK_DIGIT_WEIGHTS,
  );

  return digits.endsWith(`${firstCheckDigit}${secondCheckDigit}`);
};
