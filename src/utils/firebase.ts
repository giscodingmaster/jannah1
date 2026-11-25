import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
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

// Firestore Collections
export const participantsCol = collection(db, 'participants');
export const attendanceCol = collection(db, 'attendance');
export const settingsDoc = doc(db, 'settings', 'config');

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
      // Sort by id or createdAt
      list.sort((a, b) => a.id.localeCompare(b.id));
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

// Save or Update a Participant
export async function saveParticipantToCloud(participant: Participant) {
  const pRef = doc(db, 'participants', participant.id);
  await setDoc(pRef, participant, { merge: true });
}

// Delete a Participant
export async function deleteParticipantFromCloud(participantId: string) {
  const pRef = doc(db, 'participants', participantId);
  await deleteDoc(pRef);
}

// Record Attendance
export async function recordAttendanceToCloud(record: AttendanceRecord) {
  const aRef = doc(db, 'attendance', record.id);
  await setDoc(aRef, record);
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
    const pRef = doc(db, 'participants', p.id);
    batch.set(pRef, p, { merge: true });
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
