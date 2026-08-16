import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, ShieldCheck, Sparkles, Lock, ArrowRight, Copy, Check, Terminal, ExternalLink, HelpCircle } from 'lucide-react';
import { ThemeConfig, KeyDuration } from '../types';
import { validateAndActivateKey, ADMIN_MASTER_KEY, DURATION_CONFIG } from '../utils/keyManager';
import { sound } from '../utils/audio';

interface LoginPageProps {
  theme: ThemeConfig;
  appName: string;
  onLoginSuccess: (isAdmin: boolean) => void;
  onOpenAdminDirectly: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  theme,
  appName,
  onLoginSuccess,
  onOpenAdminDirectly,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDemoKeys, setShowDemoKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleActivate = (overrideKey?: string) => {
    sound.playClick();
    const targetKey = overrideKey || keyInput;

    if (!targetKey.trim()) {
      setErrorMessage('PLEASE ENTER A VALID LICENSE KEY OR ADMIN KEY');
      sound.playLoss();
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    setTimeout(() => {
      const result = validateAndActivateKey(targetKey);
      setIsVerifying(false);

      if (result.success) {
        sound.playConfirmed();
        setSuccessMessage(result.message);
        setTimeout(() => {
          onLoginSuccess(!!result.isAdmin);
        }, 800);
      } else {
        sound.playLoss();
        setErrorMessage(result.message);
      }
    }, 600);
  };

  const handlePasteDemo = (keyStr: string) => {
    setKeyInput(keyStr);
    handleActivate(keyStr);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      id="login-page-container"
      className="min-h-screen w-full flex items-center justify-center bg-[#070503] text-white p-3 sm:p-4 relative overflow-hidden"
      style={{ background: theme.bgGradient }}
    >
      {/* Background Animated Cyber Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${theme.primary} 1px, transparent 1px),
            linear-gradient(to bottom, ${theme.primary} 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Radiant Background Glow Orb */}
      <div
        className="absolute w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-30 top-1/4"
        style={{ backgroundColor: theme.primary }}
      />

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[440px] rounded-3xl p-5 sm:p-7 border backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: 'rgba(15, 10, 6, 0.85)',
          borderColor: theme.border,
          boxShadow: `0 0 40px ${theme.primaryGlow}, inset 0 0 30px rgba(255,255,255,0.03)`,
        }}
      >
        {/* Top App Logo & Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 border relative overflow-hidden shadow-lg"
            style={{
              backgroundColor: theme.primaryLight,
              borderColor: theme.border,
              boxShadow: `0 0 25px ${theme.primaryGlow}`,
            }}
          >
            <KeyRound className="w-8 h-8" style={{ color: theme.primary }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>

          <h1
            id="app-login-title"
            className="text-2xl sm:text-3xl font-black font-orbitron tracking-widest uppercase text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${theme.primary} 100%)`,
              textShadow: `0 0 20px ${theme.primaryGlow}`,
            }}
          >
            {appName}
          </h1>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono-tech uppercase tracking-widest text-emerald-400 font-bold">
              ANSH REVERSE ENGINE • V9.8 PRO
            </span>
          </div>
        </div>

        {/* Security / Anti-Ban Badge */}
        <div
          className="flex items-center justify-between p-2.5 rounded-xl border mb-5 text-xs font-mono-tech"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ANTI-BAN SYSTEM:</span>
          </div>
          <span className="text-emerald-400 font-bold">ACTIVE & PROTECTED 🛡️</span>
        </div>

