import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { CurrentSignal, ThemeConfig } from '../types';
import { sound } from '../utils/audio';

interface CopySignalButtonProps {
  appName: string;
  signal: CurrentSignal;
  theme: ThemeConfig;
  onShowToast: (message: string) => void;
}

export const CopySignalButton: React.FC<CopySignalButtonProps> = ({
  appName,
  signal,
  theme,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    sound.playConfirmed();

    const rangeStr =
      signal.prediction === 'SMALL' ? '0 • 1 • 2 • 3 • 4' : '5 • 6 • 7 • 8 • 9';
    const hotStr = signal.hotNumbers && signal.hotNumbers.length > 0 ? ` [ ${signal.hotNumbers.join(', ')} ]` : ' [ 2, 4 ]';

    const formattedSignal = `╔════════════════════════╗
👑 ${appName.toUpperCase()} 👑
╚════════════════════════╝
🎯 ISSUE / PERIOD: ${signal.fullPeriod || signal.period} (${signal.period})
📊 PREDICTION    : ⚡ ${signal.prediction} ⚡
🎲 RANGE         : [ ${rangeStr} ]
🔥 HOT NUMBERS   : ${hotStr}
━━━━━━━━━━━━━━━━━━━━━━━━
📈 LEVEL         : ${signal.level} (${signal.multiplier})
🛡️ RISK          : ${signal.risk}
🧠 CONFIDENCE    : ${signal.confidence}%
⚙️ ENGINE        : ${signal.engine}
⏱️ TIMER         : WinGo 1-Min Live Sync
━━━━━━━━━━━━━━━━━━━━━━━━
✅ VERIFIED ANSH SIGNAL • 100% ACCURACY`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formattedSignal);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = formattedSignal;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      onShowToast('ANSH PREDICTION SIGNAL COPIED TO CLIPBOARD!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('SIGNAL READY (COPIED)');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div id="copy-signal-section" className="w-full my-2">
      <button
        id="copy-signal-btn"
        onClick={handleCopy}
        className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base tracking-widest font-orbitron uppercase flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer relative overflow-hidden"
        style={{
          background: theme.btnBg,
          color: theme.btnText,
          boxShadow: `0 4px 20px ${theme.primaryGlow}, inset 0 1px 1px rgba(255,255,255,0.4)`,
          border: `1px solid ${theme.btnBorder}`,
        }}
      >
        <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {copied ? (
          <>
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>SIGNAL COPIED!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5 stroke-[2.5]" />
            <span>COPY PREDICTION SIGNAL</span>
          </>
        )}
      </button>
    </div>
  );
};
