"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "../utils/i18n";

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-4xl mx-4 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.home.faq.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
          {/* Common Issues Section */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.home.faq.commonIssues}</h2>

          <div className="space-y-6 mb-8">
            {/* Issue 1 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.issues.tooManyAccounts.title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t.home.faq.issues.tooManyAccounts.error}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{t.home.faq.issues.tooManyAccounts.solution}</p>
            </div>

            {/* Issue 2 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.issues.serversOverloaded.title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t.home.faq.issues.serversOverloaded.error}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.faq.issues.serversOverloaded.solution}</p>
            </div>

            {/* Issue 3 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.issues.unauthorized.title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t.home.faq.issues.unauthorized.error}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.faq.issues.unauthorized.solution}</p>
            </div>

            {/* Issue 4 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.issues.highLoad.title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t.home.faq.issues.highLoad.error}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.faq.issues.highLoad.solution}</p>
            </div>

            {/* Issue 5 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.issues.trialLimit.title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t.home.faq.issues.trialLimit.error}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.faq.issues.trialLimit.solution}</p>
            </div>

            {/* Issue 6 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.issues.blocked.title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t.home.faq.issues.blocked.error}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.faq.issues.blocked.solution}</p>
            </div>

            {/* Issue 7 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.issues.connectionFailed.title}</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t.home.faq.issues.connectionFailed.error}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.faq.issues.connectionFailed.solution}</p>
            </div>
          </div>

          <hr className="my-6 border-gray-200 dark:border-gray-700" />

          {/* FAQ Section */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.home.faq.questions.title}</h2>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.questions.whatThisToolDoes.question}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{t.home.faq.questions.whatThisToolDoes.answer}</p>
            </div>

            {/* FAQ 2 - How to use */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.questions.howToUse.question}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{t.home.faq.questions.howToUse.answer}</p>
            </div>

            {/* FAQ 3 */}
            <div className="rounded-md bg-white dark:bg-gray-700 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.home.faq.questions.codeDeleted.question}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.faq.questions.codeDeleted.answer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
