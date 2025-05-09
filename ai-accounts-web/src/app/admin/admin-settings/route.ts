import { NextResponse } from 'next/server';
import { supabaseAdmin, getUserByEmail } from '@/utils/supabase';
import { getToken } from 'next-auth/jwt';

// Admin ayarlarını getiren API
export async function GET(request: Request) {
  try {
    // URL'den key parametresini al
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    // JWT token kontrolü
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Kimlik doğrulama yoksa veya email yoksa hata döndür
    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = token.email as string;

    // Admin kontrolü
    const user = await getUserByEmail(email);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Key parametresi varsa spesifik bir ayarı getir
    if (key) {
      // Hata düzeltme: single() kullanırken veri olmazsa hata vermesini önle
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('*')
        .eq('key', key);

      console.log('Admin settings query result:', { data, error, key });

      if (error) {
        throw error;
      }

      // .single() yerine ilk elemanı alarak
      const setting = data && data.length > 0 ? data[0] : null;

      return NextResponse.json({
        status: 'success',
        setting
      });
    }

    // Tüm ayarları getir
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: 'success',
      settings: data
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching admin settings' },
      { status: 500 }
    );
  }
}
