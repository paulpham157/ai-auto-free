"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { decryptResponse } from "../utils/crypto";

// Stripe public key'i yükle
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId?: string) => void;
  onCancel: () => void;
  credits?: number;
}

// Ödeme formu bileşeni
function PaymentForm({ clientSecret, amount, onSuccess, onCancel, credits }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Ödemeyi gerçekleştir
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "An error occurred while processing payment");
      setProcessing(false);
    } else {
      // Başarılı ödeme
      console.log("Payment successful:", result);

      // Şifrelenmiş yanıt beklemeye gerek olmadan, payment_intent ID'sini gönderiyoruz
      if (result.paymentIntent) {
        onSuccess(result.paymentIntent.id);
      } else {
        onSuccess(); // Başarılı, ancak paymentIntent geri dönmemiş
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Payment Details</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete your purchase of ${amount.toFixed(2)} {credits && `for ${credits} credits`}
        </p>
      </div>

      <PaymentElement />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
}

// Stripe Elements wrapper bileşeni
interface StripePaymentElementProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId?: string) => void;
  onCancel: () => void;
  credits?: number;
}

export default function StripePaymentElement({ clientSecret, amount, onSuccess, onCancel, credits }: StripePaymentElementProps) {
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm clientSecret={clientSecret} amount={amount} onSuccess={onSuccess} onCancel={onCancel} credits={credits} />
    </Elements>
  );
}
