import React from 'react';
import { CurrentSignal, RiskLevel, ThemeConfig } from '../types';
import { sound } from '../utils/audio';

interface StatCardsProps {
  signal: CurrentSignal;
  theme: ThemeConfig;
  onUpdateLevel: (level: string, multiplier: string) => void;
  onUpdateRisk: (risk: RiskLevel) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  signal,
  theme,
  onUpdateLevel,
  onUpdateRisk,
}) => {
  const levels = [
    { level: 'L1', mult: '1X' },
    { level: 'L2', mult: '3X' },
    { level: 'L3', mult: '8X' },
    { level: 'L4', mult: '24X' },
  ];

  const handleNextLevel = () => {
    sound.playClick();
    const currentIdx = levels.findIndex((l) => l.level === signal.level);
    const nextIdx = (currentIdx + 1) % levels.length;
    onUpdateLevel(levels[nextIdx].level, levels[nextIdx].mult);
  };

  const handleNextRisk = () => {
    sound.playClick();
    const risks: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
    const currentIdx = risks.indexOf(signal.risk);
    const nextIdx = (currentIdx + 1) % risks.length;
    onUpdateRisk(risks[nextIdx]);
  };

  return (
    <div id="stat-cards-container" className="w-full grid grid-cols-3 gap-2.5 my-3">
      {/* LEVEL Card */}
      <button
        id="level-stat-card"
        onClick={handleNextLevel}
        className="rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        style={{
          backgroundColor: 'rgba(18, 12, 8, 0.75)',
          borderColor: theme.border,
          boxShadow: `0 0 12px ${theme.primaryLight}`,
        }}
        title="Click to cycle Martingale Level (L1 - L4)"
      >
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 font-rajdhani">
          LEVEL
        </span>
        <span
          id="stat-level-value"
          className="text-lg sm:text-2xl font-black font-orbitron tracking-widest mt-0.5"
          style={{
            color: theme.text,
            textShadow: `0 0 8px ${theme.primaryGlow}`,
          }}
        >
          {signal.level}
        </span>
      </button>

      {/* MULTIPLIER Card */}
      <button
        id="multiplier-stat-card"
        onClick={handleNextLevel}
        className="rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        style={{
          backgroundColor: 'rgba(18, 12, 8, 0.75)',
          borderColor: theme.border,
          boxShadow: `0 0 12px ${theme.primaryLight}`,
        }}
        title="Click to cycle Multiplier"
      >
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 font-rajdhani">
          MULTIPLIER
        </span>
        <span
          id="stat-multiplier-value"
          className="text-lg sm:text-2xl font-black font-orbitron tracking-widest mt-0.5"
          style={{
            color: theme.text,
            textShadow: `0 0 8px ${theme.primaryGlow}`,
          }}
        >
          {signal.multiplier}
        </span>
      </button>

      {/* RISK Card */}
      <button
        id="risk-stat-card"
        onClick={handleNextRisk}
        className="rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        style={{
          backgroundColor: 'rgba(18, 12, 8, 0.75)',
          borderColor: theme.border,
          boxShadow: `0 0 12px ${theme.primaryLight}`,
        }}
        title="Click to cycle Risk Level"
      >
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 font-rajdhani">
          RISK
        </span>
        <span
          id="stat-risk-value"
          className="text-lg sm:text-2xl font-black font-orbitron tracking-widest mt-0.5"
          style={{
            color:
              signal.risk === 'LOW'
                ? theme.text
                : signal.risk === 'MEDIUM'
                ? '#facc15'
                : '#ef4444',
            textShadow: `0 0 8px ${theme.primaryGlow}`,
          }}
        >
          {signal.risk}
        </span>
      </button>
    </div>
  );
};
