import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, Session, User, WeakPassword } from '@supabase/supabase-js';
import { supabase } from '../Utils/supabase';

interface UserSessionContextType {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>
  login: (email: string, password: string) => Promise<{ data: { user: User; session: Session; weakPassword?: WeakPassword | undefined; } | { user: null; session: null; weakPassword?: null | undefined; }; error: AuthError | null; }>;
  logout: () => Promise<AuthError | null>
}

interface UserSessionProviderProps {
  children: ReactNode;
}

const UserSessionContext = createContext<UserSessionContextType | null>(null);

export const UserSessionProvider = ({ children }: UserSessionProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
      }
    };

    fetchUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSession(data.session);
    return { data, error }
  };

  const logout = async () => {
    setSession(null);
    const { error } = await supabase.auth.signOut();
    return error;
  };

  return (
    <UserSessionContext.Provider value={{ session, setSession, login, logout }}>
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
