// "12345678000195" becomes "12.345.678/0001-95". Anything that is not 14
// digits comes back as typed.
export const formatCnpj = (value: string): string => {
  const groups = /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/.exec(
    value.replace(/\D/g, ''),
  );

  return groups === null
    ? value.trim()
    : `${groups[1]}.${groups[2]}.${groups[3]}/${groups[4]}-${groups[5]}`;
};
