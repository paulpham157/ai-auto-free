import { NextResponse } from 'next/server';
import { getAccountPoolStats, getAvailableAccountCountByType } from '@/utils/supabase';

// Cache süresi (30 saniye)
const CACHE_TTL = 30;

// Havuzdaki tüm hesapların istatistiklerini getirme (Admin API)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
    }

    // Hesap sayısını getir
    const availableCount = await getAvailableAccountCountByType(type);

    // Response'a Cache-Control header'ı ekle
    return NextResponse.json(
      { availableCount },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}, stale-while-revalidate=60`
        }
      }
    );
  } catch (error) {
    console.error('Error fetching account stats:', error);
    return NextResponse.json({ error: 'Failed to fetch account stats' }, { status: 500 });
  }
}
