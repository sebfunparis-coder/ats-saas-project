import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr.json';
import en from './en.json';

const savedLang = localStorage.getItem('ats_language') || 'fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lang) => {
  localStorage.setItem('ats_language', lang);
  document.documentElement.lang = lang;
});

document.documentElement.lang = savedLang;

export default i18n;
