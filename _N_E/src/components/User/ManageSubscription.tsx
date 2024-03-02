import { CAIPLUS_PRICE, CUSTOMER_PORTAL_LINK } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { RainbowGlow } from '../ui/RainbowGlow';
import { Button } from '../ui/button';

export const ManageSubscription = ({ isPlus }: { isPlus: boolean }) => {
  const renderPrice = () => {
    if (isPlus) {
      return (
        <p className="text-sm text-muted-foreground">
          <Trans
            i18nKey="Subscription.price-per-month"
            values={{ price: CAIPLUS_PRICE }}
            components={{
              price: <span className="text-primary text-lg" />,
              perMonth: <span />,
            }}
          />
        </p>
      );
    }
    return <p>{t('Subscription.free')}</p>;
  };

  const renderButton = () => {
    if (isPlus) {
      return (
        <Button
          variant="ghost"
          className="bg-accent"
          analyticsProps={{
            eventName: AnalyticsEvents.Links.Opened,
            properties: {
              referrer: 'ManageSubscription',
              link: CUSTOMER_PORTAL_LINK,
              type: 'manage',
            },
          }}
        >
          <a href={CUSTOMER_PORTAL_LINK} target="_blank">
            {t('Common.manage')}
          </a>
        </Button>
      );
    }
    return (
      <RainbowGlow>
        <Button
          className="font-sans font-semibold"
          analyticsProps={{
            eventName: AnalyticsEvents.Links.Opened,
            properties: {
              referrer: 'ManageSubscription',
              link: CUSTOMER_PORTAL_LINK,
              type: 'upgrade',
            },
          }}
        >
          <a href={CUSTOMER_PORTAL_LINK} target="_blank">
            {t('Subscription.upgrade')}
          </a>
        </Button>
      </RainbowGlow>
    );
  };

  return (
    <div className="w-full flex flex-row justify-between p-3 border-1 border-accent rounded-spacing-xs">
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground">
          {t('Subscription.your-current-plan')}
        </p>
        {renderPrice()}
      </div>
      {renderButton()}
    </div>
  );
};
