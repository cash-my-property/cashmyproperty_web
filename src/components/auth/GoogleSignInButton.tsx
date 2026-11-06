"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import api, { PUBLIC_API_PREFIX } from "@/lib/api";
import { getSafeNextPath } from "@/lib/authHint";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  locale: string;
  label?: string;
  onError?: (msg: string) => void;
}

export default function GoogleSignInButton({
  locale,
  label = "Continue with Google",
  onError,
}: GoogleSignInButtonProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const handleCredentialToken = async (idToken: string) => {
    setIsLoading(true);
    if (onError) onError("");
    try {
      const response = await api.post(`${PUBLIC_API_PREFIX}/auth/google`, { idToken });
      const data = response.data?.data || response.data;
      if (data?.account) {
        login(data.account);
        router.push(getSafeNextPath(locale));
      }
    } catch (err: any) {
      if (err.response?.status === 503) {
        setIsHidden(true);
      }
      const msg = err.response?.data?.message || "Google sign-in failed. Please try again.";
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId || typeof window === "undefined") return;

    const initializeGsi = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              handleCredentialToken(response.credential);
            }
          },
        });
        if (googleBtnContainerRef.current) {
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: googleBtnContainerRef.current.offsetWidth || 360,
          });
        }
        setGsiReady(true);
      } catch (e) {
        console.error("Failed to initialize Google Identity Services", e);
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", initializeGsi);
      return () => existingScript.removeEventListener("load", initializeGsi);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGsi;
    document.head.appendChild(script);
  }, [clientId]);

  const handleFallbackClick = async () => {
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // Probe backend when client ID is not configured; hide button on 503 per portal.html spec
    setIsLoading(true);
    if (onError) onError("");
    try {
      await api.post(`${PUBLIC_API_PREFIX}/auth/google`, { idToken: "probe" });
    } catch (err: any) {
      if (err.response?.status === 503) {
        setIsHidden(true);
      }
      if (onError) {
        onError(err.response?.data?.message || "Google sign-in is not set up yet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isHidden) return null;

  return (
    <div className="w-full">
      {clientId && (
        <div
          ref={googleBtnContainerRef}
          className={gsiReady ? "w-full flex justify-center" : "hidden"}
        />
      )}

      {(!clientId || !gsiReady) && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={isLoading}
          className="w-full py-3.5 bg-white dark:bg-[#102418] border border-gray-200 dark:border-[#1A3626] hover:bg-gray-50 dark:hover:bg-[#163321] disabled:opacity-70 text-gray-800 dark:text-white rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span>{label}</span>
        </button>
      )}
    </div>
  );
}

