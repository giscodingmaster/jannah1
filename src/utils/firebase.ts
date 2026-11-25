import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { Participant, AttendanceRecord } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCYTJNc5EtacB85WVIcnFGx1Br_5K-KJTs",
  authDomain: "jannah-way.firebaseapp.com",
  projectId: "jannah-way",
  storageBucket: "jannah-way.firebasestorage.app",
  messagingSenderId: "793737289554",
  appId: "1:793737289554:web:3f4d4f2bcd07775e60648b",
  measurementId: "G-EG09QQ1R7Y"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper to remove any undefined fields before sending to Firestore
function cleanObject(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined && obj[key] !== null) {
      result[key] = obj[key];
    }
  }
  return result;
}

// Firestore Collections
export const participantsCol = collection(db, 'participants');
export const attendanceCol = collection(db, 'attendance');

// Realtime subscription helper for participants
export function subscribeParticipants(
  onUpdate: (participants: Participant[]) => void,
  onError?: (err: any) => void
) {
  return onSnapshot(
    participantsCol,
    (snapshot) => {
      const list: Participant[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Participant);
      });
      list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore participants listener error:', err);
      if (onError) onError(err);
    }
  );
}

// Realtime subscription helper for attendance
export function subscribeAttendance(
  onUpdate: (attendance: AttendanceRecord[]) => void,
  onError?: (err: any) => void
) {
  return onSnapshot(
    attendanceCol,
    (snapshot) => {
      const list: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AttendanceRecord);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore attendance listener error:', err);
      if (onError) onError(err);
    }
  );
}

// Fetch single participant from Firestore
export async function getParticipantFromCloud(id: string): Promise<Participant | null> {
  try {
    const snap = await getDoc(doc(db, 'participants', id.trim().toUpperCase()));
    if (snap.exists()) {
      return snap.data() as Participant;
    }
  } catch (e) {
    console.error('getParticipantFromCloud error:', e);
  }
  return null;
}

// Save or Update a Participant
export async function saveParticipantToCloud(participant: Participant) {
  const cleanId = participant.id.trim().toUpperCase();
  const pRef = doc(db, 'participants', cleanId);
  const data = cleanObject({
    id: cleanId,
    name: participant.name.trim(),
    category: participant.category,
    guardianPhone: participant.guardianPhone?.trim() || null,
    phone: participant.phone?.trim() || null,
    notes: participant.notes?.trim() || null,
    createdAt: participant.createdAt || new Date().toISOString(),
  });
  await setDoc(pRef, data, { merge: true });
}

// Delete a Participant
export async function deleteParticipantFromCloud(participantId: string) {
  const cleanId = participantId.trim().toUpperCase();
  const pRef = doc(db, 'participants', cleanId);
  await deleteDoc(pRef);
}

// Record Attendance
export async function recordAttendanceToCloud(record: AttendanceRecord) {
  const aRef = doc(db, 'attendance', record.id);
  const data = cleanObject({
    id: record.id,
    participantId: record.participantId.trim().toUpperCase(),
    ramadanDay: record.ramadanDay,
    date: record.date,
    timestamp: record.timestamp,
  });
  await setDoc(aRef, data);
}

// Remove Attendance (toggle)
export async function removeAttendanceFromCloud(recordId: string) {
  const aRef = doc(db, 'attendance', recordId);
  await deleteDoc(aRef);
}

// Batch Add Participants
export async function batchAddParticipantsToCloud(participants: Participant[]) {
  const batch = writeBatch(db);
  participants.forEach((p) => {
    const cleanId = p.id.trim().toUpperCase();
    const pRef = doc(db, 'participants', cleanId);
    const data = cleanObject({
      id: cleanId,
      name: p.name.trim(),
      category: p.category,
      guardianPhone: p.guardianPhone?.trim() || null,
      phone: p.phone?.trim() || null,
      notes: p.notes?.trim() || null,
      createdAt: p.createdAt || new Date().toISOString(),
    });
    batch.set(pRef, data, { merge: true });
  });
  await batch.commit();
}

// Clear all attendance records
export async function clearAllAttendanceInCloud() {
  const snapshot = await getDocs(attendanceCol);
  const batch = writeBatch(db);
  snapshot.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// Clear all participants and attendance
export async function clearAllDataInCloud() {
  const pSnap = await getDocs(participantsCol);
  const aSnap = await getDocs(attendanceCol);
  const batch = writeBatch(db);
  pSnap.forEach((d) => batch.delete(d.ref));
  aSnap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
