import { GuideState } from '@/lib/state/enums';
import { ChatStyle } from '@/utils/constants';
import { signal } from 'signals-react-safe';

// Signal used within chat to signal what message to delete
export const deletedItemIndexSignal = signal<number | null>(null);

// Signal used within chat to signal what message to delete
export const editCandidateSignal = signal<string | null>(null);

// Signal used within chat to signal what messages to rollback
export const rewindItemIndexSignal = signal<number | null>(null);

// Signal to enable debug mode for staff users
export const enableDebugModeSignal = signal(false);

// Signal the current state of the guide
export const guideStateSignal = signal(GuideState.DEFAULT);

// Signal the current state of the guide
export const voiceSpeakingSignal = signal(false);

// Signal controls the open state of the settings dialog.
export const settingsDialogOpenSignal = signal(false);

// Signal controls the open state of the subscription dialog.
export const plusSubscriptionDialogSignal = signal(false);

// Signal controls the open state of the sign in dialog.
export const signinDialogSignal = signal(false);

// Signal if voice chat is enabled
export const voiceChatEnabledSignal = signal<boolean>(false);

// Signal reflects whether the system is currently signing the user in.
export const signingIn = signal(false);

// Signal on whether the guide is open
export const guideOpenSignal = signal<'open' | 'closed' | 'mobile'>('closed');

// Signal on whether Amplitude has fetched its experiment data
export const amplitudeFetchedSignal = signal<number>(0);

// Signal controls the open state of the legacy migration dialog.
export const legacyMigrationDialogSignal = signal(false);

// Signal contains the payload of the current id to be migrated
export const legacyMigrationIdSignal = signal<null | {
  historyId: string;
  characterId: string;
}>(null);

// Signal controls the chat style
export const chatStyleSignal = signal<ChatStyle>(ChatStyle.default);
