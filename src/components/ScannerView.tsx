import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { Camera, CheckCircle2, AlertCircle, Search, X, Users, Sparkles } from 'lucide-react';
import { recordTaraweehAttendance, getStoredParticipants, getStoredAttendance } from '../utils/storage';
import { playSuccessChime } from '../utils/audio';

interface ScannerViewProps {
  activeRamadanDay: number;
  onDoneForPrayer: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  activeRamadanDay,
  onDoneForPrayer,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanned, setLastScanned] = useState<{
    success: boolean;
    name?: string;
    message: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [showManualSheet, setShowManualSheet] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimestampRef = useRef<number>(0);

  // Compute how many attendees were recorded for this Taraweeh night
  useEffect(() => {
    const attendance = getStoredAttendance();
    const count = attendance.filter(a => a.ramadanDay === activeRamadanDay).length;
    setSessionCount(count);
  }, [activeRamadanDay, lastScanned]);

  // Handle scanned code
  const processCode = (rawCode: string) => {
    const now = Date.now();
    const trimmed = rawCode.trim();

    if (trimmed === lastScannedCodeRef.current && now - lastScanTimestampRef.current < 2500) {
      return;
    }

    lastScannedCodeRef.current = trimmed;
    lastScanTimestampRef.current = now;

    let participantId = trimmed;
    try {
      if (trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (parsed.id) participantId = parsed.id;
      }
    } catch {
      // Raw string
    }

    const result = recordTaraweehAttendance(participantId, activeRamadanDay);

    if (result.success) {
      playSuccessChime();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.75 },
        colors: ['#f5d77f', '#34d399', '#ffffff'],
      });

      setLastScanned({
        success: true,
        name: result.participant?.name,
        message: `تم تسجيل الحضور في ليلة ${activeRamadanDay}`,
      });
    } else {
      setLastScanned({
        success: false,
        name: result.participant?.name,
        message: result.message,
      });
    }

    // Auto-dismiss notification after 3 seconds
    setTimeout(() => {
      setLastScanned(null);
    }, 3200);
  };

  // Start scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const config = {
        fps: 20,
        qrbox: { width: 230, height: 230 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          processCode(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err: unknown) {
      console.error('Camera start error:', err);
      setCameraError('يرجى السماح بصلاحية الكاميرا في المتصفح، أو استخدم التحضير اليدوي.');
      setIsScanning(false);
    }
  };

  // Stop scanner
  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const participants = getStoredParticipants();
  const filteredParticipants = participants.filter(p =>
    p.name.includes(searchQuery) || p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-24 flex flex-col items-center">
      {/* Dynamic Island / Floating Scanned Alert */}
      {lastScanned && (
        <div
          className={`fixed top-14 z-50 px-4 py-2.5 rounded-full ios-glass shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300 ${
            lastScanned.success ? 'border-emerald-500/30' : 'border-amber-500/30'
          }`}
        >
          {lastScanned.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div className="text-right">
            <span className="text-xs font-bold text-white block">
              {lastScanned.name || 'تنبيه'}
            </span>
            <span className="text-[11px] text-white/70 block">
              {lastScanned.message}
            </span>
          </div>
        </div>
      )}

      {/* Floating Status Pill */}
      <div className="flex items-center gap-2 mb-4 bg-white/[0.06] border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white/80">حضور الليلة {activeRamadanDay}:</span>
        <strong className="text-[#f5d77f] font-bold text-sm">{sessionCount}</strong>
        <span className="text-white/40">مصلٍ</span>
      </div>

      {/* Apple-style Camera Viewport Card */}
      <div className="w-full relative aspect-square max-w-[340px] rounded-[36px] overflow-hidden bg-black/80 border border-white/10 shadow-2xl flex items-center justify-center">
        <div id="qr-reader" className="w-full h-full object-cover" />

        {/* Reticle Overlay when scanning */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 rounded-3xl border-2 border-[#f5d77f]/40 relative">
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#f5d77f] rounded-tr-xl" />
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#f5d77f] rounded-tl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#f5d77f] rounded-br-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#f5d77f] rounded-bl-xl" />
            </div>
          </div>
        )}

        {/* Placeholder state when camera is paused */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-sm font-semibold text-white/90">الكاميرا متوقفة</p>
            <p className="text-xs text-white/50 mt-1 max-w-[200px]">
              شغّل الكاميرا للمسح التلقائي السريع لبطاقات المصلين
            </p>
          </div>
        )}
      </div>

      {cameraError && (
        <p className="text-xs text-amber-300 mt-3 text-center px-4">
          {cameraError}
        </p>
      )}

      {/* Action Buttons (Apple Pill Style) */}
      <div className="w-full max-w-[340px] flex flex-col gap-2.5 mt-5">
        {!isScanning ? (
          <button
            onClick={startCamera}
            className="w-full py-3.5 rounded-full apple-gold-bg font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>تشغيل الكاميرا</span>
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="w-full py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] active:scale-95 text-white/80 font-semibold text-sm border border-white/10 transition-all cursor-pointer"
          >
            إيقاف الكاميرا
          </button>
        )}

        {/* Enter Prayer Button */}
        <button
          onClick={onDoneForPrayer}
          className="w-full py-3 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>حان وقت الصلاة 🕌</span>
        </button>

        {/* Manual Check-in Opener */}
        <button
          onClick={() => setShowManualSheet(true)}
          className="w-full py-2.5 rounded-full text-white/50 hover:text-white/80 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>تحضير يدوي (لمن نسي بطاقته)</span>
        </button>
      </div>

      {/* iOS Bottom Sheet Modal for Manual Check-in */}
      {showManualSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[80vh] rounded-t-[32px] sm:rounded-[32px] bg-[#121a17] border-t sm:border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="px-5 py-2 flex items-center justify-between border-b border-white/5">
              <h3 className="text-sm font-bold text-white">التحضير اليدوي</h3>
              <button
                onClick={() => setShowManualSheet(false)}
                className="p-1 rounded-full bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Box */}
            <div className="p-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="بحث باسم المتسابق..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pr-9 pl-4 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#f5d77f]"
                />
              </div>
            </div>

            {/* Participants List */}
            <div className="overflow-y-auto p-3 space-y-1.5 flex-1 max-h-[45vh]">
              {filteredParticipants.map((p) => {
                const isPresent = getStoredAttendance().some(
                  a => a.participantId === p.id && a.ramadanDay === activeRamadanDay
                );

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-white/40">{p.id} • {p.category}</span>
                    </div>

                    {isPresent ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ✓ حاضر
                      </span>
                    ) : (
                      <button
                        onClick={() => processCode(p.id)}
                        className="text-[11px] px-3.5 py-1 rounded-full bg-[#f5d77f] text-black font-bold active:scale-95 transition-all cursor-pointer"
                      >
                        تحضير
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
