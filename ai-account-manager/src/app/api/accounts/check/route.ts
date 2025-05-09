import { NextResponse } from 'next/server';
import { getUserByEmail, supabaseAdmin } from '@/utils/supabase';
import { getToken } from 'next-auth/jwt';

// Hesap sahipliğini kontrol eden API
export async function POST(request: Request) {
  try {
    // JWT token kontrolü
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Kimlik doğrulama yoksa, yetkisiz yanıt ver
    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accountId, userEmail } = body;

    console.log("API hesap kontrol isteği aldı:", { accountId, userEmail });

    if (!accountId || !userEmail) {
      console.error("Gerekli alanlar eksik:", { accountId, userEmail });
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Token'daki e-posta ile istek body'sindeki e-postanın eşleştiğini kontrol et
    const tokenEmail = token.email.toLowerCase().trim();
    const requestEmail = userEmail.toLowerCase().trim();

    if (tokenEmail !== requestEmail) {
      console.error("E-posta uyuşmazlığı:", { tokenEmail, requestEmail });
      return NextResponse.json(
        { error: 'Yetkisiz: e-posta uyuşmazlığı' },
        { status: 403 }
      );
    }

    // Kullanıcıyı e-posta ile bul
    const user = await getUserByEmail(requestEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    console.log("Hesap kontrolü için kullanıcı bulundu:", { userId: user.id, accountId });

    // Hesabın var olup olmadığını kontrol et
    const { data: accountExists, error: existsError } = await supabaseAdmin
      .from('accounts')
      .select('id, user_id, email, type')
      .eq('id', accountId)
      .single();
      
    if (existsError) {
      console.error("Hesap kontrolünde hata:", existsError);
      return NextResponse.json(
        { error: 'Hesap bulunamadı', details: existsError },
        { status: 404 }
      );
    }
    
    console.log("Hesap bulundu:", accountExists);
    
    // Hesabın kullanıcıya ait olup olmadığını kontrol et
    if (accountExists.user_id !== user.id) {
      console.log("Hesap sahipliği uyuşmazlığı:", { 
        hesapKullanıcıId: accountExists.user_id, 
        istekYapanKullanıcıId: user.id 
      });
      
      return NextResponse.json({
        error: 'Bu hesap size ait değil',
        details: {
          accountUserId: accountExists.user_id,
          requestUserId: user.id,
          match: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Hesap size ait',
      details: {
        account: accountExists,
        user: {
          id: user.id,
          email: user.email
        },
        match: true
      }
    });
  } catch (error: any) {
    console.error('Hesap kontrol API hata:', error);
    return NextResponse.json(
      { error: `İsteğiniz işlenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}` },
      { status: 500 }
    );
  }
}
