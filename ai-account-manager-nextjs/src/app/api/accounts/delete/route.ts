import { NextResponse } from 'next/server';
import { getUserByEmail, deleteAccount } from '@/utils/supabase';
import { getToken } from 'next-auth/jwt';

// Hesap silme işlemi
export async function DELETE(request: Request) {
  try {
    // JWT token kontrolü
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Kimlik doğrulama yoksa, yetkisiz yanıt ver
    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accountId, userEmail } = body;

    console.log("API received delete account request:", { accountId, userEmail });

    if (!accountId || !userEmail) {
      console.error("Missing required fields:", { accountId, userEmail });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Token'daki e-posta ile istek body'sindeki e-postanın eşleştiğini kontrol et
    const tokenEmail = token.email.toLowerCase().trim();
    const requestEmail = userEmail.toLowerCase().trim();

    if (tokenEmail !== requestEmail) {
      console.error("Email mismatch:", { tokenEmail, requestEmail });
      return NextResponse.json(
        { error: 'Unauthorized: email mismatch' },
        { status: 403 }
      );
    }

    // Kullanıcıyı e-posta ile bul
    const user = await getUserByEmail(requestEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log("User found for account deletion:", { userId: user.id, accountId });

    try {
      // Hesabı sil
      await deleteAccount(accountId, user.id);

      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (deleteError: any) {
      console.error('Specific error deleting account:', deleteError);

      // Daha spesifik hata mesajları döndür
      if (deleteError.message && deleteError.message.includes('not found or does not belong')) {
        return NextResponse.json(
          { error: 'This account does not belong to you or no longer exists' },
          { status: 403 }
        );
      }

      // Supabase hata mesajlarını kontrol et
      if (deleteError.code) {
        return NextResponse.json(
          { error: `Database error: ${deleteError.code} - ${deleteError.message}` },
          { status: 500 }
        );
      }

      // Genel hata durumu
      return NextResponse.json(
        { error: `Error deleting account: ${deleteError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in account deletion API:', error);
    return NextResponse.json(
      { error: `An error occurred while processing your request: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
