import React, { useState } from 'react';
import { 
  Tv, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Crown,
  Play,
  Film
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
  const [phone, setPhone] = useState<string>('0754 123 456');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  
  // Creator specific inputs
  const [channelName, setChannelName] = useState<string>('');
  const [category, setCategory] = useState<string>('Muziki');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Tafadhali jaza taarifa zote muhimu.');
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

    if (selectedRole === 'creator' && !channelName.trim()) {
      setErrorMsg('Tafadhali weka jina la kituo chako (Channel Name).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const registeredRole = await registerUser({
        name: name.trim(),
        email: email.trim(),
        pass: password.trim(),
        phone: phone.trim(),
        role: selectedRole,
        channelName: channelName.trim() || undefined,
        category
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
            Chagua aina ya akaunti yako ili kuelekezwa kwenye jopo (panel) linalokufaa mara moja.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-white mb-1.5">
            1. Chagua Aina ya Akaunti Yako (Nafasi Yako):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* Viewer Card */}
            <div
              onClick={() => setSelectedRole('viewer')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedRole === 'viewer'
                  ? 'border-[#FF3040] bg-[#FF3040]/15 ring-1 ring-[#FF3040]'
                  : 'border-[#262E3E] bg-[#10131B] hover:border-[#3b475e]'
              }`}
            >
              <Users className="w-5 h-5 text-purple-400 mb-2" />
              <h3 className="text-xs font-black text-white">Mtazamaji (Viewer)</h3>
              <p className="text-[10px] text-[#A7B0C0] mt-1 leading-snug">
                Kutazama video, kubana bando, kuunda playlists na kutuma zawadi.
              </p>
              <span className="text-[9px] font-bold text-[#FF3040] mt-2 block">Inaelekeza: Viewer Feed</span>
            </div>

            {/* Creator Card */}
            <div
              onClick={() => {
                setSelectedRole('creator');
                if (!channelName) setChannelName(name ? `${name} Official` : 'Kituo Changu');
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedRole === 'creator'
                  ? 'border-[#16C784] bg-[#16C784]/15 ring-1 ring-[#16C784]'
                  : 'border-[#262E3E] bg-[#10131B] hover:border-[#3b475e]'
              }`}
            >
              <Sparkles className="w-5 h-5 text-[#16C784] mb-2" />
              <h3 className="text-xs font-black text-white">Muundaji (Creator)</h3>
              <p className="text-[10px] text-[#A7B0C0] mt-1 leading-snug">
                Kupakia video &amp; shorts, kuanzisha Live na kupata mapato ya TZS.
              </p>
              <span className="text-[9px] font-bold text-[#16C784] mt-2 block">Inaelekeza: Creator Studio</span>
            </div>

            {/* Admin Card */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedRole === 'admin'
                  ? 'border-amber-400 bg-amber-400/15 ring-1 ring-amber-400'
                  : 'border-[#262E3E] bg-[#10131B] hover:border-[#3b475e]'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="text-xs font-black text-white">Msimamizi (Admin)</h3>
              <p className="text-[10px] text-[#A7B0C0] mt-1 leading-snug">
                Kusimamia watumiaji, mapato, malipo ya creators na COSOTA.
              </p>
              <span className="text-[9px] font-bold text-amber-400 mt-2 block">Inaelekeza: Admin Panel</span>
            </div>

          </div>
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
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0754 123 456"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#10131B] border border-[#262E3E] text-white text-xs font-mono focus:outline-none focus:border-[#FF3040]"
              />
            </div>
          </div>

          {/* Conditional Creator Fields */}
          {selectedRole === 'creator' && (
            <div className="p-3.5 rounded-2xl bg-[#16C784]/10 border border-[#16C784]/30 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-[#16C784] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Taarifa za Kituo Chako (Creator Channel):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A7B0C0] mb-1 font-semibold">Jina la Kituo (Channel Name):</label>
                  <input
                    type="text"
                    required
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="k.m. Wasafi Media, Mrema Comedy"
                    className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-[#16C784]"
                  />
                </div>
                <div>
                  <label className="block text-[#A7B0C0] mb-1 font-semibold">Kundi Kuu la Maudhui:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none"
                  >
                    <option value="Muziki">Muziki (Bongo Flava)</option>
                    <option value="Vichekesho">Vichekesho (Comedy)</option>
                    <option value="Habari">Habari &amp; Matukio</option>
                    <option value="Elimu">Elimu &amp; Mafunzo</option>
                    <option value="Michezo">Michezo (Simba/Yanga)</option>
                    <option value="Filamu">Filamu &amp; Tamthilia</option>
                  </select>
                </div>
              </div>
            </div>
          )}

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
                Ninakubali Masharti ya Huduma, Miongozo ya Maudhui ya COSOTA, na Sera ya Faragha ya Tazama.
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
                <span>Kamilisha Usajili na Ingia Kwenye Panel Yako</span>
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
