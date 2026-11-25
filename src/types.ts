export interface Participant {
  id: string; // e.g. "RMD-101"
  name: string;
  phone?: string;
  guardianPhone?: string;
  category: 'براعم' | 'أشبال' | 'شباب';
  notes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  participantId: string;
  ramadanDay: number; // 1 to 30 (ليلة رمضان)
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
}
