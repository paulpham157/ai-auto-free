"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import FAQModal from "./FAQModal";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useTranslations } from "../utils/i18n";

type UserMenuProps = {
  userEmail: string;
  userImage?: string;
  isAdmin: boolean;
  signout: () => void;
};

export default function UserMenu({ userEmail, userImage, isAdmin, signout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const t = useTranslations();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleOpenFAQ = () => {
    setShowFAQ(true);
    setIsOpen(false); // Close the dropdown menu
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center space-x-4">
        <LanguageSelector />
        <ThemeToggle />
        {/* User avatar button */}
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 relative focus:outline-none focus:ring-0 rounded-full ml-2" aria-expanded={isOpen} aria-haspopup="true">
          <span className="sr-only">Open user menu</span>
          {userImage ? (
            <img className="h-9 w-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors" src={userImage} alt="User profile" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">{userEmail && userEmail.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none z-50">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{t.home.userMenu.yourAccount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
          </div>

          <div className="py-1">
            {isAdmin && (
              <a href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t.home.userMenu.adminPanel}
              </a>
            )}

            {/* FAQ Menu Item */}
            <button onClick={handleOpenFAQ} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.home.userMenu.faqHelp}
            </button>
          </div>

          <div className="py-1">
            <button onClick={signout} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t.home.userMenu.signOut}
            </button>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
    </div>
  );
}
