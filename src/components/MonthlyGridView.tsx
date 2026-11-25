import React from 'react';
import { Download } from 'lucide-react';
import { Participant, AttendanceRecord } from '../types';

interface MonthlyGridViewProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  activeRamadanDay: number;
  setActiveRamadanDay: (day: number) => void;
  totalNights: number;
  onToggleAttendance: (participantId: string, day: number) => Promise<void>;
}

export const MonthlyGridView: React.FC<MonthlyGridViewProps> = ({
  participants,
  attendance,
  activeRamadanDay,
  setActiveRamadanDay,
  totalNights,
  onToggleAttendance,
}) => {
  const days = Array.from({ length: totalNights }, (_, i) => i + 1);

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
    link.setAttribute('download', `سجل_التراويح_${totalNights}_ليلة.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-2 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">سجل الليالي</h2>
          <p className="text-xs text-white/40">انقر على الخلية للتحضير أو الإلغاء</p>
        </div>
        <button
          onClick={exportGridCsv}
          className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تصدير إكسل</span>
        </button>
      </div>

      {/* Clean Grid Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/[0.04] text-white/70 border-b border-white/10 font-medium">
              <tr>
                <th className="py-2.5 px-3 sticky right-0 bg-[#0f1412] z-10">المتسابق</th>
                {days.map((d) => (
                  <th
                    key={d}
                    onClick={() => setActiveRamadanDay(d)}
                    className={`py-2 px-1 text-center min-w-[30px] cursor-pointer transition-colors ${
                      d === activeRamadanDay ? 'text-[#f5d77f] font-bold bg-[#f5d77f]/10' : 'hover:text-white'
                    }`}
                  >
                    {d}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center sticky left-0 bg-[#0f1412] z-10">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {participants.map((p) => {
                const totalAttended = attendance.filter(
                  (a) => a.participantId === p.id && a.ramadanDay <= totalNights
                ).length;

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 sticky right-0 bg-[#070b09] z-10 whitespace-nowrap">
                      <span className="font-semibold text-white block">{p.name}</span>
                      <span className="text-[10px] text-white/40">{p.category}</span>
                    </td>

                    {days.map((day) => {
                      const isPresent = attendance.some(
                        (a) => a.participantId === p.id && a.ramadanDay === day
                      );

                      return (
                        <td key={day} className="py-1 px-0.5 text-center">
                          <button
                            onClick={() => onToggleAttendance(p.id, day)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto text-[10px] font-bold transition-all cursor-pointer ${
                              isPresent
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                : 'text-white/15 hover:text-white/40'
                            }`}
                          >
                            {isPresent ? '✓' : '·'}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3 text-center sticky left-0 bg-[#070b09] z-10 whitespace-nowrap font-bold text-white text-xs">
                      {totalAttended}/{totalNights}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
