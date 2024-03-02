/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable default-case */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import { logAnalyticsEvent } from '@/analytics/analytics';
import { AppToast } from '@/components/ui/use-toast';
import { type HomeAssetFilename } from '@/views/home/createCharacterGraphic/types';
import { AnalyticsEvents } from '@character-tech/client-common/dist/types/analyticsEvents';
import { type Candidate } from '@character-tech/client-common/src/chatManager/chatServiceTypes';
import {
  type Character,
  type Participant,
  type PublicUser,
  type Subscription,
  type User,
} from '@character-tech/client-common/src/types/app-api';
import { type ViewChatMessage } from '@character-tech/client-common/src/types/types';
import numeral from 'numeral';
import parseDataUrl from 'parse-data-url';
import { APIConstants } from './constants';

// for some reason eslint thinks these are all unused
export enum CDN_SIZE {
  SMALL80,
  MEDIUM200,
  LARGE400,
}

export const AppUtils = {
  getHref: (pathOrHref: string) => {
    if (pathOrHref.startsWith('http')) return pathOrHref;
    return window.location.origin + pathOrHref;
  },
  getStaticImageSource: (name: string) =>
    `https://characterai.io/static/${name}.png`,
  getHomeAssetImageSource: (name: HomeAssetFilename) =>
    `https://characterai.io/static/homeassets/${name}.png`,
  getCDNImageSource: (uri?: string, size: CDN_SIZE = CDN_SIZE.MEDIUM200) => {
    let url = APIConstants.CDN_200_URL;
    switch (size) {
      case CDN_SIZE.SMALL80:
        url = APIConstants.CDN_80_URL;
        break;
      case CDN_SIZE.LARGE400:
        url = APIConstants.CDN_400_URL;
        break;
    }

    return `${url}/static/avatars/${uri}` ?? '';
  },
  getCDNSize: (size: number): CDN_SIZE => {
    if (size > 200) {
      return CDN_SIZE.LARGE400;
    }
    if (size > 80) {
      return CDN_SIZE.MEDIUM200;
    }

    return CDN_SIZE.SMALL80;
  },
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      // Convert to millions and round to one decimal place
      return `${(num / 1000000).toFixed(1)}m`;
    }
    if (num >= 10000) {
      // I think numbers under 10,000 are fine
      // Convert to thousands and round to one decimal place
      return `${(num / 1000).toFixed(1)}k`;
    }
    // Use standard number format
    return num.toLocaleString();
  },
  writeBit: (direction: boolean, index: number, num: number): number => {
    if (index >= 0 && index < 64) {
      if (direction) {
        num |= 1 << index;
      } else {
        num &= ~(1 << index);
      }
    } else {
      console.warn('out of bounds binary operation', index);
    }

    return num;
  },
  readBit: (num: number, index: number): number => (num >> index) & 1,
  readBitarray(num: number, numBits: number): number[] {
    const bits = [];

    for (let i = 0; i < numBits; i++) {
      bits.push((num >> i) & 1);
    }

    return bits.reverse();
  },
  copyTextToClipboard(text: string, toastText?: string, referrer?: string) {
    if (!navigator.clipboard) {
      AppToast('Error: Your browser doesnt support copying text');
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        AppToast(toastText ?? 'Copied to clipboard');
        logAnalyticsEvent(AnalyticsEvents.Message.Copied, {
          referrer: referrer || 'appUtils',
        });
      },
      () => {
        AppToast('Could not copy to clipboard');
      },
    );
  },
  slugToString(slug: string | string[] | undefined) {
    return slug?.toString() ?? '';
  },
};

