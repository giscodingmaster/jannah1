import React, { useState } from 'react';
import { UserPlus, Trash2, Download, Upload, Users, X } from 'lucide-react';
import { Participant } from '../types';
import {
  getStoredParticipants,
  saveParticipants,
  getStoredAttendance,
  saveAttendance,
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
    if (window.confirm(`حذف المتسابق (${pName}) وسجلاته؟`)) {
      const updated = participants.filter((p) => p.id !== id);
      setParticipants(updated);
      saveParticipants(updated);

      const attendance = getStoredAttendance().filter((a) => a.participantId !== id);
      saveAttendance(attendance);
    }
  };

  const handleExportBackup = () => {
    const data = {
      participants: getStoredParticipants(),
      attendance: getStoredAttendance(),
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_التراويح_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
        alert('تمت الاستعادة بنجاح');
        window.location.reload();
      } catch (err) {
        alert('ملف غير صالح');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">المشاركون</h2>
          <p className="text-xs text-white/40">{participants.length} مسجل</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="py-1.5 px-3 rounded-full apple-gold-bg text-black font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إضافة</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white transition-all cursor-pointer"
            title="نسخ احتياطي"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white transition-all cursor-pointer"
            title="استيراد نسخة"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleAdd}
            className="w-full max-w-sm rounded-3xl bg-[#121a17] border border-white/10 p-5 shadow-2xl text-right animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white">إضافة متسابق جديد</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-full bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] text-white/60 mb-1">الاسم:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f5d77f]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">الفئة:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'براعم' | 'أشبال' | 'شباب')}
                  className="w-full py-2 px-3 bg-[#121a17] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#f5d77f]"
                >
                  <option value="براعم">براعم</option>
                  <option value="أشبال">أشبال</option>
                  <option value="شباب">شباب</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">هاتف ولي الأمر (اختياري):</label>
                <input
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full py-2 px-3 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f5d77f]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl apple-gold-bg text-black font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                حفظ وإصدار QR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped List Style (iOS Settings) */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        {participants.map((p) => (
          <div key={p.id} className="p-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
            <div>
              <h4 className="text-xs font-bold text-white">{p.name}</h4>
              <span className="text-[10px] text-white/40">{p.id} • {p.category} {p.guardianPhone ? `• ${p.guardianPhone}` : ''}</span>
            </div>

            <button
              onClick={() => handleDelete(p.id, p.name)}
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
