import { Button } from '@/components/ui/button';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { cn } from '@/lib/utils';
import { ExternalLinks } from '@/utils/constants';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { HiOutlineSwitchHorizontal } from 'react-icons/hi';

export function OptOutNav({
  className,
  referrer,
}: {
  className?: string;
  referrer: string;
}) {
  return (
    <Button
      as={LinkWithAnalytics}
      href={ExternalLinks.legacySite}
      variant="outline"
      className={cn('bold flex w-full justify-center py-3', className)}
      startContent={
        <HiOutlineSwitchHorizontal className="size-4 text-muted-foreground" />
      }
      analyticsProps={{
        eventName: AnalyticsEvents.Links.Opened,
        properties: {
          referrer,
          link: ExternalLinks.legacySite,
          type: 'next-opt-out',
        },
      }}
    >
      {t('Common.legacy-site')}
    </Button>
  );
}
