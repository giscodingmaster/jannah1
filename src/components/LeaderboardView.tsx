import React, { useState, useMemo } from 'react';
import { Trophy, Download, Search, Medal, Sparkles } from 'lucide-react';
import { Participant, AttendanceRecord } from '../types';

interface LeaderboardViewProps {
  participants: Participant[];
  attendance: AttendanceRecord[];
  totalNights: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  participants,
  attendance,
  totalNights,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('الجميع');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const stats = useMemo(() => {
    return participants.map((p) => {
      const records = attendance.filter((a) => a.participantId === p.id && a.ramadanDay <= totalNights);
      const attendedNights = records.length;
      const percentage = Math.round((attendedNights / totalNights) * 100);

      let tier = 'مشارك مبارك';
      let tierBadge = 'bg-white/10 text-white/70';
      if (attendedNights >= totalNights - 2) {
        tier = 'الفئة الماسية';
        tierBadge = 'bg-[#f5d77f]/20 text-[#f5d77f] border border-[#f5d77f]/40';
      } else if (attendedNights >= totalNights - 6) {
        tier = 'الفئة الذهبية';
        tierBadge = 'bg-amber-400/20 text-amber-300 border border-amber-400/30';
      } else if (attendedNights >= totalNights - 10) {
        tier = 'الفئة الفضية';
        tierBadge = 'bg-slate-300/20 text-slate-200 border border-slate-300/30';
      } else if (attendedNights >= Math.floor(totalNights / 2)) {
        tier = 'الفئة البرونزية';
        tierBadge = 'bg-amber-700/20 text-amber-500';
      }

      return {
        ...p,
        attendedNights,
        percentage,
        tier,
        tierBadge,
      };
    }).sort((a, b) => b.attendedNights - a.attendedNights);
  }, [participants, attendance, totalNights]);

  const filtered = useMemo(() => {
    return stats.filter((p) => {
      const matchCat = selectedCategory === 'الجميع' || p.category === selectedCategory;
      const matchSearch = p.name.includes(searchTerm) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [stats, selectedCategory, searchTerm]);

  const exportReport = () => {
    const headers = ['الترتيب', 'الكود', 'الاسم', 'الفئة', 'عدد ليالي التراويح', 'النسبة المئوية', 'الدرجة التكريمية'];
    const rows = filtered.map((p, idx) => [
      idx + 1,
      p.id,
      p.name,
      p.category,
      `${p.attendedNights} / ${totalNights}`,
      `${p.percentage}%`,
      p.tier,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `نتائج_التراويح_${totalNights}_ليلة.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const top3 = filtered.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">لوحة الشرف</h2>
          <p className="text-xs text-white/40">ترتيب الحضور من أصل {totalNights} ليلة</p>
        </div>
        <button
          onClick={exportReport}
          className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
          title="تصدير كشف إكسل"
        >
          <Download className="w-3.5 h-3.5" />
          <span>إكسل</span>
        </button>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {top3[1] && (
            <div className="ios-glass-card rounded-2xl p-3 flex flex-col items-center text-center">
              <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center mb-1">
                2
              </span>
              <h4 className="text-xs font-bold text-white truncate max-w-full">{top3[1].name}</h4>
              <span className="text-[10px] text-white/40 mt-0.5">{top3[1].category}</span>
              <div className="mt-1.5 text-sm font-black text-[#f5d77f]">
                {top3[1].attendedNights} <span className="text-[10px] font-normal text-white/50">ليلة</span>
              </div>
            </div>
          )}

          {top3[0] && (
            <div className="ios-glass-card rounded-2xl p-3.5 flex flex-col items-center text-center border-[#f5d77f]/30 bg-gradient-to-b from-[#f5d77f]/10 to-transparent">
              <span className="w-7 h-7 rounded-full apple-gold-bg text-black font-black text-sm flex items-center justify-center mb-1 shadow-lg">
                1
              </span>
              <h4 className="text-xs font-black text-[#f5d77f] truncate max-w-full">{top3[0].name}</h4>
              <span className="text-[10px] text-white/50 mt-0.5">{top3[0].category}</span>
              <div className="mt-1.5 text-base font-black text-white">
                {top3[0].attendedNights} <span className="text-[10px] font-normal text-white/50">ليلة</span>
              </div>
            </div>
          )}

          {top3[2] && (
            <div className="ios-glass-card rounded-2xl p-3 flex flex-col items-center text-center">
              <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-bold text-xs flex items-center justify-center mb-1">
                3
              </span>
              <h4 className="text-xs font-bold text-white truncate max-w-full">{top3[2].name}</h4>
              <span className="text-[10px] text-white/40 mt-0.5">{top3[2].category}</span>
              <div className="mt-1.5 text-sm font-black text-[#f5d77f]">
                {top3[2].attendedNights} <span className="text-[10px] font-normal text-white/50">ليلة</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Chips & Search Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/5 overflow-x-auto no-scrollbar">
          {['الجميع', 'براعم', 'أشبال', 'شباب'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat ? 'apple-gold-bg font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1.5 px-3 bg-white/[0.06] border border-white/10 rounded-full text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f5d77f]"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        {filtered.map((p, idx) => (
          <div key={p.id} className="p-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-5 text-center text-xs font-bold text-white/40">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">{p.name}</h4>
                <span className="text-[10px] text-white/40">{p.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.tierBadge}`}>
                {p.tier}
              </span>
              <div className="text-left min-w-[50px]">
                <span className="text-xs font-black text-white">{p.attendedNights}/{totalNights}</span>
                <span className="text-[10px] text-emerald-400 block">{p.percentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
