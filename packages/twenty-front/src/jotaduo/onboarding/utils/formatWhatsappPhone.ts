// The stored digits the way a person types them: "(87) 99999-0000" for a
// Brazilian number, "+digits" for any other.
export const formatWhatsappPhone = (value: string): string => {
  const digits = value.replace(/@.*$/, '').replace(/\D/g, '');
  const brazilianGroups = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digits);

  if (brazilianGroups !== null) {
    return `(${brazilianGroups[1]}) ${brazilianGroups[2]}-${brazilianGroups[3]}`;
  }

  return digits === '' ? '' : `+${digits}`;
};
