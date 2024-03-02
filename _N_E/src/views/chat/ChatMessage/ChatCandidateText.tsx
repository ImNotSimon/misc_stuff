import { Markdown } from '@/components/Common/Markdown';
import { useAuth } from '@/context/AuthContext';
import { isUserPlusMember } from '@/utils/userUtils';
import type { Candidate } from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { useEffect, useRef, useState } from 'react';

export function ChatCandidateText({ candidate }: { candidate: Candidate }) {
  const displayText = useRef(
    !candidate.is_final ? '' : candidate.raw_content ?? '',
  );
  const { user } = useAuth();

  const [, forceUpdate] = useState(0);
  const updateKey = useRef(0);
  const animationInterval = useRef<NodeJS.Timeout>();
  // render text faster for plus members since they are on turbo servers
  const chunkSize = isUserPlusMember(user) ? 3 : 2;
  const animationSpeed = 33;

  useEffect(() => {
    clearInterval(animationInterval.current);

    animationInterval.current = setInterval(() => {
      if (
        candidate.raw_content &&
        displayText.current.length < candidate.raw_content.length
      ) {
        const textToAdd = candidate.raw_content.slice(
          displayText.current.length,
          displayText.current.length + chunkSize,
        );
        displayText.current += textToAdd;
        updateKey.current += 1;
        forceUpdate(updateKey.current);
      }

      if (
        candidate.raw_content &&
        displayText.current.length >= candidate.raw_content.length
      ) {
        clearInterval(animationInterval.current);
      }
    }, animationSpeed);

    return () => {
      clearInterval(animationInterval.current);
    };
  }, [animationSpeed, chunkSize, candidate.raw_content]);

  return <Markdown sentry-block>{displayText.current}</Markdown>;
}
