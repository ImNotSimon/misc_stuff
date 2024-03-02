import { CaiPlusBadge } from '@/components/Common/CaiPlusBadge';
import { OptOutNav } from '@/components/Guide/OptOutButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { plusSubscriptionDialogSignal } from '@/lib/state/signals';
import { t } from 'i18next';

export function GuideUpsellsLower() {
  const { isPlusUser } = useAuth();

  return (
    <div className="flex flex-col gap-3 py-3">
      <OptOutNav referrer="guide" />
      {!isPlusUser && (
        <Button
          variant="outline"
          onPress={() => {
            plusSubscriptionDialogSignal.value = true;
          }}
          className="bold flex w-full justify-center bg-background py-3 hover hover:shadow-plus-shadow hover:bg-primary-foreground"
        >
          {t('Monetization.upgrade-to-c-ai')}
          <CaiPlusBadge className="p-0 text-light bg-transparent" />
        </Button>
      )}
    </div>
  );
}
