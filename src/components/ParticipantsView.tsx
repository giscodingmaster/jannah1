import React, { useState } from 'react';
import { UserPlus, Trash2, Download, Upload, Users, X, RotateCcw, FileText, Check } from 'lucide-react';
import { Participant, AttendanceRecord } from '../types';

interface ParticipantsViewProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  onAddParticipant: (p: Participant) => Promise<void>;
  onBulkAdd: (entries: Participant[]) => Promise<void>;
  onDeleteParticipant: (id: string) => Promise<void>;
  onClearAttendance: () => Promise<void>;
  onClearAll: () => Promise<void>;
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({
  participants,
  attendance,
  onAddParticipant,
  onBulkAdd,
  onDeleteParticipant,
  onClearAttendance,
  onClearAll,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'براعم' | 'أشبال' | 'شباب'>('أشبال');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState<'براعم' | 'أشبال' | 'شباب'>('أشبال');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
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

    await onAddParticipant(newParticipant);

    setName('');
    setGuardianPhone('');
    setShowAddForm(false);
    showToast(`تمت إضافة ${newParticipant.name} ومزامنته سحابياً`);
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    let currentNumber = participants.length > 0
      ? Math.max(...participants.map((p) => parseInt(p.id.replace('RMD-', ''), 10) || 100))
      : 100;

    const newEntries: Participant[] = lines.map(lineName => {
      currentNumber += 1;
      return {
        id: `RMD-${currentNumber}`,
        name: lineName,
        category: bulkCategory,
        createdAt: new Date().toISOString(),
      };
    });

    await onBulkAdd(newEntries);
    setBulkText('');
    setShowBulkModal(false);
    showToast(`تمت إضافة ${newEntries.length} متسابق دفعة واحدة ومزامنتهم سحابياً`);
  };

  const handleDelete = async (id: string, pName: string) => {
    if (window.confirm(`حذف المتسابق (${pName}) وسجلاته نهائياً من السحاب وجميع الأجهزة؟`)) {
      await onDeleteParticipant(id);
      showToast(`تم حذف ${pName}`);
    }
  };

  const handleClearAttendance = async () => {
    if (window.confirm('هل تريد تصفير سجلات الحضور في السحاب لجميع الأيام لتجربة المسح من البداية؟ (لن يتم حذف أسماء المتسابقين)')) {
      await onClearAttendance();
      showToast('تم تصفير سجلات الحضور، يمكنك تجربة المسح الآن');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('هل تريد حذف جميع المتسابقين التجريبيين وسجلاتهم من السحاب للبدء ببيانات جديدة تماماً للمسجد؟')) {
      await onClearAll();
      showToast('تم إفراغ قاعدة البيانات، يمكنك الآن إدخال أسماء المسجد');
    }
  };

  const handleExportBackup = () => {
    const data = {
      participants,
      attendance,
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

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.participants)) {
          await onBulkAdd(parsed.participants);
        }
        showToast('تمت استعادة ومزامنة النسخة الاحتياطية بنجاح');
      } catch (err) {
        alert('ملف غير صالح');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2 pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full ios-glass text-xs font-bold text-[#f5d77f] border border-[#f5d77f]/40 shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">إدارة الأسماء والبطاقات</h2>
          <p className="text-xs text-white/40">{participants.length} مسجل بالمسابقة (مزامنة سحابية)</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(true)}
            className="py-1.5 px-3 rounded-full apple-gold-bg text-black font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ فردي</span>
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            className="py-1.5 px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all border border-white/10"
            title="إضافة قائمة أسماء كاملة دفعة واحدة"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ مجموعة</span>
          </button>
        </div>
      </div>

      {/* Control Actions (Reset & Backup) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleClearAttendance}
          className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-right flex items-center justify-between transition-all cursor-pointer"
        >
          <div>
            <span className="text-xs font-bold text-white block">تصفير سجلات الحضور</span>
            <span className="text-[10px] text-white/40">لتجربة المسح من البداية</span>
          </div>
          <RotateCcw className="w-4 h-4 text-amber-400/80" />
        </button>

        <button
          onClick={handleClearAll}
          className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-red-500/10 border border-white/5 text-right flex items-center justify-between transition-all cursor-pointer"
        >
          <div>
            <span className="text-xs font-bold text-red-300 block">حذف الكل</span>
            <span className="text-[10px] text-white/40">حذف الأسماء التجريبية</span>
          </div>
          <Trash2 className="w-4 h-4 text-red-400/70" />
        </button>
      </div>

      {/* Backup & Restore Row */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-4 text-xs">
        <span className="text-white/60">النسخ الاحتياطي:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="py-1 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/80 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل نسخة (JSON)</span>
          </button>

          <label className="py-1 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/80 transition-all flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>استيراد</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Single Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
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
                <label className="block text-[11px] text-white/60 mb-1">الاسم ثلاثي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود إبراهيم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f5d77f]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">الفئة العمرية:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'براعم' | 'أشبال' | 'شباب')}
                  className="w-full py-2 px-3 bg-[#121a17] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#f5d77f]"
                >
                  <option value="براعم">براعم (ابتدائي)</option>
                  <option value="أشبال">أشبال (إعدادي)</option>
                  <option value="شباب">شباب (ثانوي / جامعي)</option>
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
                حفظ ومزامنة سحابية
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleBulkAdd}
            className="w-full max-w-md rounded-3xl bg-[#121a17] border border-white/10 p-5 shadow-2xl text-right animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">إضافة مجموعة أسماء دفعة واحدة</h3>
                <p className="text-[11px] text-white/40 mt-0.5">الصق الأسماء كل اسم في سطر جديد</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-full bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] text-white/60 mb-1">الفئة الافتراضية للأسماء:</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value as 'براعم' | 'أشبال' | 'شباب')}
                  className="w-full py-2 px-3 bg-[#121a17] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#f5d77f]"
                >
                  <option value="براعم">براعم (ابتدائي)</option>
                  <option value="أشبال">أشبال (إعدادي)</option>
                  <option value="شباب">شباب (ثانوي / جامعي)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">قائمة الأسماء:</label>
                <textarea
                  rows={6}
                  required
                  placeholder={`عمر أحمد\nيوسف محمد\nحمزة خالد\nعبد الرحمن ياسر`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full py-2 px-3 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f5d77f] font-sans"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl apple-gold-bg text-black font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                توليد ومزامنة الجميع سحابياً
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Participants Grouped List */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        {participants.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-xs">
            لا توجد أسماء مسجلة حالياً. اضغط على "+ فردي" أو "+ مجموعة" لإضافة المتسابقين.
          </div>
        ) : (
          participants.map((p) => (
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
          ))
        )}
      </div>
    </div>
  );
};
