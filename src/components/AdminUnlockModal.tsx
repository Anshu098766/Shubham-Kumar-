import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, KeyRound, Lock, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ThemeConfig } from '../types';
import { ADMIN_MASTER_KEY } from '../utils/keyManager';
import { sound } from '../utils/audio';

interface AdminUnlockModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  theme,
  onClose,
  onSuccess,
}) => {
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sound.playClick();

    const clean = adminKeyInput.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('PLEASE ENTER MASTER ADMIN KEY');
      sound.playLoss();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    setTimeout(() => {
      setIsLoading(false);
      if (clean === ADMIN_MASTER_KEY) {
        sound.playConfirmed();
        setSuccessMsg('ADMIN KEY VERIFIED! OPENING ADMIN PANEL... 👑');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 600);
      } else {
        sound.playLoss();
        setErrorMsg('INVALID ADMIN MASTER KEY!');
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      <div
        id="admin-unlock-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-md rounded-3xl p-6 border shadow-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(18, 12, 10, 0.96)',
            borderColor: 'rgba(168, 85, 247, 0.4)',
            boxShadow: '0 0 50px rgba(168, 85, 247, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.04)',
          }}
        >
          {/* Top Close Button */}
          <button
            id="close-admin-unlock-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <ShieldAlert className="w-7 h-7 text-purple-400 animate-pulse" />
            </div>

            <h2 className="text-xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-400 uppercase">
              MASTER ADMIN ACCESS
            </h2>
            <p className="text-xs font-mono-tech text-purple-300/70 mt-1">
              AUTHORIZED PERSONNEL ONLY
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold font-rajdhani uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center justify-between">
                <span>ENTER ADMIN MASTER KEY:</span>
                <span className="text-[11px] text-purple-400/80 font-mono-tech">SECURE AUTH</span>
              </label>

              <div className="relative">
                <input
                  id="admin-master-key-input"
                  type="password"
                  autoFocus
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value.toUpperCase())}
                  placeholder="ENTER MASTER KEY..."
                  className="w-full py-3.5 pl-10 pr-4 rounded-xl bg-black/70 border border-purple-500/40 text-base font-mono-tech font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-purple-400 transition-all uppercase tracking-widest"
                />
                <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono-tech text-center flex items-center justify-center gap-1.5">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success message */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono-tech text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="unlock-admin-panel-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest font-orbitron uppercase bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>UNLOCK ADMIN PANEL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info */}
          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <span className="text-[11px] font-mono-tech text-neutral-400">
              Only authorized administrators can generate & manage license keys.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
