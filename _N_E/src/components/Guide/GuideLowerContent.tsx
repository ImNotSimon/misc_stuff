import { logAnalyticsEvent } from '@/analytics/analytics';
import { UserMenu } from '@/components/AppHeader/UserMenu';
import { GuideUpsellsLower } from '@/components/Guide/GuideUpsellsLower';
import { OptOutNav } from '@/components/Guide/OptOutButton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { signinDialogSignal } from '@/lib/state/signals';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';

export function GuideLowerContent() {
  const { user } = useAuth();

  return user ? <GuideLowerContentSignedIn /> : <GuideLowerContentSignedOut />;
}

function GuideLowerContentSignedIn() {
  return (
    <>
      <Separator />
      <GuideUpsellsLower />
      <UserMenu />
    </>
  );
}

function GuideLowerContentSignedOut() {
  return (
    <div className="w-full gap-3 flex-col flex">
      <OptOutNav referrer="signed-out-guide" />
      <Button
        analyticsProps={{
          eventName: AnalyticsEvents.UX.ModalOpened,
          properties: {
            referrer: 'GuideLowerContentSignedOut',
            type: 'SignInDialog',
          },
        }}
        onPress={() => {
          logAnalyticsEvent(AnalyticsEvents.Auth.SignupCancelled, {
            provider: 'google',
            subtype: 'one_tap',
          });
          signinDialogSignal.value = true;
        }}
        className="w-full"
      >
        {t('Common.sign-in')}
      </Button>
    </div>
  );
}
