const CDN_URL = 'https://characterai.io';

export const APIConstants = {
  // axios timeout for server requests
  // TODO: decrease timeout back to 30s once TTS is no longer blocking the completion of
  // the axios call.
  DEFAULT_TIMEOUT_MS: 50000,

  PROD_SERVER_URL: 'https://beta.character.ai',
  PLUS_SERVER_URL: 'https://plus.character.ai',
  CDN_URL,

  // Used for F2 Debug Mode
  NEO_PROD_INTERNAL_HOST: 'neo-prod.characterai.dev',
  NEO_STAGING_INTERNAL_HOST: 'neo-stage.characterai.dev',

  CHARACTER_TOKEN_KEY: 'char_token',
  CDN_80_URL: `${CDN_URL}/i/80`,
  CDN_200_URL: `${CDN_URL}/i/200`,
  CDN_400_URL: `${CDN_URL}/i/400`,
};

// https://tailwindcss.com/docs/screens
export const SCREEN_SM = 640;
export const SCREEN_MD = 768;
export const SCREEN_LG = 1024;
export const SCREEN_XL = 1024;
export const SCREEN_2XL = 1536;

export const placeholderDataUrlDark =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAGJlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAABJKGAAcAAAASAAAAUKABAAMAAAABAAEAAKACAAQAAAABAAAACKADAAQAAAABAAAACAAAAABBU0NJSQAAAFNjcmVlbnNob3TfSoO6AAAB0mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj44PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KydqwLAAAABdJREFUGBljVFPX/s+ABzDhkQNLDQ8FAIceAYd1JCH7AAAAAElFTkSuQmCC';
export const placeholderDataUrlLight =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGJlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAABJKGAAcAAAASAAAAUKABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAABBU0NJSQAAAFNjcmVlbnNob3RbPqOeAAAB1GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xNjwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNjwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlVzZXJDb21tZW50PlNjcmVlbnNob3Q8L2V4aWY6VXNlckNvbW1lbnQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpzPGLtAAAAJElEQVQ4EWN89+7dfwYKABMFesFaRw1gYBgNg9EwAGWGgU8HAJzxA+lbWZCpAAAAAElFTkSuQmCC';

export enum AvatarUploadType {
  DEFAULT = 'DEFAULT',
  UPLOADED = 'UPLOADED',
  GOOGLE = 'GOOGLE',
  IMAGE = 'IMAGE',
}

export const GoogleOAuthClientId =
  '458797720674-iukt283meoagp3k3j6rmcvpvjarddtfv.apps.googleusercontent.com';

export const CUSTOMER_PORTAL_LINK =
  'https://pay.character.ai/p/login/dR615p49Jape5Ne288';

// for one day when we are able to differentiate between subscription sources
export const GOOGLE_PLAY_SUBSCRIPTION_LINK =
  'https://play.google.com/store/account/subscriptions';

export const APPLE_SUBSCRIPTION_LINK =
  'https://apps.apple.com/account/subscriptions';

export const StorageUtils = {
  Keys: {
    Language: 'language',
    ThemeMode: 'themeMode',
    EmailForSignIn: 'emailForSignIn',
  },
};

export enum ThemeMode {
  system = 'system',
  light = 'light',
  dark = 'dark',
}

export enum ChatStyle {
  default = 'default',
  classic = 'classic',
}

export const DEPLOYMENT_COOKIE_NAME = 'deployment_cookie';

export const ExternalLinks = {
  careers: 'https://jobs.ashbyhq.com/character/',
  safety:
    'https://support.character.ai/hc/en-us/articles/21704914723995-Safety-Center',
  characterGuide:
    'https://book.character.ai/character-book/welcome-to-character-book',
  about: 'https://character.ai/about',
  aboutUs: 'https://character.ai/help',
  support: 'https://support.character.ai/hc/en-us',
  privacyPolicy: 'https://beta.character.ai/privacy',
  tos: 'https://beta.character.ai/tos',
  contactUs: 'https://support.character.ai/hc/en-us/requests/new',
  blog: 'https://blog.character.ai/',
  characterBookCreateCharacter:
    'https://book.character.ai/character-book/how-to-quick-creation',
  legacySite: 'https://beta.character.ai/',
  characterBookCreateCharacterDefinition:
    'https://book.character.ai/character-book/character-attributes/definition',
};

export const DEFAULT_THEME = ThemeMode.dark;

export const CAIPLUS_PRICE = 9.99;
export const COOKIE_CONSENT = 'cookie_consent_v1';

export const COOKIE_CHAT_STYLE = 'cookie_chat_style_v1';
