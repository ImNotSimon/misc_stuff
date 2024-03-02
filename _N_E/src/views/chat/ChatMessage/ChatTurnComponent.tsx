import { cn } from '@/lib/utils';
import type { ViewChatMessage } from '@character-tech/client-common/src/types/types';
import { ChatCandidateComponent } from './ChatCandidateComponent';
import { ChatCarouselComponent } from './ChatCarouselComponent';
import { ChatTurnOptionsMenu } from './ChatTurnOptions/ChatTurnOptionsMenu';
import { ChatSystemMessage } from './SystemMessages/ChatSystemMessage';

export function ChatTurnComponent({
  turn,
  isLastTurn,
  primaryCandidateIndex,
  listItemIndex,
}: {
  turn: ViewChatMessage;
  isLastTurn: boolean;
  primaryCandidateIndex?: number;
  listItemIndex?: number;
}) {
  // If the last turn is not human, render a carousel.
  const shouldRenderCarousel =
    isLastTurn &&
    !turn.author.is_human &&
    !turn.isGreetingMessage &&
    !turn.is_pinned;

  if (turn.clientSystemMessage) {
    return (
      <SizedWrapper>
        <ChatSystemMessage turn={turn} />
      </SizedWrapper>
    );
  }

  if (!turn?.candidates || turn.candidates.length === 0) {
    return null;
  }

  const candidateIndex = Math.min(
    primaryCandidateIndex || 0,
    turn.candidates.length - 1,
  );
  const candidate = turn.candidates[candidateIndex];
  if (!candidate) {
    return null;
  }
  const menuProps = {
    isLastTurn,
    listItemIndex,
    turn,
    candidate,
  };

  if (shouldRenderCarousel) {
    return (
      <SizedWrapper>
        <ChatCarouselComponent
          turn={turn}
          primaryCandidateIndex={primaryCandidateIndex}
        />
        <ChatTurnOptionsMenu {...menuProps} />
      </SizedWrapper>
    );
  }

  return (
    <SizedWrapper className="p-2">
      <ChatCandidateComponent candidate={candidate} turn={turn} />
      <ChatTurnOptionsMenu {...menuProps} />
    </SizedWrapper>
  );
}

function SizedWrapper({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('group relative max-w-3xl m-auto', className)}>
      {children}
    </div>
  );
}
