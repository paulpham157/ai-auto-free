"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface TermsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsDialog({ isOpen, onClose }: TermsDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-extrabold leading-6 text-gray-900 dark:text-white">
                    Terms of Service
                  </Dialog.Title>
                  <button type="button" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200" onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="prose dark:prose-invert max-w-none font-medium text-gray-800 dark:text-gray-200">
                    <p className="mb-4 text-base font-medium">Welcome to AI Accounts. Please read these Terms of Service carefully.</p>

                    <h4 className="text-lg font-bold mt-6 mb-2 text-gray-900 dark:text-white">Trial Account Limitations</h4>
                    <p className="mb-4 text-base font-medium">The accounts purchased through our website are trial accounts, and as such, their limits may vary. These limitations are subject to change based on the policies of the respective AI platforms.</p>

                    <h4 className="text-lg font-bold mt-6 mb-2 text-gray-900 dark:text-white">Account Availability</h4>
                    <p className="mb-4 text-base font-medium">
                      In the future, if stronger preventive measures are implemented for account creation by AI platforms, we may not be able to continue providing accounts. In such cases, we will strive to support these scenarios with alternative AI platforms and solutions.
                    </p>

                    <h4 className="text-lg font-bold mt-6 mb-2 text-gray-900 dark:text-white">No Guarantees</h4>
                    <p className="mb-4 text-base font-medium">We cannot guarantee the perpetual functionality of provided accounts. Changes in platform policies, security measures, or other factors beyond our control may affect the usability of accounts.</p>

                    <h4 className="text-lg font-bold mt-6 mb-2 text-gray-900 dark:text-white">Use Restrictions</h4>
                    <p className="mb-4 text-base font-medium">Accounts purchased through our service should be used in accordance with the respective AI platform's terms of service. Any violation of these terms may result in account termination by the platform provider.</p>

                    <h4 className="text-lg font-bold mt-6 mb-2 text-gray-900 dark:text-white">Service Adaptability</h4>
                    <p className="mb-4 text-base font-medium">Our service is designed to adapt to changes in the AI landscape. If certain account types become unavailable, we will make efforts to provide alternatives or adjust our offerings to continue delivering value to our customers.</p>

                    <h4 className="text-lg font-bold mt-6 mb-2 text-gray-900 dark:text-white">Changes to Terms</h4>
                    <p className="mb-4 text-base font-medium">We reserve the right to modify these terms at any time. Continued use of our service after changes constitutes acceptance of the updated terms.</p>

                    <h4 className="text-lg font-bold mt-6 mb-2 text-gray-900 dark:text-white">Contact Us</h4>
                    <p className="mb-4 text-base font-medium">
                      If you have any questions about these Terms of Service, please contact us at{" "}
                      <a href="mailto:contact@aiaccounts.online" className="text-blue-500 hover:text-blue-600 transition-colors duration-200">
                        contact@aiaccounts.online
                      </a>
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:shadow-lg hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
                    onClick={onClose}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    I agree
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
