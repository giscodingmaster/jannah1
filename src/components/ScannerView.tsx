import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { Camera, CheckCircle2, AlertCircle, ShieldCheck, UserCheck, Moon, ArrowRight } from 'lucide-react';
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
    time: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(0);
  
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

    // Prevent duplicate triggers of the exact same code within 3 seconds
    if (trimmed === lastScannedCodeRef.current && now - lastScanTimestampRef.current < 3000) {
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
      // Keep trimmed string
    }

    const result = recordTaraweehAttendance(participantId, activeRamadanDay);

    if (result.success) {
      playSuccessChime();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#d4af37', '#10b981', '#fef08a'],
      });

      setLastScanned({
        success: true,
        name: result.participant?.name,
        message: result.message,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } else {
      setLastScanned({
        success: false,
        name: result.participant?.name,
        message: result.message,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      });
    }
  };

  // Start scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
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
      setCameraError('تعذر فتح الكاميرا مباشرة. تأكد من إعطاء إذن الكاميرا، أو استخدم التحضير اليدوي السريع أدناه.');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner: Taraweeh Context */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#0d2a25] via-[#071916] to-[#0d2a25] border border-[#d4af37]/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#fef08a]">
            <Moon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#d4af37]/20 text-[#fef08a] font-black border border-[#d4af37]/40">
                الليلة {activeRamadanDay} من رمضان
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#fef08a]">
                تسجيل حضور صلاة التراويح
              </h2>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              يمرر الشاب بطاقته أمام الكاميرا لتسجيل حضوره في ثانية واحدة قبل بدء الصلاة
            </p>
          </div>
        </div>

        {/* Counter & Enter Prayer button */}
        <div className="flex items-center gap-4 bg-[#061412] px-4 py-2.5 rounded-xl border border-[#d4af37]/20">
          <div className="text-center">
            <span className="text-2xl font-black text-[#fef08a]">{sessionCount}</span>
            <span className="block text-[11px] text-[#94a3b8]">حضور الليلة</span>
          </div>
          <button
            onClick={onDoneForPrayer}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#6ee7b7] border border-[#10b981]/40 text-xs font-bold transition-all shadow-md cursor-pointer"
            title="الانتقال إلى الصلاة وإغلاق الماسح"
          >
            <span>بدء صلاة التراويح 🕌</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Camera View */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="w-full relative rounded-2xl overflow-hidden bg-[#071916] border-2 border-[#d4af37]/40 shadow-2xl p-3 flex flex-col items-center">
            {/* Camera Box */}
            <div
              id="qr-reader"
              className="w-full aspect-square max-w-[340px] rounded-xl overflow-hidden bg-black/60 relative border border-[#d4af37]/20 flex items-center justify-center text-center p-2"
            >
              {!isScanning && (
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-[#d4af37]/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#cbd5e1]">الكاميرا متوقفة حالياً</p>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    اضغط أدناه لفتح الكاميرا ومسح بطاقات الشباب قبل الصلاة
                  </p>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="w-full flex items-center justify-center gap-3 mt-4">
              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#d4af37] text-[#061412] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>تشغيل كاميرا مسح التراويح</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="w-full py-3 px-6 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>إيقاف الكاميرا</span>
                </button>
              )}
            </div>

            {cameraError && (
              <div className="w-full mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                {cameraError}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Status & Fast Fallback */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* Latest Scan Notification Box */}
          <div className="p-4 rounded-2xl bg-[#071916] border border-[#d4af37]/30 shadow-lg min-h-[160px] flex flex-col justify-center">
            <span className="text-xs text-[#94a3b8] font-semibold mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              آخر عملية تسجيل في تراويح الليلة:
            </span>

            {lastScanned ? (
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  lastScanned.success
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {lastScanned.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                  )}
                  <div>
                    {lastScanned.name && (
                      <h4 className="font-bold text-sm text-[#fef08a]">{lastScanned.name}</h4>
                    )}
                    <p className="text-xs mt-0.5 leading-relaxed">{lastScanned.message}</p>
                    <span className="text-[10px] opacity-70 block mt-1">{lastScanned.time}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#94a3b8]">
                لم يتم تسجيل أي متسابق في الليلة {activeRamadanDay} حتى الآن. وجّه البطاقة نحو الكاميرا ليتم تسجيله في لحظة.
              </div>
            )}
          </div>

          {/* Quick Manual Fallback */}
          <div className="p-4 rounded-2xl bg-[#071916] border border-[#d4af37]/20 shadow-lg">
            <h3 className="text-xs font-bold text-[#fef08a] mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#d4af37]" />
              تحضير سريع (لمن نسي بطاقته الليلة):
            </h3>
            <p className="text-[11px] text-[#94a3b8] mb-3">
              اضغط على تحضير بجانب اسم الشاب لتسجيله دون الحاجة للكاميرا:
            </p>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {participants.map((p) => {
                const isPresent = getStoredAttendance().some(
                  a => a.participantId === p.id && a.ramadanDay === activeRamadanDay
                );

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#061412] border border-[#d4af37]/15 hover:border-[#d4af37]/40 transition-all"
                  >
                    <div>
                      <span className="font-semibold text-[#f8fafc]">{p.name}</span>
                      <span className="text-[10px] text-[#94a3b8] block">({p.id} - {p.category})</span>
                    </div>

                    {isPresent ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ✓ حاضر التراويح
                      </span>
                    ) : (
                      <button
                        onClick={() => processCode(p.id)}
                        className="text-[11px] px-3 py-1 rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#fef08a] border border-[#d4af37]/40 font-bold transition-all cursor-pointer"
                      >
                        + تحضير
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
