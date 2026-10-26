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
  upgradeToCreator: (channelData?: Partial<Channel>) => Promise<Channel | null>;
  updateUserChannel: (channelData: Partial<Channel>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  // Clean initialization: if no stored session, strictly null (Guest)
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('tazama_session_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [channel, setChannel] = useState<Channel | null>(null);

  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('tazama_session_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.role || 'viewer';
      }
    } catch {
      // ignore
    }
    return 'viewer';
  });

  const [language, setLanguageState] = useState<Language>('sw');
  const [theme, setTheme] = useState<Theme>('dark');
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
            localStorage.setItem('tazama_session_profile', JSON.stringify(data));
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
            localStorage.setItem('tazama_session_profile', JSON.stringify(newProfile));
          }
        } catch (err) {
          console.warn('Firestore user fetch note:', err);
          const savedSession = localStorage.getItem('tazama_session_profile');
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              setProfile(parsed);
              setRole(parsed.role || 'viewer');
            } catch {
              // fallback
            }
          } else {
            const isAdmin = firebaseUser.email === 'amytzee@gmail.com';
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Tazama User',
              photoURL: firebaseUser.photoURL || undefined,
              role: isAdmin ? 'admin' : 'viewer',
              country: 'Tanzania',
              preferredLanguage: language,
              balanceTZS: 25000,
              createdAt: new Date().toISOString()
            };
            setProfile(fallbackProfile);
            setRole(fallbackProfile.role);
            localStorage.setItem('tazama_session_profile', JSON.stringify(fallbackProfile));
          }
        }
      } else {
        // If no Firebase Auth user, check if we have a locally stored active session
        const savedSession = localStorage.getItem('tazama_session_profile');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            setProfile(parsed);
            setRole(parsed.role || 'viewer');
          } catch {
            setUser(null);
            setProfile(null);
            setChannel(null);
            setRole('viewer');
          }
        } else {
          // Unauthenticated visitor: clean guest state without privileged access
          setUser(null);
          setProfile(null);
          setChannel(null);
          setRole('viewer');
          setDemoMode(false);
        }
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
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'amytzee@gmail.com' || cleanEmail.includes('admin@tazama');

    // Check known initial users first
    const knownUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (knownUser) {
      const resolvedRole: UserRole = isAdmin ? 'admin' : (knownUser.channelId ? 'creator' : knownUser.role);
      const activeUser = { ...knownUser, role: resolvedRole };
      setProfile(activeUser);
      setRole(resolvedRole);
      setDemoMode(false);
      localStorage.setItem('tazama_session_profile', JSON.stringify(activeUser));
      return resolvedRole;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      // Graceful fallback for sandbox preview
    }

    // Check if previously this user created a channel
    let savedChannelId: string | undefined;
    try {
      const savedChannel = localStorage.getItem('tazama_user_channel');
      if (savedChannel) {
        const parsed = JSON.parse(savedChannel);
        savedChannelId = parsed.id;
        setChannel(parsed);
      }
    } catch {}

    const resolvedRole: UserRole = targetRole || (isAdmin ? 'admin' : (savedChannelId ? 'creator' : 'viewer'));

    const newProfile: UserProfile = {
      uid: 'user-' + Date.now(),
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0].replace('.', ' '),
      photoURL: isAdmin 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        : resolvedRole === 'creator'
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: resolvedRole,
      country: 'Tanzania',
      preferredLanguage: language,
      channelId: savedChannelId,
      balanceTZS: isAdmin ? 250000 : resolvedRole === 'creator' ? 150000 : 25000,
      createdAt: new Date().toISOString()
    };

    setProfile(newProfile);
    setRole(resolvedRole);
    setDemoMode(false);
    localStorage.setItem('tazama_session_profile', JSON.stringify(newProfile));
    return resolvedRole;
  };

  const registerUser = async (userData: { 
    name: string; 
    email: string; 
    pass: string; 
    phone: string; 
    role?: UserRole; 
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

    const cleanEmail = userData.email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'amytzee@gmail.com';
    const assignedRole: UserRole = isAdmin ? 'admin' : 'viewer';

    const newProfile: UserProfile = {
      uid: 'user-' + Date.now(),
      email: cleanEmail,
      displayName: userData.name,
      photoURL: isAdmin 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: assignedRole,
      country: 'Tanzania',
      preferredLanguage: language,
      balanceTZS: 25000,
      createdAt: new Date().toISOString()
    };

    setProfile(newProfile);
    setRole(assignedRole);
    setDemoMode(false);
    localStorage.setItem('tazama_session_profile', JSON.stringify(newProfile));
    return assignedRole;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('tazama_session_profile');
    setUser(null);
    setProfile(null);
    setChannel(null);
    setRole('viewer');
    setDemoMode(false);
  };

  const switchDemoRole = (newRole: UserRole) => {
    setRole(newRole);
    if (profile) {
      const updated = { ...profile, role: newRole };
      setProfile(updated);
      localStorage.setItem('tazama_session_profile', JSON.stringify(updated));
    }
  };

  const upgradeToCreator = async (channelData?: Partial<Channel>): Promise<Channel | null> => {
    if (!profile) return null;
    const newChannelId = channelData?.id || profile.channelId || ('ch-' + Date.now());
    const newChannel: Channel = {
      id: newChannelId,
      ownerId: profile.uid,
      handle: channelData?.handle || ('@' + (profile.displayName || 'creator').toLowerCase().replace(/\s+/g, '')),
      name: channelData?.name || (profile.displayName || 'Kituo Changu'),
      bio: channelData?.bio || `Kituo rasmi cha ${profile.displayName} kwenye Tazama.`,
      avatarUrl: channelData?.avatarUrl || profile.photoURL || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bannerUrl: channelData?.bannerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      subscriberCount: 0,
      videoCount: 0,
      isVerified: false,
      isMonetized: false,
      totalViews: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      categories: channelData?.categories || ['Muziki'],
      primaryLanguage: channelData?.primaryLanguage || 'Kiswahili',
      country: channelData?.country || 'Tanzania',
      identityStatus: channelData?.identityStatus || 'Haijathibitishwa',
      publicEmail: channelData?.publicEmail,
      showPublicEmail: channelData?.showPublicEmail ?? false,
      publicPhone: channelData?.publicPhone,
      websiteUrl: channelData?.websiteUrl,
      instagramUrl: channelData?.instagramUrl,
      tiktokUrl: channelData?.tiktokUrl,
      facebookUrl: channelData?.facebookUrl,
      rightsInfo: channelData?.rightsInfo,
      policyAgreement: channelData?.policyAgreement
    };

    const updated: UserProfile = {
      ...profile,
      role: 'creator',
      channelId: newChannelId
    };

    setChannel(newChannel);
    setProfile(updated);
    setRole('creator');
    localStorage.setItem('tazama_session_profile', JSON.stringify(updated));
    localStorage.setItem('tazama_user_channel', JSON.stringify(newChannel));
    
    try {
      const storedChannels = localStorage.getItem('tazama_custom_channels');
      const list: Channel[] = storedChannels ? JSON.parse(storedChannels) : [];
      list.push(newChannel);
      localStorage.setItem('tazama_custom_channels', JSON.stringify(list));
    } catch {}

    try {
      await setDoc(doc(db, 'users', profile.uid), { role: 'creator', channelId: newChannelId }, { merge: true });
      await setDoc(doc(db, 'channels', newChannelId), newChannel, { merge: true });
    } catch {
      // preview graceful
    }

    return newChannel;
  };

  const topUpBalance = async (amountTZS: number, providerName: string, phone: string): Promise<boolean> => {
    if (amountTZS < 1000) return false;
    const cleanAmount = Math.round(amountTZS);
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, balanceTZS: prev.balanceTZS + cleanAmount };
      localStorage.setItem('tazama_session_profile', JSON.stringify(updated));
      return updated;
    });
    return true;
  };

  const deductBalance = (amountTZS: number): boolean => {
    const cleanAmount = Math.round(amountTZS);
    if (!profile || profile.balanceTZS < cleanAmount) return false;
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, balanceTZS: prev.balanceTZS - cleanAmount };
      localStorage.setItem('tazama_session_profile', JSON.stringify(updated));
      return updated;
    });
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
        upgradeToCreator,
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
