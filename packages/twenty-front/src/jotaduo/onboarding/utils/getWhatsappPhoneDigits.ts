// The number as the app stores it: digits only, country code first. A
// Brazilian number typed with just the area code gets the 55. Returns null
// when it is not a phone number.
export const getWhatsappPhoneDigits = (value: string): string | null => {
  const typedPhone = value.trim().replace(/@.*$/, '');
  const digits = typedPhone.replace(/[+()\s-]/g, '');
  const phone =
    !typedPhone.startsWith('+') && /^[1-9]\d{9,10}$/.test(digits)
      ? `55${digits}`
      : digits;

  return /^[1-9]\d{7,14}$/.test(phone) ? phone : null;
};
