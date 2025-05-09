import pako from 'pako';

/**
 * Veriyi gzip ile sıkıştırıp base64'e dönüştürür
 * @param data Sıkıştırılacak veri
 * @returns Base64 formatında sıkıştırılmış veri
 */
export const compressToBase64 = async (data: string): Promise<string> => {
  try {
    // String veriyi binary array'e dönüştür
    const binaryString = new TextEncoder().encode(data);

    // GZIP ile sıkıştır
    const compressed = pako.gzip(binaryString);

    // Uint8Array'i base64'e çevir
    let binary = '';
    const bytes = new Uint8Array(compressed);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    // Base64 dönüşümü
    const base64 = btoa(binary);

    // URL-safe base64 için karakter değişimi
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error("Compression error:", error);
    throw error;
  }
};

/**
 * Base64 formatındaki sıkıştırılmış veriyi çözer
 * @param base64Data Base64 formatındaki gzip ile sıkıştırılmış veri
 * @returns Çözülmüş string
 */
export const decompressFromBase64 = async (base64Data: string): Promise<string> => {
  try {
    // URL-safe base64'ü normal base64'e çevir
    let normalBase64 = base64Data.replace(/-/g, '+').replace(/_/g, '/');

    // Eksik padding karakterlerini ekle
    while (normalBase64.length % 4) {
      normalBase64 += '=';
    }

    // Base64'ten binary string'e çevir
    const binary = atob(normalBase64);

    // Binary string'i Uint8Array'e dönüştür
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // GZIP'ten çöz
    const decompressed = pako.ungzip(bytes);

    // Uint8Array'i string'e çevir
    return new TextDecoder().decode(decompressed);
  } catch (error) {
    console.error("Decompression error:", error);
    throw error;
  }
};
