import React, { useState } from 'react';
import { UserPlus, Trash2, Download, Upload, Users, ShieldAlert, Phone, RefreshCw } from 'lucide-react';
import { Participant } from '../types';
import {
  getStoredParticipants,
  saveParticipants,
  getStoredAttendance,
  saveAttendance,
  INITIAL_PARTICIPANTS,
} from '../utils/storage';

export const ParticipantsView: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>(getStoredParticipants());
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'براعم' | 'أشبال' | 'شباب'>('أشبال');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate unique ID
    const nextNumber = participants.length > 0
      ? Math.max(...participants.map((p) => parseInt(p.id.replace('RMD-', ''), 10) || 100)) + 1
      : 101;
    const newId = `RMD-${nextNumber}`;

    const newParticipant: Participant = {
      id: newId,
      name: name.trim(),
      category,
      guardianPhone: guardianPhone.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [...participants, newParticipant];
    setParticipants(updated);
    saveParticipants(updated);

    setName('');
    setGuardianPhone('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, pName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المتسابق (${pName}) وسجلاته؟`)) {
      const updated = participants.filter((p) => p.id !== id);
      setParticipants(updated);
      saveParticipants(updated);

      // Also clean up attendance for this participant
      const attendance = getStoredAttendance().filter((a) => a.participantId !== id);
      saveAttendance(attendance);
    }
  };

  // Export full JSON Backup
  const handleExportBackup = () => {
    const data = {
      participants: getStoredParticipants(),
      attendance: getStoredAttendance(),
      exportedAt: new Date().toISOString(),
      app: 'Ramadan_Knights_System',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_فرسان_رمضان_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.participants)) {
          saveParticipants(parsed.participants);
          setParticipants(parsed.participants);
        }
        if (Array.isArray(parsed.attendance)) {
          saveAttendance(parsed.attendance);
        }
        alert('تمت استعادة البيانات بنجاح!');
        window.location.reload();
      } catch (err) {
        alert('ملف غير صالح، يرجى اختيار ملف نسخة احتياطية صحيح.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial sample data
  const handleResetSample = () => {
    if (window.confirm('هل تريد إعادة تعيين المشاركين إلى القائمة النموذجية التجريبية؟')) {
      saveParticipants(INITIAL_PARTICIPANTS);
      setParticipants(INITIAL_PARTICIPANTS);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-[#071916] border border-[#d4af37]/30 shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-kufi text-[#fef08a] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" />
            إدارة بيانات المشاركين والنسخ الاحتياطي
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            العدد الحالي: {participants.length} متسابق • البيانات محفوظة محلياً بدون استهلاك أي باقات أو اشتراكات.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] font-black text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة متسابق جديد</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#6ee7b7] border border-[#10b981]/40 text-xs font-bold transition-all cursor-pointer"
            title="تحميل نسخة احتياطية من كل البيانات"
          >
            <Download className="w-4 h-4" />
            <span>نسخ احتياطي</span>
          </button>

          <label className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#cbd5e1] border border-slate-700 text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>استيراد</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Add Form Drawer/Card */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="p-5 rounded-2xl bg-[#0d2a25] border-2 border-[#d4af37]/50 shadow-2xl mb-6"
        >
          <h3 className="text-sm font-bold text-[#fef08a] mb-3">تسجيل مشارك جديد في المسابقة:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">اسم المتسابق ثلاثي:</label>
              <input
                type="text"
                required
                placeholder="مثال: يوسف أحمد محمود"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#061412] border border-[#d4af37]/30 rounded-lg text-xs text-[#f8fafc] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">الفئة العمرية:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'براعم' | 'أشبال' | 'شباب')}
                className="w-full px-3 py-2 bg-[#061412] border border-[#d4af37]/30 rounded-lg text-xs text-[#f8fafc] focus:outline-none focus:border-[#d4af37]"
              >
                <option value="براعم">براعم (ابتدائي)</option>
                <option value="أشبال">أشبال (إعدادي)</option>
                <option value="شباب">شباب (ثانوي / جامعي)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#cbd5e1] mb-1">هاتف ولي الأمر (اختياري):</label>
              <input
                type="tel"
                placeholder="01xxxxxxxxx"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#061412] border border-[#d4af37]/30 rounded-lg text-xs text-[#f8fafc] focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 rounded-lg text-xs text-[#94a3b8] hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#d4af37] text-[#061412] font-black text-xs hover:brightness-110"
            >
              حفظ وتوليد الـ QR
            </button>
          </div>
        </form>
      )}

      {/* Participants Table */}
      <div className="rounded-2xl overflow-hidden border border-[#d4af37]/20 bg-[#071916] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0d2a25] text-[#fef08a] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="py-3 px-4">كود المتسابق</th>
                <th className="py-3 px-4">الاسم</th>
                <th className="py-3 px-4">الفئة</th>
                <th className="py-3 px-4">هاتف ولي الأمر</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-[#cbd5e1]">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-[#10b981]/5 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#6ee7b7]">{p.id}</td>
                  <td className="py-3 px-4 font-semibold text-[#f8fafc]">{p.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-[#cbd5e1]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#94a3b8]">
                    {p.guardianPhone || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                      title="حذف المتسابق"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
