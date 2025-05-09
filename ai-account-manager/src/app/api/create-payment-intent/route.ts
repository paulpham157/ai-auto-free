import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserByEmail } from '@/utils/supabase';
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

    // Kullanıcı emailini ve kredi paket bilgisini al
    const { creditPackId, userEmail } = requestData;

    // Temiz email oluştur (güvenlik için)
    const cleanEmail = userEmail.toLowerCase().trim();

    // Kullanıcı emaili ve oturum email'i eşleşiyor mu kontrol et
    if (cleanEmail !== session.user.email.toLowerCase().trim()) {
      return encryptedJsonResponse({ error: "Email mismatch" }, 403);
    }

    // Veritabanındaki kullanıcıyı kontrol et
    const user = await getUserByEmail(cleanEmail);
    if (!user) {
      return encryptedJsonResponse({ error: "User not found" }, 404);
    }

    // Kredi paketi bilgilerini tanımla (Gerçek dünyada bu veri veritabanından gelmelidir)
    const creditPacks = [
      { id: 1, credits: 5, price: 1.00 },
      { id: 2, credits: 10, price: 2.00 },
      { id: 3, credits: 25, price: 5.00 },
      { id: 4, credits: 35, price: 7.00 },
    ];

    // Seçilen kredi paketini bul
    const selectedPack = creditPacks.find(pack => pack.id === creditPackId);
    if (!selectedPack) {
      return encryptedJsonResponse({ error: "Invalid credit pack" }, 400);
    }

    // Stripe ödemesini oluştur
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(selectedPack.price * 100), // Stripe kuruş cinsinden istiyor
      currency: 'usd',
      metadata: {
        userId: user.id,
        userEmail: cleanEmail,
        credits: selectedPack.credits,
        creditPackId: selectedPack.id
      }
    });

    // Client secret'ı döndür
    return encryptedJsonResponse({
      clientSecret: paymentIntent.client_secret,
      amount: selectedPack.price,
      credits: selectedPack.credits
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return encryptedJsonResponse({ error: "Internal server error" }, 500);
  }
}
