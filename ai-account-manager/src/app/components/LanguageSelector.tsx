"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useLocale } from "../context/LocaleContext";

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, isChangingLocale } = useLocale();
  const [localChanging, setLocalChanging] = useState(false); // Yerel olarak izlemek için

  // Available languages
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ar", name: "العربية", flag: "🇦🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
  ];

  useEffect(() => {
    // Handle click outside to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const switchLanguage = (newLocale: string) => {
    // Lokal ve global değişim flaglerini kontrol et
    if (newLocale === locale || isChangingLocale || localChanging) {
      setIsOpen(false);
      return;
    }

    // Lokal izleme durumunu değiştir ve dropdown'ı kapat
    setLocalChanging(true);
    setIsOpen(false);

    // Dili değiştir
    setLocale(newLocale);

    // Sayfayı yenile, ama timeout ile
    const reloadTimer = setTimeout(() => {
      try {
        window.location.reload();
      } catch (error) {
        console.error("Error reloading page:", error);
        setLocalChanging(false);
      }
    }, 150);

    // Component unmount olursa timer'ı temizle
    return () => clearTimeout(reloadTimer);
  };

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === locale) || languages[0];
  };

  // Butonun devre dışı bırakılma durumu
  const isDisabled = isChangingLocale || localChanging;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        className={`flex items-center h-10 px-3 rounded-full transition-all duration-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${isDisabled ? "opacity-70 cursor-wait" : ""}`}
        aria-label="Select language"
        disabled={isDisabled}
      >
        <span className="text-lg">{getCurrentLanguage().flag}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 backdrop-blur-sm backdrop-filter overflow-hidden transform origin-top-right transition-all duration-300">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              disabled={isDisabled}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors
                ${locale === language.code ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}
                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="text-xl">{language.flag}</span>
              <span>{language.name}</span>
              {locale === language.code && (
                <svg className="h-4 w-4 ml-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
