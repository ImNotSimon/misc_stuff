import type {
  Candidate,
  Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { neoAPI } from '@character-tech/client-common/src/chatManager/neoAPI';
import { useAnnotations } from '@character-tech/client-common/src/hooks/queries/chat';
import { useCallback, useState } from 'react';
import { CandidateFeedbackDialogContent } from './CandidateFeedbackDialogContent';

export function CandidateFeedbackDialog({
  turn,
  candidate,
}: {
  turn: Turn;
  candidate: Candidate;
}) {
  const [selectedPills, setSelectedPills] = useState<string[]>([]);
  const { addAnnotationMutation, removeAnnotation } = useAnnotations(
    turn.turn_key,
    candidate.candidate_id,
  );

  const togglePillSelection = useCallback(
    (pillName: string) => {
      if (selectedPills.includes(pillName)) {
        removeAnnotation(pillName);
        setSelectedPills(selectedPills.filter((p) => p !== pillName));
      } else {
        addAnnotationMutation(pillName);
        setSelectedPills([...selectedPills, pillName]);
      }
    },
    [addAnnotationMutation, removeAnnotation, selectedPills],
  );

  const saveCustomFeedback = async (text: string) => {
    try {
      if (text) {
        // TODO: move this to a hook and promote
        await neoAPI.createAnnotation(turn.turn_key, candidate.candidate_id, {
          annotation_type: 'custom',
          annotation_raw_content: text,
        });
      }
    } catch (error) {
      console.error('Failed to leave custom feedback', { error });
    }
  };

  return (
    <CandidateFeedbackDialogContent
      saveCustomFeedback={saveCustomFeedback}
      selectedPills={selectedPills}
      togglePillSelection={togglePillSelection}
    />
  );
}
