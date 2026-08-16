import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, Zap, Edit3, HelpCircle, ShieldAlert, KeyRound, LogOut } from 'lucide-react';
import { EngineType, LicenseKey, ThemeConfig } from '../types';
import { sound } from '../utils/audio';

interface HeaderProps {
  appName: string;
  engine: EngineType;
  theme: ThemeConfig;
  soundEnabled: boolean;
  isAdmin?: boolean;
  currentKey?: LicenseKey;
  timeLeftFormatted?: string;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onSelectEngine: (engine: EngineType) => void;
  onEditAppName: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

const ENGINE_LABELS: Record<EngineType, string> = {
  MARKOV: 'MARKOV ENGINE',
  PATTERN: 'PATTERN MATRIX',
  GAP: 'GAP COMPENSATOR',
  ZIGZAG: 'ZIGZAG PRO',
  PAIR: 'PAIR REBOUND',
  TREND: 'TREND STREAK',
  MEAN: 'MEAN REVERSION',
  MOMENTUM: 'MOMENTUM SLOPE',
  DRAGON: 'DRAGON RADAR',
  ENSEMBLE: 'ENSEMBLE 8-AI',
  ALWAYS_REVERSE: 'REVERSE ENGINE',
  NEURAL_AI: 'NEURAL AI v4',
};

export const Header: React.FC<HeaderProps> = ({
  appName,
  engine,
  theme,
  soundEnabled,
  isAdmin = false,
  currentKey,
  timeLeftFormatted,
  onToggleSound,
  onOpenSettings,
  onSelectEngine,
  onEditAppName,
  onOpenHelp,
  onOpenAdmin,
  onLogout,
}) => {
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);

  return (
    <header
      id="app-header"
      className="w-full flex flex-col py-2 px-1 border-b border-white/5 relative z-30 space-y-1.5"
    >
      {/* Top Bar with Name & Admin/Controls */}
      <div className="flex items-center justify-between">
        {/* App Branding */}
        <div className="flex items-center gap-1.5 group cursor-pointer" onClick={onEditAppName}>
          <h1
            id="app-title-display"
            className="text-base sm:text-lg font-black tracking-wider uppercase font-orbitron flex items-center gap-1 transition-all"
            style={{
              color: theme.text,
              textShadow: `0 0 12px ${theme.primaryGlow}`,
            }}
          >
            {appName}
          </h1>
          <button
            id="edit-title-btn"
            className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white transition-opacity p-0.5"
            title="Edit Title Name"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5">
          {/* Admin Panel Access Button */}
          <button
            id="header-admin-btn"
            onClick={onOpenAdmin}
            className={`py-1 px-2 rounded-lg border text-[10px] font-orbitron font-bold flex items-center gap-1 transition-all ${
              isAdmin
                ? 'bg-purple-950/90 border-purple-500/70 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-black/60 border-purple-500/40 text-purple-300/90 hover:bg-purple-950/60 hover:border-purple-400'
            }`}
            title="Open ANSH Master Admin Panel"
          >
            <ShieldAlert className="w-3 h-3 text-purple-400" />
            <span>ADMIN</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'text-neutral-300 border-white/10 hover:border-white/25 hover:bg-white/5'
                : 'text-neutral-500 border-white/5 bg-black/40'
            }`}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Help Modal */}
          <button
            id="help-modal-btn"
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg border border-white/10 hover:border-white/25 text-neutral-400 hover:text-white transition-colors hover:bg-white/5"
            title="Guide & Signals Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Settings */}
          <button
            id="settings-modal-btn"
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-white/10 hover:border-white/25 text-neutral-400 hover:text-white transition-colors hover:bg-white/5"
            title="Engine Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Logout / Switch Key */}
          <button
            id="header-logout-btn"
            onClick={onLogout}
            className="p-1.5 rounded-lg border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-colors hover:bg-red-500/10"
            title="Lock & Logout Key"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub Bar: ANSH License Validity Status + Engine Selector */}
      <div className="flex items-center justify-between text-[11px] font-mono-tech pt-1">
        {/* ANSH License Status Badge */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <KeyRound className="w-3 h-3 text-amber-400" />
          <span className="text-neutral-400">ANSH KEY:</span>
          <span className="font-bold text-amber-400">
            {isAdmin ? 'ADMIN UNLIMITED' : timeLeftFormatted || 'ACTIVE'}
          </span>
        </div>

        {/* Engine Dropdown Switcher */}
        <div className="relative">
          <button
            id="engine-switcher-btn"
            onClick={() => {
              sound.playClick();
              setShowEngineDropdown(!showEngineDropdown);
            }}
            className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold tracking-wider uppercase font-rajdhani transition-all flex items-center gap-1 border"
            style={{
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.primaryLight,
            }}
          >
            <Zap className="w-2.5 h-2.5 animate-pulse" />
            <span>{ENGINE_LABELS[engine]}</span>
          </button>

          {/* Dropdown Menu */}
          {showEngineDropdown && (
            <div
              id="engine-dropdown-menu"
              className="absolute right-0 mt-1.5 w-48 bg-[#120d09] border border-white/10 rounded-lg shadow-2xl p-1.5 z-50 backdrop-blur-xl"
              style={{
                borderColor: theme.border,
                boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 15px ${theme.primaryGlow}`,
              }}
            >
              <div className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-1 tracking-wider border-b border-white/10 mb-1">
                Select Algorithm Engine
              </div>
              {(Object.keys(ENGINE_LABELS) as EngineType[]).map((engKey) => (
                <button
                  key={engKey}
                  onClick={() => {
                    sound.playConfirmed();
                    onSelectEngine(engKey);
                    setShowEngineDropdown(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-between transition-colors ${
                    engine === engKey ? 'bg-white/15 font-bold' : 'hover:bg-white/5 text-neutral-300'
                  }`}
                  style={{
                    color: engine === engKey ? theme.text : undefined,
                  }}
                >
                  <span>{ENGINE_LABELS[engKey]}</span>
                  {engine === engKey && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
