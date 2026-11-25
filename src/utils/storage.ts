import { Participant, AttendanceRecord } from '../types';

const PARTICIPANTS_KEY = 'ramadan_participants_v2';
const ATTENDANCE_KEY = 'ramadan_attendance_v2';
const ACTIVE_DAY_KEY = 'ramadan_active_day_v2';
const TOTAL_NIGHTS_KEY = 'ramadan_total_nights_v2';

export const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'RMD-101', name: 'عمر أحمد إبراهيم', category: 'أشبال', guardianPhone: '01012345678', createdAt: new Date().toISOString() },
  { id: 'RMD-102', name: 'يوسف محمد خليل', category: 'شباب', guardianPhone: '01123456789', createdAt: new Date().toISOString() },
  { id: 'RMD-103', name: 'حمزة خالد محمود', category: 'براعم', guardianPhone: '01234567890', createdAt: new Date().toISOString() },
  { id: 'RMD-104', name: 'عبد الرحمن ياسر', category: 'أشبال', guardianPhone: '01098765432', createdAt: new Date().toISOString() },
  { id: 'RMD-105', name: 'بلال مصطفى علي', category: 'شباب', guardianPhone: '01512345678', createdAt: new Date().toISOString() },
  { id: 'RMD-106', name: 'أنس طارق حسين', category: 'براعم', guardianPhone: '01055554444', createdAt: new Date().toISOString() },
  { id: 'RMD-107', name: 'سيف الدين ماجد', category: 'أشبال', guardianPhone: '01177778888', createdAt: new Date().toISOString() },
  { id: 'RMD-108', name: 'يحيى كريم السيد', category: 'شباب', guardianPhone: '01299990000', createdAt: new Date().toISOString() },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Night 1 (ليلة الرؤية قبل أول صيام)
  { id: 'rec-1-101', participantId: 'RMD-101', ramadanDay: 1, date: '2026-03-01', timestamp: new Date().toISOString() },
  { id: 'rec-1-102', participantId: 'RMD-102', ramadanDay: 1, date: '2026-03-01', timestamp: new Date().toISOString() },
  { id: 'rec-1-103', participantId: 'RMD-103', ramadanDay: 1, date: '2026-03-01', timestamp: new Date().toISOString() },
  { id: 'rec-1-104', participantId: 'RMD-104', ramadanDay: 1, date: '2026-03-01', timestamp: new Date().toISOString() },
  { id: 'rec-1-105', participantId: 'RMD-105', ramadanDay: 1, date: '2026-03-01', timestamp: new Date().toISOString() },
  // Night 2
  { id: 'rec-2-101', participantId: 'RMD-101', ramadanDay: 2, date: '2026-03-02', timestamp: new Date().toISOString() },
  { id: 'rec-2-102', participantId: 'RMD-102', ramadanDay: 2, date: '2026-03-02', timestamp: new Date().toISOString() },
  { id: 'rec-2-103', participantId: 'RMD-103', ramadanDay: 2, date: '2026-03-02', timestamp: new Date().toISOString() },
  { id: 'rec-2-106', participantId: 'RMD-106', ramadanDay: 2, date: '2026-03-02', timestamp: new Date().toISOString() },
  // Night 3
  { id: 'rec-3-101', participantId: 'RMD-101', ramadanDay: 3, date: '2026-03-03', timestamp: new Date().toISOString() },
  { id: 'rec-3-102', participantId: 'RMD-102', ramadanDay: 3, date: '2026-03-03', timestamp: new Date().toISOString() },
  { id: 'rec-3-104', participantId: 'RMD-104', ramadanDay: 3, date: '2026-03-03', timestamp: new Date().toISOString() },
  { id: 'rec-3-107', participantId: 'RMD-107', ramadanDay: 3, date: '2026-03-03', timestamp: new Date().toISOString() },
];

export function getStoredParticipants(): Participant[] {
  const data = localStorage.getItem(PARTICIPANTS_KEY);
  if (!data) {
    localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
    return INITIAL_PARTICIPANTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PARTICIPANTS;
  }
}

export function saveParticipants(participants: Participant[]) {
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
}

export function getStoredAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  if (!data) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE));
    return INITIAL_ATTENDANCE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ATTENDANCE;
  }
}

export function saveAttendance(attendance: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
}

export function getActiveRamadanDay(): number {
  const day = localStorage.getItem(ACTIVE_DAY_KEY);
  return day ? parseInt(day, 10) : 1;
}

export function setActiveRamadanDay(day: number) {
  localStorage.setItem(ACTIVE_DAY_KEY, day.toString());
}

export function getTotalRamadanNights(): number {
  const nights = localStorage.getItem(TOTAL_NIGHTS_KEY);
  return nights ? parseInt(nights, 10) : 30;
}

export function setTotalRamadanNights(nights: number) {
  localStorage.setItem(TOTAL_NIGHTS_KEY, nights.toString());
}

// Record Taraweeh attendance for a specific Ramadan night
export function recordTaraweehAttendance(
  participantId: string,
  ramadanDay: number
): { success: boolean; message: string; record?: AttendanceRecord; participant?: Participant } {
  const participants = getStoredParticipants();
  const participant = participants.find(p => p.id === participantId);

  if (!participant) {
    return { success: false, message: `لم يتم العثور على متسابق بهذا الكود: (${participantId})` };
  }

  const attendance = getStoredAttendance();
  const alreadyRecorded = attendance.some(
    a => a.participantId === participantId && a.ramadanDay === ramadanDay
  );

  if (alreadyRecorded) {
    return {
      success: false,
      message: `مسجل مسبقاً! الشاب (${participant.name}) مسجل حضوره بالفعل في الليلة ${ramadanDay}.`,
      participant
    };
  }

  const newRecord: AttendanceRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    participantId,
    ramadanDay,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
  };

  attendance.push(newRecord);
  saveAttendance(attendance);

  const nightLabel = ramadanDay === 1
    ? 'الليلة 1 من رمضان (ليلة الرؤية - تسبق أول صيام)'
    : `الليلة ${ramadanDay} من رمضان`;

  return {
    success: true,
    message: `تقبل الله يا ${participant.name}! تم تسجيل حضور صلاة التراويح (${nightLabel} 🌙)`,
    record: newRecord,
    participant
  };
}

export function removeTaraweehAttendance(participantId: string, ramadanDay: number) {
  const attendance = getStoredAttendance();
  const filtered = attendance.filter(
    a => !(a.participantId === participantId && a.ramadanDay === ramadanDay)
  );
  saveAttendance(filtered);
}
