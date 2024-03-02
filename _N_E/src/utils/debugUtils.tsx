import type { Candidate } from '@character-tech/client-common/src/chatManager/chatServiceTypes';

export const parseDebugInfo = (candidate?: Candidate) => {
  if (!candidate?.is_final || !candidate.debug_info) {
    return {};
  }

  let formattedDebugInfo = {};
  try {
    formattedDebugInfo = JSON.parse(candidate.debug_info);
  } catch (err) {
    console.log(candidate.debug_info);
    console.error(err);
  }
  return formattedDebugInfo;
};
