import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { CreatorLink } from '@/components/Common/CreatorLink';
import {
  ClientSystemMessageEnum,
  type ViewChatMessage,
} from '@character-tech/client-common/src/types/types';

export function ChatSystemMessage({ turn }: { turn: ViewChatMessage }) {
  const author = turn.clientSystemMessage?.payload ?? '';
  if (
    turn.clientSystemMessage?.messageType ===
    ClientSystemMessageEnum.creator_attribution
  ) {
    // TODO: hook up these as entry points to the creator / char profile
    return (
      <AnimationFadeInAndOut>
        <div className="flex flex-col items-center justify-center text-center gap-1 pt-12 lg:pt-32">
          <CharacterAvatar
            name={turn.author.name}
            size={64}
            src={turn.author.avatar_url}
          />
          <p className="bold text-lg">{turn.author.name}</p>
          <p className="text-muted-foreground font-light text-md-medium">
            {turn.clientSystemMessage.message}
          </p>
          <CreatorLink
            author={author}
            clickable
            className="text-medium text-muted-foreground font-light"
          />
        </div>
      </AnimationFadeInAndOut>
    );
  }
  return null;
}
