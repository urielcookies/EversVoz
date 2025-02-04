import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { isNull } from 'lodash';
import { AuthError, PostgrestError, Session, User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../Utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adapty } from 'react-native-adapty';

// Define the interface for the context type
interface UserSessionContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
  loading: boolean;
  emailCheck: (email: string) => Promise<{ data: { id: string} | null }>
  archivedUserCheck: (email: string) => Promise<{ error: PostgrestError | null; data?: ArchivedUser }>
  createUserAccount: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  verifyOTPUser: (email: string, token: string, archivedUser: ArchivedUser) => Promise<{ error: AuthError | PostgrestError | null }>;
  deleteUserAccount: () => Promise<{ error: AuthError | PostgrestError | null } | null>;
  handleSendOtp: (email: string) => Promise<{ error: AuthError } | { error: null }>
}

// Props for the UserSessionProvider
interface UserSessionProviderProps {
  children: ReactNode;
}

const UserSessionContext = createContext<UserSessionContextType | null>(null);

export const UserSessionProvider = ({ children }: UserSessionProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          setUser(user);
          if (user?.email) {
            adapty.identify(user.email);
          }
        }
        setSession(session);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      return { error };
    }

    setSession(data.session);
    setUser(data.user);
    if (data.user.email) {
      adapty.identify(data.user.email);
    }
    return { error: null };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      return { error };
    }

    setSession(null);
    setUser(null);
    await adapty.logout();
    return { error: null };
  };

  const emailCheck = async (email: string) => {
    const { data } = await supabase
      .from('PhoneticUsage')
      .select('id')
      .eq('email', email)
      .single();
    return { data };
  };

  const createUserAccount = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Create user error:', error.message);
      return { error };
    }
    return { error: null };
  };

  const verifyOTPUser = async (email: string, token: string, archivedUser: ArchivedUser) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) {
      console.error('Error verifying OTP:', error.message);
      return { error };
    }

    if (data.user) {
      if (archivedUser) {
        const { error: insertError } = await supabase.from('PhoneticUsage').insert([{
          user_id: data.user.id,
          tier_type: archivedUser.tier_type,
          email: archivedUser.email,
          monthly_request_count: archivedUser.monthly_request_count,
          total_request_count: archivedUser.total_request_count,
          reset_monthly_requests_date: archivedUser.reset_monthly_requests_date,
          updated_at: new Date(),
          created_at: new Date(),
        }]);

        if (insertError) {
          console.error(`Error inserting into PhoneticUsage: ${insertError.message}`);
          return { error: insertError };
        }

        const { error: deleteError } = await supabaseAdmin
          .from('ArchivedUsers')
          .delete()
          .eq('email', archivedUser.email);

        if (deleteError) {
          console.error('Error deleting user data:', deleteError.message);
          return { error: deleteError };
        }
      } else {
        const { error: insertError } = await supabase.from('PhoneticUsage')
          .insert([{
            user_id: data.user.id,
            email: data.user.email,
            updated_at: new Date(),
            created_at: new Date()
          }]);
        if (insertError) {
          console.error(`Error inserting into PhoneticUsage: ${insertError.message}`);
          return { error: insertError };
        }
      }
      setSession(data.session);
      setUser(data.user);
      if (data.user.email) {
        adapty.identify(data.user.email);
      }
      return { error: null };
    }
    return { error: null };
  };

  const deleteUserAccount = async () => {
    if (!isNull(user)) {
      try {
        await archiveUser();
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (error) {
          console.error('Error deleting user:', error.message);
          return { error };
        }

        const { error: deleteError } = await supabaseAdmin
          .from('PhoneticUsage')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting user data:', deleteError.message);
          return { error: deleteError };
        }

        await logout();
        await AsyncStorage.clear();
        return { error: null };
      } catch (error) {
        console.error('Error deleting account:', error);
        return null;
      }
    }
    return null;
  };

  const handleSendOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      email,
      type: 'signup',
    });

    if (error) {
      console.error('Logout error:', error.message);
      return { error };
    }
    return { error: null };
  };

  const archiveUser = async () => {
    if (isNull(user)) return
    const { data, error } = await supabase
      .from('PhoneticUsage')
      .select('tier_type, monthly_request_count, total_request_count, reset_monthly_requests_date')
      .eq('user_id', user.id)
      .single();

    const { email, phone } = user;

    if (email && data) {
      const archivedUserValues: ArchivedUser = {
        email,
        phone: phone || null,
        tier_type: data.tier_type,
        monthly_request_count: data.monthly_request_count,
        total_request_count: data.total_request_count,
        reset_monthly_requests_date: data.reset_monthly_requests_date,
        created_at: new Date(),
      };
      const { error: insertError } = await supabase.from('ArchivedUsers').insert([archivedUserValues]);
      if (insertError) {
        console.error(`Error inserting into ArchivedUsers: ${insertError.message}`);
        return { error: insertError };
      }
    }

    if (error) {
      console.error('Logout error:', error.message);
      return { error };
    }

    return { error: null };
  };

  const archivedUserCheck = async (email: string) => {
    const { data, error } = await supabase
      .from('ArchivedUsers')
      .select('*')
      .eq('email', email)
      .single();

    return { data: data as ArchivedUser, error };
  };

  const values = {
    user,
    session,
    login,
    logout,
    loading,
    emailCheck,
    createUserAccount,
    verifyOTPUser,
    deleteUserAccount,
    handleSendOtp,
    archivedUserCheck,
  };

  return (
    <UserSessionContext.Provider value={values}>
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
};

export interface ArchivedUser {
  // id: number;
  created_at: Date;
  email: string;
  monthly_request_count: number;
  phone: string | null;
  reset_monthly_requests_date: Date | null;
  tier_type: string;
  total_request_count: number;
}