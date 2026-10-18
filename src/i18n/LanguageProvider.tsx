import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  dir: 'ltr' | 'rtl';
  changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  dir: 'rtl',
  changeLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'ar');
  
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Synchronize HTML attributes and Carbon classes for full RTL layout support
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    if (dir === 'rtl') {
      document.documentElement.classList.add('cds--rtl', 'cds--layout--rtl');
      document.body.classList.add('cds--rtl', 'cds--layout--rtl');
    } else {
      document.documentElement.classList.remove('cds--rtl', 'cds--layout--rtl');
      document.body.classList.remove('cds--rtl', 'cds--layout--rtl');
    }
  }, [language, dir]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  // Keep state in sync if language changes elsewhere
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ language, dir, changeLanguage }}>
      <div dir={dir} style={{ height: '100%' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};
