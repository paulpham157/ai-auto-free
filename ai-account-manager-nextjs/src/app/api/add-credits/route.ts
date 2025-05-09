import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserByEmail, updateUserCreditWithTransaction } from '@/utils/supabase';
import Stripe from 'stripe';
import { createHash, createCipheriv, randomBytes } from 'crypto';
import { decompressFromBase64 } from "@/app/utils/compression";
import pako from 'pako';

// Şifreleme anahtarı ve IV (gerçek uygulamada .env'den alınmalıdır)
const ENCRYPTION_KEY = createHash('sha256').update('V4.re@7R3JNT843$1Q').digest();
const IV_LENGTH = 16;

// GZIP sıkıştırması ve şifreleme ile JSON yanıt döndüren helper fonksiyon
const encryptedJsonResponse = (data: any, status: number = 200): Response => {
  try {
    // Veriyi JSON string'e dönüştür
    const jsonString = JSON.stringify(data);

    // String veriyi binary array'e dönüştür
    const binaryString = new TextEncoder().encode(jsonString);

    // GZIP ile sıkıştır
    const compressed = pako.gzip(binaryString);

    // Şifreleme için rastgele IV oluştur
    const iv = randomBytes(IV_LENGTH);

    // Cipher oluştur
    const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

    // Veriyi şifrele
    const encryptedBuffer = Buffer.concat([
      cipher.update(Buffer.from(compressed)),
      cipher.final()
    ]);

    // IV ve şifrelenmiş veriyi birleştir (IV + EncryptedData)
    const resultBuffer = Buffer.concat([iv, encryptedBuffer]);

    // Base64 kodlama yap (URL-safe)
    const base64Data = resultBuffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Gizlenmiş veriyi içeren özel format oluştur
    const encryptedResponse = {
      _secure: true,
      data: base64Data
    };

    // Yanıtı gönder
    return Response.json(encryptedResponse, {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Security': 'encrypted'
      }
    });
  } catch (error) {
    console.error("Error encrypting response:", error);
    return Response.json({ error: "Processing error" }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Stripe yapılandırması
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Kredi ekleme işlemi
export async function POST(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession();

    if (!session?.user?.email) {
      return encryptedJsonResponse({ error: "Unauthorized" }, 401);
    }

    // Request timestamp ve nonce kontrolü (CSRF ve replay attack önlemi)
    const requestTimestamp = req.headers.get("x-request-timestamp");
    const nonce = req.headers.get("x-request-nonce");

    if (!requestTimestamp || !nonce) {
      return encryptedJsonResponse({ error: "Invalid request headers" }, 400);
    }

    // Sıkıştırılmış verileri al ve çöz
    const compressedData = req.headers.get("x-encrypted-data");

    if (!compressedData) {
      return encryptedJsonResponse({ error: "Missing encrypted data" }, 400);
    }

    // Sıkıştırılmış veriyi çöz
    let requestData: any;
    try {
      const decompressedData = await decompressFromBase64(compressedData);
      requestData = JSON.parse(decompressedData);
    } catch (error) {
      console.error("Error decompressing data:", error);
      return encryptedJsonResponse({ error: "Invalid encrypted data" }, 400);
    }

    // Request timestamp kontrolü için parametreden de kontrol et
    if (requestData.t !== requestTimestamp) {
      return encryptedJsonResponse({ error: "Timestamp mismatch" }, 400);
    }

    // 5 dakikadan eski istekleri reddet (replay attack önlemi)
    const currentTime = Date.now();
    const requestTime = parseInt(requestTimestamp);
    if (isNaN(requestTime) || currentTime - requestTime > 5 * 60 * 1000) {
      return encryptedJsonResponse({ error: "Request expired" }, 400);
    }

    // İstek verilerini al
    const { credits, userEmail, payment_intent_id } = requestData;

    // Temel doğrulama - gerekli alanların kontrolü
    if (!credits || !userEmail || !payment_intent_id) {
      return encryptedJsonResponse({ error: "Missing required fields" }, 400);
    }

    // Temiz email oluştur
    const cleanEmail = userEmail.toLowerCase().trim();

    // Kullanıcı emaili ve oturum email'i eşleşiyor mu kontrol et
    if (cleanEmail !== session.user.email.toLowerCase().trim()) {
      return encryptedJsonResponse({ error: "Email mismatch" }, 403);
    }

    // Kullanıcıyı veritabanından al
    const user = await getUserByEmail(cleanEmail);
    if (!user) {
      return encryptedJsonResponse({ error: "User not found" }, 404);
    }

    // Stripe ödeme niyetini kontrol et (gerçek para işlemi ise)
    if (payment_intent_id.startsWith('pi_')) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        // Ödeme başarılı mı kontrol et
        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
          return encryptedJsonResponse({
            error: "Payment not completed",
            status: paymentIntent.status
          }, 400);
        }

        // Metadata'daki kullanıcı bilgileri eşleşiyor mu kontrol et
        if (paymentIntent.metadata.userEmail !== cleanEmail ||
            paymentIntent.metadata.userId !== user.id ||
            Number(paymentIntent.metadata.credits) !== Number(credits)) {
          console.error("Payment metadata mismatch", {
            paymentIntentMetadata: paymentIntent.metadata,
            requestData: { userEmail: cleanEmail, userId: user.id, credits }
          });
          return encryptedJsonResponse({ error: "Payment validation failed" }, 403);
        }
      } catch (error) {
        console.error("Error validating payment intent:", error);
        return encryptedJsonResponse({ error: "Failed to validate payment" }, 500);
      }
    }

    // Kullanıcıya kredi ekle ve işlem kaydı oluştur
    const price = Number(credits) * 0.20; // kredi başına yaklaşık fiyat
      const newBalance = await updateUserCreditWithTransaction(
        user.id,
      Number(credits),
      payment_intent_id,
        price
      );

    if (newBalance === null) {
      return encryptedJsonResponse({ error: "Failed to add credits" }, 500);
    }

    // Başarılı yanıt
    return encryptedJsonResponse({
        success: true,
        newBalance,
        message: `${credits} credits added successfully`
      });
  } catch (error) {
    console.error("Error adding credits:", error);
    return encryptedJsonResponse({ error: "Internal server error" }, 500);
  }
}

// Satın alma kaydını veritabanına ekler
async function savePurchaseRecord(userId: string, credits: number, paymentIntentId: string, amount: number) {
  try {
    console.log('Saving purchase record to credit_transactions:', { userId, credits, paymentIntentId, amount });

    const { createClient } = await import('@supabase/supabase-js');

    // Supabase URL kontrolü
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing Supabase URL configuration');
      throw new Error('Supabase URL configuration is missing');
    }

    // Servis anahtarı veya anonkey kullan - servis anahtarı yoksa anonkey'i kullan
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      console.error('Missing Supabase key configuration');
      throw new Error('Supabase key configuration is missing');
    }

    console.log('Using Supabase key type:', process.env.SUPABASE_SERVICE_KEY ? 'SERVICE_KEY' : 'ANON_KEY');

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
      console.error('Error saving purchase record:', error);
      throw error;
    }

    console.log('Purchase record saved successfully with ID:', data?.id);
    return data;
  } catch (error) {
    console.error('Detailed error saving purchase record:', error);
    throw error;
  }
}
