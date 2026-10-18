import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en.json';
import arCommon from './locales/ar.json';

const resources = {
  en: {
    common: enCommon,
  },
  ar: {
    common: arCommon,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ar',
  fallbackLng: 'ar',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
