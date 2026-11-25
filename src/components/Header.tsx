import React, { useState } from 'react';
import { Moon, Sparkles, Trophy, QrCode, Users, Calendar, Camera, Smartphone, Info } from 'lucide-react';
import { InstallModal } from './InstallModal';

interface HeaderProps {
  activeTab: 'scanner' | 'leaderboard' | 'monthly_grid' | 'cards' | 'participants';
  setActiveTab: (tab: 'scanner' | 'leaderboard' | 'monthly_grid' | 'cards' | 'participants') => void;
  activeRamadanDay: number;
  setActiveRamadanDay: (day: number) => void;
  totalNights: number;
  setTotalNights: (nights: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeRamadanDay,
  setActiveRamadanDay,
  totalNights,
  setTotalNights,
}) => {
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <header className="relative border-b border-[#d4af37]/20 bg-[#071916]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Decorative top gold line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      {/* Jurisprudence Fiqh Banner */}
      <div className="bg-[#04100e] border-b border-[#d4af37]/15 py-1 px-4 text-center text-[11px] text-[#fef08a] flex items-center justify-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
        <span>
          <strong>تنبيه فقهي معتمد:</strong> صلاة التراويح تبدأ شرعاً من <strong>ليلة 1 رمضان</strong> (مساء يوم الرؤية بعد مغرب آخر شعبان وقبل أول فجر صيام).
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar with title and quick controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('leaderboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10b981]/20 to-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center shadow-lg shadow-[#d4af37]/10">
              <Moon className="w-6 h-6 text-[#fef08a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-kufi text-[#fef08a] tracking-wide">
                  فُرسَانُ التَّرَاوِيح
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-bold">
                  مسابقة صلاة التراويح
                </span>
              </div>
              <p className="text-xs text-[#a7f3d0]/80">منظومة رصد حضور التراويح لليالي الشهر المبارك ({totalNights} ليلة)</p>
            </div>
          </div>

          {/* Right Controls: Month Length + Night Picker + Mobile PWA */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Total Month Nights Switcher (29 or 30 nights) */}
            <div className="flex items-center gap-1 bg-[#061412] px-2 py-1 rounded-xl border border-[#d4af37]/30 text-xs">
              <span className="text-[10px] text-[#94a3b8]">طول الشهر:</span>
              <button
                onClick={() => setTotalNights(29)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  totalNights === 29
                    ? 'bg-[#d4af37] text-[#061412]'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
                title="رمضان 29 ليلة (في حال ثبت هلال شوال ليلة 30)"
              >
                29 ليلة
              </button>
              <button
                onClick={() => setTotalNights(30)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  totalNights === 30
                    ? 'bg-[#d4af37] text-[#061412]'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
                title="رمضان 30 ليلة كاملة"
              >
                30 ليلة
              </button>
            </div>

            {/* Active Night Selector */}
            <div className="flex items-center gap-2 bg-[#0d2a25]/90 px-3 py-1.5 rounded-xl border border-[#d4af37]/30 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[#cbd5e1] font-semibold">الليلة:</span>
              <select
                value={activeRamadanDay}
                onChange={(e) => setActiveRamadanDay(Number(e.target.value))}
                className="bg-[#061412] text-[#fef08a] font-black px-2.5 py-1 rounded-lg border border-[#d4af37]/40 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: totalNights }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d} className="bg-[#071916] text-[#f8fafc]">
                    {d === 1
                      ? 'الليلة 1 (ليلة الرؤية - تسبق أول صيام)'
                      : d === totalNights
                      ? `الليلة ${d} (ختام صلاة التراويح)`
                      : `الليلة ${d} (تسبق صيام يوم ${d})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Open / Install on Mobile PWA button */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#10b981]/20 to-[#d4af37]/20 hover:from-[#10b981]/30 hover:to-[#d4af37]/30 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="تثبيت التطبيق على الهاتف PWA"
            >
              <Smartphone className="w-4 h-4 text-[#6ee7b7]" />
              <span>تثبيت على الموبايل</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-[#d4af37]/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] shadow-md shadow-[#d4af37]/20 font-bold'
                : 'text-[#cbd5e1] hover:text-[#fef08a] hover:bg-[#10b981]/10'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>ماسح التراويح السريع</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] shadow-md shadow-[#d4af37]/20 font-bold'
                : 'text-[#cbd5e1] hover:text-[#fef08a] hover:bg-[#10b981]/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>لوحة المتصدرين وتصنيف الجوائز</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly_grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'monthly_grid'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] shadow-md shadow-[#d4af37]/20 font-bold'
                : 'text-[#cbd5e1] hover:text-[#fef08a] hover:bg-[#10b981]/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>سجل ليالي الشهر ({totalNights} ليلة)</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] shadow-md shadow-[#d4af37]/20 font-bold'
                : 'text-[#cbd5e1] hover:text-[#fef08a] hover:bg-[#10b981]/10'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>بطاقات الـ QR للطباعة</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'participants'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] shadow-md shadow-[#d4af37]/20 font-bold'
                : 'text-[#cbd5e1] hover:text-[#fef08a] hover:bg-[#10b981]/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة المشاركين</span>
          </button>
        </nav>
      </div>

      {/* PWA Install Modal */}
      <InstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </header>
  );
};
