import { StorageUtils } from '@/utils/constants';
import { type Locale } from 'date-fns';
import {
  bg,
  cs,
  de,
  el,
  enUS,
  es,
  fi,
  fr,
  hi,
  hr,
  hu,
  id,
  it,
  ja,
  ko,
  lt,
  nl,
  pl,
  pt,
  ro,
  ru,
  sv,
  th,
  tr,
  uk,
  vi,
  zhCN,
  zhTW,
} from 'date-fns/locale';
import i18n from 'i18next';
import Cookie from 'js-cookie';
import { initReactI18next } from 'react-i18next';

const getLanguageFromQueryString = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  return params.get('lng') || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    lng: getLanguageFromQueryString(),
    resources: {
      de: {
        translations: require('./de.json'),
      },
      en: {
        translations: require('./en.json'),
      },
      es: {
        translations: require('./es.json'),
      },
      fr: {
        translations: require('./fr.json'),
      },
      it: {
        translations: require('./it.json'),
      },
      ko: {
        translations: require('./ko.json'),
      },
      br: {
        translations: require('./pt_BR.json'),
      },
      pt: {
        translations: require('./pt.json'),
      },
      ru: {
        translations: require('./ru.json'),
      },
      tr: {
        translations: require('./tr.json'),
      },
      ja: {
        translations: require('./ja_JP.json'),
      },
      cn: {
        translations: require('./zh_CN.json'),
      },
      id: {
        translations: require('./id.json'),
      },
      pl: {
        translations: require('./pl_PL.json'),
      },
      th: {
        translations: require('./th_TH.json'),
      },
      vi: {
        translations: require('./vi_VN.json'),
      },
      bg: {
        translations: require('./bg_BG.json'),
      },
      cz: {
        translations: require('./cs_CZ.json'),
      },
      gr: {
        translations: require('./el_GR.json'),
      },
      fi: {
        translations: require('./fi_FI.json'),
      },
      hi: {
        translations: require('./hi_IN.json'),
      },
      hr: {
        translations: require('./hr_HR.json'),
      },
      hu: {
        translations: require('./hu_HU.json'),
      },
      lt: {
        translations: require('./lt_LT.json'),
      },
      nl: {
        translations: require('./nl_NL.json'),
      },
      ro: {
        translations: require('./ro_RO.json'),
      },
      se: {
        translations: require('./sv_SE.json'),
      },
      ua: {
        translations: require('./uk_UA.json'),
      },
      tw: {
        translations: require('./zh_Hant_TW.json'),
      },
    },
    ns: ['translations'],
    defaultNS: 'translations',
  })
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error('i18n initialization failed', error.message);
    } else {
      console.error('i18n initialization failed', error);
    }
  });

export const getLanguages = () => [
  { value: 'en', label: 'English', dateFnsLocale: enUS },
  { value: 'es', label: 'Español', dateFnsLocale: es },
  { value: 'fr', label: 'Français', dateFnsLocale: fr },
  { value: 'it', label: 'Italiano', dateFnsLocale: it },
  { value: 'pt', label: 'Português', dateFnsLocale: pt },
  { value: 'de', label: 'Deutsch', dateFnsLocale: de },
  { value: 'tr', label: 'Türkçe', dateFnsLocale: tr },
  { value: 'pl', label: 'Polski', dateFnsLocale: pl },
  { value: 'ru', label: 'Русский', dateFnsLocale: ru },
  { value: 'id', label: 'Bahasa Indonesia', dateFnsLocale: id },
  { value: 'cn', label: '中文', dateFnsLocale: zhCN },
  { value: 'tw', label: '繁體中文', dateFnsLocale: zhTW },
  { value: 'ja', label: '日本語', dateFnsLocale: ja },
  { value: 'ko', label: '한국인', dateFnsLocale: ko },
  { value: 'th', label: 'ไทย', dateFnsLocale: th },
  { value: 'vi', label: 'Tiếng Việt', dateFnsLocale: vi },
  { value: 'bg', label: 'Български', dateFnsLocale: bg },
  { value: 'cz', label: 'Čeština', dateFnsLocale: cs },
  { value: 'gr', label: 'Ελληνικά', dateFnsLocale: el },
  { value: 'fi', label: 'Suomi', dateFnsLocale: fi },
  { value: 'hi', label: 'हिन्दी', dateFnsLocale: hi },
  { value: 'hr', label: 'Hrvatski', dateFnsLocale: hr },
  { value: 'hu', label: 'Magyar', dateFnsLocale: hu },
  { value: 'lt', label: 'Lietuvių', dateFnsLocale: lt },
  { value: 'nl', label: 'Nederlands', dateFnsLocale: nl },
  { value: 'ro', label: 'Română', dateFnsLocale: ro },
  { value: 'se', label: 'Svenska', dateFnsLocale: sv },
  { value: 'ua', label: 'Українська', dateFnsLocale: uk },
];

export const getLanguage = () => {
  const { resolvedLanguage } = i18n;
  return resolveLanguage(resolvedLanguage);
};

export const getDateFnsLocale = (): Locale | undefined => {
  const lng = getLanguage();
  return getLanguages().filter((elem) => elem.value === lng)[0]?.dateFnsLocale;
};

export const getLanguageLabel = (lang: string | undefined) => {
  if (!lang) {
    return lang;
  }
  return getLanguages().filter((elem) => elem.value === lang)[0]?.label;
};

const resolveLanguage = (language?: string) => {
  if (!language?.includes('zh')) {
    return language;
  }

  return language === 'zh-Hans-TW' ? 'tw' : 'cn';
};

export const setLanguage = async (languageVal?: string) => {
  const incomingLng = resolveLanguage(languageVal);
  if (incomingLng !== getLanguage()) {
    if (!incomingLng) {
      Cookie.remove(StorageUtils.Keys.Language);
    } else {
      Cookie.set(StorageUtils.Keys.Language, incomingLng);
    }
    await i18n.changeLanguage(incomingLng);
  }
};

export default i18n;
