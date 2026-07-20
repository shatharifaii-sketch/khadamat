
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AppLoading from '@/components/AppLoading';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string | null, password: string, fullName: string, passwordConfirm: string, phone: { countryCode: string; number: string } | null, method: string) => Promise<{ error: unknown, data: { user: User, session: Session } | { user: null, session: null } }>;
  signIn: (email: string | null, password: string, phone: { countryCode: string; number: string } | null, method: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: unknown, data?: unknown }>;
  verifyPhoneOtp: (phone: { countryCode: string; number: string }, token: string, password: string) => Promise<{ error?: unknown, data?: User }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lang = localStorage.getItem("language") || "en";

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string | null, password: string, fullName: string, passwordConfirm: string, phone: { countryCode: string; number: string } | null, method: string) => {
    if (method == "phone") {
      const { data, error } = await supabase.functions.invoke('register-with-whatsapp-otp', {
        body: JSON.stringify({
          name: fullName,
          lang,
          phone: `+${phone.countryCode}${phone.number}`,
          password,
          passwordConfirm
        })
      });

      if (error) {
        console.error('Sign up error:', error);

        return error
      }

      if (!data.success) {
        return data.error;
      }

      return data.success;
    } else if (method == "email") {
      console.log('Attempting sign up for:', email);
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          passwordConfirm
        })
      })

      if (!data.success) {
        const err = data.error;

        if (err.code === 'email_exists') {
          toast.error('البريد الإلكتروني مستخدم بالفعل');
        }

        return { data: null, error: err };
      }

      return { data, error };
    }
  };

  const signIn = async (email: string | null, password: string, phone: {
    countryCode: string;
    number: string;
  } | null, method: string) => {
    if (method == "phone") {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: `+${phone.countryCode}${phone.number}`,
        options: {
          channel: 'sms'
        }
      });

      if (error) {
        console.error('Sign in error:', error);
        return error;
      }

      return data;
    }
    console.log('Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
    } else {
      console.log('Sign in successful', userId);
      const { error } = await supabase
        .from('user_activity')
        .insert({
          activity_type: 'login',
          user_id: data.user?.id,
          details: { "page": "home" },
          method: "email"
        });

      if (error) {
        console.error('Error tracking login:', error);
        throw new Error('Error tracking login');
      }

    }

    return { data, error };
  };

  const userId: string | undefined = session?.user?.id;

  const signOut = async () => {
    console.log('Signing out...');

    // Log activity **before** signing out
    const { error: activityError } = await supabase
      .from('user_activity')
      .insert({
        activity_type: 'logout',
        user_id: userId,
        details: { page: "home" }
      });

    if (activityError) {
      console.error('Error tracking logout:', activityError);
      throw new Error('Error tracking logout');
    }

    // Now sign out
    await supabase.auth.signOut().finally(() => {
      setUser(null);
      setSession(null);
      setLoading(false);

    });
    console.log('Sign out successful');
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return { error };
    }

    return { data: 'OTP verified successfully' };
  }

  const resendOtp = async (phone: string) => {
    return { data: 'OTP resent successfully' };
  }

  const verifyPhoneOtp = async (phone: { countryCode: string; number: string }, token: string, password: string) => {
    const { data, error } = await supabase.functions.invoke(
      "verify-phone-whatsapp-otp", {
      body: JSON.stringify({ phone, token })
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

    if (userError) {
      console.error('Sign in error:', userError);

      throw error;
    } else {
      console.log('Sign in successful', userId);
      const { error } = await supabase
        .from('user_activity')
        .insert({
          activity_type: 'login',
          user_id: data.user?.id,
          details: { "page": "home" },
          method: "email"
        });

      if (error) {
        console.error('Error tracking login:', error);
        throw new Error('Error tracking login');
      }

    }

    return {
      error: null,
      user
    };
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    verifyOtp,
    verifyPhoneOtp
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <AppLoading />
      ) : (
        <>{children}</>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://khedemtak.com/', //'http://localhost:8080/',
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        return { error };
      }

      return { data };
    } catch (err) {
      console.error('Google sign-in error:', err);
      return { error: err }
    }
  }

  return { ...context, signInWithGoogle };
};
