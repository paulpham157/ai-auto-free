import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { saveUser } from "@/utils/supabase";
import { JWT } from "next-auth/jwt";
import { Session, User, Account, Profile } from "next-auth";

// Session tipini genişletiyoruz
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    expires: string;
  }
}

// Auth yapılandırması bu dosyada tanımlanacak ve buradan export edilecek
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "1022101661315-td15bk67l2hv4ej1hn8ff8qe0aff8tqk.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Hata durumunda yönlendirilecek sayfa
  },
  secret: process.env.NEXTAUTH_SECRET || "your-default-secret-key",
  session: {
    strategy: "jwt" as const,
    maxAge: 14 * 24 * 60 * 60, // 14 gün (2 hafta)
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: User, account: Account | null, profile?: Profile }): Promise<boolean> {
      try {
        // Google profil bilgilerini loglama
        console.log("Google profile data:", JSON.stringify(profile, null, 2));

        // Kullanıcı girişi öncesinde hata ayıklama
        console.log("NextAuth signIn callback called with user:", {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ? "Has image" : "No image"
        });

        // Kullanıcı e-posta adresini kontrol et
        if (!user.email) {
          console.error("NextAuth signIn: User has no email address");
          return true; // Hata olsa bile giriş yapmasına izin veriyoruz
        }

        // Kullanıcı başarıyla giriş yaptığında Supabase'e kaydediyoruz
        console.log("NextAuth signIn: Saving user to Supabase");

        try {
          const savedUser = await saveUser({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
          });

          if (savedUser) {
            console.log("NextAuth signIn: User saved successfully. User ID:", savedUser.id);
          } else {
            console.error("NextAuth signIn: Failed to save user but continuing login");

            // Kayıt başarısız olsa bile kullanıcı bilgilerini logla
            console.log("User details for manual fixing:", {
              email: user.email,
              name: user.name || "No name provided",
              image: user.image || "No image"
            });
          }
        } catch (saveError) {
          console.error("Critical error in saveUser:", saveError);
          // Kaydetme hatası olsa bile giriş yapmasına izin ver
        }

        return true;
      } catch (error) {
        console.error("Error in NextAuth signIn callback:", error);
        return true; // Hata olsa bile giriş yapmasına izin veriyoruz
      }
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }): Promise<string> {
      // URL'i loglama
      console.log("Redirect called with URL:", url, "and base URL:", baseUrl);

      // Ana sayfaya yönlendirme zorla (force root URL)
      if (url.startsWith("/")) {
        const targetUrl = `${baseUrl}${url}`;
        console.log("Redirecting to:", targetUrl);
        return targetUrl;
      }
      // Aynı origin kontrolü
      else if (new URL(url).origin === baseUrl) {
        console.log("Redirecting to same origin URL:", url);
        return url;
      }

      // Varsayılan olarak ana sayfaya yönlendir
      console.log("Defaulting to baseUrl:", baseUrl);
      return baseUrl;
    },
    async session({ session, token }: { session: Session, token: JWT }): Promise<Session> {
      // JWT token bilgilerini session'a ekle
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: JWT, user?: User, account?: Account | null }): Promise<JWT> {
      // İlk giriş sırasında JWT'ye ek bilgiler ekleyebilirsiniz
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  debug: process.env.NODE_ENV === "development",
};

// Server componentler için getServerSession kullanım
export async function getSession() {
  return await getServerSession(authOptions);
}

// Route handler'lar için JWT token'dan session bilgilerini çekme
export async function getSessionFromRequest(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    return null;
  }

  return {
    user: {
      id: token.sub,
      name: token.name,
      email: token.email,
      image: token.picture
    }
  };
}
