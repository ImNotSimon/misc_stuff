// @ts-check
import { z } from 'zod';

export const DEFAULT_VALUE_DO_NOT_USE_IN_PRODUCTION = '__default__';

export const formatErrors = (
  /** @type {import('zod').ZodFormattedError<Map<string,string>,string>} */
  errors,
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && '_errors' in value) {
        return `${name}: ${value._errors.join(', ')}\n`;
      }
    })
    .filter(Boolean);

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']),

  CHAR_SERVER_URL: z.string(),
  NEO_HOST_BASE: z.string(),
  SESSION_COOKIE_PASSWORD: z.string(),
  CF_PAGES_URL: z.string().default('http://localhost:8007'),
  CF_ACCESS_CLIENT_ID: z.string(),
  CF_ACCESS_CLIENT_SECRET: z.string(),
  SERVICE_ACCESS_TOKEN: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.infer<typeof serverSchema>]: z.infer<typeof serverSchema>[k] | undefined }}
 */
export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV,
  CHAR_SERVER_URL: process.env.NEXT_PUBLIC_CHAR_SERVER_URL,
  NEO_HOST_BASE: process.env.NEXT_PUBLIC_NEO_HOST_BASE,
  SESSION_COOKIE_PASSWORD: process.env.SESSION_COOKIE_PASSWORD,
  CF_PAGES_URL: process.env.CF_PAGES_URL,
  CF_ACCESS_CLIENT_ID: process.env.CF_ACCESS_CLIENT_ID,
  CF_ACCESS_CLIENT_SECRET: process.env.CF_ACCESS_CLIENT_SECRET,
  SERVICE_ACCESS_TOKEN: process.env.SERVICE_ACCESS_TOKEN,
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_CHAR_SERVER_URL: z.string(),
  NEXT_PUBLIC_NEO_HOST_BASE: z.string(),
  NEXT_PUBLIC_ENABLE_REACT_QUERY_DEV_TOOLS: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_CHAR_SERVER_URL: process.env.NEXT_PUBLIC_CHAR_SERVER_URL,
  NEXT_PUBLIC_NEO_HOST_BASE: process.env.NEXT_PUBLIC_NEO_HOST_BASE,
  NEXT_PUBLIC_ENABLE_REACT_QUERY_DEV_TOOLS:
    process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEV_TOOLS,
};
