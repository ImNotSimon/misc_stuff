import type {
  Candidate,
  Turn,
} from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChatEventMessageEditedPayload } from '@character-tech/client-common/src/chatManager/chatManagerTypes';
import {
  ChatEventEnum,
  DUMMY_MSG,
} from '@character-tech/client-common/src/chatManager/chatManagerTypes';

// Import Swiper React components
import { EffectCreative } from 'swiper/modules';
import type { SwiperClass, SwiperRef } from 'swiper/react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import { AnimatedHeight } from '@/components/Common/AnimatedHeight';
import { useVoiceContext } from '@/context/VoiceContext';
import { voiceSpeakingSignal } from '@/lib/state/signals';
import { clamp } from '@/utils/mathUtils';
import { scrollToBottom } from '@/views/chat/ChatHooks';
import { useChatContext } from '@character-tech/client-common/src/chatManager';
import type { ViewChatMessage } from '@character-tech/client-common/src/types/types';
import { useSignalValue } from 'signals-react-safe';
import { CandidateFeedbackComponent } from './CandidateFeedback/CandidateFeedbackComponent';
import { CandidateNextButton, CandidatePrevButton } from './CarouselButtons';
import { ChatCandidateComponent } from './ChatCandidateComponent';

const creativeEffect = {
  prev: {
    opacity: 0.0,
    translate: [0, 0, -400],
  },
  next: {
    translate: ['100%', 0, 0],
  },
};

