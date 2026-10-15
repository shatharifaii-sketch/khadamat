import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AppLoading from "@/components/AppLoading";
import { toast } from "sonner";
import { AuthResult, CODE_ALIASES, FIELD_FOR_CODE, FieldErrors } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string | null,
    password: string,
    fullName: string,
    passwordConfirm: string,
    phone: { countryCode: string; number: string } | null,
    method: string,
  ) => Promise<{
    error: unknown;
    data: { user: User; session: Session } | { user: null; session: null };
  }>;
  signIn: (
    email: string | null,
    password: string,
    phone: { countryCode: string; number: string } | null,
    method: string,
  ) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  verifyOtp: (
    email: string,
    token: string,
  ) => Promise<{ error?: unknown; data?: unknown }>;
  resendOtp: (phone: string) => Promise<{ error?: unknown; success?: boolean }>;
  verifyPhoneOtp: (
    phone: { countryCode: string; number: string },
    token: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: unknown; data?: User }>;
  tryPhoneSignIn: () => Promise<void>;
}

type ExtendedUser = User & {
  is_service_provider?: boolean | null;
};

function toFieldErrors(code: string): FieldErrors {
  const field = FIELD_FOR_CODE[code];
  return field ? { [field]: code } : { formError: code }
}

function extractCode(err: unknown): string | undefined {
  if (typeof err == "string") return err;
  if (err && typeof err == "object" && "code" in err && typeof (err as any).code == "string") {
    return (err as any).code;
  }
  return undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lang = localStorage.getItem("language") || "en";

  async function invokeFunction<T = unknown>(
    name: string,
    body: Record<string, unknown>,
  ): Promise<AuthResult<T>> {
    const { data, error } = await supabase.functions.invoke(name, { body });

    let code: string | undefined;

    if (error) {
      code = "server_error";
      if (error instanceof FunctionsHttpError) {
        try {
          const payload = await error.context.json();
          code = extractCode(payload?.error) ?? code;
        } catch {
          code = "server_error"
        }
      } else {
        code = "network_error";
      }
    } else if (!data?.success) {
      code = extractCode(data?.error) ?? "unknown";
    }

    if (code) {
      code = CODE_ALIASES[code] ?? code;
      return { data: null, error: toFieldErrors(code) };
    }

    return { data: data as T, error: null }
  }

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }
      console.log("Initial session:", session?.user?.id);
      setSession(session);
      // const [, payload] = session!.access_token.split('.');
      // const claims = JSON.parse(atob(payload));
      // console.log({
      //   alg: JSON.parse(atob(session!.access_token.split('.')[0])).alg,
      //   kid: claims.kid,
      //   issuer: claims.iss,
      //   expiresAt: claims.exp
      // })
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string | null,
    password: string,
    fullName: string,
    passwordConfirm: string,
    phone: { countryCode: string; number: string } | null,
    method: string = "email",
  ): Promise<AuthResult> => {
    if (method == "phone") {
      if (!phone) return { data: null, error: { phoneError: "required_fields_error" } };

      const readyPhone = `${phone.countryCode}${phone.number}`.replace(/[^\d+]/g, "");

      return invokeFunction("register-with-whatsapp-otp", {
        phone: readyPhone,
        name: fullName,
        password,
        passwordConfirm
      });
    }

    if (method == "email") {
      return invokeFunction("register-user", {
        email,
        password,
        name: fullName,
        passwordConfirm,
      })
    }

    return { data: null, error: { formError: "unknown_error" } };
  };

  const signIn = async (
    email: string | null,
    password: string,
    phone: {
      countryCode: string;
      number: string;
    } | null,
    method: string = "email",
  ) => {
    if (method == "phone") {
      const { data, error } = await supabase.functions.invoke(
        "handle-phone-otp",
        {
          body: JSON.stringify({
            phone: `${phone.countryCode}${phone.number}`,
            isLogin: true,
          }),
        },
      );

      if (error) {
        console.error("Sign in error:", error);
        return error;
      }

      return data;
    }
    console.log("Attempting sign in for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
    } else {
      console.log("Sign in successful", userId);
      const { error } = await supabase.from("user_activity").insert({
        activity_type: "login",
        user_id: data.user?.id,
        details: { page: "home" },
        method: "email",
      });

      if (error) {
        console.error("Error tracking login:", error);
        throw new Error("Error tracking login");
      }
    }

    return { data, error };
  };

  const userId: string | undefined = session?.user?.id;

  const signOut = async () => {
    console.log("Signing out...");

    // Log activity **before** signing out
    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        activity_type: "logout",
        user_id: userId,
        details: { page: "home" },
      });

    if (activityError) {
      console.error("Error tracking logout:", activityError);
      throw new Error("Error tracking logout");
    }

    // Now sign out
    await supabase.auth.signOut().finally(() => {
      setUser(null);
      setSession(null);
      setLoading(false);
    });
    console.log("Sign out successful");
  };

  const tryPhoneSignIn = async () => {
    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        activity_type: "try_phone_login",
        user_id: null,
        details: { page: "auth" },
      });

    if (activityError) {
      console.error("Error tracking user tries:", activityError);
      throw new Error("Error tracking user tries");
    }

    return;
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      return { error };
    }

    return { data: "OTP verified successfully" };
  };

  const resendOtp = async (phone: string) => {
    const { data, error } = await supabase.functions.invoke('handle-phone-otp', {
        body: JSON.stringify({
          phone,
          lang
        })
      })

      if (error) {
        console.error('Sign in error:', error);
        return error;
      }

      return {
        success: data.success,
        error: data.error,
      };
  };

  const verifyPhoneOtp = async (
    phone: { countryCode: string; number: string },
    token: string,
    password: string,
    fullName: string
  ) => {
    const { data, error } = await supabase.functions.invoke(
      "verify-phone-whatsapp-otp", {
      body: JSON.stringify({ phone, token, fullName, password })
    }
    );

    if (error) {
      console.error('Error verifying OTP:', error);
      return { error };
    }

    const { data: user, error: userError } = await supabase.auth.signInWithPassword({
      phone: `+${phone.countryCode}${phone.number}`,
      password
    })

    // const { data, error: userError } = await supabase.auth.verifyOtp({
    //   phone: `+${phone.countryCode}${phone.number}`,
    //   token,
    //   type: "sms",
    // });

    if (userError) {
      console.error("Sign in error:", userError);

      throw userError;
    } else {
      console.log("Sign in successful", userId);
      const { error } = await supabase.from("user_activity").insert({
        activity_type: "login",
        user_id: data.user?.id,
        details: { page: "home" },
        method: "email",
      });

      if (error) {
        console.error("Error tracking login:", error);
        throw new Error("Error tracking login");
      }
    }

    return {
      error: null,
      data,
    };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    verifyOtp,
    verifyPhoneOtp,
    resendOtp,
    tryPhoneSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <AppLoading /> : <>{children}</>}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://khedemtak.com/", //'http://localhost:8080/',
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        return { error };
      }

      return { data };
    } catch (err) {
      console.error("Google sign-in error:", err);
      return { error: err };
    }
  };

  return { ...context, signInWithGoogle };
};
