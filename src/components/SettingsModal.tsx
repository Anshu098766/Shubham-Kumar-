import React from 'react';
import { AppSettings, ThemeConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  theme: ThemeConfig;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  theme,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md rounded-2xl p-5 border bg-[#140e0a] text-white shadow-2xl relative"
        style={{ borderColor: theme.border, boxShadow: `0 0 30px ${theme.primaryGlow}` }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-bold text-sm uppercase tracking-wider font-orbitron" style={{ color: theme.text }}>
            Radar Engine Settings
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs font-rajdhani">
          {/* Round Duration Timer */}
          <div>
            <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Sync Round Duration:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 180, 300].map((dur) => (
                <button
                  key={dur}
                  onClick={() => onUpdateSettings({ roundDuration: dur })}
                  className={`py-2 rounded-lg font-mono-tech font-bold border transition-all ${
                    settings.roundDuration === dur
                      ? 'border-white text-black font-black'
                      : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: settings.roundDuration === dur ? theme.primary : undefined,
                  }}
                >
                  {dur < 60 ? `${dur}s (WinGo 30s)` : `${dur / 60}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Simulation Switch */}
          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div>
              <div className="font-bold text-sm text-neutral-200">Auto Live Period Advance</div>
              <div className="text-[11px] text-neutral-400">
                Automatically increment periods and generate new signals when countdown hits 0
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={(e) => onUpdateSettings({ autoSync: e.target.checked })}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Sound FX Switch */}
          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div>
              <div className="font-bold text-sm text-neutral-200">Cyber Sound Effects</div>
              <div className="text-[11px] text-neutral-400">
                Audio beeps on radar scan, copy click, and victory chimes
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Confidence Slider */}
          <div className="py-2 border-t border-white/10">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-neutral-200">Default Signal Confidence:</span>
              <span className="font-mono-tech font-bold" style={{ color: theme.text }}>
                {settings.customConfidence}%
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="99"
              value={settings.customConfidence}
              onChange={(e) => onUpdateSettings({ customConfidence: Number(e.target.value) })}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Test Animations Section */}
          <div className="py-2 border-t border-white/10">
            <div className="font-bold text-sm text-neutral-200 mb-2">Test Live Animations:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ testAnimation: 'WIN' } as any)}
                className="py-2 rounded-lg font-orbitron font-bold text-[10px] sm:text-xs bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all"
              >
                🏆 TEST WIN
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ testAnimation: 'JACKPOT' } as any)}
                className="py-2 rounded-lg font-orbitron font-bold text-[10px] sm:text-xs bg-amber-950/60 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-black transition-all"
              >
                👑 JACKPOT
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ testAnimation: 'LOSS' } as any)}
                className="py-2 rounded-lg font-orbitron font-bold text-[10px] sm:text-xs bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-black transition-all"
              >
                ⚠️ TEST LOSS
              </button>
            </div>
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
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
