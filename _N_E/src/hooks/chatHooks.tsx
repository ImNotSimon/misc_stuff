import { createExampleKey } from '@/views/home/ExampleChatsCard';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import { ChatEventEnum } from '@character-tech/client-common/src/chatManager/chatManagerTypes';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useChatEventsSubscription = () => {
  const { subscribeChatEvents } = useChatContext();
  const [unrecoverableErrorOccurred, setUnrecoverableErrorOccurred] =
    useState(false);

  useEffect(() => {
    const unsubscribeError = subscribeChatEvents(
      ChatEventEnum.unrecoverable_error,
      () => {
        setUnrecoverableErrorOccurred(true);
      },
    );

    return () => {
      unsubscribeError();
    };
  }, [subscribeChatEvents]);

  return { unrecoverableErrorOccurred };
};

export const useGetExampleChatInput = ({
  setInputText,
}: {
  setInputText: (val: string) => void;
}) => {
  const searchParams = useSearchParams();
  const [sentExampleChat, setSentExampleChat] = useState(false);

  const exampleChatPrompt = useMemo(() => {
    const questionKey = searchParams?.get('questionKey');
    const index = searchParams?.get('index');
    if (
      questionKey &&
      index !== null &&
      createExampleKey(questionKey, Number(index))
    ) {
      return createExampleKey(questionKey, Number(index));
    }
  }, [searchParams]);

  const resolveExampleChatPrompt = useCallback(() => {
    // see if the use clicked on an example chat
    if (sentExampleChat || !exampleChatPrompt) {
      return;
    }
    if (exampleChatPrompt) {
      setInputText(exampleChatPrompt);
      setSentExampleChat(true);
    }
  }, [exampleChatPrompt, sentExampleChat, setSentExampleChat, setInputText]);

  return { resolveExampleChatPrompt };
};
