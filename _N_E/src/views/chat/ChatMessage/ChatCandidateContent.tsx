import { CandidateDebugInfo } from '@/components/Debug/CandidateDebugInfo';
import { PinFilledIcon } from '@/components/ui/Icon';
import { TypingIndicator } from '@/components/ui/typingIndicator';
import { cn } from '@/lib/utils';
import { isCandidatePending } from '@/utils/chatUtils';
import type {
  Candidate,
  Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { t } from 'i18next';
import { isMobile } from 'react-device-detect';
import { ChatCandidateText } from './ChatCandidateText';
import { ChatImage } from './ChatImage';
import { FilterCandidateWarning } from './FilterCandidateWarning';

export function ChatCandidateContent({
  turn,
  candidate,
}: {
  turn: Turn;
  candidate: Candidate;
}) {
  const isPinned = turn.is_pinned;
  const isEdited = candidate.base_candidate_id;
  if (isCandidatePending(turn, candidate)) {
    return (
      <div className="px-4 mt-1">
        <TypingIndicator />
      </div>
    );
  }
  return (
    // swipe no swiping is a real class
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div
      className={cn('font-display font-light', {
        'swiper-no-swiping': !isMobile,
      })}
    >
      <ChatCandidateText candidate={candidate} />
      {!!candidate.tti_image_rel_path && (
        <ChatImage
          src={candidate.tti_image_rel_path}
          retryCount={10}
          className="m-2"
        />
      )}
      <div className="flex flex-row gap-1 items-center">
        {!!isPinned && (
          <>
            <PinFilledIcon
              height="0.75em"
              style={{ rotate: '-30deg' }}
              color="var(--blue)"
            />
            <p className="text-sm text-blue">{t('Chat.pinned')}</p>
          </>
        )}
        {!!isPinned && !!isEdited && (
          <p className="text-sm text-muted-foreground">•</p>
        )}
        {!!isEdited && (
          <p
            className="text-sm text-muted-foreground"
            title={t('Chat.tooltip-message-edited-by-user')}
          >
            {t('Chat.edited')}
          </p>
        )}
      </div>
      {!!candidate.safety_truncated && <FilterCandidateWarning />}
      <CandidateDebugInfo candidate={candidate} turn={turn} />
    </div>
  );
}
