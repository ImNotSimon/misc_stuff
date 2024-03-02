import { logAnalyticsEvent } from '@/analytics/analytics';
import { AvatarUploadField } from '@/components/User/AvatarUpload';
import { FormInputField } from '@/components/ui/FormInputField';
import { Button } from '@/components/ui/button';
import { Form, getSchemaChecks } from '@/components/ui/form';
import { AppToast } from '@/components/ui/use-toast';
import { api } from '@/utils/api';
import { AvatarUploadType } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useCompleteSignup } from '@character-tech/client-common/src/hooks/queries/user';
import { fetchUserLocation } from '@character-tech/client-common/src/utils/userUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { del } from 'idb-keyval';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { z } from 'zod';

const errorMappingToTranslation = {
  'Error: signup already complete': 'error-signup-already-complete',
  "Error: Couldn't find user by username": 'error-couldnt-find-username',
  'Error: Must accept policies': 'error-acknowledge',
  'Error: Missing date of birth': 'error-missing-date-of-birth',
  'Error: There was an issue with your sign up.': 'error-general',
  'Error: Username & Name must be between 3-20 characters and contain only letters, numbers, underscore and dash':
    'username-constraints',
  'Error: Username already exists': 'error-username-exists',
  'Error: Invalid date of birth': 'error-invalid-date',
} as Record<string, string | undefined>;

const formSchema = z.object({
  username: z.string().min(2).max(20),
  date_of_birth: z
    .date({
      // https://github.com/colinhacks/zod/issues/1526
      errorMap: (issue, { defaultError }) => ({
        message: ['invalid_date', 'required'].includes(issue.code)
          ? t('Form.date-required-error')
          : defaultError,
      }),

      coerce: true,
    })
    .min(new Date(1900, 1, 1), t('Form.date-min-error'))
    .max(new Date(), t('Form.date-max-error')),
  userInEEA: z.boolean(),
  userInUK: z.boolean(),
  avatar_file_name: z.string(),
});

export const SignupForm = () => {
  const router = useRouter();
  const completeSignup = useCompleteSignup();
  const logoutMutation = api.auth.logout.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      userInEEA: true,
      userInUK: true,
      avatar_file_name: '',
    },
  });

  useEffect(() => {
    void (async () => {
      const location = await fetchUserLocation();
      form.setValue('userInEEA', location.inEEA, { shouldValidate: true });
      form.setValue('userInUK', location.inUK, { shouldValidate: true });
    })();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { status, needs_exit_signup: signupBlocked } =
      await completeSignup.mutateAsync({
        ...values,
        date_of_birth_collected: true,
        acknowledgement: true,
        date_of_birth: values.date_of_birth.toISOString(),
        avatar_type: values.avatar_file_name
          ? AvatarUploadType.UPLOADED
          : 'DEFAULT',
      });
    if (status === 'Error: Username already exists') {
      form.setError('username', {
        type: 'manual',
        message: t('Signup.username-exists-error'),
      });
    } else if (signupBlocked) {
      // User isn't old enough, block signups for a day.
      // Make purposefully vague error message to avoid giving away too much
      // info.
      localStorage.setItem('signup_issue', new Date().toISOString());
      AppToast(t('Signup.error-general'), 2500, 'destructive');
      logAnalyticsEvent(AnalyticsEvents.Auth.SignupRejected, {
        type: 'user_age_issue',
      });
      setTimeout(async () => {
        await logoutMutation.mutateAsync();
        await del('REACT_QUERY_OFFLINE_CACHE');
        router.reload();
      }, 2500);
    } else if (status === 'OK') {
      logAnalyticsEvent(AnalyticsEvents.Auth.SignupCompleted);
      window.location.reload();
    } else {
      const errorKey = errorMappingToTranslation[status];
      if (errorKey) {
        AppToast(t(`Signup.${errorKey}`), 2500, 'destructive');
      } else {
        AppToast(status, 2000, 'destructive');
      }
      logAnalyticsEvent(AnalyticsEvents.Auth.SignupRejected, {
        errorKey,
        status,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:w-96 w-80"
      >
        <div className="flex justify-center">
          <AvatarUploadField
            name="avatar_file_name"
            username={form.getValues('username')}
          />
        </div>
        <FormInputField
          label={t('Signup.claim-username')}
          placeholder={t('Signup.username-placeholder')}
          name="username"
          checks={getSchemaChecks(formSchema, 'username')}
        />
        <div className="bg-muted h-[1px]" />
        <FormInputField
          type="date"
          name="date_of_birth"
          // don't need string checks. default date validation is sufficient
          checks={[]}
          label={t('Form.labels.date')}
        />
        <Button type="submit">{t('Signup.create-account-button')}</Button>
      </form>
    </Form>
  );
};

export const SignupView = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3">
    <h2 className="text-muted-foreground text-medium">{t('Signup.welcome')}</h2>
    <h1 className="text-display">{t('Signup.header')}</h1>
    <SignupForm />
    <div className="text-muted-foreground max-w-80 text-center text-sm">
      <Trans i18nKey="Signup.disclaimer">
        By creating an account you agree to the{' '}
        <a
          href="https://beta.character.ai/privacy"
          target="_blank"
          className="text-foreground"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="https://beta.character.ai/privacy"
          target="_blank"
          className="text-foreground"
        >
          Privacy Policy
        </a>
      </Trans>
    </div>
  </div>
);
