'use client';

import { AppToast } from '@/components/ui/use-toast';
import {
  deletedItemIndexSignal,
  rewindItemIndexSignal,
} from '@/lib/state/signals';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import { type ViewChatMessage } from '@character-tech/client-common/src/types/types';
import { t } from 'i18next';
import type { MutableRefObject, RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import { signal, useSignalValue } from 'signals-react-safe';

const deltaThresholdUpper = 200;

// Signal when the chat messages scroll is dirty
const chatMessagesScrollIsDirtySignal = signal(false);

export const useScrollHook = (
  listRef: RefObject<VirtuosoHandle>,
  scrollerRef: MutableRefObject<HTMLElement | null | undefined>,
  isScrolling: MutableRefObject<boolean>,
  isAtBottom: MutableRefObject<boolean>,
) => {
  const observer = useRef<ResizeObserver | null>(null);
  const chatMessagesScrollIsDirtyValue = useSignalValue(
    chatMessagesScrollIsDirtySignal,
  );

  useEffect(() => {
    if (
      !scrollerRef.current ||
      scrollerRef.current.children[0]?.children[0] == null
    ) {
      return undefined;
    }
    observer.current?.disconnect();
    observer.current = new ResizeObserver(() => {
      if (
        listRef.current &&
        scrollerRef.current &&
        !isScrolling.current &&
        isAtBottom.current // only scroll if we are within the threshold of the bottom
      ) {
        listRef.current.scrollTo({
          top: scrollerRef.current?.scrollHeight,
          behavior: 'smooth',
        });
      }
    });

    // we need to dive into the content holder of virtuoso in order to grab the correct height changes
    observer.current.observe(scrollerRef.current.children[0].children[0]);

    return () => observer.current?.disconnect(); // Cleanup observer on component unmount
  }, [isScrolling, listRef, scrollerRef, isAtBottom]);

  useLayoutEffect(() => {
    if (
      !chatMessagesScrollIsDirtyValue ||
      !scrollerRef.current ||
      !listRef.current
    ) {
      return;
    }
    chatMessagesScrollIsDirtySignal.value = false;
    // the height of the scrollable content is the scroll height minus the client height
    const scrollContentHeight =
      scrollerRef.current.scrollHeight - scrollerRef.current.clientHeight;
    // if the scroll position is within the delta threshold of the bottom
    // this also prevents us from scrolling if we are too far away from the bottom
    if (
      scrollContentHeight - scrollerRef.current.scrollTop <
      deltaThresholdUpper
    ) {
      // provide a small delay to allow the render to settle
      listRef.current.scrollTo({
        top: scrollerRef.current?.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatMessagesScrollIsDirtyValue, scrollerRef, listRef]);
};

let lastScrolledTurnId = '';

/**
 * Scrolls to the bottom of the chat messages.
 *
 * If a turn id is provided, it scrolls to the bottom only if the turn hasn't
 * been scrolled already in the previous call.
 *
 * @param turnId An optional turn id.
 */
export const scrollToBottom = (turnId?: string) => {
  if (turnId) {
    if (lastScrolledTurnId !== turnId) {
      lastScrolledTurnId = turnId;
      chatMessagesScrollIsDirtySignal.value = true;
    }
  } else {
    chatMessagesScrollIsDirtySignal.value = true;
  }
};

export const useChatEffectHooks = (
  processedTurns: ViewChatMessage[] | undefined,
  characterId: string,
) => {
  const { deleteMessages } = useChatContext();
  const deletedItemIndexValue = useSignalValue(deletedItemIndexSignal);
  const rewindItemIndexValue = useSignalValue(rewindItemIndexSignal);
  useEffect(() => {
    if (!processedTurns || !deletedItemIndexValue || !characterId) return;

    // grab the turn to be deleted
    const deletedTurn =
      processedTurns[processedTurns.length - deletedItemIndexValue - 1];

    if (deletedTurn) {
      deleteMessages(characterId, [deletedTurn.turn_key.turn_id], () => {
        AppToast(t('Chat.delete-successful'), undefined, 'destructive');
      });
    }
    deletedItemIndexSignal.value = null;
  }, [characterId, processedTurns, deleteMessages, deletedItemIndexValue]);

  useEffect(() => {
    if (!processedTurns || !rewindItemIndexValue || !characterId) return;

    // grab the turns to be deleted
    const rewoundTurns = processedTurns
      .slice(0, processedTurns.length - rewindItemIndexValue - 1)
      .map((turn) => turn.turn_key.turn_id);

    if (rewoundTurns?.length) {
      deleteMessages(characterId, rewoundTurns, () => {
        AppToast(t('Chat.rewind-successful'), undefined);
      });
    }
    rewindItemIndexSignal.value = null;
  }, [characterId, processedTurns, deleteMessages, rewindItemIndexValue]);
};
