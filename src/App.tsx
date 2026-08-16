import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEMES } from './data/themes';
import { CurrentSignal, EngineType, HistoryItem, RiskLevel, ThemeId, AppSettings, LicenseKey } from './types';
import { Header } from './components/Header';
import { ThemeSelector } from './components/ThemeSelector';
import { RadarCard } from './components/RadarCard';
import { StatCards } from './components/StatCards';
import { CopySignalButton } from './components/CopySignalButton';
import { HistoryTable } from './components/HistoryTable';
import { SignalToast } from './components/SignalToast';
import { EditTitleModal } from './components/EditTitleModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { OutcomeModal, OutcomeData } from './components/OutcomeModal';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { AdminUnlockModal } from './components/AdminUnlockModal';
import { sound } from './utils/audio';
import { analyzeAndPredict, evaluateDrawOutcome, ApiHistoryItem } from './utils/predictionEngine';
import { getActiveSession, clearActiveSession, ADMIN_MASTER_KEY, formatTimeRemaining } from './utils/keyManager';

// Helper to compute active period directly from UTC time
function getUtcActivePeriod() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const periodIndex = totalMinutes + 1;
  const fullPeriod = `${year}${month}${day}10001${String(periodIndex).padStart(4, '0')}`;
  const shortPeriod = `#${String(periodIndex).slice(-3)}`;
  const remainingSeconds = 60 - now.getUTCSeconds();

  return {
    fullPeriod,
    shortPeriod,
    periodIndex,
    remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 60,
  };
}

const INITIAL_HISTORY: HistoryItem[] = [
  { id: '1', issue: '#022', fullIssue: '20260816100010022', pred: 'BIG', num: 9, status: 'WIN', timestamp: Date.now() - 60000, color: 'green' },
  { id: '2', issue: '#021', fullIssue: '20260816100010021', pred: 'SMALL', num: 2, status: 'WIN', timestamp: Date.now() - 120000, color: 'red' },
  { id: '3', issue: '#020', fullIssue: '20260816100010020', pred: 'BIG', num: 7, status: 'WIN', timestamp: Date.now() - 180000, color: 'green' },
  { id: '4', issue: '#019', fullIssue: '20260816100010019', pred: 'BIG', num: 9, status: 'WIN', timestamp: Date.now() - 240000, color: 'green' },
];

