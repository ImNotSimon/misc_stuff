import { UserListItemSocial } from '@/components/User/UserListItemSocial';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import {
  type SocialInfoResponse,
  type SocialUserInfo,
} from '@character-tech/client-common/src/hooks/queries/social';
import {
  type FetchNextPageOptions,
  type InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';

interface InfiniteScrollUserListProps {
  users: SocialUserInfo[];
  hasNextPage: boolean;
  fetchNextPage: (
    options?: FetchNextPageOptions,
  ) => Promise<InfiniteQueryObserverResult<SocialInfoResponse, unknown>>;
  hideRelationship?: boolean;
  handleItemClick?: () => void;
}

export function InfiniteScrollUserList({
  users,
  hasNextPage,
  fetchNextPage,
  hideRelationship,
  handleItemClick,
}: InfiniteScrollUserListProps) {
  const { user: thisUser } = useAuth();

  return (
    <div className="overflow-y-auto h-full" id="scrollableDiv">
      <InfiniteScroll
        scrollableTarget="scrollableDiv"
        dataLength={users.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={
          <div className="w-full flex items-center justify-center">
            <Progress />
          </div>
        }
        className="flex w-full flex-col items-start gap-1"
      >
        {(users ?? []).map((user) => (
          <UserListItemSocial
            key={user.username}
            user={user}
            hideRelationship={
              hideRelationship || user.username === thisUser?.user?.username
            }
            handleClick={handleItemClick}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
}
