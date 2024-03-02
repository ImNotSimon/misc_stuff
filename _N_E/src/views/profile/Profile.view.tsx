import { logAnalyticsEvent } from '@/analytics/analytics';
import { CaiPlusBadge } from '@/components/Common/CaiPlusBadge';
import { CreatorLink } from '@/components/Common/CreatorLink';
import { NumCharacterAttribute } from '@/components/Common/NumCharacterAttribute';
import { FocusableHumanAvatar } from '@/components/Profile/HumanAvatar';
import { EyeOffIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { settingsDialogOpenSignal } from '@/lib/state/signals';
import { AppPaths } from '@/utils/appUtils';
import { shareLink } from '@/utils/browserUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useGetUpvotedCharacters } from '@character-tech/client-common/src/hooks/queries/social';
import {
  SubscriptionType,
  type PublicUser,
} from '@character-tech/client-common/src/types/app-api';
import { t } from 'i18next';
import { FiEdit3, FiShare } from 'react-icons/fi';
import { useHash } from 'react-use';
import { CharacterList } from './CharacterList';
import { FollowButton } from './FollowButton';
import { FollowerDialog } from './FollowerDialog';
import { PersonaList } from './PersonaList';

export function ProfileView({ publicUser }: { publicUser: PublicUser }) {
  const { user: thisUser, isPlusUser: thisUserIsPlus } = useAuth();

  const handleShare = async () => {
    const href = AppPaths.profile(publicUser.username);
    await shareLink(
      href,
      'Creator Profile',
      t('Share.check-out-this-creator', { href }),
    );
  };

  const sumChats =
    publicUser.characters?.reduce(
      (sum, char) => sum + char.participant__num_interactions,
      0,
    ) ?? 0;

  const sameUsername = publicUser.username === publicUser.name;

  const thisUsername = thisUser?.user?.username;

  const thisIsMe = thisUsername === publicUser.username;

  // we shouldn't need to use thisUserIsPlus from the auth context here but there are some
  // staff accounts that have fake plus subscriptions that aren't returned from the public user
  // endpoint
  const isPlus = thisIsMe
    ? thisUserIsPlus
    : publicUser.subscription_type === SubscriptionType.PLUS;

  const [hash] = useHash();
  const hashValue = hash.replace('#', '');

  const { characters: likedCharacters } = useGetUpvotedCharacters(!thisIsMe);

  return (
    <div className="flex flex-col items-center justify-center p-6 pt-0 mt-32 max-w-lg mx-auto">
      <title>{t('Profile.title', { name: publicUser.name })}</title>
      <FocusableHumanAvatar
        name={publicUser.name || ''}
        size={90}
        src={publicUser.avatar_file_name}
        rounded
      />
      <div className="mt-4 text-display font-thin flex flex-row gap-1 items-center">
        {publicUser.name}
        {!!isPlus && <CaiPlusBadge className="ml-1" />}
      </div>
      {!sameUsername && (
        <CreatorLink
          createdBy={false}
          clickable={false}
          author={publicUser.username}
        />
      )}
      <div className="text-md mt-2 flex items-center justify-center text-muted-foreground gap-2">
        <FollowerDialog user={publicUser} thisIsMe={thisIsMe} />
        <span className="mx-1">|</span>
        <NumCharacterAttribute
          type="interactions"
          num={sumChats}
          capitalized
          iconProps={{ size: '1em', className: '-mr-1' }}
        />
      </div>
      {!!publicUser.bio && (
        <div className="mt-2 text-md text-center whitespace-pre-wrap">
          {publicUser.bio.trim()}
        </div>
      )}
      <div className="mt-4 flex items-center gap-2">
        {thisIsMe ? (
          <Button
            color="secondary"
            onPress={() => {
              settingsDialogOpenSignal.value = true;
              logAnalyticsEvent(AnalyticsEvents.UX.ContentViewed, {
                referrer: 'Profile',
                content: 'settings',
              });
            }}
          >
            <FiEdit3 className="mr-1" />
            {t('Profile.settings-button')}
          </Button>
        ) : (
          <FollowButton
            username={publicUser.username}
            requesterUsername={thisUser?.user?.username}
          />
        )}
        <Button isIconOnly variant="outline" onPress={handleShare}>
          <FiShare />
        </Button>
      </div>
      <div className="mt-4 w-full">
        <Tabs
          defaultValue={hashValue || 'characters'}
          className="flex flex-col items-center w-full"
          tabIndex={-1}
          referrer="Profile"
        >
          <TabsList>
            <TabsTrigger value="characters">
              {t('Profile.characters')}
            </TabsTrigger>
            {!!thisIsMe && (
              <>
                <TabsTrigger value="liked" className="flex gap-1">
                  <EyeOffIcon height="16px" />
                  {t('Profile.liked')}
                </TabsTrigger>
                <TabsTrigger value="personas" className="flex gap-1">
                  <EyeOffIcon height="16px" />
                  {t('Profile.personas')}
                </TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent
            value="characters"
            className="flex w-full flex-col items-center"
          >
            <CharacterList
              characters={publicUser.characters}
              noCharacterText={
                thisIsMe
                  ? t('Profile.no-characters-you')
                  : t('Profile.no-characters')
              }
              thisUsername={thisUsername}
              referrer="Profile: Characters Tab"
            />
          </TabsContent>
          <TabsContent
            value="liked"
            className="flex w-full flex-col items-center"
          >
            <CharacterList
              characters={likedCharacters}
              noCharacterText={t('Profile.no-characters-liked')}
              thisUsername={thisUsername}
              referrer="Profile: Liked Tab"
            />
          </TabsContent>

          {!!thisIsMe && (
            <TabsContent
              value="personas"
              className="flex w-96 flex-col items-center"
            >
              <PersonaList />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
