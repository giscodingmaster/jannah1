import React, { useState } from 'react';
import { Moon, Smartphone, SlidersHorizontal, Cloud, CloudOff } from 'lucide-react';
import { InstallModal } from './InstallModal';

interface HeaderProps {
  activeRamadanDay: number;
  setActiveRamadanDay: (day: number) => void;
  totalNights: number;
  setTotalNights: (nights: number) => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeRamadanDay,
  setActiveRamadanDay,
  totalNights,
  setTotalNights,
  isCloudConnected,
}) => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="sticky top-0 z-40 ios-glass border-b border-white/5 transition-all">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d4af37]/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-[#f5d77f]">
            <Moon className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">
                فُرسَانُ التَّرَاوِيح
              </h1>
              {isCloudConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="متصل بالسحاب (مزامنة مباشرة)" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="تخزين محلي" />
              )}
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">مسجد التقوى</p>
          </div>
        </div>

        {/* Right Side: Night Selector Pill & Options */}
        <div className="flex items-center gap-1.5">
          {/* iOS-style Night Picker Pill */}
          <div className="relative">
            <select
              value={activeRamadanDay}
              onChange={(e) => setActiveRamadanDay(Number(e.target.value))}
              className="appearance-none bg-white/[0.08] hover:bg-white/[0.12] active:bg-white/[0.16] text-[#f5d77f] font-semibold text-xs py-1.5 pl-6 pr-3 rounded-full border border-white/10 focus:outline-none transition-all cursor-pointer"
            >
              {Array.from({ length: totalNights }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="bg-[#121a17] text-white">
                  ليلة {d} من رمضان {d === 1 ? '(الرؤية)' : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-[10px]">
              ▼
            </div>
          </div>

          {/* Quick Settings Dropdown/Toggle (29 vs 30 nights) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white transition-all cursor-pointer"
            title="إعدادات الشهر"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Install PWA Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="p-1.5 rounded-full bg-[#f5d77f]/15 hover:bg-[#f5d77f]/25 text-[#f5d77f] transition-all cursor-pointer"
            title="تثبيت التطبيق على الهاتف"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Mini iOS Settings Bar */}
      {showSettings && (
        <div className="border-t border-white/5 bg-black/40 px-4 py-2 text-xs flex items-center justify-between max-w-2xl mx-auto animate-in fade-in duration-200">
          <span className="text-white/50 text-[11px]">طول شهر رمضان:</span>
          <div className="flex items-center bg-white/[0.08] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => {
                setTotalNights(29);
                setShowSettings(false);
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                totalNights === 29 ? 'bg-[#f5d77f] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              29 ليلة
            </button>
            <button
              onClick={() => {
                setTotalNights(30);
                setShowSettings(false);
              }}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                totalNights === 30 ? 'bg-[#f5d77f] text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              30 ليلة
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      <InstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </header>
  );
};
