import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for API results
let cachedHistory: any[] = [];
let lastFetchTime = 0;

// Helper to calculate exact next active ongoing period for WinGo 1M
function calculateActivePeriod(latestDrawnIssue?: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const totalMinutesToday = now.getUTCHours() * 60 + now.getUTCMinutes();
  const fallbackPeriodIndex = totalMinutesToday + 1;
  const remainingSeconds = 60 - now.getUTCSeconds();

  if (latestDrawnIssue && /^\d+$/.test(latestDrawnIssue)) {
    try {
      const nextIssueBigInt = BigInt(latestDrawnIssue) + 1n;
      const nextFullPeriod = nextIssueBigInt.toString();
      const nextShortPeriod = `#${nextFullPeriod.slice(-3)}`;
      return {
        fullPeriod: nextFullPeriod,
        shortPeriod: nextShortPeriod,
        periodIndex: Number(nextFullPeriod.slice(-4)) || fallbackPeriodIndex,
        remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 60,
        serverTime: now.toISOString(),
      };
    } catch {
      // fallback
    }
  }

  const fullPeriod = `${year}${month}${day}10001${String(fallbackPeriodIndex).padStart(4, '0')}`;
  const shortPeriod = `#${String(fallbackPeriodIndex).slice(-3)}`;

  return {
    fullPeriod,
    shortPeriod,
    periodIndex: fallbackPeriodIndex,
    remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 60,
    serverTime: now.toISOString(),
  };
}

// Proxy endpoint to fetch from WinGo 1M API
app.get('/api/wingo/history', async (req, res) => {
  try {
    const now = Date.now();
    // Cache for 2 seconds to allow responsive updates
    if (cachedHistory.length > 0 && now - lastFetchTime < 2000) {
      return res.json({
        success: true,
        source: 'cache',
        data: cachedHistory,
        currentInfo: calculateActivePeriod(cachedHistory[0]?.issue),
      });
    }

    const apiUrl = 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://draw.ar-lottery01.com/',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      let rawList: any[] = [];

      if (json.data && Array.isArray(json.data.list)) {
        rawList = json.data.list;
      } else if (Array.isArray(json.data)) {
        rawList = json.data;
      } else if (Array.isArray(json.list)) {
        rawList = json.list;
      } else if (Array.isArray(json)) {
        rawList = json;
      }

      // Normalize items to standard format
      const parsedItems = rawList.map((item: any) => {
        const issue = String(item.issueNumber || item.issue || item.period || item.periodNumber || '');
        const num = Number(item.number ?? item.num ?? item.drawNumber ?? item.result ?? 0);
        const color = item.colour || item.color || (num === 0 ? 'red-violet' : num === 5 ? 'green-violet' : num % 2 === 0 ? 'red' : 'green');
        const size = item.size || (num >= 5 ? 'BIG' : 'SMALL');
        const shortIssue = issue.length > 4 ? `#${issue.slice(-3)}` : issue.startsWith('#') ? issue : `#${issue}`;

        return {
          issue,
          shortIssue,
          number: num,
          size,
          color,
          openTime: item.openTime || item.time || new Date().toISOString(),
        };
      });

      if (parsedItems.length > 0) {
        cachedHistory = parsedItems;
        lastFetchTime = now;
        return res.json({
          success: true,
          source: 'api',
          data: parsedItems,
          currentInfo: calculateActivePeriod(parsedItems[0]?.issue),
        });
      }
    }
  } catch (error) {
    console.warn('WinGo API fetch note:', (error as Error).message);
  }

  // Fallback to continuous live history if external API is unreachable
  const fallback = generateFallbackHistory();
  return res.json({
    success: true,
    source: 'fallback',
    data: fallback,
    currentInfo: calculateActivePeriod(fallback[0]?.issue),
  });
});

function generateFallbackHistory() {
  const current = calculateActivePeriod();
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const idx = Math.max(1, current.periodIndex - i);
    const num = Math.floor(Math.random() * 10);
    const size = num >= 5 ? 'BIG' : 'SMALL';
    const color = num === 0 ? 'red-violet' : num === 5 ? 'green-violet' : num % 2 === 0 ? 'red' : 'green';
    list.push({
      issue: `2026081610001${String(idx).padStart(4, '0')}`,
      shortIssue: `#${String(idx).slice(-3)}`,
      number: num,
      size,
      color,
      openTime: new Date(Date.now() - i * 60000).toISOString(),
    });
  }
  return list;
}

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VIP BHAI FEV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
