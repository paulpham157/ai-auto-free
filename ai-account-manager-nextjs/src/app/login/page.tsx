"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { useTranslations } from "../utils/i18n";
import LanguageSelector from "../components/LanguageSelector";
import ThemeToggle from "../components/ThemeToggle";
import TermsDialog from "../components/TermsDialog";

export default function Login() {
  const router = useRouter();
  const { status, signin } = useAuth();
  const t = useTranslations();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 md:p-6">
      {/* Language and Theme Selectors */}
      <div className="fixed top-4 right-4 z-10 flex items-center space-x-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col-reverse lg:flex-row">
        {/* Left side - Brand & Features */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 lg:p-12 relative">
          {/* Glassmorphism elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] rounded-full bg-white/10 backdrop-blur-3xl -top-[250px] -left-[250px]"></div>
            <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/20 backdrop-blur-3xl bottom-[10%] -right-[150px]"></div>
            <div className="absolute w-[200px] h-[200px] rounded-full bg-blue-400/10 backdrop-blur-3xl top-[40%] left-[25%]"></div>
          </div>

          {/* Brand and content */}
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-auto">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4M18 6a4 4 0 0 1 4 4M14 22l-4-4 4-4M22 14a4 4 0 0 1-4 4" />
                    <circle cx="6" cy="6" r="4" />
                    <circle cx="6" cy="18" r="4" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{t.login.branding.title}</h1>
              </div>
              <p className="text-blue-100 text-lg leading-relaxed mb-12 max-w-md">{t.login.branding.slogan}</p>
            </div>

            {/* Feature cards */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 transform transition-all hover:scale-105 hover:bg-white/15">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{t.login.features.budget.title}</h3>
                    <p className="text-blue-100 text-sm">{t.login.features.budget.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 transform transition-all hover:scale-105 hover:bg-white/15">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{t.login.features.dashboard.title}</h3>
                    <p className="text-blue-100 text-sm">{t.login.features.dashboard.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 transform transition-all hover:scale-105 hover:bg-white/15">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{t.login.features.switching.title}</h3>
                    <p className="text-blue-100 text-sm">{t.login.features.switching.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-blue-200 text-xs mt-12 opacity-80">{t.login.branding.copyright}</p>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6">
                <Image src="/logo.svg" alt="AI Accounts Logo" width={56} height={56} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t.login.title}</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">{t.login.subtitle}</p>
            </div>

            <button
              onClick={() => signin()}
              className="relative w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl p-4 flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6"
            >
              <svg className="h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              {t.login.signInWithGoogle}
            </button>

            {/* Benefits */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t.login.memberBenefits}
              </h3>
              <ul className="space-y-3">
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t.login.benefits.cost}</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t.login.benefits.analytics}</span>
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t.login.benefits.tools}</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {t.login.termsText}{" "}
              <button onClick={() => setIsTermsOpen(true)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                {t.login.termsLink}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Dialog */}
      <TermsDialog isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </main>
  );
}