export default function App() {
  const [themeId, setThemeId] = useState<ThemeId>('orange');
  const [appName, setAppName] = useState('ANSH PRO PREDICTOR');
  const [engine, setEngine] = useState<EngineType>('ALWAYS_REVERSE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & View States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'LOGIN' | 'PREDICTOR' | 'ADMIN'>('LOGIN');
  const [currentKey, setCurrentKey] = useState<LicenseKey | undefined>(undefined);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('ACTIVE');

  // Modals state
  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdminUnlockOpen, setIsAdminUnlockOpen] = useState(false);

  // Outcome Celebration State (WIN, LOSS, JACKPOT)
  const [outcomeData, setOutcomeData] = useState<OutcomeData | null>(null);

  // App Settings
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'ANSH PRO PREDICTOR',
    subtitle: 'ANSH REVERSE ENGINE',
    soundEnabled: true,
    autoSync: true,
    roundDuration: 60,
    telegramChannel: '@ANSH_PREDICTIONS',
    martingaleEnabled: true,
    customConfidence: 85,
  });

  const initialUtc = getUtcActivePeriod();

  // Main Live Signal State
  const [signal, setSignal] = useState<CurrentSignal>({
    period: initialUtc.shortPeriod,
    fullPeriod: initialUtc.fullPeriod,
    prediction: 'SMALL',
    confidence: 85,
    engine: 'ALWAYS_REVERSE',
    level: 'L1',
    multiplier: '1X',
    risk: 'LOW',
    dragonAcc: 100,
    zigzagAcc: 100,
    reverseAcc: 100,
    syncSeconds: initialUtc.remainingSeconds,
    roundDuration: 60,
    targetNumbers: [0, 1, 2, 3, 4],
    hotNumbers: [2, 4],
    status: 'CONFIRMED',
    apiConnected: true,
  });

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const lossStreakRef = useRef(0);
  const previousSignalRef = useRef<CurrentSignal>(signal);
  const evaluatedPeriodsRef = useRef<Set<string>>(new Set());

  // Check saved session on mount
  useEffect(() => {
    const session = getActiveSession();
    if (session.isValid) {
      setIsLoggedIn(true);
      setIsAdmin(!!session.isAdmin);
      setCurrentKey(session.key);
      setTimeLeftStr(session.timeLeftFormatted || 'ACTIVE');
      setCurrentView(session.isAdmin ? 'ADMIN' : 'PREDICTOR');
    } else {
      setIsLoggedIn(false);
      setCurrentView('LOGIN');
    }
  }, []);

  // Periodic key expiration check
  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;

    const interval = setInterval(() => {
      const session = getActiveSession();
      if (!session.isValid || session.isExpired) {
        setIsLoggedIn(false);
        setCurrentView('LOGIN');
        showToast('⚠️ ANSH LICENSE KEY HAS EXPIRED! PLEASE RENEW WITH ADMIN.');
        sound.playLoss();
      } else {
        setTimeLeftStr(session.timeLeftFormatted || 'ACTIVE');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isAdmin]);

  // Keep previous signal in sync
  useEffect(() => {
    previousSignalRef.current = signal;
  }, [signal]);

  const theme = THEMES[themeId] || THEMES.orange;

  // Show floating toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    setSettings((prev) => ({ ...prev, soundEnabled: next }));
    if (next) sound.playClick();
  };

  // Handle successful login
  const handleLoginSuccess = (adminStatus: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    const session = getActiveSession();
    setCurrentKey(session.key);
    setTimeLeftStr(session.timeLeftFormatted || 'ACTIVE');

    if (adminStatus) {
      setCurrentView('ADMIN');
      showToast('WELCOME MASTER ADMIN! 👑');
    } else {
      setCurrentView('PREDICTOR');
      showToast('ANSH LICENSE KEY ACTIVATED! ⚡');
    }
  };

  // Logout handler
  const handleLogout = () => {
    sound.playClick();
    clearActiveSession();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentKey(undefined);
    setCurrentView('LOGIN');
    showToast('LOGGED OUT SUCCESSFULLY');
  };

  // Trigger celebration outcome popup
  const triggerOutcomeAnimation = (
    type: 'WIN' | 'JACKPOT' | 'LOSS',
    periodStr: string,
    pred: string,
    num: number,
    color?: string
  ) => {
    const actualSize = num >= 5 ? 'BIG' : 'SMALL';
    const isHot = signal.hotNumbers?.includes(num);

    if (type === 'JACKPOT') {
      sound.playJackpot();
    } else if (type === 'WIN') {
      sound.playWin();
    } else {
      sound.playLoss();
    }

    setOutcomeData({
      type: type,
      period: periodStr,
      predicted: pred,
      actualNum: num,
      actualSize,
      color,
      level: lossStreakRef.current === 0 ? 'L1' : lossStreakRef.current === 1 ? 'L2' : 'L3',
      multiplier: lossStreakRef.current === 0 ? '1X' : lossStreakRef.current === 1 ? '3X' : '8X',
      hotHit: type === 'JACKPOT' || isHot,
    });
  };

  // Fetch Live WinGo 1M Data from API
  const fetchLiveWingoData = useCallback(async () => {
    try {
      const res = await fetch('/api/wingo/history');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiList: ApiHistoryItem[] = json.data;

          // Convert API items to HistoryItems with mathematically verified predictions & outcomes
          const formattedHist: HistoryItem[] = apiList.slice(0, 20).map((item, idx) => {
            const num = item.number;
            const actualSize = item.size || (num >= 5 ? 'BIG' : 'SMALL');
            
            // Prior data available before this draw
            const priorHistory = apiList.slice(idx + 1);
            const pastPred = analyzeAndPredict(priorHistory, engine);
            const status = evaluateDrawOutcome(pastPred.prediction, num, pastPred.hotNumbers);

            return {
              id: item.issue || String(Date.now() - idx * 60000),
              issue: item.shortIssue || `#${item.issue.slice(-3)}`,
              fullIssue: item.issue,
              pred: pastPred.prediction,
              num: num,
              status: status,
              color: item.color,
              timestamp: Date.now() - idx * 60000,
            };
          });

          setHistory(formattedHist);

          // Get latest finished drawn issue
          const latestDrawn = apiList[0];
          if (latestDrawn && latestDrawn.issue) {
            const shortDrawn = latestDrawn.shortIssue || `#${latestDrawn.issue.slice(-3)}`;
            if (!evaluatedPeriodsRef.current.has(latestDrawn.issue)) {
              evaluatedPeriodsRef.current.add(latestDrawn.issue);
              const drawnNum = latestDrawn.number;
              const prevPred = previousSignalRef.current.prediction;
              const prevHot = previousSignalRef.current.hotNumbers;
              const outcomeStatus = evaluateDrawOutcome(prevPred, drawnNum, prevHot);

              if (outcomeStatus === 'JACKPOT' || outcomeStatus === 'WIN') {
                lossStreakRef.current = 0;
                triggerOutcomeAnimation(outcomeStatus, shortDrawn, prevPred, drawnNum, latestDrawn.color);
              } else {
                lossStreakRef.current += 1;
                triggerOutcomeAnimation('LOSS', shortDrawn, prevPred, drawnNum, latestDrawn.color);
              }
            }
          }

          // Update active period from API calculation or UTC clock
          const currentInfo = json.currentInfo || getUtcActivePeriod();
          const currentFull = currentInfo.fullPeriod;
          const currentShort = currentInfo.shortPeriod;
          const remainingSec = currentInfo.remainingSeconds;

          // Compute next prediction
          const predResult = analyzeAndPredict(apiList, engine, lossStreakRef.current);

          setSignal((prev) => ({
            ...prev,
            period: currentShort,
            fullPeriod: currentFull,
            prediction: predResult.prediction,
            confidence: predResult.confidence,
            dragonAcc: predResult.dragonAcc,
            zigzagAcc: predResult.zigzagAcc,
            reverseAcc: predResult.reverseAcc,
            targetNumbers: predResult.targetNumbers,
            hotNumbers: predResult.hotNumbers,
            level: predResult.level,
            multiplier: predResult.multiplier,
            risk: predResult.risk,
            syncSeconds: remainingSec,
            patternName: predResult.patternName,
            reasoning: predResult.reasoning,
            status: 'CONFIRMED',
            apiConnected: true,
          }));
        }
      }
    } catch {
      // Offline fallback: use UTC period
      const utc = getUtcActivePeriod();
      setSignal((prev) => ({
        ...prev,
        period: utc.shortPeriod,
        fullPeriod: utc.fullPeriod,
        syncSeconds: utc.remainingSeconds,
      }));
    }
  }, [engine]);

  // Initial load
  useEffect(() => {
    fetchLiveWingoData();
  }, [fetchLiveWingoData]);

  // Manual Prediction Refresh
  const handleRefreshPrediction = () => {
    sound.playClick();
    const predResult = analyzeAndPredict(history, engine, lossStreakRef.current);
    setSignal((prev) => ({
      ...prev,
      prediction: predResult.prediction,
      confidence: predResult.confidence,
      targetNumbers: predResult.targetNumbers,
      hotNumbers: predResult.hotNumbers,
      level: predResult.level,
      multiplier: predResult.multiplier,
      risk: predResult.risk,
      dragonAcc: predResult.dragonAcc,
      zigzagAcc: predResult.zigzagAcc,
      reverseAcc: predResult.reverseAcc,
      status: 'CONFIRMED',
    }));
    sound.playConfirmed();
    showToast(`RADAR SIGNAL RECALCULATED: ${predResult.prediction} (${predResult.confidence}%)`);
  };

  // Override prediction manually
  const handleSelectManualPred = (pred: 'BIG' | 'SMALL') => {
    sound.playClick();
    setSignal((prev) => ({
      ...prev,
      prediction: pred,
      targetNumbers: pred === 'SMALL' ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9],
    }));
    showToast(`OVERRIDE SET TO: ${pred}`);
  };

  // Add a manual result (0-9)
  const handleAddManualResult = (num: number) => {
    const outcomeStatus = evaluateDrawOutcome(signal.prediction, num, signal.hotNumbers);

    if (outcomeStatus === 'WIN' || outcomeStatus === 'JACKPOT') {
      lossStreakRef.current = 0;
    } else {
      lossStreakRef.current += 1;
    }

    const currentPeriodNum = parseInt(signal.period.replace('#', ''), 10) || 24;

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      issue: signal.period,
      fullIssue: signal.fullPeriod,
      pred: signal.prediction,
      num: num,
      status: outcomeStatus,
      timestamp: Date.now(),
      color: num === 0 ? 'red-violet' : num === 5 ? 'green-violet' : num % 2 === 0 ? 'red' : 'green',
      level: signal.level,
      multiplier: signal.multiplier,
    };

    const nextHist = [newHistoryItem, ...history.slice(0, 19)];
    setHistory(nextHist);

    // Trigger celebration or loss alert animation!
    triggerOutcomeAnimation(
      outcomeStatus,
      signal.period,
      signal.prediction,
      num,
      newHistoryItem.color
    );

    // Next period calculation
    const nextPeriodNum = currentPeriodNum + 1;
    const nextPeriodStr = `#${String(nextPeriodNum).slice(-3)}`;
    const nextFullPeriodStr = signal.fullPeriod
      ? `${signal.fullPeriod.slice(0, -4)}${String(nextPeriodNum).padStart(4, '0')}`
      : undefined;

    const nextPred = analyzeAndPredict(nextHist, engine, lossStreakRef.current);

    setSignal((prev) => ({
      ...prev,
      period: nextPeriodStr,
      fullPeriod: nextFullPeriodStr || prev.fullPeriod,
      prediction: nextPred.prediction,
      confidence: nextPred.confidence,
      targetNumbers: nextPred.targetNumbers,
      hotNumbers: nextPred.hotNumbers,
      level: nextPred.level,
      multiplier: nextPred.multiplier,
      risk: nextPred.risk,
      syncSeconds: 60,
    }));
  };

  // Real 1-Minute Live Clock Timer synchronization loop
  useEffect(() => {
    const timer = setInterval(() => {
      const utc = getUtcActivePeriod();

      setSignal((prev) => {
        // When timer hits round transition, update period and fetch API
        if (utc.remainingSeconds >= 59 || utc.remainingSeconds <= 1) {
          if (settings.autoSync) {
            fetchLiveWingoData();
          }
        }

        // Radar tick sounds for final 5 seconds countdown
        if (utc.remainingSeconds <= 5 && utc.remainingSeconds > 0) {
          sound.playRadarTick();
        }

        return {
          ...prev,
          period: utc.shortPeriod,
          fullPeriod: utc.fullPeriod,
          syncSeconds: utc.remainingSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.autoSync, fetchLiveWingoData]);

  // If Not Logged In, Render Cyber Login Page
  if (!isLoggedIn || currentView === 'LOGIN') {
    return (
      <>
        <LoginPage
          theme={theme}
          appName={appName}
          onLoginSuccess={handleLoginSuccess}
          onOpenAdminDirectly={() => setIsAdminUnlockOpen(true)}
        />
        <AdminUnlockModal
          isOpen={isAdminUnlockOpen}
          theme={theme}
          onClose={() => setIsAdminUnlockOpen(false)}
          onSuccess={() => handleLoginSuccess(true)}
        />
      </>
    );
  }

  // If In Admin Mode, Render Admin Key Management Panel
  if (currentView === 'ADMIN') {
    return (
      <AdminPanel
        theme={theme}
        appName={appName}
        onEnterPredictor={() => setCurrentView('PREDICTOR')}
        onLogoutAdmin={handleLogout}
      />
    );
  }

  // Otherwise, Render Main Predictor HUD
  return (
    <div
      id="app-root-container"
      className="min-h-screen w-full flex justify-center bg-[#070503] text-white selection:bg-orange-500 selection:text-black py-2 px-2 sm:px-4 cyber-grid-bg transition-colors duration-500"
      style={{
        background: theme.bgGradient,
      }}
    >
      {/* Mobile-Proportioned Device Container */}
      <div
        id="hud-viewport-container"
        className="w-full max-w-[480px] min-h-screen flex flex-col relative px-2 sm:px-3 pb-8"
      >
        {/* Top Header with ANSH License Indicator */}
        <Header
          appName={appName}
          engine={engine}
          theme={theme}
          soundEnabled={settings.soundEnabled}
          isAdmin={isAdmin}
          currentKey={currentKey}
          timeLeftFormatted={timeLeftStr}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectEngine={(newEngine) => {
            setEngine(newEngine);
            const predResult = analyzeAndPredict(history, newEngine, lossStreakRef.current);
            setSignal((s) => ({
              ...s,
              engine: newEngine,
              prediction: predResult.prediction,
              confidence: predResult.confidence,
              targetNumbers: predResult.targetNumbers,
              hotNumbers: predResult.hotNumbers,
            }));
            showToast(`ENGINE SWITCHED TO: ${newEngine}`);
          }}
          onEditAppName={() => setIsEditTitleOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenAdmin={() => {
            if (isAdmin) {
              setCurrentView('ADMIN');
            } else {
              setIsAdminUnlockOpen(true);
            }
          }}
          onLogout={handleLogout}
        />

        {/* 10-Theme Palette Swatch Selector */}
        <ThemeSelector
          currentTheme={themeId}
          onSelectTheme={(id) => {
            setThemeId(id);
          }}
        />

        {/* Central Futuristic Radar Card with Live Dynamic Period & 1M Countdown */}
        <RadarCard
          signal={signal}
          theme={theme}
          onRefreshPrediction={handleRefreshPrediction}
          onSelectManualPred={handleSelectManualPred}
        />

        {/* 3 Metrics Cards: LEVEL, MULTIPLIER, RISK */}
        <StatCards
          signal={signal}
          theme={theme}
          onUpdateLevel={(level, mult) => {
            setSignal((s) => ({ ...s, level, multiplier: mult }));
            showToast(`LEVEL: ${level} (${mult})`);
          }}
          onUpdateRisk={(risk) => {
            setSignal((s) => ({ ...s, risk }));
            showToast(`RISK LEVEL: ${risk}`);
          }}
        />

        {/* Copy Signal Primary Action Button */}
        <CopySignalButton
          appName={appName}
          signal={signal}
          theme={theme}
          onShowToast={showToast}
        />

        {/* History Table with Exact Live Results */}
        <HistoryTable
          history={history}
          theme={theme}
          apiConnected={signal.apiConnected}
          onAddManualResult={handleAddManualResult}
          onClearHistory={() => {
            setHistory([]);
            showToast('HISTORY CLEARED');
          }}
        />

        {/* Floating Toast Notification */}
        <SignalToast message={toastMessage} theme={theme} />

        {/* Outcome Celebration Modal for Win, Loss, and Jackpot */}
        <OutcomeModal
          data={outcomeData}
          theme={theme}
          onClose={() => setOutcomeData(null)}
        />

        {/* Edit Title Branding Modal */}
        <EditTitleModal
          isOpen={isEditTitleOpen}
          currentTitle={appName}
          theme={theme}
          onSave={(newTitle) => {
            setAppName(newTitle);
            showToast('APP TITLE UPDATED');
          }}
          onClose={() => setIsEditTitleOpen(false)}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          settings={settings}
          theme={theme}
          onUpdateSettings={(newVals: any) => {
            if (newVals.testAnimation) {
              const testType = newVals.testAnimation as 'WIN' | 'JACKPOT' | 'LOSS';
              triggerOutcomeAnimation(
                testType,
                signal.period,
                signal.prediction,
                testType === 'WIN' || testType === 'JACKPOT' ? (signal.prediction === 'BIG' ? 7 : 2) : (signal.prediction === 'BIG' ? 3 : 8),
                'green'
              );
              setIsSettingsOpen(false);
              return;
            }
            setSettings((prev) => ({ ...prev, ...newVals }));
            if (newVals.customConfidence !== undefined) {
              setSignal((s) => ({ ...s, confidence: newVals.customConfidence! }));
            }
          }}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Help & System Guide Modal */}
        <HelpModal
          isOpen={isHelpOpen}
          theme={theme}
          onClose={() => setIsHelpOpen(false)}
        />

        {/* Admin Unlock Modal */}
        <AdminUnlockModal
          isOpen={isAdminUnlockOpen}
          theme={theme}
          onClose={() => setIsAdminUnlockOpen(false)}
          onSuccess={() => handleLoginSuccess(true)}
        />
      </div>
    </div>
  );
}
