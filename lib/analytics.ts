import { getSupabaseAdmin } from '@/lib/supabase-admin';

type Row = { path: string; referrer: string | null; session_id: string; created_at: string };

export type AnalyticsSummary = {
  configured: boolean;
  totalAllTime: number;
  last24h: { views: number; visitors: number };
  last7d: { views: number; visitors: number };
  last30d: { views: number; visitors: number };
  dailyLast14: { date: string; views: number; visitors: number }[];
  topPaths: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
};

const EMPTY: AnalyticsSummary = {
  configured: false,
  totalAllTime: 0,
  last24h: { views: 0, visitors: 0 },
  last7d: { views: 0, visitors: 0 },
  last30d: { views: 0, visitors: 0 },
  dailyLast14: [],
  topPaths: [],
  topReferrers: [],
};

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD, UTC — достаточно для дневных столбиков
}

function windowStats(rows: Row[], sinceMs: number) {
  const inWindow = rows.filter((r) => new Date(r.created_at).getTime() >= sinceMs);
  return { views: inWindow.length, visitors: new Set(inWindow.map((r) => r.session_id)).size };
}

/**
 * Тянет сырые строки за последние 30 дней и считает всё в JS: для размера
 * этого сайта это на порядки проще, чем городить SQL-функции ради GROUP BY,
 * и не требует отдельной агрегирующей таблицы.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = getSupabaseAdmin();
  if (!db) return EMPTY;

  const now = Date.now();
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: totalAllTime }, { data, error }] = await Promise.all([
    db.from('page_views').select('*', { count: 'exact', head: true }),
    db
      .from('page_views')
      .select('path, referrer, session_id, created_at')
      .gte('created_at', since30d)
      .order('created_at', { ascending: false })
      .limit(20000),
  ]);

  if (error || !data) return { ...EMPTY, configured: true };

  const rows = data as Row[];

  const daily: Record<string, { views: number; visitors: Set<string> }> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    daily[dayKey(d.toISOString())] = { views: 0, visitors: new Set() };
  }
  for (const r of rows) {
    const key = dayKey(r.created_at);
    if (daily[key]) {
      daily[key].views += 1;
      daily[key].visitors.add(r.session_id);
    }
  }

  const pathCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  for (const r of rows) {
    pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1);
    const ref = r.referrer && r.referrer.trim() ? new URL(r.referrer, 'https://x.invalid').host || r.referrer : 'Прямой заход';
    referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1);
  }

  const topN = (m: Map<string, number>, n: number) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

  return {
    configured: true,
    totalAllTime: totalAllTime ?? 0,
    last24h: windowStats(rows, now - 24 * 60 * 60 * 1000),
    last7d: windowStats(rows, now - 7 * 24 * 60 * 60 * 1000),
    last30d: windowStats(rows, now - 30 * 24 * 60 * 60 * 1000),
    dailyLast14: Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, views: v.views, visitors: v.visitors.size })),
    topPaths: topN(pathCounts, 10).map(([path, views]) => ({ path, views })),
    topReferrers: topN(referrerCounts, 8).map(([referrer, views]) => ({ referrer, views })),
  };
}
