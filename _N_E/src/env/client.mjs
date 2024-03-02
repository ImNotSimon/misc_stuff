/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-restricted-syntax */
// @ts-check

'use client';

import Cookies from 'js-cookie';
import { clientEnv, clientSchema, formatErrors } from './schema.mjs';

const _clientEnv = clientSchema.safeParse(clientEnv);

if (!_clientEnv.success) {
  console.error(
    '❌ Invalid environment variables:\n',
    ...formatErrors(_clientEnv.error.format()),
  );
  throw new Error(`Invalid environment variables ${_clientEnv.error.format()}`);
}

for (const key of Object.keys(_clientEnv.data)) {
  if (!key.startsWith('NEXT_PUBLIC_')) {
    console.warn(
      `❌ Invalid public environment variable name: ${key}. It must begin with 'NEXT_PUBLIC_'`,
    );

    throw new Error('Invalid public environment variable name');
  }
}

const maybeNeoUrl = Cookies.get('NEO_HOST_BASE');
const maybeCharServerUrl = Cookies.get('CHAR_SERVER_URL');

export const ClientEnv = {
  ..._clientEnv.data,
  ...(maybeCharServerUrl !== undefined && {
    NEXT_PUBLIC_CHAR_SERVER_URL: maybeCharServerUrl,
  }),
  ...(maybeNeoUrl !== undefined && { NEXT_PUBLIC_NEO_HOST_BASE: maybeNeoUrl }),
};
