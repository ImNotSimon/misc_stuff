import { CharacterAvatar } from '@/components/Character/CharacterAvatar';
import { WaveFormDots } from '@/components/Voice/SoundWave';
import { useVoiceContext } from '@/context/VoiceContext';
import { useIsSmallScreen } from '@/hooks/displayHooks';
import { chatStyleSignal, editCandidateSignal } from '@/lib/state/signals';
import { cn } from '@/lib/utils';
import { ChatStyle } from '@/utils/constants';
import type {
  Candidate,
  Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { useSignalValue } from 'signals-react-safe';
import { ChatCandidateContent } from './ChatCandidateContent';
import { ChatTurnHeaderComponent } from './ChatTurnHeader';
import { EditCandidateComponent } from './EditCandidateComponent';

export function ChatCandidateComponent({
  turn,
  candidate,
  includeWaveForm,
}: {
  turn: Turn;
  candidate: Candidate;
  includeWaveForm?: boolean;
}) {
  const isSmallScreen = useIsSmallScreen();
  const { isCharacterMaybeSpeaking } = useVoiceContext();
  const editCandidateValue = useSignalValue(editCandidateSignal);
  const chatStyleSignalValue = useSignalValue(chatStyleSignal);

  const isLegacyChatStyle = chatStyleSignalValue === ChatStyle.classic;
  const rightAlign = turn.author.is_human && !isLegacyChatStyle;
  let background = '';
  if (!isLegacyChatStyle) {
    background = turn.author.is_human
      ? 'bg-surface-elevation-3'
      : 'bg-surface-elevation-2';
  }
  return (
    <div
      className={cn(
        `m-0 flex flex-row items-start gap-2 justify-start`,
        // pivot the turn to the left or right depending on the author
        rightAlign ? 'mr-0 md:mr-6 flex-row-reverse' : 'ml-0 md:ml-6',
      )}
    >
      <div className="mt-0 hidden md:flex flex-col gap-3 items-center">
        <CharacterAvatar
          name={turn.author.name}
          size={24}
          src={turn.author.avatar_url}
        />
        {!!includeWaveForm && !!isCharacterMaybeSpeaking && <WaveFormDots />}
      </div>
      <div
        className={cn(
          'flex flex-col gap-1',
          rightAlign ? 'items-end sm:-mr-2' : 'items-start sm:-ml-2',
          { 'w-full': editCandidateSignal },
        )}
      >
        <ChatTurnHeaderComponent author={turn.author} />

        {editCandidateValue === candidate.candidate_id ? (
          <EditCandidateComponent candidate={candidate} turn={turn} />
        ) : (
          <div
            style={{ minWidth: isSmallScreen ? undefined : 60 }}
            className={cn(
              'mt-1 max-w-xl rounded-2xl px-3 min-h-12 flex justify-center ',
              background,
              { 'py-3': !isLegacyChatStyle },
            )}
          >
            <ChatCandidateContent
              candidate={candidate}
              turn={turn}
              key={candidate.candidate_id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
