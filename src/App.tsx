import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
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
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-between selection:bg-[#f5d77f]/30 selection:text-[#f5d77f] font-sans antialiased">
      {/* Sleek iOS Header */}
      <Header
        activeRamadanDay={activeDay}
        setActiveRamadanDay={handleSetDay}
        totalNights={totalNights}
        setTotalNights={handleSetTotalNights}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
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

      {/* iOS Floating Bottom Tab Bar */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
