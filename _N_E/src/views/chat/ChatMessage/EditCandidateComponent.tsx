import { EditIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { useCharacter } from '@/context/CharacterContext';
import { editCandidateSignal } from '@/lib/state/signals';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import {
  type Candidate,
  type Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { t } from 'i18next';
import { useCallback } from 'react';
import { EditCandidateText } from './EditCandidateText';

export function EditCandidateButton({
  candidate_id,
}: {
  candidate_id: string;
}) {
  return (
    <Button
      variant="ghost"
      className="justify-between w-full rounded-spacing-s"
      onPress={() => {
        editCandidateSignal.value = candidate_id;
      }}
    >
      {t('Chat.edit-message')} <EditIcon height="1.25em" />
    </Button>
  );
}

export function EditCandidateComponent({
  candidate,
  turn,
}: {
  candidate: Candidate;
  turn: Turn;
}) {
  const { characterId } = useCharacter();
  const { publish } = useChatContext();
  const onSave = useCallback(
    (text: string) => {
      if (text) {
        publish(characterId, {
          type: 'edit_turn_candidate',
          turnKey: turn.turn_key,
          candidateId: candidate.candidate_id,
          newRawContent: text,
        });
        editCandidateSignal.value = null;
      }
    },
    [candidate.candidate_id, characterId, publish, turn.turn_key],
  );

  return (
    <EditCandidateText
      onCancel={() => {
        editCandidateSignal.value = null;
      }}
      onSave={onSave}
      text={candidate.raw_content || ''}
    />
  );
}
