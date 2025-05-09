import { NextResponse } from 'next/server';
import { purchaseAccount, getUserByEmail, supabaseAdmin } from '@/utils/supabase';
import { getToken } from 'next-auth/jwt';

// Hesap satın alma işlemi
export async function POST(request: Request) {
  try {
    // JWT token kontrolü
    let token;
    try {
      token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

      console.log("Token received:", token ? "Valid token" : "No token");
    } catch (tokenError) {
      console.error("Error retrieving JWT token:", tokenError);
      return NextResponse.json(
        { error: 'Authentication error: Unable to validate session' },
        { status: 401 }
      );
    }

    // Kimlik doğrulama yoksa, yetkisiz yanıt ver
    if (!token || !token.email) {
      console.error("Unauthorized access: No valid token or email in token");
      return NextResponse.json(
        { error: 'Unauthorized access: No valid session found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accountType, userEmail } = body;

    console.log("API received request with:", { accountType, userEmail });

    if (!accountType || !userEmail) {
      console.error("Missing required fields:", { accountType, userEmail });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Token'daki e-posta ile istek body'sindeki e-postanın eşleştiğini kontrol et
    // Bu, kullanıcının kendi hesabı için işlem yaptığını doğrular
    const tokenEmail = token.email.toLowerCase().trim();
    const requestEmail = userEmail.toLowerCase().trim();

    if (tokenEmail !== requestEmail) {
      console.error("Email mismatch:", { tokenEmail, requestEmail });
      return NextResponse.json(
        { error: 'Unauthorized: email mismatch' },
        { status: 403 }
      );
    }

    // Kullanıcıyı e-posta ile bul - service role ile direkt sorgulama yapalım
    try {
      console.log("Fetching user with email:", requestEmail);

      // Service role ile kullanıcıyı getir
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', requestEmail)
        .single();

      if (error) {
        console.error("Database error fetching user:", error);
        return NextResponse.json(
          { error: 'Database error: ' + error.message },
          { status: 500 }
        );
      }

      if (!user) {
        console.error("User not found for email:", requestEmail);
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        );
      }

      console.log("User found with ID:", user.id);

      // Hesap satın alma işlemini gerçekleştir
      const result = await purchaseAccount(user.id, accountType);
      console.log("Purchase result:", result);

      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        account: result.account
      });
    } catch (userError) {
      console.error("Error retrieving user:", userError);
      return NextResponse.json(
        { error: 'Error retrieving user: ' + (userError instanceof Error ? userError.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error purchasing account:', error);
    return NextResponse.json(
      { error: 'An error occurred while purchasing the account: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
