// Logic function child processes run app code, so only runtime settings cross
// over from the server env; secrets like APP_SECRET or PG_DATABASE_URL stay out.
export const LOGIC_FUNCTION_CHILD_PROCESS_ENV_ALLOWLIST = [
  'PATH',
  'HOME',
  'TMPDIR',
  'TMP',
  'TEMP',
  'TZ',
  'LANG',
  'LC_ALL',
  'NODE_ENV',
  // Calls to the Twenty API and third parties use the server's proxy and CAs
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
  'http_proxy',
  'https_proxy',
  'no_proxy',
  'NODE_USE_ENV_PROXY',
  'NODE_EXTRA_CA_CERTS',
  'NODE_USE_SYSTEM_CA',
  'SSL_CERT_FILE',
  'SSL_CERT_DIR',
  'NODE_TLS_REJECT_UNAUTHORIZED',
] as const;
