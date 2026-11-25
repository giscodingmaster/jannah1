import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, QrCode, CheckCircle, Apple, Monitor } from 'lucide-react';
import QRCode from 'qrcode';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mobileUrl, setMobileUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    // Current URL or Wi-Fi IP
    const url = window.location.href;
    setMobileUrl(url);

    QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: {
        dark: '#071916',
        light: '#ffffff',
      },
    }).then(setQrDataUrl).catch(console.error);

    // Listen for PWA beforeinstallprompt on Android/Chrome
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#071916] border-2 border-[#d4af37]/50 shadow-2xl p-6 text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#fef08a] shadow-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-kufi text-[#fef08a]">
              تثبيت التطبيق على الموبايل (PWA)
            </h3>
            <p className="text-xs text-[#94a3b8]">
              يعمل كتطبيق أصلي سريع بدون متجر وبدون إنترنت
            </p>
          </div>
        </div>

        {/* Step 1: Open on Mobile via QR code */}
        <div className="p-4 rounded-2xl bg-[#061412] border border-[#d4af37]/20 mb-4 flex flex-col items-center text-center">
          <span className="text-xs text-[#fef08a] font-bold mb-2 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#d4af37]" />
            امسح الكود بكاميرا هاتفك لفتحه فوراً:
          </span>

          <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-[#d4af37] shadow-inner mb-2 flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Mobile QR" className="w-full h-full object-contain" />
            ) : (
              <div className="text-[10px] text-gray-500">جاري التوليد...</div>
            )}
          </div>

          <span className="text-[11px] font-mono text-[#6ee7b7] break-all px-2 py-1 rounded bg-[#0d2a25] border border-[#10b981]/20">
            {mobileUrl}
          </span>
        </div>

        {/* Step 2: Install instructions */}
        <div className="space-y-2.5 text-xs text-[#cbd5e1] mb-5">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#d4af37] text-[#061412] font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer mb-3"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق على الهاتف بنقرة واحدة</span>
            </button>
          )}

          <div className="p-3 rounded-xl bg-[#0d2a25]/60 border border-[#d4af37]/15">
            <div className="flex items-center gap-1.5 font-bold text-[#fef08a] mb-1">
              <Apple className="w-4 h-4 text-slate-300" />
              <span>مستخدمي هواتف iPhone (سفاري):</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              اضغط على زر المشاركة أسفل المتصفح (⎋ Share)، ثم اختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen ⊞)</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0d2a25]/60 border border-[#d4af37]/15">
            <div className="flex items-center gap-1.5 font-bold text-[#fef08a] mb-1">
              <Smartphone className="w-4 h-4 text-[#6ee7b7]" />
              <span>مستخدمي هواتف Android (كروم):</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              اضغط على الثلاث نقاط أعلى المتصفح (⋮)، ثم اختر <strong>"تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#cbd5e1] font-bold text-xs transition-all cursor-pointer"
        >
          حسناً، فهمت
        </button>
      </div>
    </div>
  );
};
