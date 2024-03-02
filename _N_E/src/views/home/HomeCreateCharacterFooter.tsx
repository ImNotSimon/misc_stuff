import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { StarsFilledIcon } from '@/components/ui/Icon';
import { AppPaths } from '@/utils/appUtils';
import { CreateCharacterGraphic } from '@/views/home/createCharacterGraphic/CreateCharacterGraphic';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import Link from 'next/link';

export const HomeCreateCharacterFooter = () => (
  <div className="w-full flex flex-col items-center justify-center">
    <CreateCharacterGraphic />
    <div className="my-spacing-xl max-w-[480px] w-full flex flex-col gap-spacing-s  items-center">
      <p className="text-display">{t('Home.create-a-character')}</p>
      <p className="text-muted-foreground flex text-center text-md">
        {t('Home.not-vibing')}
      </p>
      <Button
        as={Link}
        href={AppPaths.character()}
        startContent={<StarsFilledIcon height="16px" width="16px" />}
        onPress={() => {
          logAnalyticsEvent(AnalyticsEvents.UX.PageViewed, {
            referrer: 'HomeCreateCharacterFooter',
          });
        }}
      >
        {t('Home.create-a-character')}
      </Button>
    </div>
  </div>
);
