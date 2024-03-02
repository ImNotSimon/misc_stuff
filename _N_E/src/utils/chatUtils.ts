import {
  DUMMY_MSG,
  TYPING_MSG,
} from '@character-tech/client-common/src/chatManager/chatManagerTypes';
import {
  type Candidate,
  type Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { type Character } from '@character-tech/client-common/src/types/app-api';
import {
  ClientSystemMessageEnum,
  type ViewChatMessage,
} from '@character-tech/client-common/src/types/types';

export const CreatorAttributionId = 'creator_attribution';

export const createChatAttributionMessage = (
  character: Character,
): ViewChatMessage => ({
  author: {
    author_id: character.external_id,
    is_human: false,
    name: character.name,
    avatar_url: character.avatar_file_name,
  },
  candidates: [],
  create_time: new Date().toISOString(),
  last_update_time: new Date().toISOString(),
  primary_candidate_id: CreatorAttributionId,
  state: 'STATE_OK',
  turn_key: {
    chat_id: CreatorAttributionId,
    turn_id: CreatorAttributionId,
  },
  clientSystemMessage: {
    message: character.title,
    payload: character.user__username,
    messageType: ClientSystemMessageEnum.creator_attribution,
  },
});

export const getPrimaryCandidate = (
  processedTurns: ViewChatMessage[],
  primaryCandidateMap: Record<string, number>,
): Candidate | null => {
  if (processedTurns.length === 0) {
    return null;
  }
  const primaryCandidateId =
    primaryCandidateMap[processedTurns[0].turn_key.turn_id];
  // if the candidate map has a primary candidate for the first turn thats in bounds
  if (processedTurns[0].candidates?.length > (primaryCandidateId ?? 0)) {
    const primaryCandidate =
      processedTurns[0].candidates[primaryCandidateId ?? 0];
    return primaryCandidate;
  }
  return null;
};

export const isCandidatePending = (turn: Turn, candidate: Candidate) =>
  !turn.author.is_human &&
  (candidate.candidate_id === TYPING_MSG ||
    candidate.candidate_id === DUMMY_MSG);
