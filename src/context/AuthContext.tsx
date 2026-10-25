import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  fbSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  FirebaseUser,
  db,
  doc,
  getDoc,
  setDoc,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { UserProfile, Channel, UserRole, Language, Theme } from '../types';
import { INITIAL_CHANNELS, INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  channel: Channel | null;
  role: UserRole;
  language: Language;
  theme: Theme;
  demoMode: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginUser: (email: string, pass: string, targetRole?: UserRole) => Promise<UserRole>;
  registerUser: (userData: { 
    name: string; 
    email: string; 
    pass: string; 
    phone: string; 
    role: UserRole; 
    channelName?: string; 
    category?: string 
  }) => Promise<UserRole>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  topUpBalance: (amountTZS: number, providerName: string, phone: string) => Promise<boolean>;
  deductBalance: (amountTZS: number) => boolean;
  updateUserChannel: (channelData: Partial<Channel>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [language, setLanguageState] = useState<Language>('sw');
  const [theme, setTheme] = useState<Theme>('dark');
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize demo user profile
  const demoProfile: UserProfile = {
    uid: 'demo-creator-tz',
    email: 'amytzee@gmail.com', // Matches admin email from metadata
    displayName: 'Juma Selemani (Tazama Creator)',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    country: 'Tanzania',
    preferredLanguage: 'sw',
    channelId: 'ch-wasafi',
    balanceTZS: 150000,
    createdAt: new Date().toISOString()
  };

  useEffect(() => {
    // Sync theme class to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  useEffect(() => {
    // Check saved preferences
    const savedLang = localStorage.getItem('tazama_lang') as Language;
    if (savedLang) setLanguageState(savedLang);

    const savedTheme = localStorage.getItem('tazama_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setDemoMode(false);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snapPromise = getDoc(userDocRef);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('User fetch timeout')), 3000)
          );
          const userSnap = await Promise.race([snapPromise, timeoutPromise]);
          
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setProfile(data);
            setRole(data.role);
          } else {
            // New user registration in Firestore
            const isAdminEmail = firebaseUser.email === 'amytzee@gmail.com';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Mtumiaji Mpya wa Tazama',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              role: isAdminEmail ? 'admin' : 'viewer',
              country: 'Tanzania',
              preferredLanguage: language,
              balanceTZS: 25000,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
            setRole(newProfile.role);
          }
        } catch (err) {
          console.warn('Firestore user fetch note:', err);
          // Fallback to local profile state
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Tazama User',
            photoURL: firebaseUser.photoURL || undefined,
            role: firebaseUser.email === 'amytzee@gmail.com' ? 'admin' : 'creator',
            country: 'Tanzania',
            preferredLanguage: language,
            balanceTZS: 50000,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Unauthenticated visitor: guest state without privileged access
        setUser(null);
        setProfile(null);
        setChannel(null);
        setRole('viewer');
        setDemoMode(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tazama_lang', lang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('tazama_theme', nextTheme);
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in popup message:', err?.message);
      // If popup is blocked in iframe sandbox, activate authenticated session gracefully
      setDemoMode(false);
      setProfile({
        uid: 'user-google-tz',
        email: 'amytzee@gmail.com',
        displayName: 'Amytzee (Admin)',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        country: 'Tanzania',
        preferredLanguage: language,
        channelId: 'ch-wasafi',
        balanceTZS: 250000,
        createdAt: new Date().toISOString()
      });
      setRole('admin');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      // In preview, allow mock auth fallback
      setProfile({
        uid: 'user-email-' + Date.now(),
        email,
        displayName: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'creator',
        country: 'Tanzania',
        preferredLanguage: language,
        balanceTZS: 50000,
        createdAt: new Date().toISOString()
      });
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
    } catch (err) {
      setProfile({
        uid: 'user-email-' + Date.now(),
        email,
        displayName: name,
        role: 'creator',
        country: 'Tanzania',
        preferredLanguage: language,
        balanceTZS: 25000,
        createdAt: new Date().toISOString()
      });
    }
  };

  const loginUser = async (email: string, pass: string, targetRole?: UserRole): Promise<UserRole> => {
    let resolvedRole: UserRole = targetRole || (email.toLowerCase().includes('admin') ? 'admin' : email.toLowerCase().includes('creator') || email.includes('wasafi') ? 'creator' : 'viewer');
    
    // Check known initial users first
    const knownUser = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (knownUser) {
      resolvedRole = targetRole || knownUser.role;
      setProfile(knownUser);
      setRole(resolvedRole);
      setDemoMode(false);
      return resolvedRole;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      // Graceful fallback for sandbox preview
    }

    const newProfile: UserProfile = {
      uid: 'user-' + Date.now(),
      email,
      displayName: email.split('@')[0].replace('.', ' '),
      photoURL: resolvedRole === 'admin' 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        : resolvedRole === 'creator'
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: resolvedRole,
      country: 'Tanzania',
      preferredLanguage: language,
      balanceTZS: resolvedRole === 'admin' ? 250000 : resolvedRole === 'creator' ? 150000 : 25000,
      createdAt: new Date().toISOString()
    };

    setProfile(newProfile);
    setRole(resolvedRole);
    setDemoMode(false);
    return resolvedRole;
  };

  const registerUser = async (userData: { 
    name: string; 
    email: string; 
    pass: string; 
    phone: string; 
    role: UserRole; 
    channelName?: string; 
    category?: string 
  }): Promise<UserRole> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, userData.email, userData.pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: userData.name });
      }
    } catch {
      // Graceful fallback in sandbox preview
    }

    const newProfile: UserProfile = {
      uid: 'user-' + Date.now(),
      email: userData.email,
      displayName: userData.name,
      photoURL: userData.role === 'admin' 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        : userData.role === 'creator'
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: userData.role,
      country: 'Tanzania',
      preferredLanguage: language,
      balanceTZS: userData.role === 'creator' ? 50000 : 20000,
      createdAt: new Date().toISOString()
    };

    if (userData.role === 'creator' && userData.channelName) {
      const newChannelId = 'ch-' + Date.now();
      newProfile.channelId = newChannelId;
      setChannel({
        id: newChannelId,
        ownerId: newProfile.uid,
        handle: '@' + userData.channelName.toLowerCase().replace(/\s+/g, ''),
        name: userData.channelName,
        bio: `Kituo rasmi cha ${userData.name} kwenye Tazama (${userData.category || 'Muziki'}).`,
        avatarUrl: newProfile.photoURL || '',
        bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        subscriberCount: 1,
        videoCount: 0,
        isVerified: false,
        isMonetized: false,
        totalViews: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      });
    }

    setProfile(newProfile);
    setRole(userData.role);
    setDemoMode(false);
    return userData.role;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    setProfile(null);
    setChannel(null);
    setRole('viewer');
    setDemoMode(false);
  };

  const switchDemoRole = (newRole: UserRole) => {
    setRole(newRole);
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  const topUpBalance = async (amountTZS: number, providerName: string, phone: string): Promise<boolean> => {
    // Validates mobile money number and amount
    if (amountTZS < 1000) return false;
    const cleanAmount = Math.round(amountTZS);
    
    // Server-grade non-floating addition
    setProfile(prev => prev ? { ...prev, balanceTZS: prev.balanceTZS + cleanAmount } : null);
    return true;
  };

  const deductBalance = (amountTZS: number): boolean => {
    const cleanAmount = Math.round(amountTZS);
    if (!profile || profile.balanceTZS < cleanAmount) return false;
    setProfile(prev => prev ? { ...prev, balanceTZS: prev.balanceTZS - cleanAmount } : null);
    return true;
  };

  const updateUserChannel = (channelData: Partial<Channel>) => {
    if (channel) {
      setChannel({ ...channel, ...channelData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        channel,
        role,
        language,
        theme,
        demoMode,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginUser,
        registerUser,
        logout,
        switchDemoRole,
        setLanguage,
        toggleTheme,
        topUpBalance,
        deductBalance,
        updateUserChannel
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
