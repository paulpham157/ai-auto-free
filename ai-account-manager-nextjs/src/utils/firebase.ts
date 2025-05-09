// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, remove } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4AMZjnWDp0BYKQSRTXxIwuun3Jnz9wy0",
  authDomain: "ai-auto-free.firebaseapp.com",
  databaseURL: "https://ai-auto-free-default-rtdb.firebaseio.com",
  projectId: "ai-auto-free",
  storageBucket: "ai-auto-free.firebasestorage.app",
  messagingSenderId: "752171831108",
  appId: "1:752171831108:web:f331271904290799861111"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Hediye kodunu kontrol eder ve geçerliyse kredisini döndürür
 * @param code Hediye kodu (XXXX-XXXX formatında)
 * @returns Hediye kodunun kredisi veya null (geçersizse)
 */
export async function checkGiftCode(code: string): Promise<number | null> {
  try {
    // Hediye kodunu normalleştir
    const normalizedCode = code.trim().toUpperCase();

    // Kodu Realtime Database'de kontrol et
    const giftCodeRef = ref(database, `giftCodes/${normalizedCode}`);
    const snapshot = await get(giftCodeRef);

    if (snapshot.exists()) {
      const giftCodeData = snapshot.val();
      return giftCodeData.credits || null;
    }

    return null;
  } catch (error) {
    console.error("Error checking gift code:", error);
    return null;
  }
}

/**
 * Kullanılmış hediye kodunu siler
 * @param code Silinecek hediye kodu
 * @returns İşlemin başarılı olup olmadığı
 */
export async function removeGiftCode(code: string): Promise<boolean> {
  try {
    const normalizedCode = code.trim().toUpperCase();
    const giftCodeRef = ref(database, `giftCodes/${normalizedCode}`);

    await remove(giftCodeRef);
    return true;
  } catch (error) {
    console.error("Error removing gift code:", error);
    return false;
  }
}
