import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, AlertTriangle, Sparkles, X, Flame } from 'lucide-react';
import { ThemeConfig } from '../types';

export type OutcomeType = 'WIN' | 'JACKPOT' | 'LOSS';

export interface OutcomeData {
  type: OutcomeType;
  period: string;
  fullPeriod?: string;
  predicted: string;
  actualNum: number;
  actualSize: string;
  color?: string;
  level: string;
  multiplier: string;
  hotHit?: boolean;
}

interface OutcomeModalProps {
  data: OutcomeData | null;
  theme: ThemeConfig;
  onClose: () => void;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  data,
  theme,
  onClose,
}) => {
  if (!data) return null;

  const isJackpot = data.type === 'JACKPOT';
  const isWin = data.type === 'WIN' || isJackpot;
  const isLoss = data.type === 'LOSS';

  return (
    <AnimatePresence>
      <motion.div
        id="outcome-celebration-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Floating Confetti / Particle Elements for Win & Jackpot */}
        {isWin && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  y: -20,
                  rotate: 0,
                  scale: Math.random() * 0.8 + 0.5,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: Math.random() * 2.5 + 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 1.5,
                }}
                className={`absolute w-3 h-3 rounded-sm ${
                  isJackpot
                    ? i % 2 === 0
                      ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                      : 'bg-yellow-200 shadow-[0_0_8px_#fef08a]'
                    : i % 3 === 0
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : i % 3 === 1
                    ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                    : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                }`}
              />
            ))}
          </div>
        )}

        {/* Modal Card */}
        <motion.div
          id="outcome-card-container"
          initial={{ scale: 0.7, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-3xl p-6 text-center border overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: isJackpot
              ? 'rgba(26, 18, 0, 0.95)'
              : isWin
              ? 'rgba(6, 26, 14, 0.95)'
              : 'rgba(28, 8, 8, 0.95)',
            borderColor: isJackpot
              ? '#fbbf24'
              : isWin
              ? 'rgba(16, 185, 129, 0.6)'
              : 'rgba(239, 68, 68, 0.6)',
            boxShadow: isJackpot
              ? '0 0 50px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(251, 191, 36, 0.2)'
              : isWin
              ? '0 0 45px rgba(16, 185, 129, 0.35), inset 0 0 25px rgba(16, 185, 129, 0.15)'
              : '0 0 45px rgba(239, 68, 68, 0.35), inset 0 0 25px rgba(239, 68, 68, 0.15)',
          }}
        >
          {/* Close button */}
          <button
            id="close-outcome-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className="flex justify-center mb-3">
            {isJackpot ? (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -8, 8, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_#f59e0b] border-2 border-yellow-200"
              >
                <Crown className="w-11 h-11 text-black fill-black" />
              </motion.div>
            ) : isWin ? (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-300 flex items-center justify-center shadow-[0_0_30px_#10b981] border-2 border-emerald-300"
              >
                <Trophy className="w-10 h-10 text-black fill-black" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-700 to-red-500 flex items-center justify-center shadow-[0_0_30px_#ef4444] border-2 border-rose-400"
              >
                <AlertTriangle className="w-10 h-10 text-white" />
              </motion.div>
            )}
          </div>

          {/* Main Title */}
          <h3
            className="text-2xl sm:text-3xl font-black font-orbitron tracking-widest uppercase mb-1"
            style={{
              color: isJackpot ? '#fde047' : isWin ? '#34d399' : '#f87171',
              textShadow: isJackpot
                ? '0 0 20px #eab308'
                : isWin
                ? '0 0 20px #10b981'
                : '0 0 20px #ef4444',
            }}
          >
            {isJackpot ? '👑 ULTRA JACKPOT 👑' : isWin ? '⚡ WINNER! ⚡' : '⚠️ ROUND LOSS ⚠️'}
          </h3>

          <p className="text-xs font-mono-tech uppercase tracking-wider text-neutral-300 mb-4">
            {isJackpot
              ? 'EXACT HOT NUMBER MATCHED!'
              : isWin
              ? 'ANSH RADAR PREDICTION 100% SUCCESS'
              : 'AUTOMATIC MARTINGALE RECOVERY ACTIVATED'}
          </p>

          {/* Round Details Box */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 mb-4 text-left font-mono-tech space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">PERIOD:</span>
              <span className="font-bold text-white">{data.period}</span>
            </div>

            <div className="flex justify-between text-xs items-center">
              <span className="text-neutral-400">PREDICTED:</span>
              <span
                className="font-black px-2 py-0.5 rounded font-orbitron text-[11px]"
                style={{
                  backgroundColor: theme.primaryLight,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {data.predicted}
              </span>
            </div>

            <div className="flex justify-between text-xs items-center">
              <span className="text-neutral-400">OUTCOME NUMBER:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white">
                  {data.actualNum}
                </span>
                <span className="font-bold text-emerald-400">{data.actualSize}</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-white/10 flex justify-between text-xs">
              <span className="text-neutral-400">
                {isWin ? 'STATUS:' : 'RECOVERY PLAN:'}
              </span>
              <span
                className={`font-black font-orbitron ${
                  isWin ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isWin ? 'LEVEL 1 (1X) RESET' : `NEXT: ${data.level} (${data.multiplier})`}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            id="continue-after-outcome-btn"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-black font-orbitron text-xs sm:text-sm tracking-widest uppercase transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{
              background: isJackpot
                ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
                : isWin
                ? 'linear-gradient(to right, #059669, #10b981)'
                : 'linear-gradient(to right, #b91c1c, #ef4444)',
              color: isJackpot ? '#000' : '#fff',
            }}
          >
            {isWin ? 'CONTINUE TO NEXT ROUND 🚀' : 'ACCEPT RECOVERY SIGNAL ⚡'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
