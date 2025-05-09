import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isUserAdmin, updateUserLastLogin } from "./utils/supabase";

// Sabit bir güvenlik anahtarı kullanarak TokenError hatalarını önle
const SECRET_KEY = process.env.NEXTAUTH_SECRET || "your-default-secret-key";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Statik dosyalar, api/auth, login sayfası ve favicon için direk geçiş
    if (pathname.startsWith('/_next') ||
        pathname.includes('/api/auth') ||
        pathname === '/login' ||
        pathname === '/favicon.ico' ||
        pathname.includes('/images/') ||
        pathname.includes('/.well-known/')) {
      return NextResponse.next();
    }

    // Token'ı al
    let token;
    try {
      token = await getToken({
        req: request,
        secret: SECRET_KEY,
      });

      // Kullanıcı oturumu aktifse, her istek sonrası last_login değerini güncelle
      // Bu işlem, kullanıcının aktif olduğu sürece oturumun taze kalmasını sağlar
      if (token?.email && !pathname.startsWith('/_next') && !pathname.startsWith('/api/auth')) {
        try {
          await updateUserLastLogin(token.email as string);
        } catch (updateError) {
          console.error("Error updating last login:", updateError);
        }
      }

      // Geliştirme amacıyla logla (production'da kapatılmalı)
      console.log(`Path: ${pathname}, Token:`, token ? "Valid token" : "No token");
    } catch (error) {
      console.error(`Token error for ${pathname}:`, error);
      // Token çözümleme hatası - login sayfasına yönlendir
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication error' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Kimlik doğrulama yoksa ve korumalı bir route ise
    if (!token) {
      // Admin sayfasını veya API'sini koruma
      if (pathname.startsWith('/admin') || (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/check'))) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Korumalı route'ları koruma
      if (pathname === "/" ||
          pathname.startsWith('/api/purchase') ||
          pathname.startsWith('/api/credit') ||
          pathname.startsWith('/api/accounts')) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // API istekleri için koruma
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized access' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    // Admin sayfası ve API erişim kontrolü - /api/admin/check hariç
    if (token && token.email &&
      (pathname.startsWith('/admin') ||
      (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/check')))) {
      try {
        // Admin rolünü server-side kontrol et
        const email = token.email as string;
        // Hata ayıklama: E-posta adresini log'la
        console.log('Admin check for email:', email);

        // Not: Bu fonksiyon çağrısı, middleware async olduğu için çalışacaktır
        // Gerçek uygulamalarda, admin bilgisi JWT token içerisinde taşınabilir
        const isAdmin = await isUserAdmin(email);

        // Hata ayıklama: Admin durumunu log'la
        console.log('Is admin result:', isAdmin);

        if (!isAdmin) {
          // Hata ayıklama: Admın değil, yönlendiriliyor
          console.log('Not admin, redirecting to home page');

          // Admin değilse ana sayfaya yönlendir
          if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL("/", request.url));
          }

          // Admin API'ye yetkisiz erişim varsa 403 hatası döndür
          if (pathname.startsWith('/api/admin')) {
            return new NextResponse(
              JSON.stringify({ error: 'Forbidden: Admin access required' }),
              {
                status: 403,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        }
      } catch (error) {
        console.error('Error checking admin status in middleware:', error);
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Login sayfası kontrolü - kimlik doğrulanmışsa ana sayfaya yönlendir
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const { pathname } = request.nextUrl;

    // Middleware hata verirse
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Server authentication error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Auth sayfası değilse login'e yönlendir
    if (pathname !== '/login' && !pathname.includes('/api/auth')) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
