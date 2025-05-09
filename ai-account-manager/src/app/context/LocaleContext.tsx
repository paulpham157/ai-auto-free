"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

type LocaleContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  isChangingLocale: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>("en");
  const [isChangingLocale, setIsChangingLocale] = useState<boolean>(false);

  useEffect(() => {
    // Load locale from localStorage on component mount
    try {
      const savedLocale = localStorage.getItem("locale");
      if (savedLocale) {
        setLocale(savedLocale);
      }
    } catch (error) {
      console.error("Error loading locale from localStorage:", error);
    }
  }, []);

  // Update localStorage when locale changes
  const handleSetLocale = (newLocale: string) => {
    // Halihazırda dil değişiyorsa veya aynı dile geçiş yapılıyorsa işlemi engelle
    if (isChangingLocale || newLocale === locale) return;

    // Dili değiştir ve durumu güncelle
    setIsChangingLocale(true);

    try {
      // Locale state'ini değiştir
      setLocale(newLocale);

      // LocalStorage'a yeni dili kaydet
      localStorage.setItem("locale", newLocale);

      // Sayfa yenilendiğinde değişimi tamamla
      // Bu bir clean up değil, buraya return koymak hataya neden olabilir
    } catch (error) {
      console.error("Error changing locale:", error);
      setIsChangingLocale(false);
    }
  };

  return <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, isChangingLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
