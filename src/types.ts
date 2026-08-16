export type ThemeId =
  | 'cyan'
  | 'purple'
  | 'emerald'
  | 'yellow'
  | 'red'
  | 'sky'
  | 'orange'
  | 'lime'
  | 'pink'
  | 'silver';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  dotColor: string;
  primary: string; // e.g. #ff6b00
  primaryGlow: string; // rgba(255, 107, 0, 0.4)
  primaryLight: string; // rgba(255, 107, 0, 0.15)
  border: string; // border color
  borderGlow: string;
  text: string;
  bgGradient: string;
  radarColor: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
}

export type PredictionType = 'BIG' | 'SMALL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type EngineType =
  | 'MARKOV'
  | 'PATTERN'
  | 'GAP'
  | 'ZIGZAG'
  | 'PAIR'
  | 'TREND'
  | 'MEAN'
  | 'MOMENTUM'
  | 'DRAGON'
  | 'ENSEMBLE'
  | 'ALWAYS_REVERSE'
  | 'NEURAL_AI';

export interface CurrentSignal {
  period: string; // display period e.g. '#024' or full '20260816100010024'
  fullPeriod?: string;
  prediction: PredictionType;
  confidence: number;
  engine: EngineType;
  level: string; // 'L1', 'L2', 'L3', 'L4'
  multiplier: string; // '1X', '3X', '8X', '24X'
  risk: RiskLevel;
  dragonAcc: number;
  zigzagAcc: number;
  reverseAcc: number;
  syncSeconds: number; // remaining seconds in 1M round (60s)
  roundDuration: number; // e.g. 60
  targetNumbers: number[]; // e.g. [0,1,2,3,4] or [5,6,7,8,9]
  hotNumbers?: number[]; // e.g. [2, 4]
  status: 'CONFIRMED' | 'CALCULATING' | 'SYNCING';
  patternName?: string;
  reasoning?: string;
  apiConnected?: boolean;
}

export interface HistoryItem {
  id: string;
  issue: string; // e.g. '#022'
  fullIssue?: string;
  pred: PredictionType;
  num: number; // 0-9
  status: 'WIN' | 'JACKPOT' | 'LOSS';
  timestamp: number;
  color?: string;
  level?: string;
  multiplier?: string;
}

export type KeyDuration = '1D' | '3D' | '7D' | '30D' | 'LIFETIME';

export interface LicenseKey {
  id: string;
  key: string;
  duration: KeyDuration;
  durationLabel: string;
  durationHours: number; // 24, 72, 168, 720, 876000
  createdAt: number;
  activatedAt?: number;
  expiresAt?: number; // timestamp in ms
  status: 'UNUSED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  deviceFingerprint?: string;
  note?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentKey?: LicenseKey;
  expiresInFormatted?: string;
}

export interface AppSettings {
  appName: string;
  subtitle: string;
  soundEnabled: boolean;
  autoSync: boolean;
  roundDuration: number; // in seconds, default 30
  telegramChannel: string;
  martingaleEnabled: boolean;
  customConfidence: number;
}
