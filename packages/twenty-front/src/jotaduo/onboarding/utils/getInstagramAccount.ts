// A link, "@account" or "account" all become the bare account name.
export const getInstagramAccount = (value: string): string =>
  value
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/^@|\/.*$/g, '');
