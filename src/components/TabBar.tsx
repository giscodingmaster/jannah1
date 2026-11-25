import React from 'react';
import { Camera, Trophy, CalendarDays, QrCode, Users } from 'lucide-react';

interface TabBarProps {
  activeTab: 'scanner' | 'leaderboard' | 'monthly_grid' | 'cards' | 'participants';
  setActiveTab: (tab: 'scanner' | 'leaderboard' | 'monthly_grid' | 'cards' | 'participants') => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'scanner', label: 'الماسح', icon: Camera },
    { id: 'leaderboard', label: 'المتصدرين', icon: Trophy },
    { id: 'monthly_grid', label: 'السجل', icon: CalendarDays },
    { id: 'cards', label: 'البطاقات', icon: QrCode },
    { id: 'participants', label: 'المشاركون', icon: Users },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 print:hidden">
      {/* iOS Frosted Glass Tab Bar */}
      <div className="ios-glass border-t border-white/10 px-4 pt-2 pb-5 sm:pb-3 max-w-lg mx-auto sm:rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#f5d77f] scale-105'
                    : 'text-white/45 hover:text-white/75 active:scale-95'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#f5d77f]/15' : ''}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className={`text-[11px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-[#f5d77f]' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
