import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Ban,
  ArrowRight,
  LogOut,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  Flame,
} from 'lucide-react';
import { KeyDuration, LicenseKey, ThemeConfig } from '../types';
import {
  ADMIN_MASTER_KEY,
  DURATION_CONFIG,
  getStoredKeys,
  generateNewKey,
  generateBulkKeys,
  deleteKey,
  revokeKey,
  extendKey,
  formatTimeRemaining,
} from '../utils/keyManager';
import { sound } from '../utils/audio';

interface AdminPanelProps {
  theme: ThemeConfig;
  appName: string;
  onEnterPredictor: () => void;
  onLogoutAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  theme,
  appName,
  onEnterPredictor,
  onLogoutAdmin,
}) => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<KeyDuration>('1D');
  const [keyQuantity, setKeyQuantity] = useState(1);
  const [keyNote, setKeyNote] = useState('');
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'MANAGE' | 'STATS'>('GENERATE');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'UNUSED' | 'EXPIRED' | 'REVOKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [latestGenerated, setLatestGenerated] = useState<LicenseKey[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Reload keys list
  const refreshKeys = () => {
    setKeys(getStoredKeys());
  };

  useEffect(() => {
    refreshKeys();
    const interval = setInterval(() => {
      refreshKeys();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    sound.playConfirmed();
    let created: LicenseKey[] = [];

    if (keyQuantity === 1) {
      const k = generateNewKey(selectedDuration, keyNote.trim() || undefined);
      created = [k];
    } else {
      created = generateBulkKeys(selectedDuration, keyQuantity, keyNote.trim() || undefined);
    }

    setLatestGenerated(created);
    setKeyNote('');
    refreshKeys();
    showToastMsg(`GENERATED ${created.length} ANSH LICENSE KEY(S) SUCCESSFULLY!`);
  };

  const handleCopyKey = (keyObj: LicenseKey) => {
    sound.playClick();
    const formatted = `╔════════════════════════╗
👑 ${appName.toUpperCase()} 👑
🔑 ANSH LICENSE KEY ACCESS
╚════════════════════════╝
🎯 KEY CODE : ${keyObj.key}
⏱️ DURATION : ${keyObj.durationLabel}
🛡️ STATUS   : ${keyObj.status}
━━━━━━━━━━━━━━━━━━━━━━━━
⚡ ACCESS: WinGo 1M Live Signal Radar
✅ 100% Reverse Engine Activated
━━━━━━━━━━━━━━━━━━━━━━━━
Activate at: ANSH PRO PREDICTOR HUD`;

    navigator.clipboard?.writeText(formatted);
    setCopiedKeyId(keyObj.id);
    showToastMsg('ANSH KEY TELEGRAM FORMAT COPIED!');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleDelete = (id: string) => {
    sound.playClick();
    deleteKey(id);
    refreshKeys();
    showToastMsg('KEY REMOVED');
  };

  const handleRevoke = (id: string) => {
    sound.playClick();
    revokeKey(id);
    refreshKeys();
    showToastMsg('KEY REVOKED / BLOCKED');
  };

  const handleExtend = (id: string, hours: number) => {
    sound.playClick();
    extendKey(id, hours);
    refreshKeys();
    showToastMsg(`EXTENDED +${hours} HOURS`);
  };

  // Stats calculation
  const totalCount = keys.length;
  const activeCount = keys.filter((k) => k.status === 'ACTIVE').length;
  const unusedCount = keys.filter((k) => k.status === 'UNUSED').length;
  const expiredCount = keys.filter((k) => k.status === 'EXPIRED').length;

  // Filtered keys
  const filteredKeys = keys.filter((k) => {
    const matchesFilter = statusFilter === 'ALL' || k.status === statusFilter;
    const matchesSearch =
      k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.note && k.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      k.durationLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div
      id="admin-panel-container"
      className="min-h-screen w-full flex justify-center bg-[#070503] text-white p-2 sm:p-4 selection:bg-purple-500 selection:text-black font-sans"
      style={{ background: theme.bgGradient }}
    >
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative pb-12">
        {/* Top Master Admin Header */}
        <div
          className="w-full p-4 rounded-2xl border backdrop-blur-xl mb-4 flex items-center justify-between shadow-xl"
          style={{
            backgroundColor: 'rgba(20, 10, 25, 0.85)',
            borderColor: '#a855f7',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_#a855f7]">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black font-orbitron tracking-wider text-purple-300">
                  ANSH ADMIN MASTER PANEL
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-purple-900/60 border border-purple-400/50 text-purple-200">
                  MASTER AUTHENTICATED 👑
                </span>
              </div>
              <p className="text-[11px] font-mono-tech text-neutral-400">
                ANSH License Key Generator & Expiry Management Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEnterPredictor}
              className="py-2 px-3 sm:px-4 rounded-xl font-black font-orbitron text-xs tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <span>PREDICTOR HUD</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogoutAdmin}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/10 transition-colors"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center font-mono-tech">
            <div className="text-xs text-neutral-400">TOTAL KEYS</div>
            <div className="text-lg sm:text-xl font-bold text-white font-orbitron">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center font-mono-tech">
            <div className="text-xs text-emerald-400">ACTIVE KEYS</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-300 font-orbitron">{activeCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center font-mono-tech">
            <div className="text-xs text-amber-400">UNUSED KEYS</div>
            <div className="text-lg sm:text-xl font-bold text-amber-300 font-orbitron">{unusedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center font-mono-tech">
            <div className="text-xs text-rose-400">EXPIRED</div>
            <div className="text-lg sm:text-xl font-bold text-rose-300 font-orbitron">{expiredCount}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-4 gap-2">
          <button
            onClick={() => setActiveTab('GENERATE')}
            className={`pb-2.5 px-4 font-orbitron text-xs sm:text-sm font-bold tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'GENERATE'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>GENERATE ANSH KEYS</span>
          </button>
          <button
            onClick={() => setActiveTab('MANAGE')}
            className={`pb-2.5 px-4 font-orbitron text-xs sm:text-sm font-bold tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'MANAGE'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>ALL KEYS ({keys.length})</span>
          </button>
        </div>

        {/* Tab 1: KEY GENERATOR */}
        {activeTab === 'GENERATE' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
              <h2 className="text-sm font-bold font-orbitron text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                SELECT DURATION & TIME LIMIT
              </h2>

              {/* Duration Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                {(['1D', '3D', '7D', '30D', 'LIFETIME'] as KeyDuration[]).map((dur) => {
                  const conf = DURATION_CONFIG[dur];
                  const isSelected = selectedDuration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSelectedDuration(dur)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron font-bold text-xs sm:text-sm text-white">
                          {conf.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono-tech mt-1">
                        {conf.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quantity & Note Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-mono-tech text-neutral-300 mb-1">
                    QUANTITY TO GENERATE:
                  </label>
                  <select
                    value={keyQuantity}
                    onChange={(e) => setKeyQuantity(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl bg-black/60 border border-white/20 text-sm font-mono-tech text-white focus:outline-none"
                  >
                    <option value={1}>1 Single Key</option>
                    <option value={5}>5 Bulk Keys</option>
                    <option value={10}>10 Bulk Keys</option>
                    <option value={20}>20 Bulk Keys</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech text-neutral-300 mb-1">
                    USER TAG / CLIENT NOTE (OPTIONAL):
                  </label>
                  <input
                    type="text"
                    value={keyNote}
                    onChange={(e) => setKeyNote(e.target.value)}
                    placeholder="e.g. ANSH Member Rahul / Telegram User"
                    className="w-full py-2.5 px-3 rounded-xl bg-black/60 border border-white/20 text-sm font-mono-tech text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Generate Primary Button */}
              <button
                id="generate-ansh-key-btn"
                onClick={handleGenerate}
                className="w-full py-3.5 rounded-xl font-black font-orbitron text-sm tracking-widest uppercase bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>GENERATE {keyQuantity} ANSH {DURATION_CONFIG[selectedDuration].label} KEY(S)</span>
              </button>
            </div>

            {/* Generated Keys Display Box */}
            {latestGenerated && latestGenerated.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/50 backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-orbitron text-purple-300 uppercase">
                    ⚡ NEWLY GENERATED KEYS ({latestGenerated.length})
                  </span>
                  <button
                    onClick={() => setLatestGenerated(null)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    DISMISS
                  </button>
                </div>

                <div className="space-y-2">
                  {latestGenerated.map((k) => (
                    <div
                      key={k.id}
                      className="p-3 rounded-xl bg-black/60 border border-purple-500/30 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono-tech font-bold text-sm sm:text-base text-white tracking-wider">
                          {k.key}
                        </div>
                        <div className="text-[10px] font-mono-tech text-purple-300">
                          {k.durationLabel} • {k.note}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyKey(k)}
                        className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-orbitron font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {copiedKeyId === k.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab 2: MANAGE KEYS */}
        {activeTab === 'MANAGE' && (
          <div className="space-y-3">
            {/* Search & Filter Bar */}
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search key by code or note..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono-tech text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'ACTIVE', 'UNUSED', 'EXPIRED', 'REVOKED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-orbitron font-bold transition-colors whitespace-nowrap ${
                      statusFilter === filter
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Keys List */}
            <div className="space-y-2">
              {filteredKeys.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono-tech text-neutral-500 bg-black/40 rounded-xl border border-white/5">
                  NO KEYS FOUND MATCHING YOUR CRITERIA
                </div>
              ) : (
                filteredKeys.map((k) => {
                  const isActive = k.status === 'ACTIVE';
                  const isExpired = k.status === 'EXPIRED';
                  const isRevoked = k.status === 'REVOKED';
                  const isUnused = k.status === 'UNUSED';

                  return (
                    <div
                      key={k.id}
                      className={`p-3 sm:p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : isRevoked
                          ? 'bg-rose-950/20 border-rose-500/40 opacity-70'
                          : isExpired
                          ? 'bg-neutral-900/50 border-neutral-700 opacity-60'
                          : 'bg-black/60 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-tech font-bold text-sm sm:text-base text-white tracking-wider">
                              {k.key}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-orbitron font-black uppercase ${
                                isActive
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                                  : isUnused
                                  ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                                  : isRevoked
                                  ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {k.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono-tech text-neutral-400 mt-0.5">
                            {k.durationLabel} {k.note ? `• ${k.note}` : ''}
                          </div>
                        </div>

                        {/* Remaining Time Badge */}
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400 font-mono-tech uppercase">
                            TIME LEFT
                          </div>
                          <div
                            className={`text-xs font-mono-tech font-bold ${
                              isActive
                                ? 'text-emerald-400'
                                : isUnused
                                ? 'text-amber-400'
                                : 'text-neutral-500'
                            }`}
                          >
                            {k.status === 'UNUSED'
                              ? 'NOT ACTIVATED'
                              : formatTimeRemaining(k.expiresAt)}
                          </div>
                        </div>
                      </div>

                      {/* Action Button Row */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1 flex-wrap">
                        <div className="text-[10px] text-neutral-500 font-mono-tech">
                          Created: {new Date(k.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Copy ANSH Format */}
                          <button
                            onClick={() => handleCopyKey(k)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors text-xs font-mono-tech flex items-center gap-1"
                            title="Copy ANSH Telegram Format"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">COPY</span>
                          </button>

                          {/* Extend 24h */}
                          <button
                            onClick={() => handleExtend(k.id, 24)}
                            className="p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-colors text-xs font-mono-tech"
                            title="Add +24 Hours Extension"
                          >
                            +24H
                          </button>

                          {/* Revoke */}
                          {k.status !== 'REVOKED' && (
                            <button
                              onClick={() => handleRevoke(k.id)}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors text-xs font-mono-tech"
                              title="Revoke / Block Key"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(k.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                            title="Delete Key Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 py-2.5 px-4 rounded-xl bg-purple-950/90 border border-purple-400 text-purple-200 font-mono-tech text-xs shadow-2xl backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </div>
    </div>
  );
};
