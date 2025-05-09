"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "../utils/i18n";

interface CreditCardProps {
  credits: number;
  hasActiveSubscription?: boolean;
  isBanned?: boolean;
  onAddCredits?: () => void;
  onUseGiftCode?: () => void;
  onPurchaseAccount?: () => void;
  onResetCursorTrial?: () => void;
}

export default function CreditCard({ credits, hasActiveSubscription = false, isBanned = false, onAddCredits, onUseGiftCode, onPurchaseAccount, onResetCursorTrial }: CreditCardProps) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-800 shadow-xl dark:shadow-blue-900/30 p-5 relative">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[200px] h-[200px] rounded-full bg-white/10 backdrop-blur-xl -top-[100px] -right-[100px]"></div>
          <div className="absolute w-[150px] h-[150px] rounded-full bg-indigo-500/20 backdrop-blur-xl bottom-[10%] -left-[50px]"></div>
        </div>

        {/* Card content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-medium text-lg">{t.home.creditCard.title}</h3>
            <div className="bg-white/20 backdrop-blur-xl p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-5xl font-bold text-white">{credits.toFixed(1)}</p>
            <p className="text-blue-100 text-sm mt-1">{t.home.creditCard.available}</p>
          </div>

          {isBanned ? (
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
              <span className="text-blue-50 text-sm">Account banned</span>
            </div>
          ) : (
            hasActiveSubscription && (
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
                <span className="text-blue-50 text-sm">{t.home.creditCard.activeSubscription}</span>
              </div>
            )
          )}
        </div>

        {/* Gradient border effect at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300/20 via-indigo-400/60 to-blue-300/20"></div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button disabled={true} className="flex-1 py-2 px-2 bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 font-medium rounded-xl cursor-not-allowed opacity-70 text-center text-sm whitespace-nowrap">
          <span>{t.home.creditCard.addCredits}</span>
          <span className="block text-xs mt-1">Not Available</span>
        </button>

        <button onClick={onUseGiftCode} className="flex-1 py-2 px-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-200 font-medium rounded-xl transition-colors duration-200 text-center text-sm whitespace-nowrap">
          {t.home.creditCard.useGiftCode}
        </button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onPurchaseAccount}
          className="flex-1 py-2.5 px-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all duration-200 text-center text-sm whitespace-nowrap shadow-sm"
        >
          {t.home.actions.purchaseAccount}
        </button>

        <button
          onClick={onResetCursorTrial}
          className="flex-1 py-2.5 px-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all duration-200 text-center text-sm whitespace-nowrap shadow-sm"
        >
          {t.home.actions.resetCursorTrial}
        </button>
      </div>
    </div>
  );
}
