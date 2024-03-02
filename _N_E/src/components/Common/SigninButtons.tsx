'use client';

import { logAnalyticsEvent } from '@/analytics/analytics';
import { useSignalValue } from 'signals-react-safe';
/* eslint-disable i18next/no-literal-string */
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';
import { initFirebase } from '@/utils/auth/firebase';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';

import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { AppleIcon, EmailIcon, GoogleIcon } from '@/components/ui/Icon';
import { useGoogleOneTap } from '@/hooks/authHooks';
import { signingIn } from '@/lib/state/signals';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormInputField } from '../ui/FormInputField';
import { Form, getSchemaChecks } from '../ui/form';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Spinner } from './Loader';

interface SignInButtonListProps {
  onPressGoogle: () => void;
  onPressApple: () => void;
  sentEmail: boolean;
  handleContinue: (inputEmail: string) => Promise<void>;
}

export const SignInButtonListSchema = z.object({
  email: z.string(),
});

export const SignInButtonList = ({
  onPressGoogle,
  onPressApple,
  sentEmail,
  handleContinue,
}: SignInButtonListProps) => {
  const form = useForm<z.infer<typeof SignInButtonListSchema>>({
    resolver: zodResolver(SignInButtonListSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
    disabled: sentEmail,
  });
  const watchedFields = form.watch();

  const onSubmit = (values: z.infer<typeof SignInButtonListSchema>) => {
    if (sentEmail || !values.email) {
      return;
    }
    void handleContinue(values.email);
  };

  return (
    <div className="flex flex-col space-y-2 gap-1 w-72">
      <Button
        onPress={onPressGoogle}
        className="bg-surface-elevation-3 text-primary"
      >
        <div className="flex justify-between w-full">
          <GoogleIcon height="1.5em" />
          <div className="w-full flex-1">
            {t('Auth.continue-with', {
              provider: 'Google',
            })}
          </div>
        </div>
      </Button>
      <Button
        onPress={onPressApple}
        className="bg-surface-elevation-3 text-primary"
      >
        <div className="flex justify-between w-full">
          <AppleIcon height="1.5em" />
          <div className="w-full flex-1">
            {t('Auth.continue-with', {
              provider: 'Apple',
            })}
          </div>
        </div>
      </Button>
      <Separator className="text-muted-foreground font-thin text-sm">
        {t('Common.or')}
      </Separator>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center border-spacing-1 border-1 border-surface-elevation-3 rounded-lg px-4">
            <EmailIcon />
            <FormInputField
              className="bg-transparent border-none"
              name="email"
              checks={getSchemaChecks(SignInButtonListSchema, 'email')}
            />
          </div>
          {!!(watchedFields.email || sentEmail) && (
            <AnimationFadeInAndOut className="w-full">
              <Button
                type="submit"
                className="w-full"
                isDisabled={!watchedFields.email || sentEmail}
              >
                {t('Common.continue')}
              </Button>
            </AnimationFadeInAndOut>
          )}
        </form>
      </Form>
      {!!sentEmail && (
        <Label>
          {t('Auth.verification-link', {
            email: watchedFields.email,
          })}
        </Label>
      )}
    </div>
  );
};

export default function SignInButtons() {
  const [sentEmail, setSentEmail] = useState(false);
  const signingInValue = useSignalValue(signingIn);

  useGoogleOneTap();

  const login = api.auth.signIn.useMutation();
  const onPressApple = async () => {
    const credentials = await initFirebase().signInWithApple();
    const token = await credentials.user.getIdToken();
    const successfulLogin = await login.mutateAsync({
      googleJwt: token,
    });

    if (successfulLogin) {
      logAnalyticsEvent(AnalyticsEvents.Auth.Login, { provider: 'apple' });
      window.location.reload();
    }
  };
  const onPressGoogle = async () => {
    const credentials = await initFirebase().signInWithGoogle();
    const token = await credentials.user.getIdToken();
    const successfulLogin = await login.mutateAsync({
      googleJwt: token,
    });

    if (successfulLogin) {
      logAnalyticsEvent(AnalyticsEvents.Auth.Login, { provider: 'google' });
      window.location.reload();
    }
  };

  const handleContinue = useCallback(
    async (email: string) => {
      logAnalyticsEvent(AnalyticsEvents.Auth.AuthStarted, {
        provider: 'email',
      });
      setSentEmail(true);
      await initFirebase().sendSignInWithEmail(email);
    },
    [setSentEmail],
  );

  return signingInValue ? (
    <Spinner />
  ) : (
    <SignInButtonList
      onPressGoogle={onPressGoogle}
      onPressApple={onPressApple}
      sentEmail={sentEmail}
      handleContinue={handleContinue}
    />
  );
}
