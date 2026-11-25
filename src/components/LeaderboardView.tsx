import React, { useState, useMemo } from 'react';
import { Trophy, Moon, Sparkles, Download, Flame, Star } from 'lucide-react';
import { Participant, AttendanceRecord } from '../types';
import { getStoredParticipants, getStoredAttendance } from '../utils/storage';

interface LeaderboardViewProps {
  totalNights: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ totalNights }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('الجميع');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const participants = useMemo(() => getStoredParticipants(), []);
  const attendance = useMemo(() => getStoredAttendance(), []);

  // Aggregate stats per participant based on Taraweeh nights
  const stats = useMemo(() => {
    return participants.map((p) => {
      const records = attendance.filter((a) => a.participantId === p.id && a.ramadanDay <= totalNights);
      const attendedNights = records.length;
      const percentage = Math.round((attendedNights / totalNights) * 100);

      // Determine award tier based on totalNights
      let tier = 'مشارك مبارك';
      let tierColor = 'text-slate-300 bg-slate-800';
      if (attendedNights >= totalNights - 2) {
        tier = 'المرتبة الماسية (الأوائل)';
        tierColor = 'text-[#fef08a] bg-[#d4af37]/20 border border-[#d4af37]/40';
      } else if (attendedNights >= totalNights - 6) {
        tier = 'المرتبة الذهبية';
        tierColor = 'text-amber-300 bg-amber-500/20 border border-amber-500/30';
      } else if (attendedNights >= totalNights - 10) {
        tier = 'المرتبة الفضية';
        tierColor = 'text-slate-200 bg-slate-400/20 border border-slate-400/30';
      } else if (attendedNights >= Math.floor(totalNights / 2)) {
        tier = 'المرتبة البرونزية';
        tierColor = 'text-amber-600 bg-amber-800/20';
      }

      return {
        ...p,
        attendedNights,
        percentage,
        tier,
        tierColor,
      };
    }).sort((a, b) => b.attendedNights - a.attendedNights);
  }, [participants, attendance, totalNights]);

  // Filtered stats
  const filtered = useMemo(() => {
    return stats.filter((p) => {
      const matchCat = selectedCategory === 'الجميع' || p.category === selectedCategory;
      const matchSearch = p.name.includes(searchTerm) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [stats, selectedCategory, searchTerm]);

  // Export report as CSV
  const exportReport = () => {
    const headers = ['الترتيب', 'الكود', 'الاسم', 'الفئة', 'عدد ليالي التراويح', 'النسبة المئوية', 'الدرجة التكريمية'];
    const rows = filtered.map((p, idx) => [
      idx + 1,
      p.id,
      p.name,
      p.category,
      `${p.attendedNights} / ${totalNights} ليلة`,
      `${p.percentage}%`,
      p.tier,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `نتائج_مسابقة_تراويح_رمضان_${totalNights}_ليلة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const top3 = filtered.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Title & Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs text-[#fef08a] font-semibold mb-2">
          <Moon className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>حصر ومفاضلة حضور صلاة التراويح بالمسجد ({totalNights} ليلة)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-kufi text-[#fef08a] tracking-wide">
          لوحة الشرف وتصنيف جوائز التراويح
        </h2>
        <p className="text-xs sm:text-sm text-[#94a3b8] mt-1 max-w-xl mx-auto">
          ترتيب أبطال المسجد في ختام شهر رمضان المبارك حسب عدد ليالي التراويح المحضورة من أصل {totalNights} ليلة
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="order-2 md:order-1 relative rounded-2xl bg-gradient-to-b from-[#0f2e27] to-[#071916] border border-slate-400/40 p-5 shadow-xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-lg shadow-lg border-2 border-white mb-2">
                2
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-200 border border-slate-400/30 font-bold mb-1">
                المرتبة الثانية (الفضية)
              </span>
              <h3 className="text-lg font-bold text-[#f8fafc]">{top3[1].name}</h3>
              <span className="text-xs text-[#94a3b8]">{top3[1].category}</span>
              <div className="mt-3 text-2xl font-black text-[#fef08a]">
                {top3[1].attendedNights} <span className="text-xs text-[#94a3b8] font-normal">/ {totalNights} ليلة</span>
              </div>
              <span className="mt-1 text-xs text-[#6ee7b7] font-bold">نسبة الحضور: {top3[1].percentage}%</span>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {top3[0] && (
            <div className="order-1 md:order-2 relative rounded-2xl bg-gradient-to-b from-[#1c3d32] to-[#071916] border-2 border-[#d4af37] p-6 shadow-2xl shadow-[#d4af37]/20 flex flex-col items-center text-center transform md:-translate-y-2">
              <div className="absolute -top-3 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] text-xs font-black shadow-md flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                فارس التراويح الأول
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#fef08a] to-[#d4af37] text-[#061412] font-black flex items-center justify-center text-2xl shadow-xl border-2 border-white mb-2 animate-pulse-gold">
                1
              </div>
              <span className="text-xs px-3 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-bold mb-1">
                المرتبة الأولى (الماسية)
              </span>
              <h3 className="text-xl font-black text-[#fef08a]">{top3[0].name}</h3>
              <span className="text-xs text-[#94a3b8]">{top3[0].category}</span>
              <div className="mt-3 text-3xl font-black text-[#fef08a]">
                {top3[0].attendedNights} <span className="text-xs text-[#94a3b8] font-normal">/ {totalNights} ليلة</span>
              </div>
              <span className="mt-1 text-xs text-[#6ee7b7] font-bold">نسبة الحضور: {top3[0].percentage}%</span>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="order-3 relative rounded-2xl bg-gradient-to-b from-[#132c25] to-[#071916] border border-amber-700/40 p-5 shadow-xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-lg shadow-lg border-2 border-amber-300 mb-2">
                3
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-700/20 text-amber-200 border border-amber-600/30 font-bold mb-1">
                المرتبة الثالثة (البرونزية)
              </span>
              <h3 className="text-lg font-bold text-[#f8fafc]">{top3[2].name}</h3>
              <span className="text-xs text-[#94a3b8]">{top3[2].category}</span>
              <div className="mt-3 text-2xl font-black text-[#fef08a]">
                {top3[2].attendedNights} <span className="text-xs text-[#94a3b8] font-normal">/ {totalNights} ليلة</span>
              </div>
              <span className="mt-1 text-xs text-[#6ee7b7] font-bold">نسبة الحضور: {top3[2].percentage}%</span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#071916] border border-[#d4af37]/20 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['الجميع', 'براعم', 'أشبال', 'شباب'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#d4af37] text-[#061412] font-black'
                  : 'bg-[#061412] text-[#94a3b8] hover:text-[#f8fafc] border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input & Export button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <input
            type="text"
            placeholder="بحث باسم المتسابق..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-[#061412] border border-[#d4af37]/30 rounded-lg text-xs text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] w-full sm:w-48"
          />
          <button
            onClick={exportReport}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#6ee7b7] border border-[#10b981]/40 text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
            title="تصدير النتائج النهائية للمسجد"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير النتائج (Excel)</span>
          </button>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="rounded-2xl overflow-hidden border border-[#d4af37]/20 bg-[#071916] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0d2a25] text-[#fef08a] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="py-3 px-4">الترتيب</th>
                <th className="py-3 px-4">المتسابق</th>
                <th className="py-3 px-4">الفئة</th>
                <th className="py-3 px-4 text-center">ليالي التراويح</th>
                <th className="py-3 px-4 text-center">النسبة</th>
                <th className="py-3 px-4 text-center">الدرجة والتقدير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-[#cbd5e1]">
              {filtered.map((p, idx) => (
                <tr key={p.id} className="hover:bg-[#10b981]/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-center w-12">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#f8fafc]">
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      <span className="text-[10px] text-[#94a3b8] font-mono">{p.id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[#cbd5e1] text-[10px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-black text-sm text-[#fef08a]">
                    {p.attendedNights} <span className="text-[11px] text-[#94a3b8] font-normal">/ {totalNights} ليلة</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#6ee7b7]">{p.percentage}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${p.tierColor}`}>
                      {p.tier}
                    </span>
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
