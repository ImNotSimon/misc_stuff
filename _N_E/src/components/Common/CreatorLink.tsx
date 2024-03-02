import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { cn } from '@/lib/utils';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';

export function CreatorLink({
  author,
  clickable = true,
  createdBy = true,
  className = '',
}: {
  author: string;
  clickable?: boolean;
  createdBy?: boolean;
  className?: string;
}) {
  const displayString = createdBy
    ? t('Character.by-username', {
        username: author,
      })
    : `@${author}`;

  return (
    <div
      className={cn(
        'text-muted-foreground font-normal text-sm truncate',
        className,
      )}
    >
      {!!clickable && (
        <LinkWithAnalytics
          href={AppPaths.profile(author)}
          className="hover:text-foreground"
          analyticsProps={{
            eventName: AnalyticsEvents.UX.PageViewed,
            properties: {
              page_name: 'Profile',
              referrer: 'CreatorLink',
              author,
            },
          }}
        >
          {displayString}
        </LinkWithAnalytics>
      )}
      {!clickable && displayString}
    </div>
  );
}
