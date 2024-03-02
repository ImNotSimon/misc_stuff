import { logError } from '@/analytics/analytics';
import { voiceSpeakingSignal } from '@/lib/state/signals';
import {
  ConnectionState,
  Room,
  RoomEvent,
  Track,
  type RemoteTrack,
  type RemoteTrackPublication,
} from 'livekit-client';
import 'webrtc-adapter';
import type { CharacterToVoiceMap } from './MultimediaClient';
import { MultimodalClient } from './MultimediaClient';
import { timeoutWithoutSoundMs } from './const';

/**
 * Subscribes to the sound progress from a given media stream.
 *
 * Use `onTimeOut` to receive a callback when no sound is received after `waitTimeWithoutSoundMs`
 * has passed since this function was called.
 *
 * @param stream The media stream.
 * @param onSoundStarted Callback when the sound started.
 * @param onSoundEnded Callback when the sound ended.
 * @returns Callback to unsubscribe.
 */
export const subscribeSoundProgress = (
  stream: MediaStream,
  audioCtx: AudioContext,
  onSoundStarted: CallableFunction,
  onSoundEnded: CallableFunction,
  waitTimeWithoutSoundMs = timeoutWithoutSoundMs,
) => {
  let source: MediaStreamAudioSourceNode;
  let dataArray: Float32Array;
  let bufferLength: number;
  let analyser: AnalyserNode;

  let notify = true;
  let currSoundPlaying = false;
  let notifiedSoundPlaying = false;
  let timerSoundStateChanged: ReturnType<typeof setTimeout> | null = null;

  const init = () => {
    source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();

    source.connect(analyser);

    analyser.fftSize = 32;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Float32Array(bufferLength);
  };

  const rafLoop = () => {
    if (!notify) {
      return;
    }
    analyser.getFloatTimeDomainData(dataArray);

    if (notifiedSoundPlaying) {
      notifyWaveForm(dataArray);
    }

    // Detect when the sound is playing.
    // TODO(emmanuel): Use centrifugo to signal when audio is playing or stopped.
    let soundPlaying = false;
    for (let i = 0; i < bufferLength; i++) {
      if (Math.abs(dataArray[i]) > 0.1) {
        soundPlaying = true;
        break;
      }
    }

    if (currSoundPlaying !== soundPlaying) {
      currSoundPlaying = soundPlaying;

      if (timerSoundStateChanged != null) {
        clearTimeout(timerSoundStateChanged);
      }

      timerSoundStateChanged = setTimeout(
        () => {
          timerSoundStateChanged = null;
          if (notifiedSoundPlaying !== currSoundPlaying && notify) {
            notifiedSoundPlaying = currSoundPlaying;
            if (currSoundPlaying) {
              onSoundStarted();
            } else {
              onSoundEnded();
            }
          }
        },
        currSoundPlaying ? 0 : waitTimeWithoutSoundMs,
      );
    }
    requestAnimationFrame(rafLoop);
  };

  const hasAudioTracks = () => stream.getAudioTracks().length > 0;
  // We cannot create a media stream source without an audio track.

  if (!hasAudioTracks()) {
    const addTrack = () => {
      if (hasAudioTracks()) {
        init();
        rafLoop();
      }
    };
    stream.addEventListener('addtrack', addTrack);
    return () => {
      notify = false;
      stream.removeEventListener('addtrack', addTrack);
    };
  }

  init();
  rafLoop();

  return () => {
    notify = false;
  };
};

const waveFormListeners: MediaEventListenerCallback[] = [];

export type MediaEventListenerCallback = (data: Float32Array) => void;

/**
 * Subscribes to the sound wave form data.
 *
 * @param cb The callback to call whenever new data is available.
 * @returns The callback to unsubscribe.
 */
export const subscribeToWaveForm = (cb: MediaEventListenerCallback) => {
  const idx = waveFormListeners.length;
  waveFormListeners.push(cb);
  return () => {
    waveFormListeners.splice(idx, 1);
  };
};

const notifyWaveForm = (data: Float32Array) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const cb of waveFormListeners) {
    cb(data);
  }
};

interface MediaConnection {
  /** Promise that resolves when the webRTC connection is closed. */
  isConnectionClosed: Promise<void>;
}

const room: Room = new Room();

/**
 * Connects to the media track by initiating the RTC peer connection.
 *
 * @param characterId The character id.
 * @param chatId The chat id.
 * @param voiceId The voice id for this character.
 * @param authToken The auth token.
 * @param mediaStream The media stream where the audio track is added.
 * @returns MediaConnection
 */
