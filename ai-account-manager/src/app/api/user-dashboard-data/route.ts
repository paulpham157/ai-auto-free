import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  getAccountsByUserId,
  getUserPurchasesInLastHour,
  supabaseAdmin,
  updateUserLastLogin
} from "@/utils/supabase";
import { createHash, randomBytes, createCipheriv } from "crypto";
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

    // Yanıtı gönder - artık normal JSON olarak gönderiyoruz,
    // çünkü içeriği zaten kendimiz şifreledik
    return Response.json(encryptedResponse, {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Security': 'encrypted'
      }
    });
  } catch (error) {
    console.error("Error encrypting response:", error);
    // Hata durumunda güvenli bir hata yanıtı döndür
    return Response.json({ error: "Processing error" }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export async function GET(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return encryptedJsonResponse({ error: "Unauthorized" }, 401);
    }

    // Kullanıcı e-postasını küçük harfe çevirerek ve boşlukları temizleyerek kullan
    const userEmail = session.user.email.toLowerCase().trim();

    // URL parametrelerini al
    const url = new URL(req.url);
    const statsOnlyParam = url.searchParams.get("statsOnly");
    const compressedData = url.searchParams.get("data");

    // statsOnly parametresi URL'den geliyorsa
    const statsOnly = statsOnlyParam === "true";

    // statsOnly direkt URL'den geliyorsa, diğer parametrelere gerek yok
    if (statsOnly && !compressedData) {
      // Kullanıcının son giriş zamanını güncelle - service role ile
      await updateUserLastLogin(userEmail);

      // Hesap tiplerini getir - service role ile
      const accountTypesResult = await supabaseAdmin.from('account_settings').select('*');
      const accountTypes = accountTypesResult.data || [];

      // Hesap tiplerine göre mevcut hesap sayılarını getir - service role ile
      const accountStatsPromises = accountTypes.map(async (type: any) => {
        const { count } = await supabaseAdmin
          .from('account_pool')
          .select('*', { count: 'exact', head: true })
          .eq('type', type.type)
          .eq('is_available', true);

        return {
          type: type.type,
          availableCount: count || 0
        };
      });

      const accountStats = await Promise.all(accountStatsPromises);

      // Sadece hesap istatistiklerini döndür
      return encryptedJsonResponse({
        accountStats: Object.fromEntries(accountStats.map(stat => [stat.type, stat.availableCount]))
      });
    }

    // Request timestamp ve nonce kontrolü (CSRF ve replay attack önlemi)
    const requestTimestamp = req.headers.get("x-request-timestamp");
    const nonce = req.headers.get("x-request-nonce");

    if (!requestTimestamp || !nonce) {
      return encryptedJsonResponse({ error: "Invalid request headers" }, 400);
    }

    if (!compressedData) {
      return encryptedJsonResponse({ error: "Missing compressed data" }, 400);
    }

    // Sıkıştırılmış veriyi çöz
    let params: any;
    try {
      const decompressedData = await decompressFromBase64(compressedData);
      params = JSON.parse(decompressedData);
    } catch (error) {
      console.error("Error decompressing data:", error);
      return encryptedJsonResponse({ error: "Invalid compressed data" }, 400);
    }

    // Request timestamp kontrolü için parametreden de kontrol et
    if (params.t !== requestTimestamp) {
      return encryptedJsonResponse({ error: "Timestamp mismatch" }, 400);
    }

    // 5 dakikadan eski istekleri reddet (replay attack önlemi)
    const currentTime = Date.now();
    const requestTime = parseInt(requestTimestamp);
    if (isNaN(requestTime) || currentTime - requestTime > 5 * 60 * 1000) {
      return encryptedJsonResponse({ error: "Request expired" }, 400);
    }

    // Kullanıcının son giriş zamanını güncelle - service role ile
    await updateUserLastLogin(userEmail);

    // Kullanıcı bilgilerini getir - service role ile
    const userData = await getUserByEmail(userEmail);

    if (!userData) {
      return encryptedJsonResponse({ error: "User not found" }, 404);
    }

    // Parametreleri al
    const currentPage = params.page || 1;
    const pageSize = params.pageSize || 10;
    const paramsStatsOnly = params.statsOnly === true;

    // Sadece hesap istatistikleri isteniyorsa
    if (paramsStatsOnly) {
      // Hesap tiplerini getir - service role ile
      const accountTypesResult = await supabaseAdmin.from('account_settings').select('*');
      const accountTypes = accountTypesResult.data || [];

      // Hesap tiplerine göre mevcut hesap sayılarını getir - service role ile
      const accountStatsPromises = accountTypes.map(async (type: any) => {
        const { count } = await supabaseAdmin
          .from('account_pool')
          .select('*', { count: 'exact', head: true })
          .eq('type', type.type)
          .eq('is_available', true);

        return {
          type: type.type,
          availableCount: count || 0
        };
      });

      const accountStats = await Promise.all(accountStatsPromises);

      // Sadece hesap istatistiklerini döndür
      return encryptedJsonResponse({
        accountStats: Object.fromEntries(accountStats.map(stat => [stat.type, stat.availableCount]))
      });
    }

    // Tüm verileri paralel olarak getir - service role ile
    const [
      accountsData,
      hourlyPurchaseCount,
      accountTypesResult,
      isAdminResult
    ] = await Promise.all([
      // 1. Kullanıcının hesaplarını getir - service role ile
      getAccountsByUserId(userData.id, currentPage, pageSize),

      // 2. Son bir saat içindeki satın alımları kontrol et - service role ile
      getUserPurchasesInLastHour(userData.id),

      // 3. Hesap tiplerini getir - service role ile
      supabaseAdmin.from('account_settings').select('*'),

      // 4. Admin kontrolü - service role ile
      supabaseAdmin.from('users').select('role').eq('id', userData.id).single()
    ]);

    // Hesap tiplerini al
    const accountTypes = accountTypesResult.data || [];

    // Admin durumunu kontrol et
    const isAdmin = isAdminResult.data?.role === "admin";

    // Hesap tiplerine göre mevcut hesap sayılarını getir - service role ile
    const accountStatsPromises = accountTypes.map(async (type: any) => {
      const { count } = await supabaseAdmin
        .from('account_pool')
        .select('*', { count: 'exact', head: true })
        .eq('type', type.type)
        .eq('is_available', true);

      return {
        type: type.type,
        availableCount: count || 0
      };
    });

    const accountStats = await Promise.all(accountStatsPromises);

    // Tüm verileri birleştir ve döndür
    return encryptedJsonResponse({
      user: {
        id: userData.id,
        email: userData.email,
        credit: userData.credit || 0,
        isBanned: userData.banned || userData.is_banned || false,
        role: userData.role
      },
      accounts: accountsData.accounts,
      totalAccounts: accountsData.count,
      hourlyPurchaseCount,
      accountTypes,
      accountStats: Object.fromEntries(accountStats.map(stat => [stat.type, stat.availableCount])),
      isAdmin
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return encryptedJsonResponse({ error: "Internal server error" }, 500);
  }
}
