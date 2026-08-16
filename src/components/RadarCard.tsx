import React, { useState } from 'react';
import { CurrentSignal, ThemeConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, RefreshCw, Radio, Flame, Sparkles } from 'lucide-react';

interface RadarCardProps {
  signal: CurrentSignal;
  theme: ThemeConfig;
  onRefreshPrediction: () => void;
  onSelectManualPred: (pred: 'BIG' | 'SMALL') => void;
}

export const RadarCard: React.FC<RadarCardProps> = ({
  signal,
  theme,
  onRefreshPrediction,
  onSelectManualPred,
}) => {
  const [showFullPeriod, setShowFullPeriod] = useState(false);
  const isSmall = signal.prediction === 'SMALL';

  // Format countdown mm:ss
  const formattedCountdown = `${Math.floor(signal.syncSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(signal.syncSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <div
      id="main-radar-card"
      className="w-full rounded-2xl relative overflow-hidden p-3.5 sm:p-5 transition-all duration-300 border backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(15, 10, 6, 0.75)',
        borderColor: theme.border,
        boxShadow: `0 0 30px ${theme.primaryGlow}, inset 0 0 25px rgba(255, 255, 255, 0.02)`,
      }}
    >
      {/* Background Cyber Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${theme.primary} 1px, transparent 1px),
            linear-gradient(to bottom, ${theme.primary} 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header of Card: PERIOD & 1-MINUTE SYNC */}
      <div className="flex items-center justify-between relative z-10 mb-1.5">
        {/* Period Number with Click Toggle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <button
              id="period-toggle-btn"
              onClick={() => setShowFullPeriod(!showFullPeriod)}
              className="text-left group flex items-center gap-1 focus:outline-none"
              title="Click to toggle Full WinGo Issue Number"
            >
              <span
                id="period-indicator"
                className="text-xs sm:text-sm font-bold tracking-wider font-mono-tech uppercase group-hover:underline"
                style={{ color: theme.text }}
              >
                PERIOD: {showFullPeriod && signal.fullPeriod ? signal.fullPeriod : signal.period}
              </span>
            </button>
            <button
              id="manual-resync-btn"
              onClick={onRefreshPrediction}
              title="Recalculate AI Prediction Signal"
              className="text-neutral-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Subtitle with API Connection status */}
          <div className="flex items-center gap-1 text-[10px] font-mono-tech text-neutral-400">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">
              {signal.apiConnected ? 'WinGo 1M Live API' : '1-Min Sync Engine'}
            </span>
          </div>
        </div>

        {/* 1-Minute Live Countdown Timer */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span
              id="sync-timer-display"
              className="text-xs sm:text-sm font-black tracking-widest font-mono-tech uppercase"
              style={{ color: theme.text }}
            >
              SYNC: {signal.syncSeconds}s ({formattedCountdown})
            </span>
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: theme.primary }}
            />
          </div>
          <span className="text-[10px] font-mono-tech text-neutral-400 uppercase tracking-wider">
            1 MINUTE ROUND
          </span>
        </div>
      </div>

      {/* Center Radar Scanner Graphics */}
      <div className="relative my-3 sm:my-4 flex items-center justify-center min-h-[210px] sm:min-h-[240px]">
        {/* Outer Circular Bounds & Degrees */}
        <div
          className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full flex items-center justify-center"
          style={{
            border: `1px solid ${theme.primaryLight}`,
          }}
        >
          {/* Rotating Dashed Tech Ring */}
          <div
            className="absolute inset-2 rounded-full border-2 border-dashed radar-sweep-fast pointer-events-none opacity-80"
            style={{
              borderColor: theme.primary,
            }}
          />

          {/* Secondary Counter-rotating Ring with Notches */}
          <div
            className="absolute inset-5 rounded-full border border-dotted pointer-events-none opacity-40"
            style={{
              borderColor: theme.primary,
              animation: 'radar-spin 12s linear infinite reverse',
            }}
          />

          {/* Sweeping Radar Cone/Beam */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-45 radar-sweep">
            <div
              className="w-full h-full"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, ${theme.primaryGlow} 340deg, ${theme.primary} 360deg)`,
              }}
            />
          </div>

          {/* Concentric Glow Ring */}
          <div
            className="absolute inset-9 rounded-full pointer-events-none"
            style={{
              border: `1px solid ${theme.border}`,
              boxShadow: `0 0 20px ${theme.primaryGlow}`,
            }}
          />

          {/* Cardinal Crosshair Markers */}
          <div
            className="absolute -top-1 w-2 h-1 left-1/2 -translate-x-1/2"
            style={{ backgroundColor: theme.primary }}
          />
          <div
            className="absolute -bottom-1 w-2 h-1 left-1/2 -translate-x-1/2"
            style={{ backgroundColor: theme.primary }}
          />
          <div
            className="absolute -left-1 h-2 w-1 top-1/2 -translate-y-1/2"
            style={{ backgroundColor: theme.primary }}
          />
          <div
            className="absolute -right-1 h-2 w-1 top-1/2 -translate-y-1/2"
            style={{ backgroundColor: theme.primary }}
          />

          {/* Center Main Bold Typography: SMALL or BIG */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={signal.prediction}
                initial={{ scale: 0.8, opacity: 0, filter: 'blur(4px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scale: 1.15, opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center cursor-pointer group"
                onClick={() =>
                  onSelectManualPred(signal.prediction === 'SMALL' ? 'BIG' : 'SMALL')
                }
                title="Click to toggle prediction override"
              >
                <span
                  id="prediction-display-text"
                  className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest font-orbitron uppercase text-center transition-all select-none group-hover:scale-105"
                  style={{
                    color: theme.text,
                    textShadow: `
                      0 0 10px ${theme.primary},
                      0 0 25px ${theme.primary},
                      0 0 50px ${theme.primaryGlow}
                    `,
                  }}
                >
                  {signal.prediction}
                </span>

                {/* Sub Numbers Target Tag */}
                <div
                  className="mt-1 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-mono-tech tracking-widest border transition-all"
                  style={{
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                >
                  {isSmall ? 'RANGE: [ 0 • 1 • 2 • 3 • 4 ]' : 'RANGE: [ 5 • 6 • 7 • 8 • 9 ]'}
                </div>

                {/* Hot Numbers Indicator */}
                {signal.hotNumbers && signal.hotNumbers.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-mono-tech font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400 animate-bounce" />
                    <span>HOT: {signal.hotNumbers.join(', ')}</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Status & Confirmation Row */}
      <div
        className="relative z-10 pt-2 pb-2 px-1 border-t border-b flex items-center justify-between text-xs sm:text-sm font-rajdhani font-semibold uppercase tracking-wider"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="flex items-center gap-1.5">
          <Activity
            className="w-3.5 h-3.5 animate-pulse"
            style={{ color: theme.primary }}
          />
          <span
            id="status-engine-text"
            className="font-bold tracking-wider"
            style={{ color: theme.text }}
          >
            {signal.engine} | {signal.status}
          </span>
        </div>

        <div
          id="confidence-score-text"
          className="font-bold font-mono-tech flex items-center gap-1"
          style={{ color: theme.text }}
        >
          <Sparkles className="w-3 h-3" />
          CONF: {signal.confidence}%
        </div>
      </div>

      {/* Accuracy Breakdown Sub-Stats Row */}
      <div className="grid grid-cols-3 gap-1 pt-2 text-center text-[10px] sm:text-xs font-rajdhani font-bold uppercase tracking-wider">
        <div
          className="py-1 px-1 rounded bg-white/5"
          style={{ color: 'rgba(255, 255, 255, 0.85)' }}
        >
          <span className="text-neutral-400">DRAGON ACC:</span>{' '}
          <span style={{ color: theme.text }}>{signal.dragonAcc}%</span>
        </div>
        <div
          className="py-1 px-1 rounded bg-white/5"
          style={{ color: 'rgba(255, 255, 255, 0.85)' }}
        >
          <span className="text-neutral-400">ZIGZAG ACC:</span>{' '}
          <span style={{ color: theme.text }}>{signal.zigzagAcc}%</span>
        </div>
        <div
          className="py-1 px-1 rounded bg-white/5"
          style={{ color: 'rgba(255, 255, 255, 0.85)' }}
        >
          <span className="text-neutral-400">REVERSE ACC:</span>{' '}
          <span style={{ color: theme.text }}>{signal.reverseAcc}%</span>
        </div>
      </div>
    </div>
  );
};
