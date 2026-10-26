import React, { useState } from 'react';
import { 
  Tv, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Crown,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { loginUser, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Tafadhali jaza barua pepe au namba ya simu na nenosiri.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const loggedInRole = await loginUser(email.trim(), password.trim());
      setIsLoading(false);
      onLoginSuccess(loggedInRole);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Imeshindwa kuingia. Tafadhali hakikisha taarifa zako ni sahihi.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setIsLoading(false);
      onLoginSuccess('viewer');
    } catch {
      setIsLoading(false);
      onLoginSuccess('viewer');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 select-none">
      <div className="w-full max-w-md bg-[#121622] border border-[#262E3E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-orange-500 text-white shadow-xl shadow-[#FF3040]/30 mb-1">
            <Tv className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Ingia Tazama</h1>
          <p className="text-xs text-[#A7B0C0]">
            Weka barua pepe au namba ya simu na nenosiri lako kuingia kwenye akaunti yako.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-[#A7B0C0] mb-1">Barua Pepe au Namba ya Simu:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mfano: diamond@wasafi.co.tz"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#A7B0C0]">Nenosiri (Password):</label>
              <button 
                type="button" 
                onClick={() => alert('Wasiliana na huduma kwa wateja au weka barua pepe upya.')}
                className="text-[11px] text-[#FF3040] hover:underline"
              >
                Umesahau nenosiri?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Weka nenosiri lako..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-[#A7B0C0] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded cursor-pointer"
              />
              <span>Nikumbuke kwenye kifaa hiki</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3040] to-[#E02635] hover:brightness-110 text-white font-black text-xs shadow-xl shadow-[#FF3040]/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Inaingia...</span>
            ) : (
              <>
                <span>Ingia Kwenye Tazama</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-2xl bg-[#10131B] hover:bg-[#191E29] border border-[#262E3E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Ingia Moja kwa Moja na Google</span>
          </button>

        </form>

        {/* Link to Register */}
        <div className="pt-4 border-t border-[#262E3E]/60 text-center text-xs">
          <p className="text-[#A7B0C0]">
            Huna akaunti ya Tazama bado?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#FF3040] hover:underline font-extrabold ml-1"
            >
              Tengeneza Akaunti Mpya (Jisajili Hapa)
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
