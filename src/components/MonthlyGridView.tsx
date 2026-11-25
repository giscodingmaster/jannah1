import React, { useState } from 'react';
import { Calendar, CheckCircle2, Sparkles, Moon, Download, Info } from 'lucide-react';
import { Participant, AttendanceRecord } from '../types';
import {
  getStoredParticipants,
  getStoredAttendance,
  recordTaraweehAttendance,
  removeTaraweehAttendance,
} from '../utils/storage';

interface MonthlyGridViewProps {
  activeRamadanDay: number;
  setActiveRamadanDay: (day: number) => void;
  totalNights: number;
}

export const MonthlyGridView: React.FC<MonthlyGridViewProps> = ({
  activeRamadanDay,
  setActiveRamadanDay,
  totalNights,
}) => {
  const [participants] = useState<Participant[]>(getStoredParticipants());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getStoredAttendance());

  const days = Array.from({ length: totalNights }, (_, i) => i + 1);

  const toggleDayAttendance = (participantId: string, day: number) => {
    const isPresent = attendance.some(
      (a) => a.participantId === participantId && a.ramadanDay === day
    );

    if (isPresent) {
      removeTaraweehAttendance(participantId, day);
    } else {
      recordTaraweehAttendance(participantId, day);
    }

    setAttendance(getStoredAttendance());
  };

  // Export full grid as CSV
  const exportGridCsv = () => {
    const headers = ['الكود', 'الاسم', 'الفئة', ...days.map((d) => `ليلة ${d}`), 'إجمالي الحضور', 'النسبة المئوية'];
    const rows = participants.map((p) => {
      const attendedDays = days.map((d) =>
        attendance.some((a) => a.participantId === p.id && a.ramadanDay === d) ? 'حاضر' : 'غائب'
      );
      const total = attendance.filter((a) => a.participantId === p.id && a.ramadanDay <= totalNights).length;
      const pct = `${Math.round((total / totalNights) * 100)}%`;
      return [p.id, p.name, p.category, ...attendedDays, `${total} / ${totalNights}`, pct];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `كشف_تراويح_رمضان_${totalNights}_ليلة.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#071916] border border-[#d4af37]/30 shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-kufi text-[#fef08a] flex items-center gap-2">
            <Moon className="w-5 h-5 text-[#d4af37]" />
            سجل صلاة التراويح لليالي شهر رمضان ({totalNights} ليلة)
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            <strong>تذكير:</strong> الليلة 1 هي ليلة الرؤية (مساء آخر يوم شعبان قبل صيام اليوم الأول) • انقر على أي خلية للتحضير أو الإلغاء فوراً.
          </p>
        </div>

        <button
          onClick={exportGridCsv}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#6ee7b7] border border-[#10b981]/40 text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>تصدير كشف الـ {totalNights} ليلة (Excel)</span>
        </button>
      </div>

      {/* Grid Table */}
      <div className="rounded-2xl overflow-hidden border border-[#d4af37]/20 bg-[#071916] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0d2a25] text-[#fef08a] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="py-3 px-3 sticky right-0 bg-[#0d2a25] z-20 shadow-md">المتسابق</th>
                <th className="py-3 px-2 text-center">الفئة</th>
                {days.map((d) => (
                  <th
                    key={d}
                    onClick={() => setActiveRamadanDay(d)}
                    className={`py-2 px-1 text-center min-w-[32px] cursor-pointer transition-colors ${
                      d === activeRamadanDay
                        ? 'bg-[#d4af37] text-[#061412] font-black'
                        : 'hover:bg-[#10b981]/20'
                    }`}
                    title={d === 1 ? 'الليلة 1 (ليلة الرؤية - تسبق أول صيام)' : `الليلة ${d} من رمضان`}
                  >
                    <span>{d}</span>
                  </th>
                ))}
                <th className="py-3 px-3 text-center sticky left-0 bg-[#0d2a25] z-20 shadow-md">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-[#cbd5e1]">
              {participants.map((p) => {
                const totalAttended = attendance.filter(
                  (a) => a.participantId === p.id && a.ramadanDay <= totalNights
                ).length;
                const percentage = Math.round((totalAttended / totalNights) * 100);

                return (
                  <tr key={p.id} className="hover:bg-[#10b981]/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#f8fafc] sticky right-0 bg-[#071916] z-10 whitespace-nowrap">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-[#94a3b8] font-mono">{p.id}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-[#cbd5e1] whitespace-nowrap">
                        {p.category}
                      </span>
                    </td>

                    {/* Nights Cells */}
                    {days.map((day) => {
                      const isPresent = attendance.some(
                        (a) => a.participantId === p.id && a.ramadanDay === day
                      );

                      return (
                        <td key={day} className="py-2 px-1 text-center">
                          <button
                            onClick={() => toggleDayAttendance(p.id, day)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto text-[11px] font-bold transition-all cursor-pointer ${
                              isPresent
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                                : 'bg-[#061412] text-slate-700 border border-slate-900 hover:border-[#d4af37]/30 hover:text-slate-400'
                            }`}
                            title={
                              isPresent
                                ? `حاضر تراويح الليلة ${day} (اضغط للإلغاء)`
                                : `غير مسجل في الليلة ${day} (اضغط للتحضير)`
                            }
                          >
                            {isPresent ? '✓' : '·'}
                          </button>
                        </td>
                      );
                    })}

                    {/* Total & Percentage */}
                    <td className="py-3 px-3 text-center sticky left-0 bg-[#071916] z-10 whitespace-nowrap">
                      <div className="font-black text-sm text-[#fef08a]">{totalAttended} / {totalNights}</div>
                      <div className="text-[10px] text-[#6ee7b7]">{percentage}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Summary Footer Row */}
            <tfoot className="bg-[#0d2a25]/80 font-bold text-[#fef08a] border-t border-[#d4af37]/20">
              <tr>
                <td className="py-3 px-3 sticky right-0 bg-[#0d2a25] z-20">إجمالي حضور الليلة:</td>
                <td className="py-3 px-2 text-center">-</td>
                {days.map((day) => {
                  const count = attendance.filter((a) => a.ramadanDay === day).length;
                  return (
                    <td key={day} className="py-2 px-1 text-center font-mono text-[11px]">
                      {count > 0 ? count : '0'}
                    </td>
                  );
                })}
                <td className="py-3 px-3 text-center sticky left-0 bg-[#0d2a25] z-20">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
