import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { CompassFilledIcon, PlusIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import { usePathname } from 'next/navigation';

export function GuideUpperContent() {
  const pathname = usePathname();
  const isDiscoverPage = pathname === AppPaths.home();

  return (
    <div className="w-full px-4">
      <Button
        as={LinkWithAnalytics}
        href={AppPaths.character()}
        color="secondary"
        className="min-h-12 w-32 justify-start bg-surface-elevation-1 border-1 border-surface-elevation-3"
        startContent={<PlusIcon color="var(--muted-foreground)" height="2em" />}
        onPress={() => {
          logAnalyticsEvent(AnalyticsEvents.UX.PageViewed, {
            page_name: 'CharacterEditor',
            referrer: 'GuideUpperContent',
          });
        }}
      >
        {t('Guide.create')}
      </Button>
      <Button
        as={LinkWithAnalytics}
        href="/"
        variant="ghost"
        className={cn('min-h-12 justify-start mt-2 w-full rounded-spacing-xs', {
          'bg-secondary': isDiscoverPage,
        })}
        startContent={
          <CompassFilledIcon
            color={
              isDiscoverPage ? 'var(--primary)' : 'var(--muted-foreground)'
            }
            height="2em"
            className="mr-1"
          />
        }
        onPress={() => {
          logAnalyticsEvent(AnalyticsEvents.UX.PageViewed, {
            page_name: 'Discover',
            referrer: 'GuideUpperContent',
          });
        }}
      >
        {t('Guide.discover')}
      </Button>
    </div>
  );
}
