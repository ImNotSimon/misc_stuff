import { useGoogleOneTapLogin } from '@react-oauth/google';

import { logAnalyticsEvent } from '@/analytics/analytics';
import { api } from '@/utils/api';
import { initFirebase } from '@/utils/auth/firebase';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';

export const useGoogleOneTap = () => {
  const login = api.auth.signIn.useMutation();
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      const { credential } = credentialResponse;
      if (credential) {
        const idpCredentials =
          await initFirebase().signInWithGoogleCredential(credential);
        const token = await idpCredentials.user.getIdToken();
        const successfulLogin = await login.mutateAsync({
          googleJwt: token,
        });

        if (successfulLogin) {
          // TODO (AG): Verify with David if this `provider` and/or `subtype` is correct
          logAnalyticsEvent(AnalyticsEvents.Auth.Login, {
            provider: 'google',
            subtype: 'one_tap',
          });
          window.location.reload();
        }
      }
    },
    onError: () => {
      console.error('Login Failed');
    },
  });
};
