/* eslint-disable @typescript-eslint/no-empty-function */
import { ExperimentationProvider } from '@/analytics/ExperimentationProvider';
import { logAnalyticsEvent } from '@/analytics/analytics';
import { LegacyMigrationDialog } from '@/components/Common/Dialogs/LegacyMigrationDialog';
import { SignInDialog } from '@/components/Common/SigninDialog';
import { CookieConsent } from '@/components/CookieConsent/CookieConsent';
import { Guide } from '@/components/Guide/Guide';
import { PlusSubscriptionDialog } from '@/components/Monetization/PlusSubscriptionDialog';
import { SettingsDialog } from '@/components/User/SettingsDialog';
import { ClientEnv } from '@/env/client.mjs';
import { setLanguage } from '@/i18n/config';
import { signingIn } from '@/lib/state/signals';
import { api } from '@/utils/api';
import { initFirebase } from '@/utils/auth/firebase';
import { GoogleOAuthClientId, StorageUtils } from '@/utils/constants';
import { isUserPlusMember } from '@/utils/userUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { type Participant } from '@character-tech/client-common/src/types/app-api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import * as Sentry from '@sentry/react';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  PersistQueryClientProvider,
  persistQueryClient,
} from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';
import Cookie from 'js-cookie';
import { useEffect, useState } from 'react';
import { AuthProvider } from './AuthProvider';
import { CharacterEditorContextProvider } from './CharacterEditorContext';

const extractAndSetQueryState = (queryClient: QueryClient) => {
  const queries = queryClient.getQueryCache().findAll();
  const queryInfo = queries.map((query) => ({
    queryKey: query.queryKey.toString(),
    dataUpdatedAt: query.state.dataUpdatedAt,
    cacheTime: query.cacheTime,
  }));

  Cookie.set('reactQueryState', JSON.stringify(queryInfo), {
    // 1 day expiration, all queries will 100% be expired by then
    expires: 1,
  });
};

export function RootLayout({
  children,
  token,
  dehydratedState,
  user,
  hideGuide = false,
}: {
  children: React.ReactNode;
  token: string;
  dehydratedState: DehydratedState;
  user: Participant;
  hideGuide?: boolean;
}) {
  const [loadedQueryState, setLoadedQueryState] = useState(false);
  useEffect(() => {
    const localLang = Cookie.get(StorageUtils.Keys.Language);
    void setLanguage(localLang ?? 'en');
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: 1000 * 60 * 15,
          },
        },
      }),
  );

  useEffect(() => {
    try {
      if (isUserPlusMember(user)) {
        Cookie.set('caiplus', 'true', {
          expires: 1, // 1 day expiration,
        });
      } else {
        Cookie.remove('caiplus');
      }

      if (process.env.CF_PAGES_URL) {
        broadcastQueryClient({ queryClient, broadcastChannel: 'cai' });
      }
    } catch {
      // catch error, do nothing, it's fine
    }
  });

  useEffect(() => {
    void get('error').then((error) => {
      if (error) {
        void del('error');
        Sentry.showReportDialog({ eventId: error.id });
      }
    });
  }, []);

  const [idbStoragePersister] = useState(() => {
    if (typeof window !== 'undefined') {
      return createAsyncStoragePersister({
        storage: {
          getItem: (key) => get(key),
          setItem: async (key, value) => {
            await set(key, value);
            extractAndSetQueryState(queryClient);
          },
          removeItem: async (key) => {
            await del(key);
            extractAndSetQueryState(queryClient);
          },
        },
      });
    }

    // return a mock Storage object when `window` is `undefined`
    const mockStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      removeClient: () => {},
    };
    return createAsyncStoragePersister({ storage: mockStorage });
  });

  const [, loadQueryPromise] = persistQueryClient({
    // @ts-expect-error - queryClient being weird about #private
    queryClient,
    persister: idbStoragePersister,
    cacheTime: 1000 * 60 * 15,
  });

  void loadQueryPromise.finally(() => {
    setLoadedQueryState(true);
  });

  if (!loadedQueryState) {
    return null;
  }

  return (
    <AuthProvider token={token} user={user}>
      <ExperimentationProvider>
        <PersistQueryClientProvider
          client={queryClient}
          onSuccess={() => {
            extractAndSetQueryState(queryClient);
          }}
          persistOptions={{
            persister: idbStoragePersister,
          }}
        >
          <PlusSubscriptionDialog />
          <LegacyMigrationDialog />
          <SettingsDialog user={user} />
          {!!ClientEnv.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEV_TOOLS && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
          <Hydrate state={dehydratedState}>
            <CharacterEditorContextProvider>
              <div className="relative overflow-hidden">
                <div className="flex h-screen">
                  {!hideGuide && (
                    <aside className="h-[100dvh] overflow-hidden">
                      <Guide />
                    </aside>
                  )}
                  <main className="h-[100dvh] flex-1 overflow-x-hidden">
                    <div className="h-full">{children}</div>
                  </main>
                </div>
              </div>
            </CharacterEditorContextProvider>
          </Hydrate>
          <CookieConsent />
        </PersistQueryClientProvider>
      </ExperimentationProvider>
    </AuthProvider>
  );
}

export function SignedOutRootLayout({
  children,
  dehydratedState,
  hideGuide = false,
}: {
  children: React.ReactNode;
  dehydratedState: DehydratedState;
  hideGuide?: boolean;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: 1000 * 60 * 15,
          },
        },
      }),
  );

  const login = api.auth.signIn.useMutation();

  useEffect(() => {
    (async () => {
      if (initFirebase().isSignInWithPasswordless(window.location.href)) {
        signingIn.value = true;
        const email = window.localStorage.getItem(
          StorageUtils.Keys.EmailForSignIn,
        );
        if (!email) {
          // todo (@david) handle empty email and need to re-enter
          logAnalyticsEvent(AnalyticsEvents.Auth.LoginDisallowed, {
            reason: 'missing_email',
          });
        } else {
          const credentials = await initFirebase().signInWithLink(
            email,
            window.location.href,
          );
          window.history.replaceState({}, '', window.location.pathname);
          const idToken = await credentials.user.getIdToken();
          const successfulLogin = await login.mutateAsync({
            googleJwt: idToken,
          });

          if (successfulLogin) {
            logAnalyticsEvent(AnalyticsEvents.Auth.Login, {
              provider: 'email',
            });
            window.localStorage.removeItem(StorageUtils.Keys.EmailForSignIn);
            window.location.reload();
          } else {
            signingIn.value = false;
          }
        }
      }
    })().catch((error) => {
      signingIn.value = false;
      console.error(error);
    });
  });

  useEffect(() => {
    void get('error').then((error) => {
      if (error) {
        void del('error');
        Sentry.showReportDialog({ eventId: error.id });
      }
    });
  }, []);

  return (
    <GoogleOAuthProvider clientId={GoogleOAuthClientId}>
      <ExperimentationProvider>
        <QueryClientProvider client={queryClient} contextSharing>
          {!!ClientEnv.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEV_TOOLS && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
          <Hydrate state={dehydratedState}>
            <SignInDialog />
            <div className="relative overflow-hidden">
              <div className="flex h-screen">
                {!hideGuide && (
                  <aside className="h-[100dvh] overflow-hidden">
                    <Guide />
                  </aside>
                )}
                <main className="h-[100dvh] flex-1 overflow-x-hidden">
                  <div className="h-full">{children}</div>
                </main>
              </div>
            </div>
          </Hydrate>
        </QueryClientProvider>
      </ExperimentationProvider>
    </GoogleOAuthProvider>
  );
}
