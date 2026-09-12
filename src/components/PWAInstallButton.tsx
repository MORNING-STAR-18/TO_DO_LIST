import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Icon } from '@iconify/react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all"
      >
        <Icon icon="ph:download-simple-bold" className="text-lg" />
        Install Neural Link
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-black/40 px-3 py-1.5 text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 hover:bg-cyan-900/40 transition-all"
        >
          <Icon icon="ph:apple-logo-fill" className="text-lg" />
          Install iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#050505] border border-cyan-500/50 p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <h3 className="text-lg font-mono font-bold text-cyan-400 flex items-center gap-2">
                <Icon icon="ph:info-bold" />
                iOS Installation Protocol
              </h3>
              <div className="mt-4 text-sm text-cyan-100/70 font-mono space-y-3">
                <p>1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar.</p>
                <p>2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-cyan-500/20 border border-cyan-500/50 py-2 text-sm font-mono font-bold text-cyan-400 hover:bg-cyan-500/40 transition-all uppercase tracking-widest"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