export const connectToMedia = async (
  characterId: string,
  chatId: string,
  voiceId: string,
  authToken: string,
  mediaStream: MediaStream,
  abortSignal: AbortSignal,
): Promise<MediaConnection> => {
  const voiceMap: CharacterToVoiceMap = {
    [characterId]: voiceId,
  };

  const client = MultimodalClient.getInstance(authToken);
  const sessionInfo = await client.joinOrCreateSession(
    chatId,
    voiceMap,
    undefined,
    abortSignal,
  );

  client.setCurrentSession(sessionInfo?.session);

  const url = sessionInfo.lkUrl;
  const token = sessionInfo.lkToken;

  let closedStateResolver: () => void;
  const closedStatePromise = new Promise<void>((resolve) => {
    closedStateResolver = resolve;
  });

  room
    ?.on(RoomEvent.DataReceived, (payload) => {
      const decoder = new TextDecoder();
      const strData = decoder.decode(payload);
      try {
        const jsonData = JSON.parse(strData);
        if (jsonData.event === 'speechStarted') {
          voiceSpeakingSignal.value = true;
          // onConversationActivity();
        } else if (jsonData.event === 'speechEnded') {
          voiceSpeakingSignal.value = false;
        }
      } catch (e) {
        logError('Error parsing speech event', { error: e });
      }
    })
    .on(RoomEvent.Disconnected, () => {
      closedStateResolver();
    })
    .on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, publication: RemoteTrackPublication) => {
        if (
          track.kind === Track.Kind.Video ||
          track.kind === Track.Kind.Audio
        ) {
          const remoteMediaStream = publication.track?.mediaStream;
          if (remoteMediaStream) {
            remoteMediaStream.getTracks().forEach((remoteTrack) => {
              mediaStream.addTrack(remoteTrack);
              // `addtrack` is not fired when addTrack is explicitly called.
              mediaStream.dispatchEvent(new Event('addtrack'));
              abortSignal.addEventListener('abort', () =>
                mediaStream.removeTrack(remoteTrack),
              );
            });
          }
        }
      },
    );

  await room.connect(url, token, { autoSubscribe: true });

  return { isConnectionClosed: closedStatePromise };
};

export const isPeerConnectionOk = () =>
  room.state === ConnectionState.Connecting ||
  room.state === ConnectionState.Connected;

/**
 * Closes the RTC peer connection.
 */
export const disconnectFromMedia = async () => {
  try {
    await room?.disconnect();
    const audioElement = getAudioElementForStreaming();
    audioElement.muted = true;
    audioElement.srcObject = null;
  } catch (error) {
    logError('Error disconnecting from media', { error });
  }
};

let audioElement: HTMLAudioElement | null = null;
const getAudioElementForStreaming = () => {
  if (audioElement) {
    return audioElement;
  }
  audioElement = document.createElement('audio');
  audioElement.autoplay = true;
  // https://developer.chrome.com/blog/autoplay
  audioElement.muted = true;
  audioElement.style.display = 'none';
  document.body.appendChild(audioElement);
  return audioElement;
};

/**
 * Plays an audio file.
 *
 * @param src The audio file.
 * @param onEnd A callback for when the audio played until it reached the end.
 * @returns A function to clean up the audio resource.
 */
export const playAudioFile = (src: string, onEnd: () => void) => {
  const audioEl = getAudioElementForStreaming();
  audioEl.src = src;

  audioEl.addEventListener('ended', onEnd);
  audioEl.currentTime = 0;
  audioEl.muted = false;
  void audioEl.play();
  return () => {
    audioEl.muted = true;
    audioEl.src = '';
    audioEl.removeEventListener('ended', onEnd);
  };
};

/**
 * Plays a media stream.
 *
 * @param src The media stream.
 * @returns A function to clean up the audio resource.
 */
export const playMediaStream = (src: MediaStream) => {
  const audioEl = getAudioElementForStreaming();
  audioEl.srcObject = src;
  audioEl.muted = false;
  void audioEl.play();
  return () => {
    audioEl.muted = true;
    audioEl.srcObject = null;
  };
};

/**
 * Stops the audio currently played if any.
 */
export const stopAudio = () => {
  const audioEl = getAudioElementForStreaming();
  audioEl.pause();
  audioEl.currentTime = 0;
  // https://developer.chrome.com/blog/autoplay
  audioEl.muted = true;
  audioEl.src = '';
  audioEl.srcObject = null;
};
