'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AppToast } from '@/components/ui/use-toast';
import { expBackoffGenerator } from '@/lib/asyncUtil';
import {
  voiceChatEnabledSignal,
  voiceSpeakingSignal,
} from '@/lib/state/signals';
import { MultimodalClient } from '@/lib/voice/MultimediaClient';
import { timeoutWithoutAnySoundMs } from '@/lib/voice/const';
import {
  connectToMedia,
  disconnectFromMedia,
  isPeerConnectionOk,
  playMediaStream,
  subscribeSoundProgress,
} from '@/lib/voice/mediaConnection';
import { isTtsEnabled } from '@/lib/voice/rollout';
import { useCharacterInfo } from '@character-tech/client-common/src/hooks/queries/character';
import {
  useUpdateUserSettings,
  useUserSettings,
} from '@character-tech/client-common/src/hooks/queries/user';
import * as Sentry from '@sentry/react';
import { t } from 'i18next';
import { useSignalValue } from 'signals-react-safe';

/**
 * The actions related to voice.
 */
export interface VoiceContextType {
  /** Whether the voice is enabled. */
  isVoiceEnabled: boolean;
  /** Whether the text-to-speech feature is enabled. */
  isTtsEnabledForCurrentUser: boolean;
  /** Enables the voice. */
  enableVoice: () => void;
  /** Disables the voice. */
  disableVoice: () => void;
  /** Sets the voice for the current character, and enables the voice if disabled. */
  overrideVoice: (voiceId: string | undefined) => void;
  /** Whether the character might be speaking. */
  isCharacterMaybeSpeaking: boolean;
  /** Whether the character is definitely speakig. */
  isCharacterSpeaking: boolean;
  /** Expects the character to speak. Use when the user submits a candidate. */
  expectCharacterSpeech: () => void;
  /** Stops the character from speaking. */
  abortCharacterSpeech: () => void;
  /** The API client. */
  client: MultimodalClient | null;
  /** Allows changing the voice */
  onRequestVoice: () => void;
  getCharacterVoiceId: () => string | null;
}

export const VoiceContext = createContext<VoiceContextType>({
  isVoiceEnabled: false,
  isTtsEnabledForCurrentUser: false,
  enableVoice: () => null,
  disableVoice: () => null,
  overrideVoice: () => null,
  isCharacterMaybeSpeaking: false,
  isCharacterSpeaking: false,
  expectCharacterSpeech: () => null,
  abortCharacterSpeech: () => null,
  client: null,
  onRequestVoice: () => null,
  getCharacterVoiceId: () => null,
});

interface VoiceProviderProps {
  children: React.ReactNode;
  authToken: string;
  characterId: string | null;
  chatId: string | null;
  // TODO(emmanuel): This should come from centrifugo. This candidate id may not be the one playing.
  candidateId: string | null;
  /** Called when the current character doesn't have a default voice nor a voice override, and voice is enabled via enableVoice().  */
  onRequestVoice: () => void;
}

/** The max number of webRTC connection retries. */
const maxConnectionRetries = 2;
const mediaConnectionBackoff = expBackoffGenerator();

/**
 * Provides the voice context that allows character to speak.
 *
 * Once the context is provided, use `useVoiceContext()` to use
 * the voice related actions such as `enableVoice` or `disableVoice`.
 */