        {/* Key Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold font-rajdhani uppercase tracking-wider text-neutral-300 mb-1.5">
              ENTER ANSH LICENSE KEY / ADMIN KEY:
            </label>
            <div className="relative">
              <input
                id="license-key-input"
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                placeholder="ANSH-1D-XXXXXX or ADMIN KEY"
                className="w-full py-3.5 pl-4 pr-11 rounded-xl bg-black/60 border text-sm sm:text-base font-mono-tech font-bold text-white placeholder-neutral-600 focus:outline-none transition-all uppercase tracking-wider"
                style={{
                  borderColor: theme.border,
                  boxShadow: `0 0 15px rgba(0,0,0,0.5)`,
                }}
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setKeyInput(text.toUpperCase().trim());
                  } catch {
                    // ignore
                  }
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors text-xs font-mono-tech"
                title="Paste from clipboard"
              >
                PASTE
              </button>
            </div>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs font-mono-tech text-center flex items-center justify-center gap-1.5"
            >
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Success Message Display */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-mono-tech text-center flex items-center justify-center gap-1.5"
            >
              <span>✅</span>
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Primary Unlock Button */}
          <button
            id="activate-key-btn"
            onClick={() => handleActivate()}
            disabled={isVerifying}
            className="w-full py-4 rounded-xl font-black text-sm sm:text-base tracking-widest font-orbitron uppercase flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xl disabled:opacity-50"
            style={{
              background: theme.btnBg,
              color: theme.btnText,
              border: `1px solid ${theme.btnBorder}`,
              boxShadow: `0 0 25px ${theme.primaryGlow}`,
            }}
          >
            {isVerifying ? (
              <span>VERIFYING LICENSE...</span>
            ) : (
              <>
                <span>ACTIVATE & ENTER PREDICTOR</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Quick Demo Keys & Admin Access Helper */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <button
              onClick={() => setShowDemoKeys(!showDemoKeys)}
              className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showDemoKeys ? 'HIDE TEST KEYS ▲' : 'GET TEST DEMO KEYS ▼'}</span>
            </button>

            <button
              id="open-admin-from-login-btn"
              onClick={onOpenAdminDirectly}
              className="py-1 px-2.5 rounded-lg bg-purple-950/60 border border-purple-500/50 hover:bg-purple-900/70 text-purple-300 font-bold flex items-center gap-1.5 transition-all text-xs shadow-[0_0_10px_rgba(168,85,247,0.3)]"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>ADMIN PANEL</span>
            </button>
          </div>

          {/* Expandable Demo Key Picker */}
          {showDemoKeys && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono-tech space-y-2"
            >
              <div className="text-[11px] text-neutral-400 font-bold mb-1">
                TAP ANY KEY BELOW TO AUTO-ACTIVATE:
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => handlePasteDemo('ANSH-1D-DEMO24')}
                  className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 text-left border border-white/5"
                >
                  <div>
                    <div className="font-bold text-emerald-400">ANSH-1D-DEMO24</div>
                    <div className="text-[10px] text-neutral-400">1 Day Pass (24 Hours)</div>
                  </div>
                  <span className="text-[10px] font-orbitron px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    USE
                  </span>
                </button>

                <button
                  onClick={() => handlePasteDemo('ANSH-7D-ANSHPASS')}
                  className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 text-left border border-white/5"
                >
                  <div>
                    <div className="font-bold text-amber-400">ANSH-7D-ANSHPASS</div>
                    <div className="text-[10px] text-neutral-400">7 Days ANSH Pass</div>
                  </div>
                  <span className="text-[10px] font-orbitron px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                    USE
                  </span>
                </button>

                <button
                  onClick={() => handlePasteDemo('ANSH-LIFE-ANSH99')}
                  className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 text-left border border-white/5"
                >
                  <div>
                    <div className="font-bold text-cyan-400">ANSH-LIFE-ANSH99</div>
                    <div className="text-[10px] text-neutral-400">Lifetime Access Pass</div>
                  </div>
                  <span className="text-[10px] font-orbitron px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    USE
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Telegram Support Footer */}
          <div className="pt-2 text-center text-[11px] font-mono-tech text-neutral-400">
            Need ANSH Key? Contact Admin on Telegram:{' '}
            <span className="text-white font-bold">@ANSH_PREDICTIONS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
