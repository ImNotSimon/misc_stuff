import { ClientEnv } from '@/env/client.mjs';
import { type Voice } from '@character-tech/client-common/src/types/app-api';

const masSvcPrefix = `https://${ClientEnv.NEXT_PUBLIC_NEO_HOST_BASE}/multimodal/api/`;

export interface Track {
  location: string;
  sessionId: string;
  trackName: string;
}

// k-TODO: remove cloudflare types / api logic
export interface RTCParticipant {
  id: string;
  type: 'user' | 'character';
  rtcSessionId: string;
  tracks: Track[];
  voiceId: string;
}

export interface RTCSession {
  id: string;
  roomId: string;
  participants: { [key: string]: RTCParticipant };
}

export type CharacterToVoiceMap = { [characterId: string]: string };

type Result = {
  errorCode: number;
  errorDescription: string;
  tracks: (Track & {
    errorCode: number;
    errorDescription: string;
  })[];
};

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class MultimodalClient {
  private authToken: string | null = null;

  private currentSession: RTCSession | null = null;

  private static instance: MultimodalClient | null = null;

  static getInstance(authToken: string) {
    if (!this.instance) {
      this.instance = new MultimodalClient();
    }
    this.instance.setAuthToken(authToken);
    return this.instance;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  setCurrentSession(session: RTCSession) {
    this.currentSession = session;
  }

  private async sendRequest(
    resource: string,
    body: object | null,
    method: HttpMethod,
    abortSignal?: AbortSignal,
  ) {
    if (!this.authToken) {
      throw new Error('expected auth token');
    }
    const request: RequestInit = {
      method,
      headers: {
        Authorization: `Token ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: abortSignal,
    };

    const url = new URL(resource, masSvcPrefix).href;
    const response = await fetch(url, request);
    const result = response.json();
    return result;
  }

  async joinOrCreateSession(
    roomId: string,
    voices: CharacterToVoiceMap,
    offerSDP: RTCSessionDescription | undefined,
    abortSignal?: AbortSignal,
  ) {
    const resource = `v1/sessions/joinOrCreateSession`;
    const body = {
      roomId,
      voices,
      rtcSessionDescription: offerSDP,
      rtcBackend: 'lk',
    };

    const result = await this.sendRequest(resource, body, 'POST', abortSignal);
    checkErrors(result);
    return result;
  }

  async updateSession(
    characterId: string,
    updatedVoiceId: string,
    abortSignal?: AbortSignal,
  ) {
    if (
      !this.currentSession ||
      !this.currentSession.participants[characterId]
    ) {
      throw new Error('invalid params');
    }

    const resource = `v1/sessions/${this.currentSession.id}`;
    const updatedSession = this.currentSession;

    updatedSession.participants[characterId].voiceId = updatedVoiceId;

    const body = {
      session: updatedSession,
    };

    const result = await this.sendRequest(resource, body, 'PATCH', abortSignal);
    checkErrors(result);
    return result;
  }

  async subscribeToRemoteTracks(
    sessionId: string,
    rtcSessionId: string,
    tracks: Track[],
    abortSignal?: AbortSignal,
  ) {
    const resource = `v1/sessions/subscribeToRemoteTracks`;
    const body = {
      sessionId,
      rtcSessionId,
      tracks,
    };

    const result = await this.sendRequest(resource, body, 'POST', abortSignal);
    checkErrors(result);
    return result;
  }

  async renegotiateRemoteTracks(
    sessionId: string,
    rtcSessionId: string,
    answerSessionDescription: RTCSessionDescription,
    abortSignal?: AbortSignal,
  ) {
    const resource = `v1/sessions/renegotiateRemoteTracks`;
    const body = {
      sessionId,
      rtcSessionId,
      sessionDescription: answerSessionDescription,
    };

    const result = await this.sendRequest(resource, body, 'POST', abortSignal);
    checkErrors(result);
  }

  async abortCharacterVoice(
    roomId: string,
    characterId: string,
    candidateId: string,
    abortSignal?: AbortSignal,
  ) {
    const url = `v1/sessions/discardCandidate`;
    const body = {
      roomId,
      characterId,
      candidateId,
    };
    const result = await this.sendRequest(url, body, 'POST', abortSignal);
    checkErrors(result);
  }

  async searchVoices(abortSignal?: AbortSignal): Promise<Voice[]> {
    const result = await this.sendRequest(
      'v1/voices/search',
      null,
      'GET',
      abortSignal,
    );
    if (!result.voices) {
      throw new Error('Missing voices in response');
    }
    return result.voices as Voice[];
  }

  async getVoiceFromId(voiceId: string) {
    const result = await this.sendRequest(`v1/voices/${voiceId}`, null, 'GET');
    if (!result.voice) {
      throw new Error('Missing voice in response');
    }
    return result.voice;
  }
}

const checkErrors = (result: Result, tracksCount = 0) => {
  if (result?.errorCode) {
    throw new Error(result.errorDescription);
  }
  for (let i = 0; i < tracksCount; i++) {
    if (result?.tracks?.[i]?.errorCode) {
      throw new Error(`tracks[${i}]: ${result.tracks[i]?.errorDescription}`);
    }
  }
};
