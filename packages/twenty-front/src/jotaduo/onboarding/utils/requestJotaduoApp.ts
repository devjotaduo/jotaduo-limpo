import { isNonEmptyString } from '@sniptt/guards';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type JotaduoAppResponse<TData> = {
  ok?: boolean;
  data?: TData;
  error?: { message?: string };
};

export class JotaduoAppRequestError extends Error {
  status: number;
  hasServerMessage: boolean;

  constructor(status: number, serverMessage?: string) {
    super(serverMessage ?? `JotaDuo app request failed with status ${status}`);
    this.status = status;
    this.hasServerMessage = isNonEmptyString(serverMessage);
  }
}

// The JotaDuo app serves its HTTP routes under /s/jotaduo on the Twenty
// server and accepts the signed-in person's session, the same one the rest of
// the front already sends.
export const requestJotaduoApp = async <TData>(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch(
    `${REACT_APP_SERVER_BASE_URL}/s/jotaduo/${path}`,
    {
      method,
      credentials: 'include',
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );

  const payload: JotaduoAppResponse<TData> | null = await response
    .json()
    .catch(() => null);

  if (!response.ok || payload?.ok !== true || payload.data === undefined) {
    throw new JotaduoAppRequestError(response.status, payload?.error?.message);
  }

  return payload.data;
};
