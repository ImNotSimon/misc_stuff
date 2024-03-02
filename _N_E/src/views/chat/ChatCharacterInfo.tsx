import { FocusableCharacterAvatar } from '@/components/Character/CharacterAvatar';
import { CreatorLink } from '@/components/Common/CreatorLink';
import { cn } from '@/lib/utils';
import { AppUtils } from '@/utils/appUtils';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import { t } from 'i18next';

export function ChatCharacterInfo({
  characterId,
  className,
}: {
  characterId: string | null;
  className?: string;
}) {
  const { character } = useCharacterInfo(characterId ?? '');

  if (!character) {
    return null;
  }

  return (
    <div className={cn('flex gap-3', className)}>
      <FocusableCharacterAvatar
        name={character.name}
        size={40}
        src={character.avatar_file_name}
      />
      <div>
        <p className="font-semi-bold line-clamp-1 text-ellipsis break-anywhere overflow-hidden whitespace-normal">
          {character.name}
        </p>
        <CreatorLink author={character.user__username} />
      </div>
    </div>
  );
}

export function ChatCharacterInfoDetailed({
  characterId,
}: {
  characterId: string | null;
}) {
  const { character } = useCharacterInfo(characterId ?? '');

  if (!character) {
    return null;
  }

  const numChats = AppUtils.formatNumber(
    character?.participant__num_interactions ?? 0,
  );

  return (
    <div className="flex gap-3">
      <FocusableCharacterAvatar
        name={character.name}
        size={68}
        src={character.avatar_file_name}
      />
      <div className="flex-col flex gap-1">
        <p className="font-semi-bold">{character.name}</p>
        <CreatorLink author={character.user__username} />
        <div
          className="text-sm text-muted-foreground flex gap-1"
          title={t('Common.character-interactions')}
        >
          {t('Common.num-chats', {
            num: numChats,
            count: character?.participant__num_interactions ?? 0,
          })}
        </div>
      </div>
    </div>
  );
}
