import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Flag, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Activity, 
  Tv, 
  FileText,
  UserX,
  UserCheck,
  Trash2,
  Edit3,
  Plus,
  Search,
  Sparkles,
  Eye,
  Sliders,
  Check,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Crown,
  Settings as SettingsIcon,
  Filter
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import { formatTZS, formatViews, translations } from '../lib/i18n';
import { SAMPLE_AD_CAMPAIGNS } from '../data/mockData';
import { ContentReport, UserProfile, UserRole, PremiumPlan, PayoutRequest, VideoItem } from '../types';

export const AdminPage: React.FC = () => {
  const { 
    reports, 
    updateReportStatus, 
    channels, 
    videos, 
    shorts,
    payoutRequests,
    users,
    premiumPlans,
    platformSettings,
    auditLogs,
    deleteUser,
    toggleBlockUser,
    updateUserRole,
    updateUserBalance,
    toggleChannelVerification,
    toggleBlockChannel,
    deleteVideo,
    updateVideoStatus,
    updatePremiumPlan,
    addPremiumPlan,
    updatePayoutStatus,
    updatePlatformSettings,
    addAuditLog
  } = useVideo();

  const { profile, language } = useAuth();
  const t = translations[language];

  // Active Tab
  const [activeTab, setActiveTab] = useState<'users' | 'premium' | 'videos' | 'payouts' | 'moderation' | 'settings' | 'audit'>('users');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  const [videoSearch, setVideoSearch] = useState('');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('all');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // User Action Modals
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToBlock, setUserToBlock] = useState<UserProfile | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [userToEditBalance, setUserToEditBalance] = useState<UserProfile | null>(null);
  const [balanceAdjustmentInput, setBalanceAdjustmentInput] = useState('');

  // Premium Plan Edit/Add Modal
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planForm, setPlanForm] = useState<{
    name: string;
    description: string;
    target: 'viewer' | 'creator';
    priceTZS: number;
    billingPeriod: 'month' | 'year';
    perks: string;
    badgeLabel: string;
    badgeColor: string;
    popular: boolean;
    isActive: boolean;
  }>({
    name: '',
    description: '',
    target: 'viewer',
    priceTZS: 5000,
    billingPeriod: 'month',
    perks: '',
    badgeLabel: 'VIP',
    badgeColor: '#FF3040',
    popular: false,
    isActive: true
  });

  // Video Action Modal
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);

  // Financial Calculations
  const totalGrossTZS = 52400000;
  const platformRevenueTZS = Math.round(totalGrossTZS * (platformSettings.platformCommissionPercent / 100));
  const creatorPayoutTotalTZS = Math.round(totalGrossTZS * (platformSettings.creatorRevenuePercent / 100));

  // Premium MRR calculation
  const totalViewerMRR = premiumPlans
    .filter(p => p.target === 'viewer')
    .reduce((sum, p) => sum + (p.priceTZS * (p.subscribersCount || 0)), 0);

  const totalCreatorMRR = premiumPlans
    .filter(p => p.target === 'creator')
    .reduce((sum, p) => sum + (p.priceTZS * (p.subscribersCount || 0)), 0);

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.uid.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = 
      userStatusFilter === 'all' || 
      (userStatusFilter === 'blocked' ? u.isBlocked : !u.isBlocked);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered Videos
  const allVideos = [...videos, ...shorts];
  const filteredVideos = allVideos.filter(v => {
    const matchesSearch = 
      v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
      v.channelName.toLowerCase().includes(videoSearch.toLowerCase());
    const matchesCategory = videoCategoryFilter === 'all' || v.category === videoCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingPayouts = payoutRequests.filter(p => p.status === 'pending');

  // Handlers
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const ok = deleteUser(userToDelete.uid);
    if (ok) {
      showToast(`Mtumiaji ${userToDelete.displayName || userToDelete.email} amefutwa kabisa kwenye mfumo.`, 'success');
    } else {
      showToast(`Hauwezi kumfuta Super Admin mkuu wa mfumo.`, 'error');
    }
    setUserToDelete(null);
  };

  const handleConfirmBlockUser = () => {
    if (!userToBlock) return;
    toggleBlockUser(userToBlock.uid, blockReasonInput.trim() || undefined);
    showToast(
      userToBlock.isBlocked 
        ? `Mtumiaji ${userToBlock.displayName} amefunguliwa (Unblocked).` 
        : `Mtumiaji ${userToBlock.displayName} amezuiwa (Blocked).`, 
      'info'
    );
    setUserToBlock(null);
    setBlockReasonInput('');
  };

  const handleConfirmBalanceAdjustment = () => {
    if (!userToEditBalance) return;
    const amount = parseInt(balanceAdjustmentInput, 10);
    if (isNaN(amount) || amount === 0) {
      showToast('Tafadhali weka kiasi sahihi cha nambari.', 'error');
      return;
    }
    updateUserBalance(userToEditBalance.uid, amount);
    showToast(`Salio la ${userToEditBalance.displayName} limebadilishwa kwa TZS ${amount.toLocaleString()}.`, 'success');
    setUserToEditBalance(null);
    setBalanceAdjustmentInput('');
  };

  const handleOpenEditPlan = (plan: PremiumPlan) => {
    setEditingPlan(plan);
    setIsCreatingPlan(false);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      target: plan.target,
      priceTZS: plan.priceTZS,
      billingPeriod: plan.billingPeriod,
      perks: plan.perks.join('\n'),
      badgeLabel: plan.badgeLabel,
      badgeColor: plan.badgeColor,
      popular: !!plan.popular,
      isActive: plan.isActive
    });
  };

  const handleOpenCreatePlan = (targetType: 'viewer' | 'creator') => {
    setEditingPlan(null);
    setIsCreatingPlan(true);
    setPlanForm({
      name: targetType === 'viewer' ? 'Tazama VIP Mpya' : 'Creator Pro Mpya',
      description: 'Maelezo mafupi ya kifurushi hiki na faida zake...',
      target: targetType,
      priceTZS: targetType === 'viewer' ? 5000 : 25000,
      billingPeriod: 'month',
      perks: 'Faida ya kwanza\nFaida ya pili\nFaida ya tatu',
      badgeLabel: targetType === 'viewer' ? 'VIP' : 'PRO',
      badgeColor: targetType === 'viewer' ? '#FF3040' : '#16C784',
      popular: false,
      isActive: true
    });
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const perkList = planForm.perks
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (editingPlan) {
      updatePremiumPlan(editingPlan.id, {
        name: planForm.name,
        description: planForm.description,
        target: planForm.target,
        priceTZS: Math.max(0, Math.round(planForm.priceTZS)),
        billingPeriod: planForm.billingPeriod,
        perks: perkList,
        badgeLabel: planForm.badgeLabel,
        badgeColor: planForm.badgeColor,
        popular: planForm.popular,
        isActive: planForm.isActive
      });
      showToast(`Kifurushi cha "${planForm.name}" kimesasishwa kwa mafanikio!`, 'success');
    } else if (isCreatingPlan) {
      addPremiumPlan({
        name: planForm.name,
        description: planForm.description,
        target: planForm.target,
        priceTZS: Math.max(0, Math.round(planForm.priceTZS)),
        billingPeriod: planForm.billingPeriod,
        perks: perkList,
        badgeLabel: planForm.badgeLabel,
        badgeColor: planForm.badgeColor,
        popular: planForm.popular,
        isActive: planForm.isActive
      });
      showToast(`Kifurushi kipya cha "${planForm.name}" kimeundwa!`, 'success');
    }

    setEditingPlan(null);
    setIsCreatingPlan(false);
  };

  const handleConfirmDeleteVideo = () => {
    if (!videoToDelete) return;
    deleteVideo(videoToDelete.id);
    showToast(`Video "${videoToDelete.title}" imefutwa kabisa.`, 'success');
    setVideoToDelete(null);
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-bounce text-xs font-semibold ${
          toastMessage.type === 'error' 
            ? 'bg-red-500/90 text-white border-red-400' 
            : toastMessage.type === 'info'
            ? 'bg-blue-500/90 text-white border-blue-400'
            : 'bg-[#16C784]/95 text-black border-[#16C784]'
        }`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#191E29] to-[#232A39] border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Jopo Kuu la Usimamizi (Super Admin Panel)
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                Mamlaka Kamili
              </span>
            </div>
            <p className="text-xs text-[#A7B0C0] mt-0.5">
              Usimamizi wa Watumiaji, Kufuta &amp; Kubloku Wahusika, Vifurushi vya Premium (Watazamaji &amp; Waumbaji), Maudhui, Fedha na Mfumo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs bg-[#10131B]/80 px-3.5 py-2 rounded-2xl border border-[#262E3E]">
            <span className="text-[#A7B0C0] text-[10px] block">Msimamizi wa Sasa:</span>
            <div className="font-bold text-white flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-[#16C784] animate-pulse" />
              {profile?.email || 'amytzee@gmail.com'}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Summary & Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A7B0C0] font-semibold">Jumla ya Watumiaji</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {users.length.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px]">
            <span className="text-[#16C784]">
              {users.filter(u => !u.isBlocked).length} Walio Hai
            </span>
            <span>•</span>
            <span className="text-red-400">
              {users.filter(u => u.isBlocked).length} Waliozuiwa (Blocked)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A7B0C0] font-semibold">Mapato ya Premium (MRR)</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">
            {formatTZS(totalViewerMRR + totalCreatorMRR)}
          </div>
          <span className="text-[10px] text-[#A7B0C0]">
            Watazamaji: {formatTZS(totalViewerMRR)} | Waumbaji: {formatTZS(totalCreatorMRR)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A7B0C0] font-semibold">Mapato ya Jukwaa ({platformSettings.platformCommissionPercent}%)</span>
            <DollarSign className="w-4 h-4 text-[#16C784]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#16C784] mt-1">
            {formatTZS(platformRevenueTZS)}
          </div>
          <span className="text-[10px] text-[#A7B0C0]">
            Kutoka matangazo, zawadi &amp; uanachama
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#191E29] border border-[#262E3E]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A7B0C0] font-semibold">Gawio la Waumbaji ({platformSettings.creatorRevenuePercent}%)</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 mt-1">
            {formatTZS(creatorPayoutTotalTZS)}
          </div>
          <span className="text-[10px] text-[#A7B0C0]">
            {pendingPayouts.length} maombi mapya ya kutoa fedha
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262E3E] pb-2 overflow-x-auto">
        {[
          { id: 'users', label: `Watumiaji & Waumbaji (${users.length})`, icon: Users },
          { id: 'premium', label: `Vifurushi vya Premium (${premiumPlans.length})`, icon: Crown },
          { id: 'videos', label: `Maudhui & Video (${allVideos.length})`, icon: Tv },
          { id: 'payouts', label: `Maombi ya Malipo (${pendingPayouts.length})`, icon: CreditCard, badge: pendingPayouts.length > 0 ? pendingPayouts.length : undefined },
          { id: 'moderation', label: `Uhakiki wa Hakimiliki (${pendingReports.length})`, icon: Flag, badge: pendingReports.length > 0 ? pendingReports.length : undefined },
          { id: 'settings', label: 'Mfumo & Matangazo', icon: Sliders },
          { id: 'audit', label: `Kumbukumbu za Usalama (${auditLogs.length})`, icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
                isActive 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-[#191E29] text-[#A7B0C0] hover:text-white hover:bg-[#232A39]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-extrabold ml-1">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: USERS & CREATORS MANAGEMENT (DELETE & BLOCK CAPABILITIES) */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262E3E]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Usimamizi wa Watumiaji na Waumbaji (User &amp; Creator Management)
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Unaweza kumfuta mtumiaji, kum-block/kumzuia, kurekebisha salio la TZS, na kubadili majukumu.
              </p>
            </div>

            {/* User Search & Filters */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A7B0C0]" />
                <input
                  type="text"
                  placeholder="Tafuta jina, email au UID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-amber-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="all">Majukumu Yote (All Roles)</option>
                <option value="viewer">Watazamaji (Viewers)</option>
                <option value="creator">Waumbaji (Creators)</option>
                <option value="moderator">Wasimamizi (Moderators)</option>
                <option value="admin">Wakuu (Admins)</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="all">Hali Zote (All Status)</option>
                <option value="active">Walio Hai (Active)</option>
                <option value="blocked">Waliozuiwa (Blocked)</option>
              </select>
            </div>
          </div>

          {/* Mobile User Cards (< md screens) */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-[#A7B0C0] text-xs">
                Hakuna mtumiaji aliyepatikana kwa vigezo hivi vya utafutaji.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const userChannel = channels.find(c => c.id === u.channelId);
                return (
                  <div 
                    key={u.uid} 
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      u.isBlocked 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-[#10131B] border-[#262E3E]'
                    }`}
                  >
                    {/* User info row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={u.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={u.displayName}
                          className="w-10 h-10 rounded-full object-cover border border-[#262E3E] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white flex items-center gap-1.5 truncate text-sm">
                            <span className="truncate">{u.displayName}</span>
                            {u.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-black font-extrabold uppercase shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#A7B0C0] font-mono truncate">{u.email}</div>
                          {u.blockReason && (
                            <div className="text-[10px] text-red-400 font-medium italic mt-0.5">
                              Sababu: {u.blockReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      {u.isBlocked ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                          <Lock className="w-3 h-3" />
                          Blocked
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16C784]/15 text-[#16C784] border border-[#16C784]/30">
                          <Check className="w-3 h-3" />
                          Hai
                        </span>
                      )}
                    </div>

                    {/* Metadata & Controls: Role, Channel, Salio */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-[#191E29] p-2.5 rounded-xl border border-[#262E3E]">
                        <span className="text-[10px] text-[#A7B0C0] block mb-1">Jukumu (Role):</span>
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.uid, e.target.value as UserRole)}
                          disabled={u.email === 'amytzee@gmail.com'}
                          className="w-full bg-[#10131B] border border-[#262E3E] text-white px-2 py-1 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-400 disabled:opacity-60"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="creator">Creator</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="bg-[#191E29] p-2.5 rounded-xl border border-[#262E3E]">
                        <span className="text-[10px] text-[#A7B0C0] block mb-1">Salio la Mkoba:</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#16C784] text-xs">
                            {formatTZS(u.balanceTZS)}
                          </span>
                          <button
                            onClick={() => {
                              setUserToEditBalance(u);
                              setBalanceAdjustmentInput('10000');
                            }}
                            className="p-1 rounded bg-[#10131B] border border-[#262E3E] text-[#A7B0C0] hover:text-white"
                            title="Badili Salio"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {userChannel && (
                      <div className="flex items-center justify-between text-xs bg-[#191E29] px-3 py-1.5 rounded-xl border border-[#262E3E]">
                        <span className="text-[#A7B0C0] text-[11px]">Kituo: <strong className="text-white">{userChannel.name}</strong></span>
                        <button
                          onClick={() => toggleChannelVerification(userChannel.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            userChannel.isVerified 
                              ? 'bg-[#16C784]/20 text-[#16C784]' 
                              : 'bg-[#262E3E] text-[#A7B0C0]'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {userChannel.isVerified ? 'Verified' : 'Verify'}
                        </button>
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#262E3E]/60">
                      <button
                        onClick={() => {
                          if (u.isBlocked) {
                            toggleBlockUser(u.uid);
                            showToast(`Mtumiaji ${u.displayName} amefunguliwa na kuruhusiwa kutumia huduma zote.`, 'info');
                          } else {
                            setUserToBlock(u);
                            setBlockReasonInput('Kukiuka vigezo na miongozo ya jamii ya Tazama');
                          }
                        }}
                        disabled={u.email === 'amytzee@gmail.com'}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          u.isBlocked 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        } disabled:opacity-40`}
                      >
                        {u.isBlocked ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Fungua (Unblock)
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            Bloku (Block)
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setUserToDelete(u)}
                        disabled={u.email === 'amytzee@gmail.com'}
                        className="py-2 px-3 rounded-xl font-bold text-xs bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Futa Mtumiaji
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Users Table (>= md screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                  <th className="pb-3 font-semibold">Mtumiaji</th>
                  <th className="pb-3 font-semibold">Jukumu (Role)</th>
                  <th className="pb-3 font-semibold">Kituo (Channel)</th>
                  <th className="pb-3 font-semibold">Salio (TZS)</th>
                  <th className="pb-3 font-semibold">Hali (Status)</th>
                  <th className="pb-3 font-semibold text-right">Vitendo vya Msimamizi (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262E3E]/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#A7B0C0]">
                      Hakuna mtumiaji aliyepatikana kwa vigezo hivi vya utafutaji.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const userChannel = channels.find(c => c.id === u.channelId);
                    return (
                      <tr key={u.uid} className={`hover:bg-[#10131B]/50 transition-colors ${u.isBlocked ? 'bg-red-500/5' : ''}`}>
                        
                        {/* User Identity */}
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                              alt={u.displayName}
                              className="w-9 h-9 rounded-full object-cover border border-[#262E3E]"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {u.displayName}
                                {u.role === 'admin' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-black font-extrabold uppercase">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#A7B0C0] font-mono">{u.email}</div>
                              {u.blockReason && (
                                <div className="text-[10px] text-red-400 font-medium italic mt-0.5">
                                  Sababu: {u.blockReason}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-3.5 pr-3">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.uid, e.target.value as UserRole)}
                            disabled={u.email === 'amytzee@gmail.com'}
                            className="bg-[#10131B] border border-[#262E3E] text-white px-2.5 py-1 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-400 disabled:opacity-60 cursor-pointer"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="creator">Creator</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Channel & Verification Toggle */}
                        <td className="py-3.5 pr-3">
                          {userChannel ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{userChannel.name}</span>
                              <button
                                onClick={() => toggleChannelVerification(userChannel.id)}
                                title={userChannel.isVerified ? 'Ondoa beji ya uthibitisho' : 'Thibitisha kituo'}
                                className={`p-1 rounded-md transition-colors ${
                                  userChannel.isVerified 
                                    ? 'bg-[#16C784]/20 text-[#16C784]' 
                                    : 'bg-[#262E3E] text-[#A7B0C0] hover:text-white'
                                }`}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#A7B0C0] italic text-[11px]">Hana Kituo</span>
                          )}
                        </td>

                        {/* Balance & Adjust Button */}
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#16C784]">
                              {formatTZS(u.balanceTZS)}
                            </span>
                            <button
                              onClick={() => {
                                setUserToEditBalance(u);
                                setBalanceAdjustmentInput('10000');
                              }}
                              title="Badili salio la mtumiaji"
                              className="p-1 rounded bg-[#10131B] border border-[#262E3E] hover:border-amber-400 text-[#A7B0C0] hover:text-white"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Status (Active / Blocked) */}
                        <td className="py-3.5 pr-3">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                              <Lock className="w-3 h-3" />
                              Imezuiwa (Blocked)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#16C784]/15 text-[#16C784] border border-[#16C784]/30">
                              <Check className="w-3 h-3" />
                              Hai (Active)
                            </span>
                          )}
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* Block / Unblock Toggle Button */}
                          <button
                            onClick={() => {
                              if (u.isBlocked) {
                                toggleBlockUser(u.uid);
                                showToast(`Mtumiaji ${u.displayName} amefunguliwa na kuruhusiwa kutumia huduma zote.`, 'info');
                              } else {
                                setUserToBlock(u);
                                setBlockReasonInput('Kukiuka vigezo na miongozo ya jamii ya Tazama');
                              }
                            }}
                            disabled={u.email === 'amytzee@gmail.com'}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-all ${
                              u.isBlocked 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                                : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={u.isBlocked ? 'Fungua mtumiaji huyu' : 'Zuia/Bloku mtumiaji huyu'}
                          >
                            {u.isBlocked ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Fungua (Unblock)
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                Bloku (Block)
                              </>
                            )}
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={u.email === 'amytzee@gmail.com'}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600 hover:text-white transition-all inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Futa mtumiaji huyu kabisa kwenye mfumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Futa (Delete)
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PREMIUM PLANS MANAGEMENT (VIEWERS & CREATORS) */}
      {/* ============================================================== */}
      {activeTab === 'premium' && (
        <div className="space-y-6">
          {/* Header & Add Plan Buttons */}
          <div className="p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Usimamizi wa Vifurushi vya Premium (Viewer &amp; Creator Plans)
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Kuweka bei (TZS), faida (perks), hali ya kifurushi, na kuongeza mipango mipya kwa ajili ya watazamaji na watengenezaji video.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => handleOpenCreatePlan('viewer')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3040] to-rose-600 text-white font-bold flex items-center gap-1.5 shadow-md shadow-[#FF3040]/30 hover:brightness-110"
              >
                <Plus className="w-4 h-4" />
                Kifurushi cha Mtazamaji (+ Viewer Plan)
              </button>

              <button
                onClick={() => handleOpenCreatePlan('creator')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16C784] to-emerald-600 text-black font-extrabold flex items-center gap-1.5 shadow-md shadow-[#16C784]/30 hover:brightness-110"
              >
                <Plus className="w-4 h-4" />
                Kifurushi cha Muumbaji (+ Creator Plan)
              </button>
            </div>
          </div>

          {/* Section A: Viewer Premium Plans */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF3040]" />
                1. Vifurushi vya Watazamaji (Viewer Premium Tiers — Ad-Free, 4K, Offline)
              </h4>
              <span className="text-xs text-[#A7B0C0]">
                Jumla ya Mapato ya Mwezi: <strong className="text-white font-mono">{formatTZS(totalViewerMRR)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {premiumPlans.filter(p => p.target === 'viewer').map((plan) => (
                <div 
                  key={plan.id}
                  className={`p-5 rounded-3xl bg-[#191E29] border transition-all flex flex-col justify-between ${
                    plan.popular ? 'border-[#FF3040] shadow-lg shadow-[#FF3040]/10' : 'border-[#262E3E]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: plan.badgeColor }}
                      >
                        {plan.badgeLabel}
                      </span>
                      {plan.popular && (
                        <span className="text-[10px] bg-[#FF3040]/20 text-[#FF3040] border border-[#FF3040]/40 px-2 py-0.5 rounded-full font-bold">
                          Maarufu Zaidi
                        </span>
                      )}
                    </div>

                    <div>
                      <h5 className="text-base font-bold text-white">{plan.name}</h5>
                      <p className="text-xs text-[#A7B0C0] mt-1 line-clamp-2">{plan.description}</p>
                    </div>

                    <div className="pt-2 border-t border-[#262E3E]/70">
                      <div className="text-2xl font-black font-mono text-white">
                        {plan.priceTZS === 0 ? 'BURE' : formatTZS(plan.priceTZS)}
                        {plan.priceTZS > 0 && (
                          <span className="text-xs font-normal text-[#A7B0C0] font-sans">
                            /{plan.billingPeriod === 'year' ? 'kwa mwaka' : 'kwa mwezi'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#16C784] font-medium">
                        {(plan.subscribersCount || 0).toLocaleString()} waliojiunga
                      </span>
                    </div>

                    {/* Perks List */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">Faida zilizojumuishwa:</span>
                      {plan.perks.map((perk, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-[#A7B0C0]">
                          <Check className="w-3.5 h-3.5 text-[#16C784] shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-[#262E3E] flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      plan.isActive ? 'bg-[#16C784]/20 text-[#16C784]' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {plan.isActive ? 'Inatumika (Active)' : 'Imezimwa (Inactive)'}
                    </span>

                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="px-3 py-1.5 rounded-xl bg-[#10131B] border border-[#262E3E] hover:border-amber-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      Hariri Bei &amp; Faida
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Section B: Creator Premium Plans */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16C784]" />
                2. Vifurushi vya Waumbaji (Creator Studio Plans — 85-90% Share, GB Kubwa, Analytics)
              </h4>
              <span className="text-xs text-[#A7B0C0]">
                Jumla ya Mapato ya Mwezi: <strong className="text-white font-mono">{formatTZS(totalCreatorMRR)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {premiumPlans.filter(p => p.target === 'creator').map((plan) => (
                <div 
                  key={plan.id}
                  className={`p-5 rounded-3xl bg-[#191E29] border transition-all flex flex-col justify-between ${
                    plan.popular ? 'border-[#16C784] shadow-lg shadow-[#16C784]/10' : 'border-[#262E3E]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-black font-extrabold"
                        style={{ backgroundColor: plan.badgeColor }}
                      >
                        {plan.badgeLabel}
                      </span>
                      {plan.popular && (
                        <span className="text-[10px] bg-[#16C784]/20 text-[#16C784] border border-[#16C784]/40 px-2 py-0.5 rounded-full font-bold">
                          Chaguo Bora la Studio
                        </span>
                      )}
                    </div>

                    <div>
                      <h5 className="text-base font-bold text-white">{plan.name}</h5>
                      <p className="text-xs text-[#A7B0C0] mt-1 line-clamp-2">{plan.description}</p>
                    </div>

                    <div className="pt-2 border-t border-[#262E3E]/70">
                      <div className="text-2xl font-black font-mono text-[#16C784]">
                        {plan.priceTZS === 0 ? 'BURE' : formatTZS(plan.priceTZS)}
                        {plan.priceTZS > 0 && (
                          <span className="text-xs font-normal text-[#A7B0C0] font-sans">
                            /kwa mwezi
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-400 font-medium">
                        {(plan.subscribersCount || 0).toLocaleString()} waumbaji wanatumia
                      </span>
                    </div>

                    {/* Perks List */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0]">Faida zilizojumuishwa:</span>
                      {plan.perks.map((perk, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-[#A7B0C0]">
                          <Check className="w-3.5 h-3.5 text-[#16C784] shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-[#262E3E] flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      plan.isActive ? 'bg-[#16C784]/20 text-[#16C784]' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {plan.isActive ? 'Inatumika' : 'Imezimwa'}
                    </span>

                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="px-3 py-1.5 rounded-xl bg-[#10131B] border border-[#262E3E] hover:border-amber-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      Hariri Bei &amp; Faida
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ALL VIDEOS & CONTENT MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'videos' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262E3E]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-amber-400" />
                Usimamizi wa Maudhui &amp; Video Zote (All Platform Media)
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Kuhakiki, kufuta video zilizokiuka haki au sheria, kubadili hadhi ya uchakataji na ufikiaji.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A7B0C0]" />
                <input
                  type="text"
                  placeholder="Tafuta jina la video au kituo..."
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-amber-400 w-48 sm:w-60"
                />
              </div>

              <select
                value={videoCategoryFilter}
                onChange={(e) => setVideoCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="all">Kategoria Zote</option>
                <option value="Muziki">Muziki</option>
                <option value="Habari">Habari</option>
                <option value="Vichekesho">Vichekesho</option>
                <option value="Michezo">Michezo</option>
                <option value="Teknolojia">Teknolojia</option>
              </select>
            </div>
          </div>

          {/* Mobile Video Cards (< md screens) */}
          <div className="md:hidden space-y-3">
            {filteredVideos.map((vid) => (
              <div 
                key={vid.id}
                className="p-3.5 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={vid.thumbnailUrl} 
                    alt={vid.title} 
                    className="w-20 h-14 rounded-xl object-cover border border-[#262E3E] shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-white text-xs line-clamp-2 leading-tight">
                      {vid.title}
                    </h5>
                    <p className="text-[11px] text-[#A7B0C0] truncate mt-0.5 font-medium">
                      {vid.channelName} • {vid.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className="font-mono text-white">{vid.viewsCount.toLocaleString()} views</span>
                      <span className="px-1.5 py-0.2 rounded font-bold uppercase bg-[#16C784]/20 text-[#16C784]">
                        {vid.visibility}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#262E3E]/60 text-xs">
                  <button
                    onClick={() => {
                      const nextVis = vid.visibility === 'public' ? 'unlisted' : 'public';
                      updateVideoStatus(vid.id, vid.processingStatus, nextVis);
                      showToast(`Ufikiaji wa video umebadilishwa kuwa: ${nextVis}`, 'info');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-[#191E29] border border-[#262E3E] hover:border-amber-400 text-white font-semibold text-[11px]"
                  >
                    {vid.visibility === 'public' ? 'Ficha (Unlist)' : 'Weka Public'}
                  </button>

                  <button
                    onClick={() => setVideoToDelete(vid)}
                    className="flex-1 py-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Futa Video
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Videos Table (>= md screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                  <th className="pb-3 font-semibold">Video</th>
                  <th className="pb-3 font-semibold">Kituo &amp; Mmiliki</th>
                  <th className="pb-3 font-semibold">Kategoria</th>
                  <th className="pb-3 font-semibold">Matazamio</th>
                  <th className="pb-3 font-semibold">Hali (Status)</th>
                  <th className="pb-3 font-semibold text-right">Vitendo (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262E3E]/60">
                {filteredVideos.map((vid) => (
                  <tr key={vid.id} className="hover:bg-[#10131B]/50 transition-colors">
                    
                    {/* Thumbnail & Title */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3 max-w-sm">
                        <img 
                          src={vid.thumbnailUrl} 
                          alt={vid.title} 
                          className="w-16 h-10 rounded-lg object-cover border border-[#262E3E] shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-white line-clamp-1 flex items-center gap-1.5">
                            {vid.title}
                            {vid.isShort && (
                              <span className="text-[9px] bg-[#FF3040] text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                                Short
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#A7B0C0] font-mono">
                            {new Date(vid.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3 pr-3">
                      <span className="font-semibold text-white">{vid.channelName}</span>
                    </td>

                    {/* Category */}
                    <td className="py-3 pr-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#262E3E] text-[#A7B0C0] font-semibold">
                        {vid.category}
                      </span>
                    </td>

                    {/* Views & Likes */}
                    <td className="py-3 pr-3 font-mono">
                      <div className="font-bold text-white">{vid.viewsCount.toLocaleString()}</div>
                      <span className="text-[10px] text-[#A7B0C0]">{vid.likesCount.toLocaleString()} likes</span>
                    </td>

                    {/* Processing & Visibility status */}
                    <td className="py-3 pr-3">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#16C784]/20 text-[#16C784]">
                          {vid.processingStatus.toUpperCase()}
                        </span>
                        <div className="text-[10px] text-[#A7B0C0] capitalize">
                          {vid.visibility}
                        </div>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          const nextVis = vid.visibility === 'public' ? 'unlisted' : 'public';
                          updateVideoStatus(vid.id, vid.processingStatus, nextVis);
                          showToast(`Ufikiaji wa video umebadilishwa kuwa: ${nextVis}`, 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#10131B] border border-[#262E3E] hover:border-amber-400 text-white text-[11px] font-semibold"
                        title="Badili ufikiaji (Public / Unlisted)"
                      >
                        {vid.visibility === 'public' ? 'Ficha (Unlist)' : 'Weka Public'}
                      </button>

                      <button
                        onClick={() => setVideoToDelete(vid)}
                        className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600 hover:text-white text-[11px] font-bold transition-all inline-flex items-center gap-1"
                        title="Futa video hii kabisa"
                      >
                        <Trash2 className="w-3 h-3" />
                        Futa Video
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CREATOR PAYOUT REQUESTS APPROVAL */}
      {/* ============================================================== */}
      {activeTab === 'payouts' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                Maombi ya Kutoa Fedha ya Waumbaji (Creator Payout Approvals)
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Idhinisha malipo ya moja kwa moja kwenda M-Pesa, Tigo Pesa, Airtel Money, Halopesa, CRDB au NMB.
              </p>
            </div>
            <span className="text-xs text-[#A7B0C0] font-mono">
              {payoutRequests.length} maombi yamesajiliwa
            </span>
          </div>

          <div className="space-y-3">
            {payoutRequests.map((pay) => (
              <div 
                key={pay.id}
                className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16C784]/20 text-[#16C784] border border-[#16C784]/30">
                      {pay.provider}
                    </span>
                    <span className="text-xs font-bold text-white">{pay.channelName}</span>
                    <span className="text-[11px] font-mono text-[#A7B0C0]">({pay.accountNumber})</span>
                  </div>

                  <div className="text-lg font-black font-mono text-white">
                    {formatTZS(pay.amountTZS)}
                  </div>

                  <p className="text-xs text-[#A7B0C0]">
                    Jina la Akaunti: <strong className="text-white">{pay.accountHolderName}</strong> • Ombi: {new Date(pay.requestedAt).toLocaleString()}
                  </p>

                  {pay.notes && (
                    <p className="text-[11px] text-amber-300 font-semibold italic">
                      Ujumbe: {pay.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pay.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => {
                          updatePayoutStatus(pay.id, 'rejected', 'Kukataliwa na Msimamizi Mkuu: Taarifa za akaunti hazijathibitishwa');
                          showToast('Ombi la malipo limekataliwa.', 'info');
                        }}
                        className="px-3.5 py-2 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                      >
                        Kataa (Reject)
                      </button>

                      <button
                        onClick={() => {
                          updatePayoutStatus(pay.id, 'approved', 'Imeidhinishwa na kutumwa na Msimamizi wa Tazama');
                          showToast(`Malipo ya TZS ${pay.amountTZS.toLocaleString()} yameidhinishwa kwa mafanikio!`, 'success');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#16C784] hover:bg-[#16C784]/90 text-black text-xs font-extrabold transition-all shadow-md shadow-[#16C784]/20"
                      >
                        Idhinisha &amp; Tuma Malipo
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      pay.status === 'approved' 
                        ? 'bg-[#16C784]/20 text-[#16C784] border border-[#16C784]/30' 
                        : pay.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {pay.status === 'approved' ? '✓ Imeidhinishwa & Kulipwa' : pay.status === 'rejected' ? '✕ Imekataliwa' : 'Imeshughulikiwa'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: CONTENT MODERATION (COSOTA & COPYRIGHT REPORTS) */}
      {/* ============================================================== */}
      {activeTab === 'moderation' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" />
                Uhakiki wa Hakimiliki na Maadili (COSOTA &amp; Content Review)
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Kupitia maombi ya hakimiliki ya COSOTA na video zilizoripotiwa na watumiaji.
              </p>
            </div>
            <span className="text-xs text-[#A7B0C0]">{reports.length} ripoti zimesajiliwa</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div 
                key={rep.id}
                className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                      {rep.targetType}
                    </span>
                    <span className="text-xs font-bold text-white">{rep.targetTitle}</span>
                  </div>
                  <p className="text-xs text-amber-300 font-semibold">{rep.reason}</p>
                  <p className="text-[11px] text-[#A7B0C0]">{rep.details}</p>
                  <span className="text-[10px] text-[#A7B0C0] font-mono block">
                    Imeripotiwa: {new Date(rep.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rep.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => {
                          updateReportStatus(rep.id, 'dismissed');
                          showToast('Ripoti imetupiliwa mbali.', 'info');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#262E3E] hover:bg-[#232A39] text-xs font-semibold text-[#A7B0C0] hover:text-white transition-colors"
                      >
                        Tupilia Mbali (Dismiss)
                      </button>
                      <button
                        onClick={() => {
                          updateReportStatus(rep.id, 'action_taken');
                          if (rep.targetType === 'video') {
                            deleteVideo(rep.targetId);
                          }
                          showToast('Hatua imechukuliwa na video kuondolewa.', 'success');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md"
                      >
                        Ondoa Video (Takedown)
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      rep.status === 'action_taken' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-[#16C784]/20 text-[#16C784]'
                    }`}>
                      {rep.status === 'action_taken' ? 'Hatua Imechukuliwa' : 'Imetupiliwa Mbali'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: PLATFORM SETTINGS & AD NETWORK */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Mipangilio ya Mfumo wa Tazama (Platform Global Configuration)
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Kudhibiti asilimia ya mgawanyo wa mapato, kima cha chini cha kutoa fedha, na hali ya usajili.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              {/* Split Settings */}
              <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3">
                <label className="font-bold text-white block">
                  Kamisheni ya Jukwaa la Tazama (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={platformSettings.platformCommissionPercent}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    updatePlatformSettings({
                      platformCommissionPercent: val,
                      creatorRevenuePercent: 100 - val
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-[#A7B0C0] block">
                  Gawio la Waumbaji linakuwa: <strong className="text-[#16C784]">{platformSettings.creatorRevenuePercent}%</strong>
                </span>
              </div>

              {/* Minimum Payout */}
              <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3">
                <label className="font-bold text-white block">
                  Kima cha Chini cha Kutoa Fedha (TZS)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={platformSettings.minPayoutTZS}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 10000;
                    updatePlatformSettings({ minPayoutTZS: val });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#191E29] border border-[#262E3E] text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-[#A7B0C0] block">
                  Hasa kwa miamala ya M-Pesa, Tigo Pesa, na Airtel Money.
                </span>
              </div>

              {/* Registration Toggle */}
              <div className="p-4 rounded-2xl bg-[#10131B] border border-[#262E3E] space-y-3">
                <label className="font-bold text-white block">
                  Usajili wa Watumiaji Wapya
                </label>
                <button
                  onClick={() => {
                    updatePlatformSettings({
                      allowNewRegistrations: !platformSettings.allowNewRegistrations
                    });
                    showToast(
                      platformSettings.allowNewRegistrations 
                        ? 'Usajili wa watumiaji wapya umesitishwa.' 
                        : 'Usajili wa watumiaji wapya umeruhusiwa.', 
                      'info'
                    );
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                    platformSettings.allowNewRegistrations 
                      ? 'bg-[#16C784]/20 text-[#16C784] border border-[#16C784]/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {platformSettings.allowNewRegistrations ? 'Umeruhusiwa (Open)' : 'Umesitishwa (Closed)'}
                </button>
                <span className="text-[10px] text-[#A7B0C0] block">
                  Kudhibiti usajili wakati wa marekebisho ya mfumo.
                </span>
              </div>
            </div>
          </div>

          {/* Ad Network Campaigns Table */}
          <div className="p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#262E3E]">
              Kampeni za Matangazo Zinazoendelea (Ad Network Architecture)
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#262E3E] text-[#A7B0C0]">
                    <th className="pb-2">Tangazo</th>
                    <th className="pb-2">Mteja</th>
                    <th className="pb-2">Aina</th>
                    <th className="pb-2">Matazamio (Impressions)</th>
                    <th className="pb-2">Bajeti (TZS)</th>
                    <th className="pb-2">Hali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262E3E]/60 text-[#A7B0C0]">
                  {SAMPLE_AD_CAMPAIGNS.map((ad) => (
                    <tr key={ad.id}>
                      <td className="py-3 font-semibold text-white">{ad.title}</td>
                      <td className="py-3">{ad.advertiserName}</td>
                      <td className="py-3 uppercase text-[10px] font-mono">{ad.adType}</td>
                      <td className="py-3 font-mono text-white">{ad.impressions.toLocaleString()}</td>
                      <td className="py-3 font-mono font-bold text-[#16C784]">{formatTZS(ad.budgetTZS)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#16C784]/20 text-[#16C784] font-bold">
                          Inaendelea
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: LIVE AUDIT LOG TRAIL */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                Kumbukumbu za Usalama na Ukaguzi wa Mfumo (Live Audit Log Trail)
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Kila kitendo cha msimamizi kinarekodiwa kwa uwazi wa kiwango cha juu.
              </p>
            </div>
            <button
              onClick={() => {
                addAuditLog('SYSTEM_HEALTH_CHECK', 'Server Nodes', 'Ukaguzi wa nodes na seva za utangazaji umekamilika bila hitilafu.');
                showToast('Ukaguzi wa mfumo umerekodiwa.', 'info');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#10131B] border border-[#262E3E] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Pima Mfumo Sasa
            </button>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 rounded-2xl bg-[#10131B] border border-[#262E3E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'REJECTED' 
                        ? 'bg-red-500/20 text-red-400' 
                        : log.status === 'WARNING' 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-[#16C784]/20 text-[#16C784]'
                    }`}>
                      [{log.action}]
                    </span>
                    <span className="font-semibold text-white">{log.target}</span>
                  </div>
                  <p className="text-[11px] text-[#A7B0C0] font-sans">{log.details}</p>
                </div>

                <div className="text-right text-[10px] text-[#A7B0C0] shrink-0">
                  <div>{log.adminEmail}</div>
                  <div className="opacity-70">{new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIALOG 1: CONFIRM DELETE USER MODAL */}
      {/* ============================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191E29] border border-red-500/40 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-lg font-black text-white">
                Futa Mtumiaji Kabisa?
              </h4>
              <p className="text-xs text-[#A7B0C0]">
                Una uhakika unataka kumfuta mtumiaji <strong className="text-white">{userToDelete.displayName}</strong> ({userToDelete.email})?
              </p>
              <p className="text-[11px] text-red-400 font-semibold pt-1">
                Tahadhari: Kitendo hiki hakiwezi kubatilishwa. Kituo chake na video zote alizopakia zitafutwa kabisa kwenye mfumo!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white hover:bg-[#232A39]"
              >
                Ghairi (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Ndio, Futa Mtumiaji
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIALOG 2: BLOCK USER MODAL */}
      {/* ============================================================== */}
      {userToBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191E29] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-lg font-black text-white">
                Zuia Mtumiaji (Block User)
              </h4>
              <p className="text-xs text-[#A7B0C0]">
                Zuia akaunti ya <strong className="text-white">{userToBlock.displayName}</strong> kutumia jukwaa la Tazama.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-white block">
                Sababu ya Kumzuia:
              </label>
              <textarea
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                placeholder="Mfano: Kusambaza maudhui ya kashfa, copyright infringement, au spam..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToBlock(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white hover:bg-[#232A39]"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleConfirmBlockUser}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/30"
              >
                Thibitisha Zuio (Block)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIALOG 3: ADJUST BALANCE MODAL */}
      {/* ============================================================== */}
      {userToEditBalance && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191E29] border border-[#262E3E] w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#16C784]/20 text-[#16C784] flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-lg font-black text-white">
                Rekebisha Salio la Mtumiaji
              </h4>
              <p className="text-xs text-[#A7B0C0]">
                Mtumiaji: <strong className="text-white">{userToEditBalance.displayName}</strong><br />
                Salio la Sasa: <strong className="text-[#16C784] font-mono">{formatTZS(userToEditBalance.balanceTZS)}</strong>
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-white block">
                Kiasi cha Kuingiza au Kupunguza (TZS):
              </label>
              <input
                type="number"
                value={balanceAdjustmentInput}
                onChange={(e) => setBalanceAdjustmentInput(e.target.value)}
                placeholder="Weka 10000 au -5000"
                className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-[#A7B0C0]">
                * Ili kuongeza salio weka namba chanya (k.m. 20000). Ili kupunguza weka alama ya kutoa (k.m. -10000).
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToEditBalance(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white hover:bg-[#232A39]"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleConfirmBalanceAdjustment}
                className="flex-1 py-2.5 rounded-xl bg-[#16C784] hover:bg-[#16C784]/90 text-black text-xs font-extrabold shadow-lg shadow-[#16C784]/30"
              >
                Hifadhi Salio Jipya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIALOG 4: EDIT / CREATE PREMIUM PLAN MODAL */}
      {/* ============================================================== */}
      {(editingPlan || isCreatingPlan) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#191E29] border border-[#262E3E] w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3E]">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">
                  {editingPlan ? `Hariri Kifurushi: ${editingPlan.name}` : `Unda Kifurushi Kipya cha ${planForm.target === 'viewer' ? 'Mtazamaji' : 'Muumbaji'}`}
                </h4>
              </div>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setIsCreatingPlan(false);
                }}
                className="text-[#A7B0C0] hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-white">Jina la Kifurushi:</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-white">Bei (TZS):</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={planForm.priceTZS}
                    onChange={(e) => setPlanForm({ ...planForm, priceTZS: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-white">Maelezo Mafupi (Description):</label>
                <input
                  type="text"
                  required
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-white">Mzunguko wa Malipo:</label>
                  <select
                    value={planForm.billingPeriod}
                    onChange={(e) => setPlanForm({ ...planForm, billingPeriod: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="month">Kila Mwezi</option>
                    <option value="year">Kila Mwaka</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-white">Lebo ya Beji (Badge):</label>
                  <input
                    type="text"
                    value={planForm.badgeLabel}
                    onChange={(e) => setPlanForm({ ...planForm, badgeLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-white">Rangi ya Beji:</label>
                  <input
                    type="color"
                    value={planForm.badgeColor}
                    onChange={(e) => setPlanForm({ ...planForm, badgeColor: e.target.value })}
                    className="w-full h-9 rounded-xl bg-[#10131B] border border-[#262E3E] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-white">Faida (Perks) — Weka moja kwa kila mstari:</label>
                <textarea
                  rows={4}
                  required
                  value={planForm.perks}
                  onChange={(e) => setPlanForm({ ...planForm, perks: e.target.value })}
                  placeholder="Bila matangazo kabisa&#10;Ubora wa 4K Ultra HD&#10;Kupakua video kutazama bila mtandao"
                  className="w-full px-3 py-2 rounded-xl bg-[#10131B] border border-[#262E3E] text-white text-xs focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex items-center gap-5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.popular}
                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    className="rounded text-amber-400 focus:ring-0"
                  />
                  <span className="font-semibold text-white">Weka Alama ya "Maarufu Zaidi"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="rounded text-[#16C784] focus:ring-0"
                  />
                  <span className="font-semibold text-white">Kifurushi Hiki Kinafanya Kazi (Active)</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#262E3E]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreatingPlan(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/30"
                >
                  Hifadhi Kifurushi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIALOG 5: CONFIRM DELETE VIDEO MODAL */}
      {/* ============================================================== */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191E29] border border-red-500/40 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-lg font-black text-white">
                Futa Video Hii Kabisa?
              </h4>
              <p className="text-xs text-[#A7B0C0]">
                Una uhakika unataka kuondoa video <strong className="text-white">"{videoToDelete.title}"</strong> ya kituo cha <strong className="text-white">{videoToDelete.channelName}</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#262E3E] text-xs font-semibold text-[#A7B0C0] hover:text-white"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVideo}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Ndio, Futa Video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
