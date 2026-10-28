import React, { useState } from 'react';
import {
  CameraOff,
  RefreshCw,
  Upload,
  Lock,
  Smartphone,
  Laptop,
  CheckCircle2,
  ExternalLink,
  SwitchCamera,
  Search
} from 'lucide-react';

interface CameraPermissionDeniedUIProps {
  onRetry: () => void;
  onUploadClick?: () => void;
  onSwitchCamera?: () => void;
  onSelectSampleCode?: (code: string, format: string) => void;
  errorMessage?: string;
  isRetrying?: boolean;
}

export const CameraPermissionDeniedUI: React.FC<CameraPermissionDeniedUIProps> = ({
  onRetry,
  onUploadClick,
  onSwitchCamera,
  onSelectSampleCode,
  errorMessage,
  isRetrying = false
}) => {
  const [activeTab, setActiveTab] = useState<'chrome' | 'safari' | 'firefox' | 'android'>('chrome');

  const sampleQuickCodes = [
    { label: 'EAN-13: Coca-Cola', code: '5000112637939', format: 'EAN-13' },
    { label: 'UPC-A: Apple iPhone', code: '0194252033012', format: 'UPC-A' },
    { label: 'Code 128: Nike Jordan', code: 'NIKE-AIR-JORDAN-1042', format: 'CODE-128' },
    { label: 'Fake Barcode: Replica 99', code: '000000FAKE99', format: 'EAN-12' }
  ];

  return (
    <div className="w-full rounded-2xl bg-white border border-[#ba1a1a]/30 p-5 sm:p-6 shadow-sm text-[#1a1c1a] space-y-5 animate-in fade-in duration-300">
      {/* Header Alert */}
      <div className="flex items-start gap-3.5 pb-4 border-b border-[#bccac0]/30">
        <div className="w-11 h-11 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0 shadow-xs ring-4 ring-[#ffdad6]/50">
          <CameraOff className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#ba1a1a] tracking-tight">
              Camera Permission Denied
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/30">
              Access Blocked
            </span>
          </div>
          <p className="text-xs text-[#3d4a42] leading-relaxed">
            {errorMessage ||
              'Your browser blocked access to the camera. Follow the quick guide below to grant camera permission, or test with sample barcodes or photo upload.'}
          </p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="py-2.5 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.99] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking Permission...' : 'Request Permission Again'}</span>
        </button>

        {onSwitchCamera && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className="py-2.5 px-3.5 rounded-xl bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#1a1c1a] text-xs font-semibold border border-[#bccac0]/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <SwitchCamera className="w-3.5 h-3.5 text-[#006948]" />
            <span>Switch Front/Back Camera</span>
          </button>
        )}

        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="py-2.5 px-3.5 rounded-xl bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#1a1c1a] text-xs font-semibold border border-[#bccac0]/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#006948]" />
            <span>Upload Photo Instead</span>
          </button>
        )}
      </div>

      {/* Browser-Specific Instructions Card */}
      <div className="rounded-xl bg-[#faf9f6] border border-[#bccac0]/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1a1c1a] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#006948]" />
            <span>How to allow camera in your browser:</span>
          </span>
          <span className="text-[11px] text-[#6d7a72] font-mono">10-second fix</span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-[#e9e8e5] p-1 rounded-lg text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('chrome')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'chrome'
                ? 'bg-white text-[#006948] shadow-2xs'
                : 'text-[#6d7a72] hover:text-[#1a1c1a]'
            }`}
          >
            Chrome / Edge / Brave
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('safari')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'safari'
                ? 'bg-white text-[#006948] shadow-2xs'
                : 'text-[#6d7a72] hover:text-[#1a1c1a]'
            }`}
          >
            Safari (iOS / Mac)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firefox')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'firefox'
                ? 'bg-white text-[#006948] shadow-2xs'
                : 'text-[#6d7a72] hover:text-[#1a1c1a]'
            }`}
          >
            Firefox
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'android'
                ? 'bg-white text-[#006948] shadow-2xs'
                : 'text-[#6d7a72] hover:text-[#1a1c1a]'
            }`}
          >
            Android
          </button>
        </div>

        {/* Guide Steps */}
        <div className="pt-1 text-xs text-[#3d4a42] space-y-2">
          {activeTab === 'chrome' && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Look at the <strong>URL address bar</strong> at the top of your browser.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Click the <strong>camera with a red slash icon</strong> or <strong>tune / padlock icon</strong> on the left of the URL.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Change <strong>Camera</strong> from <em>Block</em> to <strong>Always allow</strong>, then click <strong>Request Permission Again</strong> above.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'safari' && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>On iPhone / iPad:</strong> Open the iOS <strong>Settings</strong> app &gt; <strong>Safari</strong> &gt; <strong>Camera</strong> &gt; Set to <strong>Ask</strong> or <strong>Allow</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>On Mac Safari:</strong> Click <strong>Safari</strong> in top menu &gt; <strong>Settings for This Website</strong> &gt; Set <strong>Camera</strong> to <strong>Allow</strong>.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'firefox' && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Click the <strong>permission icon</strong> (camera with a cross) next to the URL.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Click the <strong>&times;</strong> next to <em>Blocked Temporarily</em>, then click <strong>Request Permission Again</strong>.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the three dots (⋮) in the top-right &gt; <strong>Settings</strong> &gt; <strong>Site settings</strong> &gt; <strong>Camera</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#006948] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Make sure camera is toggled <strong>ON</strong> and tap this site under Blocked to remove it.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* One-Click Sample Barcodes to Test Without Camera */}
      {onSelectSampleCode && (
        <div className="pt-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1a1c1a] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#006948]" />
              <span>Or verify instantly with a test barcode:</span>
            </span>
            <span className="text-[11px] text-[#6d7a72]">No camera required</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sampleQuickCodes.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSampleCode(item.code, item.format)}
                className="p-2 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#bccac0]/40 text-left transition-colors cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-[#006948] group-hover:underline">
                  {item.format}
                </div>
                <div className="text-xs font-semibold text-[#1a1c1a] truncate mt-0.5">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
