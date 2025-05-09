import { NextResponse } from 'next/server';
import { getAccountSettings } from '@/utils/supabase';

// Hesap türlerini getirme
export async function GET() {
  try {
    const accountSettings = await getAccountSettings();

    return NextResponse.json(accountSettings);
  } catch (error) {
    console.error('Error fetching account types:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching account types' },
      { status: 500 }
    );
  }
}
