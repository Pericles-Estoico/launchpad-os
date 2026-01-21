import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import {
  clearLocalStorage,
  getLocalProfile,
  getLocalWorkspaceId,
  isLocalMode,
  setLocalProfile,
} from '@/lib/localMode';

type AppRole = Database['public']['Enums']['app_role'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  role: AppRole | null;
  workspaceId: string | null;
  isLoading: boolean;
  setWorkspaceId: (workspaceId: string | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setLocalSessionState = (nextProfile?: AuthContextType['profile']) => {
    const fallbackProfile = nextProfile ?? {
      id: 'local-user',
      name: 'Usuário Local',
      email: 'local@launchpad.os',
      avatar_url: null,
    };

    const localUser = {
      id: fallbackProfile.id,
      email: fallbackProfile.email,
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { name: fallbackProfile.name },
    } as User;

    const localSession = {
      access_token: 'local-access-token',
      refresh_token: 'local-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: localUser,
    } as Session;

    setSession(localSession);
    setUser(localUser);
    setProfile(fallbackProfile);
    setRole('admin');
    setWorkspaceId(getLocalWorkspaceId());
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .eq('user_id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleData) {
        setRole(roleData.role);
      }

      // Fetch workspace membership
      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .single();
      
      if (memberData) {
        setWorkspaceId(memberData.workspace_id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (isLocalMode) {
      const storedProfile = getLocalProfile();
      if (storedProfile) {
        setLocalSessionState(storedProfile);
      } else {
        const defaultProfile = {
          id: 'local-user',
          name: 'Usuário Local',
          email: 'local@launchpad.os',
          avatar_url: null,
        };
        setLocalProfile(defaultProfile);
        setLocalSessionState(defaultProfile);
      }
      setIsLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid blocking the callback
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setRole(null);
          setWorkspaceId(null);
        }
        setIsLoading(false);
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isLocalMode) {
      const storedProfile = getLocalProfile();
      const nextProfile = storedProfile ?? {
        id: 'local-user',
        name: email.split('@')[0] || 'Usuário Local',
        email,
        avatar_url: null,
      };
      setLocalProfile(nextProfile);
      setLocalSessionState(nextProfile);
      setIsLoading(false);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (isLocalMode) {
      const nextProfile = {
        id: 'local-user',
        name,
        email,
        avatar_url: null,
      };
      setLocalProfile(nextProfile);
      setLocalSessionState(nextProfile);
      setIsLoading(false);
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (isLocalMode) {
      clearLocalStorage();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setWorkspaceId(null);
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setWorkspaceId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        workspaceId,
        setWorkspaceId,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
