import React from 'react';
import { ThemeConfig } from '../types';
import { ShieldCheck, HelpCircle, Cpu, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, theme, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md rounded-2xl p-5 border bg-[#140e0a] text-white shadow-2xl relative max-h-[85vh] overflow-y-auto"
        style={{ borderColor: theme.border, boxShadow: `0 0 30px ${theme.primaryGlow}` }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: theme.primary }} />
            <h3 className="font-bold text-sm uppercase tracking-wider font-orbitron" style={{ color: theme.text }}>
              HUD System Guide
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-neutral-300 font-rajdhani">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white uppercase flex items-center gap-1.5 mb-1 text-sm">
              <Zap className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              1. Live Radar Prediction
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              The central radar displays real-time <strong>SMALL</strong> (0-4) or <strong>BIG</strong> (5-9) predictions. It synchronizes with the countdown timer (SYNC) for every game period.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white uppercase flex items-center gap-1.5 mb-1 text-sm">
              <Cpu className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              2. 10 Theme Matrix Engine
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Click any of the 10 glowing circular swatches on top to dynamically switch themes (Neon Orange, Cyber Cyan, Electric Violet, Emerald, Gold, Ruby, etc.).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white uppercase flex items-center gap-1.5 mb-1 text-sm">
              <HelpCircle className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              3. One-Click ANSH Signal Copy
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Click <strong>COPY PREDICTION SIGNAL</strong> to format a full Telegram / ANSH channel signal complete with issue number, prediction, risk level, confidence score, and numbers range.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white uppercase flex items-center gap-1.5 mb-1 text-sm">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              4. Manual Outcome Verification
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Click the <strong>+</strong> button above the history table to record any number (0-9) and automatically verify WIN/LOSS status and live win rate.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-black uppercase text-xs font-orbitron"
            style={{
              background: theme.btnBg,
              color: theme.btnText,
            }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
