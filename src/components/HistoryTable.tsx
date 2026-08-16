import React, { useState } from 'react';
import { HistoryItem, ThemeConfig } from '../types';
import { Plus, Trash2, TrendingUp, Crown, CheckCircle2, XCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface HistoryTableProps {
  history: HistoryItem[];
  theme: ThemeConfig;
  apiConnected?: boolean;
  onAddManualResult: (num: number) => void;
  onClearHistory: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  theme,
  apiConnected = true,
  onAddManualResult,
  onClearHistory,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const totalWins = history.filter((h) => h.status === 'WIN' || h.status === 'JACKPOT').length;
  const totalJackpots = history.filter((h) => h.status === 'JACKPOT').length;
  const winRate = history.length > 0 ? Math.round((totalWins / history.length) * 100) : 100;

  const handleManualAdd = (n: number) => {
    sound.playWin();
    onAddManualResult(n);
    setShowAddModal(false);
  };

  const getNumberColorClass = (num: number, rawColor?: string) => {
    if (rawColor) {
      if (rawColor.includes('red') && rawColor.includes('violet')) {
        return 'bg-gradient-to-tr from-rose-600 to-purple-600 border-purple-400 text-white';
      }
      if (rawColor.includes('green') && rawColor.includes('violet')) {
        return 'bg-gradient-to-tr from-emerald-600 to-purple-600 border-purple-400 text-white';
      }
      if (rawColor.includes('green')) {
        return 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300';
      }
      if (rawColor.includes('red')) {
        return 'bg-rose-950/60 border-rose-500/50 text-rose-300';
      }
    }

    if (num === 0) return 'bg-gradient-to-tr from-rose-600 to-purple-600 border-purple-400 text-white';
    if (num === 5) return 'bg-gradient-to-tr from-emerald-600 to-purple-600 border-purple-400 text-white';
    if (num % 2 === 0) return 'bg-rose-950/60 border-rose-500/50 text-rose-300';
    return 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300';
  };

  return (
    <div id="history-table-container" className="w-full mt-3 mb-6">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 font-rajdhani flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            WINGO 1M DRAW HISTORY
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono-tech border flex items-center gap-1"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.4)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#34d399',
            }}
          >
            <span>ACCURACY: {winRate}%</span>
            {totalJackpots > 0 && (
              <span className="text-amber-300 font-bold ml-0.5">({totalJackpots}👑)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="add-history-btn"
            onClick={() => setShowAddModal(true)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors border border-white/10"
            title="Log manual result number (0-9)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            id="clear-history-btn"
            onClick={() => {
              sound.playClick();
              onClearHistory();
            }}
            className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors border border-white/10"
            title="Reset history table"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Manual Number Picker Bar */}
      {showAddModal && (
        <div
          id="quick-add-result-bar"
          className="mb-3 p-2.5 rounded-xl border bg-[#140e0a] backdrop-blur-lg animate-in fade-in"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center justify-between text-xs font-bold text-neutral-300 mb-2 font-rajdhani">
            <span>SELECT DRAWN NUMBER (0 - 9):</span>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-neutral-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handleManualAdd(n)}
                className={`py-2 rounded font-black font-mono-tech text-xs sm:text-sm border transition-all ${
                  n <= 4
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-black'
                    : 'bg-orange-950/40 border-orange-500/40 text-orange-300 hover:bg-orange-500 hover:text-black'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1.5 px-1 font-mono-tech">
            <span>0-4 = SMALL</span>
            <span>5-9 = BIG</span>
          </div>
        </div>
      )}

      {/* Main Table Layout */}
      <div className="w-full">
        {/* Table Column Headers */}
        <div className="grid grid-cols-4 px-3 py-2 text-[11px] sm:text-xs font-bold font-rajdhani uppercase tracking-wider text-neutral-400 border-b border-white/10">
          <div className="text-left">PERIOD</div>
          <div className="text-center">PRED</div>
          <div className="text-center">NUM</div>
          <div className="text-right pr-2 sm:pr-4">STATUS</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500 font-mono-tech">
              FETCHING LIVE WINGO 1M ISSUE RECORDS...
            </div>
          ) : (
            history.map((item) => {
              const isJackpot = item.status === 'JACKPOT';
              const isWin = item.status === 'WIN';
              const isLoss = item.status === 'LOSS';

              return (
                <div
                  key={item.id}
                  id={`history-row-${item.issue.replace('#', '')}`}
                  className="grid grid-cols-4 items-center px-3 py-2.5 sm:py-3 transition-colors hover:bg-white/[0.02]"
                >
                  {/* Issue / Period */}
                  <div className="text-left font-mono-tech font-bold text-xs sm:text-sm text-neutral-300 flex flex-col">
                    <span>{item.issue}</span>
                    {item.fullIssue && item.fullIssue !== item.issue && (
                      <span className="text-[9px] text-neutral-500 font-mono hidden sm:inline">
                        {item.fullIssue.slice(-6)}
                      </span>
                    )}
                  </div>

                  {/* Predicted BIG or SMALL */}
                  <div
                    className="text-center font-orbitron font-bold text-xs sm:text-sm uppercase tracking-wider"
                    style={{
                      color: theme.text,
                      textShadow: `0 0 6px ${theme.primaryGlow}`,
                    }}
                  >
                    {item.pred}
                  </div>

                  {/* Outcome Number in Glowing Pill */}
                  <div className="text-center flex justify-center">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black font-mono-tech text-xs sm:text-sm border transition-all ${getNumberColorClass(
                        item.num,
                        item.color
                      )}`}
                    >
                      {item.num}
                    </span>
                  </div>

                  {/* Status Pill Badge: JACKPOT, WIN or LOSS */}
                  <div className="text-right flex justify-end">
                    {isJackpot ? (
                      <span
                        className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-black font-orbitron tracking-wider uppercase border transition-all border-amber-400/80 text-amber-300 bg-amber-950/40"
                        style={{
                          boxShadow: '0 0 12px rgba(251, 191, 36, 0.4), inset 0 0 8px rgba(251, 191, 36, 0.2)',
                        }}
                      >
                        <Crown className="w-3 h-3 text-amber-300 fill-amber-300 hidden sm:inline" />
                        <span>JACKPOT</span>
                      </span>
                    ) : isWin ? (
                      <span
                        className="inline-flex items-center justify-center gap-1 px-3 sm:px-5 py-1 rounded-full text-xs font-black font-orbitron tracking-widest uppercase border transition-all border-emerald-500/60 text-emerald-400 bg-emerald-950/30"
                        style={{
                          boxShadow: '0 0 10px rgba(16, 185, 129, 0.25), inset 0 0 8px rgba(16, 185, 129, 0.15)',
                        }}
                      >
                        <span>WIN</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center justify-center gap-1 px-3 sm:px-5 py-1 rounded-full text-xs font-black font-orbitron tracking-widest uppercase border transition-all border-rose-500/60 text-rose-400 bg-rose-950/30"
                        style={{
                          boxShadow: '0 0 10px rgba(244, 63, 94, 0.25), inset 0 0 8px rgba(244, 63, 94, 0.15)',
                        }}
                      >
                        <span>LOSS</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
