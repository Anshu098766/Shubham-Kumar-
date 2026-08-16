import React, { useState } from 'react';
import { ThemeConfig } from '../types';
import { sound } from '../utils/audio';

interface EditTitleModalProps {
  isOpen: boolean;
  currentTitle: string;
  theme: ThemeConfig;
  onSave: (newTitle: string) => void;
  onClose: () => void;
}

export const EditTitleModal: React.FC<EditTitleModalProps> = ({
  isOpen,
  currentTitle,
  theme,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(currentTitle);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      sound.playConfirmed();
      onSave(title.trim());
      onClose();
    }
  };

  const presetTitles = [
    'ANSH BHAI FEV 🫶',
    'ANSH TRADER PRO 👑',
    'ANSH PRO PREDICTOR ⚡',
    'WINGO GOD SIGNAL 🔥',
    'CYBER MATRIX HUD 🌐',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md rounded-2xl p-5 border bg-[#140e0a] text-white shadow-2xl relative"
        style={{ borderColor: theme.border, boxShadow: `0 0 30px ${theme.primaryGlow}` }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-bold text-sm uppercase tracking-wider font-orbitron" style={{ color: theme.text }}>
            Customize App Title
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1 font-rajdhani">
              Custom Title / Branding
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/20 text-white font-orbitron font-bold text-sm focus:outline-none focus:border-orange-500"
              style={{ borderColor: theme.border }}
              placeholder="e.g. ANSH BHAI FEV 🫶"
              maxLength={35}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-rajdhani">
              Quick Preset Names:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetTitles.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setTitle(p)}
                  className="px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/15 border border-white/10 font-mono-tech transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase rounded-lg border border-white/10 hover:bg-white/5 text-neutral-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black uppercase rounded-lg font-orbitron"
              style={{
                background: theme.btnBg,
                color: theme.btnText,
              }}
            >
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
