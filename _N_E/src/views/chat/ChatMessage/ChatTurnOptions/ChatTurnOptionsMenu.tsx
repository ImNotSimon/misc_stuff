import { Button } from '@/components/ui/button';
import type { ViewChatMessage } from '@character-tech/client-common/src/types/types';

import { type Candidate } from '@character-tech/client-common/src/chatManager/chatServiceTypes';

import {
  AmplitudeExperimentationFactory,
  AmplitudeVariants,
} from '@/analytics/AmplitudeExperimentationFactory';
import { DynamicRightClickMenu } from '@/components/ui/DynamicContextMenu';
import { DynamicDropdownMenu } from '@/components/ui/DynamicDropdownMenu';
import { type ContextItem } from '@/components/ui/ui-types';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { EditCandidateButton } from '../EditCandidateComponent';
import { CopyMessageOption } from './CopyMessageOption';
import { ConfirmDeleteDialog } from './DeleteMessagesDialog';
import { PinMessageOption } from './PinMessageOption';
import { ConfirmRewindDialog } from './RewindMessagesDialog';

export interface ChatTurnOptionsProps {
  isLastTurn: boolean;
  listItemIndex?: number;
  candidate: Candidate;
  turn: ViewChatMessage;
}

const useTurnMenuHook = (props: ChatTurnOptionsProps): ContextItem[] => {
  const { listItemIndex, turn, candidate, isLastTurn } = props;
  const isPinned = !!turn.is_pinned;

  // currently we restrict editing to the last message from the user or the last message from the AI
  const canEdit = (turn.isLastAiMessage || turn.isLastUserMessage) && !isPinned;

  const pinnedMessagesEnabled =
    AmplitudeExperimentationFactory.checkAmplitudeVariantValue(
      AmplitudeVariants.PinnedMessages,
      'treatment',
    );

  const showEditOption =
    canEdit &&
    // either you don't have access to pinning or you have access to pinning and the candidate is unpinned
    (!pinnedMessagesEnabled || (!!pinnedMessagesEnabled && !isPinned));

  const showPinOption =
    pinnedMessagesEnabled && (!turn?.isLastAiMessage || isPinned);

  const options: ContextItem[] = useMemo(() => {
    if (!listItemIndex || !candidate || !candidate.is_final) {
      return [];
    }

    const optionsArr = [
      {
        content: <CopyMessageOption text={candidate.raw_content} />,
        asChild: false,
        key: 'copy',
      },
      {
        content: <ConfirmDeleteDialog listIndex={listItemIndex} />,
        asChild: true,
        key: 'delete-dialog',
      },
    ];
    if (!isLastTurn) {
      optionsArr.push({
        content: <ConfirmRewindDialog listIndex={listItemIndex} />,
        asChild: true,
        key: 'rewind-dialog',
      });
    }

    if (showEditOption) {
      optionsArr.push({
        content: <EditCandidateButton candidate_id={candidate.candidate_id} />,
        asChild: false,
        key: 'edit',
      });
    }

    if (showPinOption) {
      optionsArr.push({
        content: (
          <PinMessageOption turnKey={turn.turn_key} isCurPinned={isPinned} />
        ),
        asChild: false,
        key: 'pin',
      });
    }

    return optionsArr;
  }, [
    showEditOption,
    showPinOption,
    isPinned,
    turn.turn_key,
    isLastTurn,
    listItemIndex,
    candidate,
  ]);

  return options;
};

export function ChatTurnOptionsMenu({
  listItemIndex,
  turn,
  candidate,
  isLastTurn,
}: ChatTurnOptionsProps) {
  const options = useTurnMenuHook({
    listItemIndex,
    turn,
    candidate,
    isLastTurn,
  });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        'absolute right-6 top-0 sm:top-9 z-50 group',
        turn.author.is_human ? 'sm:right-6 left-4 sm:left-auto' : 'right-6',
      )}
    >
      <DynamicDropdownMenu
        options={options}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setIsOpen(!isOpen)}
          className={cn('opacity-0 transistion-all group-hover:opacity-100', {
            'opacity-100': isOpen,
          })}
        >
          <BsThreeDots />
        </Button>
      </DynamicDropdownMenu>
    </div>
  );
}

export function ChatTurnRightClickMenu({
  listItemIndex,
  turn,
  candidate,
  isLastTurn,
  children,
}: ChatTurnOptionsProps & { children: React.ReactNode }) {
  const options = useTurnMenuHook({
    listItemIndex,
    turn,
    candidate,
    isLastTurn,
  });

  return (
    <DynamicRightClickMenu options={options}>{children}</DynamicRightClickMenu>
  );
}
