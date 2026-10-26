import React, { useState } from 'react';
import { 
  Tv, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess: (role: UserRole) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegisterSuccess }) => {
  const { registerUser } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Tafadhali jaza jina kamili, barua pepe na nenosiri.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Nenosiri linapaswa kuwa na angalau herufi au tarakimu 6.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Nenosiri la uthibitisho halilingani na nenosiri uliloweka.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Tafadhali ukubali masharti ya huduma ya Tazama kuendelea.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const registeredRole = await registerUser({
        name: name.trim(),
        email: email.trim(),
        pass: password.trim(),
        phone: phone.trim() || '0754 000 000',
        role: 'viewer'
      });

      setIsLoading(false);
      onRegisterSuccess(registeredRole);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Usajili umeshindwa. Tafadhali jaribu tena au tumia barua pepe nyingine.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 select-none">
      <div className="w-full max-w-lg bg-[#121622] border border-[#262E3E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF3040] to-orange-500 text-white shadow-xl shadow-[#FF3040]/30 mb-1">
            <Tv className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Tengeneza Akaunti ya Tazama</h1>
          <p className="text-xs text-[#A7B0C0]">
            Jisajili bure ili kuanza kutazama video, kubana bando na kujiunga na jamii ya Tazama.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#A7B0C0] mb-1">Jina Kamili:</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mfano: Baraka Mrema"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#A7B0C0] mb-1">Barua Pepe (Email):</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="baraka@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#A7B0C0] mb-1">Namba ya Simu (Kwa ajili ya M-Pesa / Tigo Pesa):</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0754 123 456"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono focus:outline-none focus:border-[#FF3040]"
              />
            </div>
            <span className="text-[10px] text-[#A7B0C0] block mt-1">
              Taarifa zako za simu na akaunti zinalindwa na hazitawekwa hadharani.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#A7B0C0] mb-1">Nenosiri (Password):</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Angalau herufi 6..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
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

            <div>
              <label className="block font-bold text-[#A7B0C0] mb-1">Thibitisha Nenosiri:</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0C0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Rudia nenosiri..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#FF3040]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-start gap-2 text-[#A7B0C0] cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded cursor-pointer"
              />
              <span className="text-[11px] leading-tight">
                Ninakubali Masharti ya Huduma, Miongozo ya Maudhui, na Sera ya Faragha ya Tazama.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3040] to-orange-500 hover:brightness-110 text-white font-black text-xs shadow-xl shadow-[#FF3040]/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Inasajili akaunti...</span>
            ) : (
              <>
                <span>Kamilisha Usajili na Uanze Kutazama</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Link to Login */}
        <div className="pt-4 border-t border-[#262E3E]/60 text-center text-xs">
          <p className="text-[#A7B0C0]">
            Tayari unayo akaunti ya Tazama?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#FF3040] hover:underline font-extrabold ml-1"
            >
              Ingia Hapa (Login)
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