export function ChatCarouselComponent({
  turn,
  primaryCandidateIndex,
}: {
  turn: ViewChatMessage;
  primaryCandidateIndex?: number;
}) {
  // If primaryCandidate is present and its within the candidate length, use that as the initial slide.
  const initialSlide = clamp(
    primaryCandidateIndex || 0,
    turn.candidates.length,
  );

  const { publish, updatePrimaryCandidateMap, subscribeChatEvents } =
    useChatContext();
  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const swiperRef = useRef<SwiperRef>(null);
  const [heightMap, setHeightMap] = useState<Record<number, number>>({});

  useArrowKeys(swiperRef);

  const { isVoiceEnabled, expectCharacterSpeech, abortCharacterSpeech } =
    useVoiceContext();
  const isCharacterSpeaking = useSignalValue(voiceSpeakingSignal);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const lastCandidateId = useRef(
    turn.candidates[turn.candidates.length - 1]?.candidate_id,
  );

  useEffect(
    () =>
      subscribeChatEvents(
        ChatEventEnum.message_edited,
        (_eventType: ChatEventEnum, payload: ChatEventMessageEditedPayload) => {
          const { turnId, editedIndex } = payload;
          if (
            turn.turn_key.turn_id &&
            turn.turn_key.turn_id === turnId &&
            editedIndex > -1
          ) {
            swiperRef.current?.swiper.slideTo(editedIndex);
          }
        },
      ),
    [subscribeChatEvents, turn.isLastAiMessage, turn.turn_key.turn_id],
  );

  const onSlideHeightChange = useCallback(
    (idx: number, height: number) => {
      // if the height is the same, we don't need to update
      if (heightMap[idx] === height) return;
      setHeightMap({
        ...heightMap,
        [idx]: height ?? 0,
      });
    },
    [heightMap],
  );

  useEffect(() => {
    // if we have candidates, and the last candidate id does not equal what we have set, update it
    // also this signals that we have are on a different candidate and can debounce generation
    // and unblock setGeneratingResponse
    if (
      turn.candidates.length >= 0 &&
      turn.candidates[turn.candidates.length - 1]?.candidate_id !==
        lastCandidateId.current
    ) {
      lastCandidateId.current =
        turn.candidates[turn.candidates.length - 1].candidate_id;
      setGeneratingResponse(false);
    }
  }, [turn.candidates.length, turn.candidates]);

  // TODO: enforce a max length on the carousel properly.
  const candidates: Candidate[] = turn.candidates.slice(0, 31);

  const isStreaming = candidates.some((c) => !c.is_final);
  // If we are not streaming, we need to add a dummy message to the end of the carousel.
  if (!isStreaming) {
    candidates.push({
      candidate_id: DUMMY_MSG,
      create_time: '',
    });
  }

  const onSlideChange = useCallback(
    (swiper: SwiperClass) => {
      // Scroll to bottom whenever the snap index changed.
      scrollToBottom();

      setCurrentIndex(swiper.snapIndex);
      updatePrimaryCandidateMap(
        turn.author.author_id,
        turn.turn_key.turn_id,
        swiper.snapIndex,
      );

      // If we are on the last slide, we need to generate a new candidate.
      // only if we are not already generating a candidate
      // or have asked for a new one already
      if (
        swiper.snapIndex === turn.candidates.length &&
        !isStreaming &&
        !generatingResponse
      ) {
        if (isCharacterSpeaking) {
          abortCharacterSpeech();
        }

        publish(turn.author.author_id, {
          type: 'generate_candidate',
          ttsEnabled: isVoiceEnabled,
        });
        setGeneratingResponse(true);
        expectCharacterSpeech();
      }
    },
    [
      expectCharacterSpeech,
      generatingResponse,
      isStreaming,
      isVoiceEnabled,
      publish,
      turn.author.author_id,
      turn.candidates.length,
      turn.turn_key.turn_id,
      updatePrimaryCandidateMap,
      isCharacterSpeaking,
      abortCharacterSpeech,
    ],
  );

  const slideSwipe = useCallback((back: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    back
      ? swiperRef.current?.swiper?.slidePrev()
      : swiperRef.current?.swiper?.slideNext();
  }, []);

  if (!turn?.candidates || turn.candidates.length === 0) {
    return null;
  }

  return (
    <div className="p-2 min-h-32">
      <Swiper
        style={{ height: heightMap[currentIndex] ?? 60 }}
        className="flex flex-1"
        initialSlide={initialSlide}
        onSlideChange={onSlideChange}
        ref={swiperRef}
        effect="creative"
        creativeEffect={creativeEffect}
        modules={[EffectCreative]}
      >
        {candidates.map((candidate, idx) => (
          <SwiperSlide key={candidate.candidate_id}>
            <Slide
              idx={idx}
              listCount={candidates.length}
              swipe={slideSwipe}
              candidate={candidate}
              turn={turn}
              onHeightChange={onSlideHeightChange}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function Slide({
  candidate,
  turn,
  onHeightChange,
  idx,
  listCount,
  swipe,
}: {
  candidate: Candidate;
  turn: Turn;
  onHeightChange: (idx: number, height: number) => void;
  idx: number;
  listCount: number;
  swipe: (back: boolean) => void;
}) {
  const slideRef = useRef(null);
  const observer = useRef<ResizeObserver | null>(null);
  // we need to observe for heigth changes so that we can have variable heights within the carousel
  useEffect(() => {
    // disconnect the observer if it exists
    observer.current?.disconnect();
    if (slideRef.current) {
      observer.current = new ResizeObserver((entries) => {
        if (entries[0]) {
          onHeightChange(idx, entries[0].contentRect.height);
        }
      });
      observer.current.observe(slideRef.current);
    }

    return () => observer.current?.disconnect(); // Cleanup observer on component unmount
  }, [idx, onHeightChange]);

  return (
    <div>
      <AnimatedHeight>
        {/* the ref actually goes on an inner element since putting it on the animated one would be too noisy */}
        <div ref={slideRef}>
          <ChatCandidateComponent
            candidate={candidate}
            turn={turn}
            includeWaveForm
          />
          <div className="h-8" />
        </div>
      </AnimatedHeight>
      <SlideBottomRow
        candidate={candidate}
        turn={turn}
        idx={idx}
        listCount={listCount}
        swipe={swipe}
      />
    </div>
  );
}

const useArrowKeys = (swiperRef: React.MutableRefObject<SwiperRef | null>) => {
  // Function to handle key press
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const { activeElement } = document;

      // Check if the active element is a text input, textarea, etc.
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA'
      ) {
        // if there is text in the input area
        if ((activeElement as HTMLInputElement).value !== '') {
          // Do not handle arrow keys if focused on a text field
          return;
        }
      }

      switch (event.key) {
        case 'ArrowLeft':
          swiperRef.current?.swiper?.slidePrev();
          event.preventDefault();
          break;
        case 'ArrowRight':
          swiperRef.current?.swiper?.slideNext();
          event.preventDefault();
          break;
        default:
      }
    },
    [swiperRef],
  );

  useEffect(() => {
    // Attach event listener
    window.addEventListener('keydown', handleKeyPress);

    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};

export function SlideBottomRow({
  candidate,
  turn,
  idx,
  listCount,
  swipe,
}: {
  candidate: Candidate;
  turn: Turn;
  idx: number;
  listCount: number;
  swipe: (back: boolean) => void;
}) {
  return (
    <div className="flex md:ml-14 absolute -bottom-0 items-center">
      <div className="flex">
        <CandidatePrevButton swipe={swipe} listIndex={idx} />
        <CandidateNextButton
          swipe={swipe}
          listIndex={idx}
          listCount={listCount}
        />
      </div>
      <CandidateFeedbackComponent candidate={candidate} turn={turn} />
    </div>
  );
}
