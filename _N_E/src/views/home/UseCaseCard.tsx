import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import LinkWithAnalytics from '@/components/ui/button/linkWithAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { AppPaths } from '@/utils/appUtils';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { t } from 'i18next';

export const UseCaseCardCore = ({
  name,
  characterId,
  label,
  avatar_file_name,
}: {
  name: string;
  characterId: string;
  label: string;
  avatar_file_name: string;
}) => {
  const link = AppPaths.chat(characterId);
  return (
    <LinkWithAnalytics
      className="min-w-[200px] w-[312px] flex flex-row gap-2 p-3 items-center bg-surface-elevation-1 hover:brightness-105 rounded-spacing-s"
      href={link}
      analyticsProps={{
        eventName: AnalyticsEvents.Links.Handled,
        properties: {
          link,
          referrer: 'UseCaseCard',
        },
      }}
    >
      <CharacterAvatar name={name} size={54} src={avatar_file_name} />
      <div className="flex flex-col">
        <p className="line-clamp-2 text-ellipsis">{label}</p>
        <p className="line-clamp-1 text-ellipsis text-muted-foreground text-md">
          {t('Feed.with-character', { name })}
        </p>
      </div>
    </LinkWithAnalytics>
  );
};

export const UseCaseCard = ({
  characterId,
  label,
}: {
  characterId: string;
  label: string;
}) => {
  const { character } = useCharacterInfo(characterId);

  if (!character) {
    return (
      <Skeleton className="h-20 min-w-[200px] w-[312px] rounded-spacing-s" />
    );
  }
  return (
    <UseCaseCardCore
      characterId={characterId}
      label={label}
      name={character.name}
      avatar_file_name={character.avatar_file_name}
    />
  );
};
