import { type FirebaseOptions } from 'firebase/app';

export const config: FirebaseOptions & {
  reCaptchaSiteKey: string;
} = {
  apiKey: 'AIzaSyAbLy_s6hJqVNr2ZN0UHHiCbJX1X8smTws',
  authDomain: 'auth.character.ai',
  projectId: 'character-ai',
  storageBucket: 'character-ai.appspot.com',
  messagingSenderId: '458797720674',
  appId: '1:458797720674:web:b334ca4361e934daeb9d3b',
  measurementId: 'G-3182PBRZJV',
  reCaptchaSiteKey: '6Lc7dkMpAAAAADhrgEKsNOQDBLcJkyfSO6izUtub',
};

export function getFirebaseConfig(): FirebaseOptions {
  if (!config || !config.apiKey) {
    throw new Error(
      'No Firebase configuration object provided.' +
        '\n' +
        "Add your web app's configuration object to firebase-config.ts",
    );
  } else {
    return config;
  }
}
