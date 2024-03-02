'use client';

import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { CreatorLink } from '@/components/Common/CreatorLink';
import { AppUtils } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { t } from 'i18next';
import LinkWithAnalytics from '../ui/button/linkWithAnalytics';
import { Skeleton } from '../ui/skeleton';

type CharacterListItemProps = {
  referrer: string;
  name: string;
  href: string;
  title?: string;
  src?: string;
  author?: string;
  interactions?: number;
  upvotes?: number;
};

export function CharacterListItemCompactSkeleton() {
  return (
    <div className="my-2 flex h-10 items-center gap-2 p-2 pl-4">
      <Skeleton className="mr-2 h-8 w-8 min-w-[2rem] rounded-sm" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function CharacterListItemCompact({
  referrer,
  name,
  src,
  href,
  title,
  author,
  interactions,
  upvotes,
}: CharacterListItemProps) {
  const renderInfo = () => {
    const elems = [];
    if (!!interactions && interactions > 0) {
      elems.push(
        <div>
          {t('Common.num-chats', {
            num: AppUtils.formatNumber(interactions),
            count: interactions,
          })}
        </div>,
      );
    }
    if (!!upvotes && upvotes > 0) {
      if (elems.length >= 1) {
        elems.push(<>•</>);
      }
      elems.push(
        <div>
          {t('Common.num-likes', {
            num: AppUtils.formatNumber(upvotes),
            count: upvotes,
          })}
        </div>,
      );
    }
    if (author) {
      if (elems.length >= 1) {
        elems.push(<>•</>);
      }
      elems.push(<CreatorLink author={author} clickable={false} />);
    }
    return <>{elems.map((elem) => elem)}</>;
  };

  return (
    <LinkWithAnalytics
      href={href}
      analyticsProps={{
        eventName: AnalyticsEvents.Links.Handled,
        properties: {
          link: href,
          referrer,
          type: 'CharacterListItemCompact',
        },
      }}
    >
      <div className="group my-1 flex w-full flex-row justify-between hover:bg-surface-elevation-3 hover:rounded-spacing-m p-2 items-center">
        <div className="flex w-full flex-row gap-3 items-center">
          <CharacterAvatar name={name} src={src} size={40} circle={false} />
          <div className="flex flex-1 flex-col justify-center">
            <p>{name}</p>
            <p className="text-md mb-1 line-clamp-1 text-ellipsis text-muted-foreground">
              {title}
            </p>
            <div className="flex gap-1 text-muted-foreground text-sm">
              {renderInfo()}
            </div>
          </div>
        </div>
      </div>
    </LinkWithAnalytics>
  );
}
