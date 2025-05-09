"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";

type AuthContextType = {
  status: "authenticated" | "loading" | "unauthenticated";
  signin: () => Promise<void>;
  signout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
}

function AuthProviderContent({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  // Her 6 saatte bir session'ı yenile
  useEffect(() => {
    const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 saat
    let intervalId: NodeJS.Timeout;

    if (status === "authenticated") {
      intervalId = setInterval(async () => {
        // Session'ı yenile
        await update();
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, update]);

  const signin = async () => {
    try {
      // Absolute URL kullanmak daha güvenli
      const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/` : "/";

      console.log("Signing in with callback URL:", callbackUrl);

      await signIn("google", {
        callbackUrl: callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Error during signin:", error);
    }
  };

  const signout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error during signout:", error);
    }
  };

  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  return <AuthContext.Provider value={{ status, signin, signout, refreshSession }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
