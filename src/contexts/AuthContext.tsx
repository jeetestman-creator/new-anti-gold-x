import * as React from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';
import { toast } from 'sonner';
import { useAnalytics } from '@/lib/analytics';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string, 
    password: string, 
    referralCode?: string,
    additionalData?: { full_name?: string; phone?: string; country?: string }
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: Error | null }>;
  resendOTP: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { trackSignIn, trackSignUp } = useAnalytics();

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  React.useEffect(() => {
    supabase
      .auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await getProfile(session.user.id);
          setProfile(profileData);
        }
      })
      .catch((error: unknown) => {
        // FIX #1: Proper error handling without @ts-ignore
        const message = error instanceof Error ? error.message : 'Failed to get user session';
        toast.error(`Failed to get user session: ${message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    // In this function, do NOT use any await calls. Use `.then()` instead to avoid deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const method = session.user.app_metadata.provider === 'google' ? 'google' : 'email';
        trackSignIn(method);
      }

      if (session?.user) {
        // Use a small delay to ensure trigger has finished and profile is visible
        const checkReferral = (retryCount = 0) => {
          getProfile(session.user.id).then((p) => {
            if (p) {
              setProfile(p);
              
              // Handle referral if user is new and was just created
              const ref = sessionStorage.getItem('referral_code');
              if (!p.referrer_id && ref) {
                const userCreated = new Date(session.user.created_at).getTime();
                const now = new Date().getTime();
                // If user was created in the last 2 minutes, try to attribute referral
                if (now - userCreated < 120000) {
                  supabase.from('profiles').select('id').eq('referral_code', ref).maybeSingle().then(({ data: referrer }) => {
                    // FIX #2: Proper type checking instead of unsafe casts
                    if (referrer && 'id' in referrer) {
                      supabase.from('profiles').update({ referrer_id: (referrer as any).id }).eq('id', session.user.id).then(() => {
                        console.log('Referral attributed successfully');
                        sessionStorage.removeItem('referral_code');
                        refreshProfile();
                      });
                    }
                  });
                }
              }
            } else if (retryCount < 3) {
              // Retry fetching profile if not found yet (replication/trigger lag)
              setTimeout(() => checkReferral(retryCount + 1), 1000);
            }
          });
        };
        
        checkReferral();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [trackSignIn, trackSignUp]); // FIX #3: Added missing dependencies

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
          throw new Error('Email login is not currently enabled for this platform. Please contact support.');
        }
        throw error;
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    referralCode?: string,
    additionalData?: { full_name?: string; phone?: string; country?: string }
  ) => {
    try {
      // Use provided code or check session storage
      const finalReferralCode = referralCode || sessionStorage.getItem('referral_code');

      // Check if referral code is valid
      if (finalReferralCode) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', finalReferralCode)
          .maybeSingle();

        if (!referrer) {
          console.warn('Invalid referral code provided, proceeding without referrer');
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            referral_code: finalReferralCode || null,
            full_name: additionalData?.full_name,
            phone: additionalData?.phone,
            country: additionalData?.country
          }
        }
      });

      if (error) {
        if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
          throw new Error('Email registration is not currently enabled for this platform. Please contact support.');
        }
        throw error;
      }

      // Update profile with additional data if user was created
      // This is now redundant as handle_new_user trigger handles metadata, 
      // but we keep it as a fallback, ensuring it doesn't block the return.
      if (data.user && additionalData) {
        trackSignUp('email');
        supabase
          .from('profiles')
          .update({
            full_name: additionalData.full_name,
            phone: additionalData.phone,
            country: additionalData.country
          })
          .eq('id', data.user.id)
          .then(({ error: updateError }) => {
            if (updateError) console.warn('Secondary profile update failed (likely RLS), but user was created:', updateError);
          });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        // Provide more helpful error for disabled providers
        if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
          // FIX #4: Complete the error message
          throw new Error('Google Sign-In is not currently enabled. Please enable it in the Supabase Dashboard.');
        }
        throw error;
      }
      if (data?.url) {
        window.location.assign(data.url);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyOTP = async (email: string, token: string, purpose: 'signup' | 'login' | 'password_reset' = 'signup') => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otp: token, purpose }
      });

      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resendOTP = async (email: string, purpose: 'signup' | 'login' | 'password_reset' = 'signup', userData?: unknown) => {
    try {
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email, purpose, userData }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, verifyOTP, resendOTP, resetPassword, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
