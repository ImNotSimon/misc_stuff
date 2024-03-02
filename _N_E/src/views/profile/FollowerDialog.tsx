import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppUtils } from '@/utils/appUtils';
import {
  useGetPublicFollowers,
  useGetPublicFollowing,
  type SocialInfoResponse,
  type SocialUserInfo,
} from '@character-tech/client-common/src/hooks/queries/social';
import { type PublicUser } from '@character-tech/client-common/src/types/app-api';
import {
  type FetchNextPageOptions,
  type InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { t } from 'i18next';
import { X } from 'lucide-react';
import { useState } from 'react';
import { InfiniteScrollUserList } from './InfiniteScrollUserList';

// TODO sophia: add logging for clicking into a user item and for opening the modal

export function FollowerDialog({
  user,
  thisIsMe,
}: {
  user: PublicUser;
  thisIsMe: boolean;
}) {
  const [open, setOpen] = useState(false);

  const { username } = user;

  const {
    users: followers,
    hasNextPage: hasNextPageFollowers,
    fetchNextPage: fetchNextPageFollowers,
  } = useGetPublicFollowers(username);

  const {
    users: following,
    hasNextPage: hasNextPageFollowing,
    fetchNextPage: fetchNextPageFollowing,
  } = useGetPublicFollowing(username);

  return (
    <FollowerDialogCore
      open={open}
      setOpen={setOpen}
      user={user}
      thisIsMe={thisIsMe}
      followers={followers}
      hasNextPageFollowers={hasNextPageFollowers}
      fetchNextPageFollowers={fetchNextPageFollowers}
      following={following}
      hasNextPageFollowing={hasNextPageFollowing}
      fetchNextPageFollowing={fetchNextPageFollowing}
    />
  );
}
interface FollowerDialogCoreProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  user: PublicUser;
  thisIsMe: boolean;
  followers: SocialUserInfo[];
  hasNextPageFollowers: boolean | undefined;
  fetchNextPageFollowers: (
    options?: FetchNextPageOptions,
  ) => Promise<InfiniteQueryObserverResult<SocialInfoResponse, unknown>>;
  following: SocialUserInfo[];
  hasNextPageFollowing?: boolean;
  fetchNextPageFollowing: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<InfiniteQueryObserverResult<SocialInfoResponse, unknown>>;
}

export function FollowerDialogCore({
  open,
  setOpen,
  user,
  thisIsMe,
  followers,
  hasNextPageFollowers,
  fetchNextPageFollowers,
  following,
  hasNextPageFollowing,
  fetchNextPageFollowing,
}: FollowerDialogCoreProps) {
  const closeDialog = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      analyticsProps={{ referrer: 'Profile', type: 'FollowerDialog' }}
    >
      <DialogTrigger asChild>
        <span className="hover:cursor-pointer hover:text-primary">
          {t(`Profile.num_followers`, {
            count: user.num_followers,
            // TODO update the type in client common to optional
            formatted: AppUtils.formatNumber(user.num_followers ?? 0),
          })}
          <span className="mx-2">•</span>
          {t(`Profile.num_following`, {
            // TODO update the type in client common to optional
            formatted: AppUtils.formatNumber(user.num_following ?? 0),
          })}
        </span>
      </DialogTrigger>
      <DialogContent
        className="w-full sm:w-[400px] h-[calc(100vh-20vh)] pt-4 overflow-y-hidden px-3"
        hideClose
      >
        <Tabs
          defaultValue="followers"
          className="flex flex-col items-center h-full overflow-y-hidden"
          tabIndex={-1}
        >
          <TabsList className="sticky top-0 w-full bg-popover z-10 py-6">
            <DialogClose className="absolute right-1 top-0">
              <X className="h-4 w-4" />
              <span className="sr-only">{t('Common.close')}</span>
            </DialogClose>
            <TabsTrigger value="followers">
              {t(`Profile.followers_num`, {
                count: user.num_followers ?? 0,
                formatted: AppUtils.formatNumber(user.num_followers ?? 0),
              })}
            </TabsTrigger>
            <TabsTrigger value="following">
              {t(`Profile.following_num`, {
                count: user.num_following,
                formatted: AppUtils.formatNumber(user.num_following ?? 0),
              })}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="followers"
            className="w-full h-full overflow-y-hidden"
          >
            <InfiniteScrollUserList
              users={followers}
              hasNextPage={!!hasNextPageFollowers}
              fetchNextPage={fetchNextPageFollowers}
              handleItemClick={closeDialog}
            />
          </TabsContent>
          <TabsContent
            value="following"
            className="w-full h-full overflow-y-hidden"
          >
            <InfiniteScrollUserList
              users={following}
              hasNextPage={!!hasNextPageFollowing}
              fetchNextPage={fetchNextPageFollowing}
              hideRelationship={thisIsMe}
              handleItemClick={closeDialog}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
