import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Profile, UserRole } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  role: UserRole | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const setData = async () => {
      // Check for demo mode in localStorage
      const demoRole = localStorage.getItem('demo_role');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else if (demoRole) {
        // Mock user for demo
        const demoId = '00000000-0000-0000-0000-000000000001';
        setUser({ id: demoId, email: 'demo@mediconnect.pro' } as any);
        setProfile({
          id: demoId,
          full_name: 'Dra. Hilda Martínez',
          role: demoRole as UserRole,
          cedula: '12345678',
          especialidad: 'Medicina General'
        });
      }
      setLoading(false);
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        const demoRole = localStorage.getItem('demo_role');
        if (demoRole) {
          const demoId = '00000000-0000-0000-0000-000000000001';
          setUser({ id: demoId, email: 'demo@mediconnect.pro' } as any);
          setProfile({
            id: demoId,
            full_name: 'Dra. Hilda Martínez',
            role: demoRole as UserRole,
            cedula: '12345678',
            especialidad: 'Medicina General'
          });
        } else {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('demo_role');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, role: profile?.role ?? null, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
