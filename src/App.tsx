import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScannerView } from './components/ScannerView';
import { LeaderboardView } from './components/LeaderboardView';
import { MonthlyGridView } from './components/MonthlyGridView';
import { CardsView } from './components/CardsView';
import { ParticipantsView } from './components/ParticipantsView';
import {
  getActiveRamadanDay,
  setActiveRamadanDay,
  getTotalRamadanNights,
  setTotalRamadanNights,
} from './utils/storage';
import { Moon, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'leaderboard' | 'monthly_grid' | 'cards' | 'participants'>('scanner');
  const [activeDay, setActiveDay] = useState<number>(getActiveRamadanDay());
  const [totalNights, setTotalNightsState] = useState<number>(getTotalRamadanNights());

  const handleSetDay = (day: number) => {
    setActiveDay(day);
    setActiveRamadanDay(day);
  };

  const handleSetTotalNights = (nights: number) => {
    setTotalNightsState(nights);
    setTotalRamadanNights(nights);
  };

  return (
    <div className="min-h-screen bg-islamic-pattern text-[#f8fafc] flex flex-col justify-between selection:bg-[#d4af37]/30 selection:text-[#fef08a]">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRamadanDay={activeDay}
        setActiveRamadanDay={handleSetDay}
        totalNights={totalNights}
        setTotalNights={handleSetTotalNights}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-4">
        {activeTab === 'scanner' && (
          <ScannerView
            activeRamadanDay={activeDay}
            onDoneForPrayer={() => setActiveTab('monthly_grid')}
          />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView totalNights={totalNights} />}

        {activeTab === 'monthly_grid' && (
          <MonthlyGridView
            activeRamadanDay={activeDay}
            setActiveRamadanDay={handleSetDay}
            totalNights={totalNights}
          />
        )}

        {activeTab === 'cards' && <CardsView />}

        {activeTab === 'participants' && <ParticipantsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d4af37]/15 bg-[#061412]/80 backdrop-blur-md py-4 text-center text-xs text-[#94a3b8] print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[#fef08a]">
            <Moon className="w-4 h-4 text-[#d4af37]" />
            <span className="font-kufi font-bold">فرسان التراويح | شهر رمضان المبارك</span>
            <span className="text-[11px] text-[#94a3b8]">| تقبل الله صيامكم وقيامكم</span>
          </div>
          <div className="flex items-center gap-1">
            <span>نظام رصد صلاة التراويح فائق الدقة بدون أي تكاليف أو حصص سحابية</span>
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
