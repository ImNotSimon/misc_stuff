'use client';

import { AnimationFadeInAndOut } from '@/components/Common/Animated';
import { useScrollHook } from '@/views/chat/ChatHooks';
import type { ViewChatMessage } from '@character-tech/client-common/src/types/types';
import { useMemo, useRef } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import { Virtuoso } from 'react-virtuoso';
import { ChatTurnComponent } from './ChatMessage/ChatTurnComponent';

export function ChatMessages({
  chatTurns,
  primaryCandidateMap,
  getChatMessages,
}: {
  chatTurns: ViewChatMessage[];
  primaryCandidateMap: Record<string, number>;
  getChatMessages: () => void;
}) {
  const listRef = useRef<VirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLElement | null>();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isScrolling = useRef(false);
  const isAtBottom = useRef(false);
  useScrollHook(listRef, scrollerRef, isScrolling, isAtBottom);

  const reversedChatTurns = useMemo(
    () => chatTurns.slice().reverse(),
    [chatTurns],
  );

  return (
    <AnimationFadeInAndOut className="h-full">
      <Virtuoso
        ref={listRef}
        scrollerRef={(scrollRef: HTMLElement | Window | null) => {
          const element = scrollRef as HTMLElement;
          scrollerRef.current = element;
        }}
        className="h-full mb-3 overflow-x-hidden px-1"
        isScrolling={(_isScrolling: boolean) => {
          isScrolling.current = _isScrolling;

          const scroller = scrollerRef.current;
          if (!scroller) {
            return;
          }
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          if (_isScrolling) {
            scroller.classList.remove('hide-scrollbar');
          } else {
            scrollTimeoutRef.current = setTimeout(() => {
              if (scrollerRef.current) {
                scrollerRef.current.classList.add('hide-scrollbar');
              }
            }, 2000);
          }
        }}
        followOutput
        atTopStateChange={(atTop) => {
          // only grab more messages if we are at the top of the list
          // and we already have some turns
          if (atTop && chatTurns?.length > 0) {
            getChatMessages();
          }
        }}
        atBottomStateChange={(atBottom) => {
          isAtBottom.current = atBottom;
        }}
        defaultItemHeight={72}
        atBottomThreshold={60}
        totalCount={chatTurns.length}
        data={reversedChatTurns}
        // twice a 1080p screen height, I think we can have this window be quite large without much issue
        overscan={2160}
        initialTopMostItemIndex={chatTurns.length - 1}
        // eslint-disable-next-line react/no-unstable-nested-components
        itemContent={(index, data) => (
          <ChatTurnComponent
            primaryCandidateIndex={primaryCandidateMap[data.turn_key.turn_id]}
            isLastTurn={index === chatTurns.length - 1}
            listItemIndex={index}
            turn={data}
            key={data.turn_key.turn_id}
          />
        )}
      />
    </AnimationFadeInAndOut>
  );
}