export function VoiceContextProvider({
  children,
  authToken,
  characterId,
  chatId,
  candidateId,
  onRequestVoice,
}: VoiceProviderProps) {
  const voiceKey = `${characterId}${chatId}`;
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isCharacterMaybeSpeaking, setIsCharacterMaybeSpeaking] =
    useState(false);
  const [isCharacterSpeaking, setIsCharacterSpeaking] = useState(false);
  const userSettings = useUserSettings();
  const updateUserSettings = useUpdateUserSettings();
  const { character } = useCharacterInfo(characterId ?? undefined);
  const isTtsEnabledForCurrentUser = isTtsEnabled();
  const client = MultimodalClient.getInstance(authToken);
  const voiceMediaStream = useMemo(() => new MediaStream(), []);
  const audioContext = useMemo(() => new AudioContext(), []);
  const [resetConnection, setResetConnection] = useState({});

  const persistVoiceEnabled = useCallback((voiceEnabled: boolean) => {
    voiceChatEnabledSignal.value = voiceEnabled;
  }, []);

  const overrideVoice = useCallback(
    (voiceId: string | undefined) => {
      if (!characterId) {
        return;
      }
      const currVoiceOverrides = userSettings.settings?.voiceOverrides;
      voiceChatEnabledSignal.value = !!voiceId;
      if (characterId && voiceId) {
        client.updateSession(characterId, voiceId).catch(logError);
      }

      updateUserSettings.mutate(
        {
          voiceOverrides: {
            ...currVoiceOverrides,
            [characterId]: voiceId,
          },
        },
        {
          onError: logError,
        },
      );
    },
    [characterId, updateUserSettings, userSettings, client],
  );

  const getVoiceOverride = useCallback((): string | null => {
    if (!characterId) {
      return null;
    }

    const voiceOverrides = userSettings.settings?.voiceOverrides;
    if (voiceOverrides != null && voiceOverrides[characterId] != null) {
      return voiceOverrides[characterId] || null;
    }
    return null;
  }, [characterId, userSettings.settings?.voiceOverrides]);

  const getCharacterVoiceId = useCallback((): string | null => {
    if (!characterId) {
      return null;
    }
    const voiceOverridden = getVoiceOverride();
    if (voiceOverridden != null) {
      return voiceOverridden;
    }
    if (character?.default_voice_id != null) {
      return character.default_voice_id;
    }
    return null;
  }, [characterId, character?.default_voice_id, getVoiceOverride]);

  const abortCharacterSpeech = useCallback(() => {
    if (!chatId || !characterId || !candidateId || !isVoiceEnabled) {
      return;
    }
    client
      .abortCharacterVoice(chatId, characterId, candidateId)
      .then(() => {
        setIsCharacterMaybeSpeaking(false);
        setIsCharacterSpeaking(false);
      })
      .catch(logError);
  }, [candidateId, characterId, chatId, client, isVoiceEnabled]);

  const enableVoice = useCallback(() => {
    const hasVoice = getCharacterVoiceId() != null;
    if (hasVoice) {
      persistVoiceEnabled(true);
      setIsVoiceEnabled(true);
    } else {
      onRequestVoice();
    }
  }, [getCharacterVoiceId, onRequestVoice, persistVoiceEnabled]);

  const disableVoice = useCallback(() => {
    persistVoiceEnabled(false);
    setIsVoiceEnabled(false);
    abortCharacterSpeech();
  }, [abortCharacterSpeech, persistVoiceEnabled]);

  const expectCharacterSpeech = useCallback(() => {
    setIsCharacterMaybeSpeaking(isVoiceEnabled);
    if (isVoiceEnabled) {
      playMediaStream(voiceMediaStream);
      void audioContext.resume();
    }
  }, [audioContext, isVoiceEnabled, voiceMediaStream]);

  const voiceEnabled = useSignalValue(voiceChatEnabledSignal);
  // When the component is mounted, check if the voice is already enabled.
  useEffect(() => {
    const hasVoice = getCharacterVoiceId() != null;
    setIsVoiceEnabled(isTtsEnabledForCurrentUser && voiceEnabled && hasVoice);
  }, [
    getCharacterVoiceId,
    isTtsEnabledForCurrentUser,
    getVoiceOverride,
    voiceEnabled,
  ]);

  useEffect(() => {
    voiceSpeakingSignal.value = isCharacterMaybeSpeaking || isCharacterSpeaking;
  }, [isCharacterMaybeSpeaking, isCharacterSpeaking]);

  // When the character is or isn't speaking for sure, set the maybe speaking state accordingly.
  useEffect(
    () => setIsCharacterMaybeSpeaking(isCharacterSpeaking),
    [isCharacterSpeaking],
  );

  // Subscribe to the sound progress.
  useEffect(() => {
    if (!isVoiceEnabled || !isCharacterMaybeSpeaking) {
      return;
    }
    const unsubscribe = subscribeSoundProgress(
      voiceMediaStream,
      audioContext,
      () => {
        setIsCharacterSpeaking(true);
      },
      () => {
        setIsCharacterSpeaking(false);
      },
    );
    return unsubscribe;
  }, [
    audioContext,
    isVoiceEnabled,
    isCharacterMaybeSpeaking,
    voiceMediaStream,
  ]);

  // Reset the character maybe speaking state after some time has passed without
  // seeing the character speaking.
  useEffect(() => {
    if (isCharacterMaybeSpeaking && !isCharacterSpeaking) {
      const timer = setTimeout(() => {
        if (!isCharacterSpeaking) {
          setIsCharacterMaybeSpeaking(false);
        }
      }, timeoutWithoutAnySoundMs);
      return () => clearTimeout(timer);
    }
  }, [isCharacterMaybeSpeaking, isCharacterSpeaking]);

  // If the peer connection is not ok, then try to reset the connection when the client expects
  // the character to speak.
  useEffect(() => {
    if (!isPeerConnectionOk()) {
      setResetConnection({});
    }
  }, [isCharacterMaybeSpeaking]);

  // Connect to media whenever the voice is enabled or disconnect otherwise.
  useEffect(() => {
    if (!characterId || !chatId || !isVoiceEnabled || isPeerConnectionOk()) {
      return;
    }
    const closeConnection = async () => {
      setIsCharacterMaybeSpeaking(false);
      await disconnectFromMedia();
    };
    let connectionRetries = maxConnectionRetries;
    let abortController: AbortController | null = null;
    const startConnection = async () => {
      if (!isVoiceEnabled) {
        return;
      }
      const voiceId = getCharacterVoiceId();
      if (voiceId == null) {
        return;
      }
      abortController = new AbortController();
      const abortSignal = abortController.signal;
      abortSignal.addEventListener('abort', closeConnection);
      try {
        const { isConnectionClosed } = await connectToMedia(
          characterId,
          chatId,
          voiceId,
          authToken,
          voiceMediaStream,
          abortSignal,
        );

        AppToast(t('Voice.enabled'));

        await isConnectionClosed;

        await closeConnection();
        setIsCharacterSpeaking(false);
      } catch (error) {
        if (abortSignal.aborted) {
          return;
        }
        // Retry connection.
        await mediaConnectionBackoff.next();
        if (connectionRetries > 0) {
          connectionRetries--;
          await startConnection();
        } else {
          AppToast(t('Voice.error'));
          logError(error);
          await closeConnection();
          setIsCharacterSpeaking(false);
          setIsVoiceEnabled(false);
        }
      }
    };
    void startConnection();
    return () => {
      abortController?.abort();
    };
  }, [
    characterId,
    chatId,
    authToken,
    isVoiceEnabled,
    voiceKey,
    getCharacterVoiceId,
    voiceMediaStream,
    resetConnection,
  ]);

  const ctx = useMemo(
    () => ({
      enableVoice,
      disableVoice,
      overrideVoice,
      expectCharacterSpeech,
      abortCharacterSpeech,
      isVoiceEnabled,
      isTtsEnabledForCurrentUser,
      isCharacterMaybeSpeaking,
      isCharacterSpeaking,
      client,
      onRequestVoice,
      getCharacterVoiceId,
    }),
    [
      abortCharacterSpeech,
      client,
      disableVoice,
      enableVoice,
      expectCharacterSpeech,
      isCharacterMaybeSpeaking,
      isCharacterSpeaking,
      isTtsEnabledForCurrentUser,
      isVoiceEnabled,
      overrideVoice,
      onRequestVoice,
      getCharacterVoiceId,
    ],
  );

  return <VoiceContext.Provider value={ctx}>{children}</VoiceContext.Provider>;
}

export const useVoiceContext = () => useContext(VoiceContext);

const logError = (exception: unknown) => {
  Sentry.captureException(exception);
  console.error('voice error', exception);
};
