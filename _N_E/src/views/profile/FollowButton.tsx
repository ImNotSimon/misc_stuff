import { logAnalyticsEvent } from '@/analytics/analytics';
import { Button } from '@/components/ui/button';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import {
  socialKeys,
  useFollowUser,
  useUnfollowUser,
} from '@character-tech/client-common/src/hooks/queries/social';
import { useIsFollowing } from '@character-tech/client-common/src/hooks/social';
import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';

export function FollowButton({
  username,
  requesterUsername,
}: {
  username: string;
  requesterUsername?: string;
}) {
  const queryClient = useQueryClient();
  const { isFollowing } = useIsFollowing(username);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handlePublicUserInvalidation = (name: string) =>
    void queryClient.invalidateQueries([socialKeys.publicUser(name)]);

  const handleFollowToggle = async () => {
    if (!requesterUsername) {
      return;
    }

    if (isFollowing) {
      logAnalyticsEvent(AnalyticsEvents.User.SocialAction, {
        referrer: 'FollowButton',
        type: 'unfollow',
      });
      unfollowUser.mutate(
        {
          username,
          requesterUsername,
        },
        {
          //  need to invalidate the prefetch
          onSuccess: () => handlePublicUserInvalidation(requesterUsername),
        },
      );
    } else {
      logAnalyticsEvent(AnalyticsEvents.User.SocialAction, {
        referrer: 'FollowButton',
        type: 'follow',
      });
      followUser.mutate(
        {
          username,
          requesterUsername,
        },
        {
          //  need to invalidate the prefetch
          onSuccess: () => handlePublicUserInvalidation(requesterUsername),
        },
      );
    }
  };

  return (
    <Button
      onPress={handleFollowToggle}
      preventDefault
      isDisabled={!requesterUsername}
      variant={isFollowing ? 'ghost' : 'primary'}
      className={
        isFollowing ? 'bg-surface-elevation-2 hover:bg-surface-elevation-3' : ''
      }
    >
      {isFollowing
        ? t('Profile.followButtonFollowing')
        : t('Profile.followButton')}
    </Button>
  );
}
