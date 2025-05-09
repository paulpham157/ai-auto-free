import { createHash, createDecipheriv } from 'crypto-browserify';
import pako from 'pako';

// Şifreleme anahtarı (gerçek uygulamada daha güvenli bir şekilde saklanmalıdır)
const ENCRYPTION_KEY = createHash('sha256').update('V4.re@7R3JNT843$1Q').digest();
const IV_LENGTH = 16;

/**
 * Şifrelenmiş yanıtı çözümleyen fonksiyon
 * @param encryptedResponse API'den gelen şifrelenmiş yanıt
 * @returns Çözümlenmiş veri objesi
 */
export const decryptResponse = (encryptedResponse: any): any => {
  try {
    // Güvenlik kontrolü
    if (!encryptedResponse || !encryptedResponse._secure || !encryptedResponse.data) {
      throw new Error("Invalid encrypted response format");
    }

    // Base64 veriyi çöz
    let base64Data = encryptedResponse.data;

    // URL-safe base64'ü normal base64'e çevir
    base64Data = base64Data.replace(/-/g, '+').replace(/_/g, '/');

    // Padding ekle
    while (base64Data.length % 4) {
      base64Data += '=';
    }

    // Base64'ten buffer'a dönüştür
    const buffer = Buffer.from(base64Data, 'base64');

    // IV ve şifreli veriyi ayır
    const iv = buffer.slice(0, IV_LENGTH);
    const encryptedData = buffer.slice(IV_LENGTH);

    // Decipher oluştur
    const decipher = createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

    // Veriyi çöz
    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);

    // GZIP'i çöz
    const decompressed = pako.ungzip(decryptedBuffer);

    // Binary veriyi string'e çevir
    const jsonString = new TextDecoder().decode(decompressed);

    // JSON parse et
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decrypting response:', error);
    throw new Error('Failed to decrypt response data');
  }
};
