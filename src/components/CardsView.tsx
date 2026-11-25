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
        dark: '#000000',
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
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 text-white shadow-xl flex flex-col justify-between print:bg-white print:text-black print:border-black print:shadow-none break-inside-avoid">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 print:border-black">
        <div className="flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-[#f5d77f] fill-current print:text-black" />
          <span className="font-bold text-xs text-white print:text-black tracking-tight">
            فرسان التراويح
          </span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80 print:bg-gray-200 print:text-black">
          {participant.category}
        </span>
      </div>

      {/* Middle Body */}
      <div className="my-3 flex items-center gap-3">
        {/* QR Code */}
        <div className="w-20 h-20 bg-white p-1 rounded-2xl border border-white/20 shadow-inner flex items-center justify-center shrink-0 print:border-black">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR ${participant.id}`} className="w-full h-full object-contain" />
          ) : (
            <div className="text-[9px] text-gray-400">QR...</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] text-white/50 print:text-gray-600">المتسابق</span>
          <h3 className="text-sm font-bold text-white print:text-black leading-snug">
            {participant.name}
          </h3>
          <span className="text-[10px] font-mono font-bold text-[#f5d77f] print:text-black mt-1">
            {participant.id}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 pt-1.5 flex items-center justify-between text-[9px] text-white/40 print:text-gray-600 print:border-black">
        <span>مسجد التقوى</span>
        <span>رمضان المبارك</span>
      </div>
    </div>
  );
});

export const CardsView: React.FC = () => {
  const participants = useMemo(() => getStoredParticipants(), []);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2 pb-24">
      {/* Action Bar */}
      <div className="print:hidden flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">بطاقات المصلين</h2>
          <p className="text-xs text-white/40">جاهزة للطباعة والقص للشباب</p>
        </div>
        <button
          onClick={() => window.print()}
          className="py-2 px-3.5 rounded-xl apple-gold-bg text-black font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة A4</span>
        </button>
      </div>

      {/* Grid of passes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid print:grid-cols-2 print:gap-4 print:text-black">
        {participants.map((p) => (
          <SingleCard key={p.id} participant={p} />
        ))}
      </div>
    </div>
  );
};
