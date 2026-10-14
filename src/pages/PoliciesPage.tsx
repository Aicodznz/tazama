import React, { useState } from 'react';
import { Shield, FileText, Lock, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/i18n';

export const PoliciesPage: React.FC = () => {
  const { language } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'guidelines' | 'copyright'>('terms');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#191E29] border border-[#262E3E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF3040] flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Sera na Vigezo vya Tazama</h1>
            <p className="text-xs text-[#A7B0C0]">Ulinzi wa Watumiaji, Sheria za Hakimiliki (COSOTA), na Mwongozo wa Jamii</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262E3E] pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'terms', label: t.terms, icon: FileText },
          { id: 'privacy', label: t.privacy, icon: Lock },
          { id: 'guidelines', label: t.guidelines, icon: Users },
          { id: 'copyright', label: 'Hakimiliki (COSOTA & DMCA)', icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-[#FF3040] text-white shadow-md' 
                  : 'bg-[#191E29] text-[#A7B0C0] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded-3xl bg-[#191E29] border border-[#262E3E] text-xs text-[#A7B0C0] leading-relaxed space-y-4">
        {activeTab === 'terms' && (
          <>
            <h2 className="text-sm font-bold text-white">1. Vigezo vya Matumizi ya Tazama</h2>
            <p>
              Karibu Tazama (&ldquo;Tazama Platform&rdquo;). Kwa kutumia tovuti na huduma zetu, unakubaliana na masharti haya yanayosimamiwa na sheria za Jamhuri ya Muungano wa Tanzania na sheria za kimataifa za huduma za kidijitali.
            </p>
            <h3 className="text-xs font-bold text-white pt-2">2. Akaunti na Umiliki wa Maudhui</h3>
            <p>
              Mtayarishaji anabaki kuwa mmiliki halali wa kazi yake ya sanaa au video. Kwa kupakia kwenye Tazama, mtayarishaji anatupatia leseni ya kusambaza na kuonyesha video hiyo kwa ubora unaofaa kwa watumiaji.
            </p>
            <h3 className="text-xs font-bold text-white pt-2">3. Mapato na Gawio (70/30 Rule)</h3>
            <p>
              Watayarishaji wanaokidhi vigezo hupokea 70% ya mapato halisi yaliyothibitishwa yanayotokana na matangazo, michango ya uanachama, na zawadi za kidijitali, huku 30% ikigharamia miundombinu na usalama wa seva.
            </p>
          </>
        )}

        {activeTab === 'privacy' && (
          <>
            <h2 className="text-sm font-bold text-white">Sera ya Faragha ya Tazama (Privacy Policy)</h2>
            <p>
              Tazama inazingatia Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania ya mwaka 2022. Hatutoi, hatuuzi, wala hatushiriki taarifa zako binafsi kwa mtu au shirika lolote la nje bila idhini yako.
            </p>
            <h3 className="text-xs font-bold text-white pt-2">Taarifa Tunazokusanya</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Anwani ya barua pepe na jina la mtumiaji (kwa njia salama ya Firebase Authentication).</li>
              <li>Rekodi za matamzo na takwimu za utazamaji kwa ajili ya kuboresha mapendekezo ya maudhui.</li>
              <li>Taarifa za muamala wa kifedha (bila kuhifadhi namba za siri za simu au PIN za M-Pesa).</li>
            </ul>
          </>
        )}

        {activeTab === 'guidelines' && (
          <>
            <h2 className="text-sm font-bold text-white">Miongozo ya Jumuiya (Community Guidelines)</h2>
            <p>
              Tazama ni jukwaa la heshima na maendeleo kwa jamii yote ya Tanzania na Afrika. Yafuatayo yamepigwa marufuku kabisa:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-red-300">
              <li>Kupakia picha au video za ngono au utupu usio na staha.</li>
              <li>Lugha za matusi, uchochezi wa kikabila au kidini, na vitisho vya vurugu.</li>
              <li>Utapeli wa fedha, michango ya uongo au propaganda za upotoshaji.</li>
            </ul>
          </>
        )}

        {activeTab === 'copyright' && (
          <>
            <h2 className="text-sm font-bold text-white">Sera ya Hakimiliki (COSOTA Tanzania & DMCA)</h2>
            <p>
              Tazama inatambua na kuheshimu sheria za Chama cha Hakimiliki Tanzania (COSOTA). Iwapo wewe ni mmiliki halali wa kazi yoyote ya muziki au filamu na unahisi imepakiwa bila ruhusa yako:
            </p>
            <p className="p-3 bg-[#10131B] rounded-xl border border-[#262E3E] text-white">
              Tuma barua pepe kwenda: <span className="text-[#FF3040] font-mono">copyright@tazama.co.tz</span> au tumia kitufe cha &ldquo;Ripoti Video&rdquo; kilichopo chini ya video yoyote.
            </p>
          </>
        )}
      </div>

    </div>
  );
};