export const AppPaths = {
  home: () => '/',
  chat: (charId: string, params?: string) =>
    `/chat/${charId}${params ? `?${params}` : ''}`,
  search: (searchQuery: string) => `/search/?q=${searchQuery}`,
  profile: (
    usernameSlug: string,
    hash?: string,
    query?: Record<string, string>,
  ) => {
    const url = new URL(`${window.location.origin}/profile/${usernameSlug}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return `${url.pathname}${url.search}${hash ? `#${hash}` : ''}`;
  },
  character: (charId?: string) =>
    charId ? `/character/${charId}/edit` : '/character/new',
};

export const selectCharacterColor = (text?: string) => {
  const primaryColor = [
    '#F44E3B',
    '#FE9200',
    '#FCDC00',
    '#DBDF00',
    '#A4DD00',
    '#68CCCA',
    '#73D8FF',
    '#AEA1FF',
    '#FDA1FF',
    '#D33115',
    '#E27300',
    '#FCC400',
    '#B0BC00',
    '#68BC00',
    '#16A5A5',
    '#009CE0',
    '#7B64FF',
    '#FA28FF',
    '#9F0500',
    '#C45100',
    '#FB9E00',
    '#808900',
    '#194D33',
    '#0C797D',
    '#0062B1',
    '#653294',
    '#AB149E',
  ];

  const tertiaryColor = [
    '#f47c3b',
    '#fed200',
    '#ddfc00',
    '#a3df00',
    '#6ddd00',
    '#68b5cc',
    '#73b5ff',
    '#c5a1ff',
    '#ffa1ea',
    '#d36115',
    '#e2ab00',
    '#f5fc00',
    '#81bc00',
    '#39bc00',
    '#1681a5',
    '#0064e0',
    '#a264ff',
    '#ff28ce',
    '#9f2d00',
    '#c48200',
    '#fbdd00',
    '#5e8900',
    '#194d40',
    '#0c5d7d',
    '#0036b1',
    '#7d3294',
    '#ab1478',
  ];

  // if no text, default to A
  if (!text) {
    return { primary: primaryColor[0], tertiary: tertiaryColor[0] };
  }

  const letter = text.toLowerCase().charCodeAt(0);
  if (letter < 97 || letter > 122) {
    return { primary: primaryColor[0], tertiary: tertiaryColor[0] };
  }
  return {
    primary: primaryColor[letter - 97],
    tertiary: tertiaryColor[letter - 97],
  };
};

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error(`Failed to parse data url: ${dataUrl}`);
  return new Blob([parsed.toBuffer()], { type: parsed.contentType });
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
export const buildMockTurn = (
  data: Partial<ViewChatMessage>,
): ViewChatMessage => {
  const defaultTurn: ViewChatMessage = {
    author: {
      author_id: '',
      avatar_url: '',
      name: '',
      is_human: true,
    },
    create_time: '',
    candidates: [],
    last_update_time: '',
    state: 'STATE_OK',
    primary_candidate_id: '',
    turn_key: {
      chat_id: '',
      turn_id: '',
    },
  };

  return {
    ...defaultTurn,
    ...data,
    author: {
      ...defaultTurn.author,
      ...data.author,
    },
    turn_key: {
      ...defaultTurn.turn_key,
      ...data.turn_key,
    },
  };
};

export const buildMockCandidate = (data: Partial<Candidate>): Candidate => {
  const defaultCandidate: Candidate = {
    candidate_id: '',
    create_time: '',
    raw_content: '',
    is_final: true,
  };

  return {
    ...defaultCandidate,
    ...data,
  };
};

export const buildMockCharacter = (data: Partial<Character>): Character => {
  const defaultCharacter: Character = {
    external_id: 'YntB_ZeqRq2l_aVf2gWDCZl4oBttQzDvhj9cXafWcF8',
    name: 'Character Assistant',
    participant__name: 'Character Assistant',
    participant__num_interactions: 103772295,
    title: 'Your AI work/study buddy',
    greeting:
      "Hello--I'm an AI assistant trained by Character.AI!\nI can help answer questions, brainstorm ideas, draft emails, write code, give advice and much more.\n(To talk with more of my AI friends, visit: https://beta.character.ai/)\n\nNow, how can I help you?",
    visibility: 'PUBLIC',
    avatar_file_name:
      'uploaded/2023/9/1/SiXk7ThPURQki2fNtKtgW4HL_ORH5F-MOaVKbt19Qao.webp',
    img_gen_enabled: false,
    user__username: 'landon',
    copyable: false,
    description: '',
    identifier: '123',
    songs: [],
    base_img_prompt: '',
    img_prompt_regex: '',
    strip_img_prompt_from_msg: false,
    participant__user__username: 'landon',
    voice_id: '',
    usage: '',
  };

  return {
    ...defaultCharacter,
    ...data,
  };
};

export const buildMockSubscription = (
  overrides: Partial<Subscription> = {},
): Subscription => ({
  type: 'NONE',
  status: 'INCOMPLETE',
  expires_at: new Date().toISOString(),
  ...overrides, // Override any values as needed
});

export const buildMockUser = (overrides: Partial<User> = {}): User => ({
  username: 'mockUser',
  id: Date.now(),
  first_name: 'Mock',
  account: null,
  is_staff: false,
  subscription: buildMockSubscription(), // Default subscription, can be overridden
  ...overrides, // Apply any user overrides
});

export const buildMockParticipant = (
  overrides: Partial<Participant> = {},
): Participant => ({
  name: 'Mock Participant',
  is_human: true,
  avatar_file_name: undefined,
  email: 'mock@participant.com',
  num_interactions: 0,
  hidden_characters: [],
  blocked_users: [],
  suspended_until: undefined,
  needs_to_acknowledge_policy: false,
  bio: undefined,
  user: buildMockUser(),
  ...overrides, // Apply any participant overrides
});

export const buildMockPublicUser = (
  overrides: Partial<PublicUser> = {},
): PublicUser => ({
  name: 'Mock Public User',
  username: 'mockPublicUser',
  characters: [],
  bio: 'Mock Bio',
  num_followers: 0,
  num_following: 0,
  avatar_file_name: '',
  ...overrides, // Apply any public user overrides
});

export const formatLargeNumber = (num: number) =>
  num > 1000 ? numeral(num).format('0.0a') : num;

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
