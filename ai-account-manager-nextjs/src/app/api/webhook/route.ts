import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserCreditWithTransaction } from '@/utils/supabase';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Bu fonksiyon yalnızca POST isteklerini kabul edecek
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing Stripe webhook secret');
      return NextResponse.json(
        { error: 'Webhook secret is not configured' },
        { status: 500 }
      );
    }

    // Webhook imzasını doğrula
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`Webhook received event type: ${event.type}`);
    console.log('Event data:', JSON.stringify(event.data.object));

  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Ödeme başarılı olduğunda kredi ekle
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;

    console.log('Payment intent succeeded with metadata:', metadata);

    try {
      // Alınan metadata'dan userId ve credits bilgisini çıkar
      const userId = metadata.userId;
      const credits = Number(metadata.credits);

      console.log(`Processing payment for user ${userId}, adding ${credits} credits`);

      if (!userId || !credits) {
        console.error('Missing metadata in payment intent', metadata);
        return NextResponse.json(
          { error: 'Missing metadata in payment intent' },
          { status: 400 }
        );
      }

      // Tek seferde hem kredi ekle hem de işlem kaydı oluştur
      try {
        const paymentAmount = paymentIntent.amount / 100; // Cent'ten dolara çevir
        const newBalance = await updateUserCreditWithTransaction(
          userId,
          credits,
          paymentIntent.id,
          paymentAmount
        );

        console.log(`Webhook: Credits and transaction record updated successfully: ${credits} added to user ${userId}. New balance: ${newBalance}`);
      } catch (error) {
        console.error('Error processing payment in webhook:', error);
        return NextResponse.json(
          { error: 'Failed to process payment' },
          { status: 500 }
        );
      }

      return NextResponse.json({ received: true, success: true });
    } catch (error) {
      console.error('Error processing payment intent', error);
      return NextResponse.json(
        { error: 'Failed to process payment intent' },
        { status: 500 }
      );
    }
  }

  // Diğer webhook olayları için başarılı yanıt ver
  return NextResponse.json({ received: true });
}

// Satın alma kaydını veritabanına ekler
async function savePurchaseRecord(userId: string, credits: number, paymentIntentId: string, amount: number) {
  // Supabase veritabanına kayıt eklemek için gerekli işlemler
  try {
    console.log('Webhook - Saving purchase record to credit_transactions:', { userId, credits, paymentIntentId, amount });

    // Supabase URL kontrolü
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing Supabase URL configuration in webhook');
      throw new Error('Supabase URL configuration is missing');
    }

    // Servis anahtarı veya anonkey kullan - servis anahtarı yoksa anonkey'i kullan
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      console.error('Missing Supabase key configuration in webhook');
      throw new Error('Supabase key configuration is missing');
    }

    console.log('Webhook using Supabase key type:', process.env.SUPABASE_SERVICE_KEY ? 'SERVICE_KEY' : 'ANON_KEY');

    const { createClient } = await import('@supabase/supabase-js');

    // Supabase client'ı oluştur
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey
    );

    // Satın alma kaydını ekle
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: credits,
        price: amount,
        payment_id: paymentIntentId,
        package_id: null,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving webhook purchase record to credit_transactions:', error);
      throw error;
    }

    console.log('Webhook - Purchase record saved successfully to credit_transactions with ID:', data?.id);
    return data;
  } catch (error) {
    console.error('Detailed error saving webhook purchase record:', error);
    // Hatayı fırlat ama işlemi durdurma, böylece kredi işlemi yine de tamamlanabilir
    return null;
  }
}
