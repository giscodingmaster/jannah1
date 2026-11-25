import React, { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Printer, Moon } from 'lucide-react';
import { Participant } from '../types';
import { getStoredParticipants } from '../utils/storage';

interface SingleCardProps {
  participant: Participant;
}

const SingleCard: React.FC<SingleCardProps> = React.memo(({ participant }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(participant.id, {
      width: 200,
      margin: 1,
      color: {
        dark: '#071916',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch((err) => console.error('QR error for', participant.id, err));

    return () => {
      isMounted = false;
    };
  }, [participant.id]);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-[#d4af37] bg-gradient-to-b from-[#0e2c24] via-[#071916] to-[#040d0c] text-white p-5 shadow-2xl flex flex-col justify-between print:bg-white print:text-black print:border-black print:shadow-none break-inside-avoid">
      {/* Top decorative header */}
      <div className="border-b border-[#d4af37]/30 pb-3 flex items-center justify-between print:border-black">
        <div className="flex items-center gap-1.5">
          <Moon className="w-5 h-5 text-[#fef08a] print:text-black" />
          <span className="font-kufi font-black text-sm text-[#fef08a] print:text-black tracking-wider">
            فُرسَانُ رَمَضَان
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/20 text-[#6ee7b7] border border-[#10b981]/40 print:bg-gray-200 print:text-black print:border-black">
          تراويح • {participant.category}
        </span>
      </div>

      {/* Middle body: QR code & Participant Info */}
      <div className="my-4 flex items-center gap-4">
        {/* QR Code */}
        <div className="w-28 h-28 bg-white p-1.5 rounded-xl border border-[#d4af37] shadow-inner flex items-center justify-center shrink-0 print:border-black">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR ${participant.id}`} className="w-full h-full object-contain" />
          ) : (
            <div className="text-[10px] text-gray-400">توليد QR...</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <span className="text-[11px] text-[#94a3b8] print:text-gray-600 font-semibold">المتسابق:</span>
          <h3 className="text-base font-black text-[#fef08a] print:text-black leading-snug">
            {participant.name}
          </h3>
          <div className="mt-2 text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#061412] text-[#6ee7b7] border border-[#10b981]/30 w-fit print:bg-gray-100 print:text-black">
            كود: {participant.id}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[#d4af37]/30 pt-2 flex items-center justify-between text-[10px] text-[#cbd5e1] print:text-gray-700 print:border-black">
        <span>مسجد التقوى والإيمان</span>
        <span className="text-[#fef08a] print:text-black font-semibold">رمضان المبارك ١٤٤٦ هـ</span>
      </div>
    </div>
  );
});

export const CardsView: React.FC = () => {
  const participants = useMemo(() => getStoredParticipants(), []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top action bar (hidden during print) */}
      <div className="print:hidden p-4 rounded-2xl bg-[#071916] border border-[#d4af37]/30 shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-kufi text-[#fef08a] flex items-center gap-2">
            <Moon className="w-5 h-5 text-[#d4af37]" />
            بطاقات فرسان المسجد للطباعة
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            اطبع البطاقات على ورق مقوى (Glossy أو A4 كوشيه)، وقصّها لتوزيعها على الشباب قبل أول ليلة في رمضان.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#061412] font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة جميع البطاقات (A4)</span>
        </button>
      </div>

      {/* Grid of badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 print:grid print:grid-cols-2 print:gap-4 print:text-black">
        {participants.map((p) => (
          <SingleCard key={p.id} participant={p} />
        ))}
      </div>
    </div>
  );
};
