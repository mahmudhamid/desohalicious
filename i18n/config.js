import i18n from 'i18n-js';
import en from './translations/en';

const languageTag = "en"
const isRTL = false;

i18n.defaultLocale = en;
i18n.translations = { en };
i18n.locale = languageTag;

export const rtl = isRTL;

export default i18n;