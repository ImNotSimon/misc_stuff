import { Button } from '@/components/ui/button';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { AppPaths } from '@/utils/appUtils';
import { FollowButton } from '@/views/profile/FollowButton';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { type SocialUserInfo } from '@character-tech/client-common/src/hooks/queries/social';
import { HumanAvatar } from '../Profile/HumanAvatar';

interface UserListItemSocialProps {
  user: SocialUserInfo;
  hideRelationship?: boolean;
  handleClick?: () => void;
  className?: string;
}

export function UserListItemSocial({
  user,
  hideRelationship,
  handleClick,
  className,
}: UserListItemSocialProps) {
  const thisUser = useAuth().user;

  const {
    username,
    account__avatar_file_name: avatarFileName,
    account__bio: bio,
  } = user;

  return (
    <Button
      variant="ghost"
      as={LinkWithAnalytics}
      href={AppPaths.profile(user.username)}
      analyticsProps={{
        eventName: AnalyticsEvents.UX.PageViewed,
        properties: {
          page_name: 'Profile',
          referrer: 'UserListItemSocial',
          username: user.username,
        },
      }}
      className={cn(
        'h-fit flex w-full flex-row justify-between items-center rounded-spacing-xs p-2 gap-3',
        className,
      )}
      onPress={() => handleClick?.()}
    >
      <div className="shrink-0">
        <HumanAvatar
          name={username || ''}
          size={40}
          src={avatarFileName}
          rounded
        />
      </div>
      <div className="flex flex-1 min-w-0 flex-col justify-center pr-1 overflow-hidden">
        <p className="text-md truncate">{user.username}</p>
        {!!bio && (
          <p className="text-md truncate text-muted-foreground">{bio}</p>
        )}
      </div>
      {!hideRelationship && (
        <div className="shrink-0">
          <FollowButton
            username={user.username}
            requesterUsername={thisUser?.user?.username}
          />
        </div>
      )}
    </Button>
  );
}
