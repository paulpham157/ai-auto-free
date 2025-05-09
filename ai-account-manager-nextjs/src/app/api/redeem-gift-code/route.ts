import { NextResponse } from "next/server";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, remove } from "firebase/database";
import { createClient } from '@supabase/supabase-js';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyA4AMZjnWDp0BYKQSRTXxIwuun3Jnz9wy0",
  authDomain: "ai-auto-free.firebaseapp.com",
  databaseURL: "https://ai-auto-free-default-rtdb.firebaseio.com",
  projectId: "ai-auto-free",
  storageBucket: "ai-auto-free.firebasestorage.app",
  messagingSenderId: "752171831108",
  appId: "1:752171831108:web:f331271904290799861111"
};

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Firebase'i başlat
const firebaseApp = initializeApp(firebaseConfig, 'gift-code-app');
const firebaseDb = getDatabase(firebaseApp);

// Hediye kodu kullanma
export async function POST(request: Request) {
  try {
    const { code, userEmail } = await request.json();

    if (!code || !userEmail) {
      return NextResponse.json(
        { error: "Gift code and user email are required" },
        { status: 400 }
      );
    }

    // Kod formatını kontrol et - XXXX-XXXX
    const codePattern = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
    if (!codePattern.test(code)) {
      return NextResponse.json(
        { error: "Invalid gift code format. Please use XXXX-XXXX format" },
        { status: 400 }
      );
    }

    // Kullanıcıyı veritabanından al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, credit')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Firebase'den hediye kodunu kontrol et
    const giftCodeRef = ref(firebaseDb, `giftCodes/${code.toUpperCase()}`);
    const giftCodeSnapshot = await get(giftCodeRef);

    if (!giftCodeSnapshot.exists()) {
      return NextResponse.json(
        { error: "Invalid gift code or already used" },
        { status: 400 }
      );
    }

    const giftCodeData = giftCodeSnapshot.val();
    const creditAmount = giftCodeData.credits || 0;

    if (creditAmount <= 0) {
      return NextResponse.json(
        { error: "Gift code has no credits" },
        { status: 400 }
      );
    }

    // Firebase'den hediye kodunu sil
    await remove(giftCodeRef);

    // Kullanıcının kredisini veritabanında güncelle
    const userCurrentCredit = user.credit || 0;
    const newBalance = userCurrentCredit + creditAmount;

    const { error: updateError } = await supabase
      .from('users')
      .update({ credit: newBalance })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update user credits" },
        { status: 500 }
      );
    }

    // Başarılı yanıt
    return NextResponse.json({
      message: `Successfully redeemed ${creditAmount} credits!`,
      newBalance: newBalance,
    });
  } catch (error) {
    console.error("Error processing gift code:", error);
    return NextResponse.json(
      { error: "Failed to process gift code" },
      { status: 500 }
    );
  }
}
