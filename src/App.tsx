import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { ScannerView } from './components/ScannerView';
import { LeaderboardView } from './components/LeaderboardView';
import { MonthlyGridView } from './components/MonthlyGridView';
import { CardsView } from './components/CardsView';
import { ParticipantsView } from './components/ParticipantsView';
import { Participant, AttendanceRecord } from './types';
import {
  getStoredParticipants,
  saveParticipants,
  getStoredAttendance,
  saveAttendance,
  getActiveRamadanDay,
  setActiveRamadanDay,
  getTotalRamadanNights,
  setTotalRamadanNights,
  INITIAL_PARTICIPANTS,
} from './utils/storage';
import {
  subscribeParticipants,
  subscribeAttendance,
  getParticipantFromCloud,
  saveParticipantToCloud,
  deleteParticipantFromCloud,
  recordAttendanceToCloud,
  removeAttendanceFromCloud,
  batchAddParticipantsToCloud,
  clearAllAttendanceInCloud,
  clearAllDataInCloud,
} from './utils/firebase';
import { Cloud, CloudOff, AlertTriangle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'leaderboard' | 'monthly_grid' | 'cards' | 'participants'>('scanner');
  const [activeDay, setActiveDay] = useState<number>(getActiveRamadanDay());
  const [totalNights, setTotalNightsState] = useState<number>(getTotalRamadanNights());

  const [participants, setParticipants] = useState<Participant[]>(getStoredParticipants());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getStoredAttendance());
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Sync with Firestore in Real-Time
  useEffect(() => {
    let unsubParticipants: (() => void) | null = null;
    let unsubAttendance: (() => void) | null = null;

    try {
      unsubParticipants = subscribeParticipants(
        (cloudList) => {
          setIsCloudConnected(true);
          setCloudError(null);
          // If cloud has data, sync it; if empty and first time, keep local
          if (cloudList.length > 0) {
            setParticipants(cloudList);
            saveParticipants(cloudList);
          } else {
            // Cloud is empty: let's push initial participants to cloud once
            const local = getStoredParticipants();
            if (local.length > 0) {
              batchAddParticipantsToCloud(local).catch(console.error);
            }
          }
        },
        (err) => {
          setIsCloudConnected(false);
          if (err.code === 'permission-denied') {
            setCloudError('قواعد Firestore الحالية تمنع القراءة/الكتابة (if false). يرجى تغييرها إلى (if true) في لوحة Firebase Rules.');
          } else {
            setCloudError('تعذر الاتصال بالسحاب. التطبيق يعمل الآن في وضع التخزين المحلي.');
          }
        }
      );

      unsubAttendance = subscribeAttendance(
        (cloudAtt) => {
          setAttendance(cloudAtt);
          saveAttendance(cloudAtt);
        },
        (err) => {
          console.warn('Attendance subscription error:', err);
        }
      );
    } catch (e) {
      console.error('Firebase subscription init error:', e);
    }

    return () => {
      if (unsubParticipants) unsubParticipants();
      if (unsubAttendance) unsubAttendance();
    };
  }, []);

  const handleSetDay = (day: number) => {
    setActiveDay(day);
    setActiveRamadanDay(day);
  };

  const handleSetTotalNights = (nights: number) => {
    setTotalNightsState(nights);
    setTotalRamadanNights(nights);
  };

  // Record Attendance
  const handleRecordAttendance = async (
    participantId: string,
    ramadanDay: number
  ): Promise<{ success: boolean; message: string; participant?: Participant }> => {
    const cleanId = participantId.trim().toUpperCase();
    let p = participants.find((item) => item.id.trim().toUpperCase() === cleanId);

    // Fallback: Check Firestore directly in case state hadn't updated yet
    if (!p) {
      const cloudP = await getParticipantFromCloud(cleanId);
      if (cloudP) {
        p = cloudP;
        setParticipants((prev) => {
          if (prev.some((x) => x.id.toUpperCase() === cleanId)) return prev;
          return [...prev, cloudP];
        });
      }
    }

    if (!p) {
      return {
        success: false,
        message: `لم يتم العثور على (${cleanId}). تأكد من إضافته أولاً في تبويب "المشاركون".`,
      };
    }

    const already = attendance.some(
      (a) => a.participantId.trim().toUpperCase() === cleanId && a.ramadanDay === ramadanDay
    );

    if (already) {
      return {
        success: false,
        message: `مسجل مسبقاً! الشاب (${p.name}) مسجل حضوره بالفعل في الليلة ${ramadanDay}.`,
        participant: p,
      };
    }

    const newRec: AttendanceRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      participantId: p.id,
      ramadanDay,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };

    // Update local state immediately for zero latency
    const updated = [...attendance, newRec];
    setAttendance(updated);
    saveAttendance(updated);

    // Sync to Cloud
    recordAttendanceToCloud(newRec).catch((err) => {
      console.warn('Sync attendance to cloud failed, saved locally:', err);
    });

    const nightLabel = ramadanDay === 1
      ? 'الليلة 1 من رمضان (ليلة الرؤية)'
      : `الليلة ${ramadanDay} من رمضان`;

    return {
      success: true,
      message: `تقبل الله يا ${p.name}! تم تسجيل حضور صلاة التراويح (${nightLabel} 🌙)`,
      participant: p,
    };
  };

  // Toggle Attendance
  const handleToggleAttendance = async (participantId: string, day: number) => {
    const existing = attendance.find(
      (a) => a.participantId === participantId && a.ramadanDay === day
    );

    if (existing) {
      const updated = attendance.filter((a) => a.id !== existing.id);
      setAttendance(updated);
      saveAttendance(updated);
      removeAttendanceFromCloud(existing.id).catch(console.error);
    } else {
      await handleRecordAttendance(participantId, day);
    }
  };

  // Add Participant
  const handleAddParticipant = async (p: Participant) => {
    try {
      await saveParticipantToCloud(p);
      const updated = [...participants.filter((x) => x.id !== p.id), p];
      setParticipants(updated);
      saveParticipants(updated);
    } catch (e: any) {
      console.error('Failed to save to cloud:', e);
      alert('تعذر الحفظ في فايربيز: ' + (e?.message || e));
    }
  };

  // Bulk Add Participants
  const handleBulkAddParticipants = async (newEntries: Participant[]) => {
    try {
      await batchAddParticipantsToCloud(newEntries);
      const updated = [...participants, ...newEntries];
      setParticipants(updated);
      saveParticipants(updated);
    } catch (e: any) {
      console.error('Failed to batch save to cloud:', e);
      alert('تعذر الحفظ في فايربيز: ' + (e?.message || e));
    }
  };

  // Delete Participant
  const handleDeleteParticipant = async (id: string) => {
    try {
      await deleteParticipantFromCloud(id);
      const updatedP = participants.filter((p) => p.id !== id);
      const updatedA = attendance.filter((a) => a.participantId !== id);
      setParticipants(updatedP);
      setAttendance(updatedA);
      saveParticipants(updatedP);
      saveAttendance(updatedA);
    } catch (e: any) {
      console.error('Failed to delete from cloud:', e);
      alert('تعذر الحذف من فايربيز: ' + (e?.message || e));
    }
  };

  // Clear Attendance
  const handleClearAttendance = async () => {
    setAttendance([]);
    saveAttendance([]);
    clearAllAttendanceInCloud().catch(console.error);
  };

  // Clear All Data
  const handleClearAll = async () => {
    setParticipants([]);
    setAttendance([]);
    saveParticipants([]);
    saveAttendance([]);
    clearAllDataInCloud().catch(console.error);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-between selection:bg-[#f5d77f]/30 selection:text-[#f5d77f] font-sans antialiased">
      {/* Cloud Status Indicator / Rules Warning */}
      {cloudError && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 py-1.5 px-4 text-center text-xs text-amber-200 flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{cloudError}</span>
        </div>
      )}

      {/* Sleek iOS Header */}
      <Header
        activeRamadanDay={activeDay}
        setActiveRamadanDay={handleSetDay}
        totalNights={totalNights}
        setTotalNights={handleSetTotalNights}
        isCloudConnected={isCloudConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'scanner' && (
          <ScannerView
            activeRamadanDay={activeDay}
            participants={participants}
            attendance={attendance}
            onRecordCode={handleRecordAttendance}
            onDoneForPrayer={() => setActiveTab('monthly_grid')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            participants={participants}
            attendance={attendance}
            totalNights={totalNights}
          />
        )}

        {activeTab === 'monthly_grid' && (
          <MonthlyGridView
            participants={participants}
            attendance={attendance}
            activeRamadanDay={activeDay}
            setActiveRamadanDay={handleSetDay}
            totalNights={totalNights}
            onToggleAttendance={handleToggleAttendance}
          />
        )}

        {activeTab === 'cards' && <CardsView participants={participants} />}

        {activeTab === 'participants' && (
          <ParticipantsView
            participants={participants}
            attendance={attendance}
            onAddParticipant={handleAddParticipant}
            onBulkAdd={handleBulkAddParticipants}
            onDeleteParticipant={handleDeleteParticipant}
            onClearAttendance={handleClearAttendance}
            onClearAll={handleClearAll}
          />
        )}
      </main>

      {/* iOS Floating Bottom Tab Bar */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
