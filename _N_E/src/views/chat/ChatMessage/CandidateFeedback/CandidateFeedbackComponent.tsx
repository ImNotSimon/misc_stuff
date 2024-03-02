import { logAnalyticsEvent } from '@/analytics/analytics';
import { StarRatingButton } from '@/components/Common/StarRatingButton';
import { ButtonGroup } from '@/components/ui/button';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import type {
  Candidate,
  Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { neoAPI } from '@character-tech/client-common/src/chatManager/neoAPI';
import { useState } from 'react';
import { CandidateFeedbackDialog } from './AdditionalCandidateFeedbackDialog';

export const CandidateFeedbackButtons = ({
  rating,
  onRatingPress,
}: {
  rating: number;
  onRatingPress: (idx: number) => void;
}) => {
  const ratings = [...Array(4)];

  return (
    <ButtonGroup isIconOnly className="h-6">
      {ratings.map((_, idx) => (
        <StarRatingButton
          key={idx}
          filled={idx <= rating}
          onPress={() => onRatingPress(idx)}
        />
      ))}
    </ButtonGroup>
  );
};

export function CandidateFeedbackComponent({
  turn,
  candidate,
}: {
  turn: Turn;
  candidate: Candidate;
}) {
  const [rating, setRating] = useState(-1);
  const [showTellUsMore, setShowTellUsMore] = useState(false);
  const [existingAnnotationId, setExistingAnnotationId] = useState<
    string | null
  >(null);

  // only show feedback for AI that have finished their message, and have sa message
  const showFeedback =
    !turn.author.is_human &&
    candidate.is_final &&
    candidate.fresh &&
    candidate.raw_content;

  if (!showFeedback) {
    return null;
  }

  const onRatingPress = async (idx: number) => {
    const newRating = rating === idx ? -1 : idx;
    setRating(newRating);
    setShowTellUsMore(newRating !== -1);
    // if this rating is different from the previous one, create a new annotation
    if (rating !== idx) {
      try {
        // TODO: investigate moving this to query mutation
        const annotationReponse = await neoAPI.createAnnotation(
          turn.turn_key,
          candidate.candidate_id,
          {
            annotation_type: 'star',
            annotation_value: newRating + 1,
          },
        );
        // store the annotation id so we can delete it later if we remove this rating
        if (annotationReponse?.data?.annotation?.annotation_id) {
          setExistingAnnotationId(
            annotationReponse.data.annotation.annotation_id,
          );
        }
        logAnalyticsEvent(AnalyticsEvents.UX.ElementClicked, {
          referrer: 'CandidateFeedbackComponent',
          type: 'star_rating',
        });
      } catch (e) {
        // TODO: add error logging when logger is setup
        console.error('Failed to set rating', e);
      }
      // remove the old annotation if it exists
    } else if (existingAnnotationId) {
      try {
        // TODO: investigate moving this to query mutation
        await neoAPI.removeAnnotation(
          turn.turn_key,
          candidate.candidate_id,
          existingAnnotationId,
        );
        setExistingAnnotationId(null);
      } catch (e) {
        // TODO: add error logging when logger is setup
        console.error('Failed to delete rating', e);
      }
    }
  };

  return (
    <div className="flex flex-1 justify-start items-center gap-2 ">
      <CandidateFeedbackButtons onRatingPress={onRatingPress} rating={rating} />
      {!!showTellUsMore && (
        <CandidateFeedbackDialog turn={turn} candidate={candidate} />
      )}
    </div>
  );
}
