import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, Gauge, ShieldAlert, TrendingUp } from 'lucide-react';
import type { TraderData } from '../types';
import type { InsightsTexts, Language } from '../i18n';

interface PerformanceInsightsProps {
  data: TraderData[];
  language: Language;
  texts: InsightsTexts;
}

type TooltipPayloadItem = {
  name?: string;
  value?: unknown;
  color?: string;
  payload?: unknown;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

const PROFIT_COLOR = '#10B981'; // Emerald-500
const LOSS_COLOR = '#EF4444'; // Red-500
const INACTIVE_COLOR = '#64748B'; // Slate-500
const LIQUIDATED_COLOR = '#991B1B'; // Red-800
const HUMAN_COLOR = '#60A5FA'; // Blue-400
const AI_COLOR = '#A78BFA'; // Purple-400

const LIQUIDATED_BALANCE_THRESHOLD = 1;
const INITIAL_FUNDS_USDT = 10000;
const TOTAL_PRIZE_POOL_USD = 200000;
const CHAMPION_PRIZE_USD = 100000;
const HUMAN_TEAM_POOL_BASE_USD = 50000;
const HUMAN_TEAM_POOL_BOOSTED_USD = 100000;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const quantile = (sortedValues: number[], q: number): number | null => {
  if (sortedValues.length === 0) return null;
  const qq = clamp(q, 0, 1);
  const pos = (sortedValues.length - 1) * qq;
  const base = Math.floor(pos);
  const rest = pos - base;
  const lower = sortedValues[base];
  const upper = sortedValues[Math.min(base + 1, sortedValues.length - 1)];
  return lerp(lower, upper, rest);
};

const median = (values: number[]): number | null => {
  const sorted = [...values].sort((a, b) => a - b);
  return quantile(sorted, 0.5);
};

type StatusKey = 'PROFIT' | 'LOSS' | 'INACTIVE' | 'LIQUIDATED';

interface DerivedTrader {
  userType: TraderData['user']['userType'];
  nickName: string;
  rank: number;
  totalVolume: number;
  trades: number;
  pnlTotal: number;
  pnl24H: number;
  balance: number;
  roiTotalPct: number | null;
  pnlPerVolBps: number | null;
  pnlPerTrade: number | null;
  avgTradeSize: number | null;
  isActive: boolean;
  status: StatusKey;
}

const formatSigned = (value: number, formatter: Intl.NumberFormat): string =>
  `${value >= 0 ? '+' : ''}${formatter.format(value)}`;

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const first = payload[0];
  const title = label ?? first?.name ?? '';

  return (
    <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs">
      <p className="font-bold text-slate-200 mb-1">{String(title)}</p>
      {payload.map((entry, idx) => {
        const color = entry.color ?? '#94a3b8';
        const value =
          typeof entry.value === 'number'
            ? entry.value.toLocaleString()
            : entry.value == null
              ? '—'
              : String(entry.value);
        return (
          <p key={`${entry.name ?? 'item'}-${idx}`} style={{ color }}>
            {entry.name}: {value}
          </p>
        );
      })}
    </div>
  );
};

interface RoiBin {
  label: string;
  human: number;
  ai: number;
}

interface StatusRow {
  name: string;
  profitable: number;
  loss: number;
  inactive: number;
  liquidated: number;
}

interface GroupStatsRow {
  group: string;
  participants: number;
  active: number;
  winRateActive: number | null; // 0..1
  liquidatedRate: number | null; // 0..1
  medianPnl: number | null;
  medianRoiPct: number | null;
  medianBps: number | null;
  medianPnlPerTrade: number | null;
  medianAvgTradeSize: number | null;
}

interface RewardRow {
  nickName: string;
  pnl: number;
  share: number; // 0..1
  reward: number;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ data, language, texts }) => {
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';

  const currency0 = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [locale]
  );

  const currency2 = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const percent1 = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: 1,
      }),
    [locale]
  );

  const percent2 = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const derived = useMemo<DerivedTrader[]>(() => {
    return data.map((d) => {
      const isActive = d.totalVolume > 0 && d.trades > 0;
      const pnlPerVolBps = d.totalVolume > 0 ? (d.pnlTotal / d.totalVolume) * 10000 : null;
      const pnlPerTrade = d.trades > 0 ? d.pnlTotal / d.trades : null;
      const avgTradeSize = d.trades > 0 ? d.totalVolume / d.trades : null;
      const roiTotalPct = (d.pnlTotal / INITIAL_FUNDS_USDT) * 100;

      const status: StatusKey =
        d.balance < LIQUIDATED_BALANCE_THRESHOLD
          ? 'LIQUIDATED'
          : !isActive
            ? 'INACTIVE'
            : d.pnlTotal >= 0
              ? 'PROFIT'
              : 'LOSS';

      return {
        userType: d.user.userType,
        nickName: d.user.nickName,
        rank: d.rank,
        totalVolume: d.totalVolume,
        trades: d.trades,
        pnlTotal: d.pnlTotal,
        pnl24H: d.pnl24H,
        balance: d.balance,
        roiTotalPct,
        pnlPerVolBps,
        pnlPerTrade,
        avgTradeSize,
        isActive,
        status,
      };
    });
  }, [data]);

  const byPnLThenVolumeDesc = (a: DerivedTrader, b: DerivedTrader): number => {
    if (a.pnlTotal !== b.pnlTotal) return b.pnlTotal - a.pnlTotal;
    if (a.totalVolume !== b.totalVolume) return b.totalVolume - a.totalVolume;
    return a.rank - b.rank;
  };

  const overallLeader = useMemo(() => {
    if (derived.length === 0) return null;
    return [...derived].sort(byPnLThenVolumeDesc)[0] ?? null;
  }, [derived]);

  const humanLeader = useMemo(() => {
    const humans = derived.filter((d) => d.userType === 'HUMAN');
    if (humans.length === 0) return null;
    return [...humans].sort(byPnLThenVolumeDesc)[0] ?? null;
  }, [derived]);

  const teamStats = useMemo(() => {
    const humans = derived.filter((d) => d.userType === 'HUMAN');
    const ais = derived.filter((d) => d.userType === 'AI');

    const sumHuman = humans.reduce((acc, d) => acc + d.pnlTotal, 0);
    const sumAI = ais.reduce((acc, d) => acc + d.pnlTotal, 0);

    const roiHuman = humans.length > 0 ? sumHuman / (INITIAL_FUNDS_USDT * humans.length) : null;
    const roiAI = ais.length > 0 ? sumAI / (INITIAL_FUNDS_USDT * ais.length) : null;

    const humanWins = roiHuman != null && roiAI != null ? roiHuman > roiAI : false;
    const humanTeamPool = humanWins ? HUMAN_TEAM_POOL_BOOSTED_USD : HUMAN_TEAM_POOL_BASE_USD;

    return {
      humansCount: humans.length,
      aiCount: ais.length,
      sumHuman,
      sumAI,
      roiHuman,
      roiAI,
      humanWins,
      humanTeamPool,
    };
  }, [derived]);

  const championPrizeAwarded = useMemo(() => {
    if (!overallLeader) return false;
    return overallLeader.userType === 'HUMAN';
  }, [overallLeader]);

  const championPrizeAmount = championPrizeAwarded ? CHAMPION_PRIZE_USD : 0;

  const rewardDistribution = useMemo<RewardRow[]>(() => {
    if (!humanLeader) return [];
    const eligible = derived
      .filter((d) => d.userType === 'HUMAN')
      .filter((d) => d.pnlTotal > 0)
      .filter((d) => d.nickName !== humanLeader.nickName);

    const totalPositive = eligible.reduce((acc, d) => acc + d.pnlTotal, 0);
    if (totalPositive <= 0) return [];

    const rows: RewardRow[] = eligible.map((d) => {
      const share = d.pnlTotal / totalPositive;
      return {
        nickName: d.nickName,
        pnl: d.pnlTotal,
        share,
        reward: share * teamStats.humanTeamPool,
      };
    });

    return rows.sort((a, b) => b.reward - a.reward).slice(0, 12);
  }, [derived, humanLeader, teamStats.humanTeamPool]);

  const groupStats = useMemo<GroupStatsRow[]>(() => {
    const build = (userType: TraderData['user']['userType'], label: string): GroupStatsRow => {
      const group = derived.filter((d) => d.userType === userType);
      const active = group.filter((d) => d.isActive);
      const profitableActive = active.filter((d) => d.pnlTotal > 0).length;
      const liquidated = group.filter((d) => d.status === 'LIQUIDATED').length;

      const winRateActive = active.length > 0 ? profitableActive / active.length : null;
      const liquidatedRate = group.length > 0 ? liquidated / group.length : null;

      const medianPnl = median(group.map((d) => d.pnlTotal).filter(isFiniteNumber));
      const medianRoiPct = median(group.map((d) => d.roiTotalPct).filter(isFiniteNumber));
      const medianBps = median(active.map((d) => d.pnlPerVolBps).filter(isFiniteNumber));
      const medianPnlPerTrade = median(active.map((d) => d.pnlPerTrade).filter(isFiniteNumber));
      const medianAvgTradeSize = median(active.map((d) => d.avgTradeSize).filter(isFiniteNumber));

      return {
        group: label,
        participants: group.length,
        active: active.length,
        winRateActive,
        liquidatedRate,
        medianPnl,
        medianRoiPct,
        medianBps,
        medianPnlPerTrade,
        medianAvgTradeSize,
      };
    };

    return [
      build('HUMAN', texts.groupLabels.human),
      build('AI', texts.groupLabels.ai),
    ];
  }, [derived, texts.groupLabels.ai, texts.groupLabels.human]);

  const statusChartData = useMemo<StatusRow[]>(() => {
    const build = (userType: TraderData['user']['userType'], label: string): StatusRow => {
      const group = derived.filter((d) => d.userType === userType);
      const profitable = group.filter((d) => d.status === 'PROFIT').length;
      const loss = group.filter((d) => d.status === 'LOSS').length;
      const inactive = group.filter((d) => d.status === 'INACTIVE').length;
      const liquidated = group.filter((d) => d.status === 'LIQUIDATED').length;
      return { name: label, profitable, loss, inactive, liquidated };
    };
    return [
      build('HUMAN', texts.groupLabels.human),
      build('AI', texts.groupLabels.ai),
    ];
  }, [derived, texts.groupLabels.ai, texts.groupLabels.human]);

  const roiHistogram = useMemo<RoiBin[]>(() => {
    const values = derived.map((d) => d.roiTotalPct).filter(isFiniteNumber);
    const maxRoi = values.length > 0 ? Math.max(...values) : 0;
    const minRoi = values.length > 0 ? Math.min(...values) : 0;

    const step = 25;
    const lower = Math.min(-100, Math.floor(minRoi / step) * step);
    const upper = Math.max(100, Math.ceil(maxRoi / step) * step);
    const from = clamp(lower, -200, 0); // keep axis readable
    const to = clamp(upper, 50, 300);

    const binsCount = Math.max(1, Math.ceil((to - from) / step));
    const bins: RoiBin[] = new Array<RoiBin>(binsCount).fill(null).map((_, idx) => {
      const a = from + idx * step;
      const b = a + step;
      return {
        label: `${a}% ~ ${b}%`,
        human: 0,
        ai: 0,
      };
    });

    const assign = (roi: number): number => {
      const clamped = clamp(roi, from, to - 1e-9);
      const idx = Math.floor((clamped - from) / step);
      return clamp(idx, 0, bins.length - 1);
    };

    derived.forEach((d) => {
      if (!isFiniteNumber(d.roiTotalPct)) return;
      const idx = assign(d.roiTotalPct);
      if (d.userType === 'HUMAN') bins[idx].human += 1;
      if (d.userType === 'AI') bins[idx].ai += 1;
    });

    return bins;
  }, [derived]);

  const leaders = useMemo(() => {
    const active = derived.filter((d) => d.isActive);
    const topBps = [...active]
      .filter((d) => isFiniteNumber(d.pnlPerVolBps))
      .sort((a, b) => (b.pnlPerVolBps ?? -Infinity) - (a.pnlPerVolBps ?? -Infinity))
      .slice(0, 5);
    const topPnlPerTrade = [...active]
      .filter((d) => isFiniteNumber(d.pnlPerTrade))
      .sort((a, b) => (b.pnlPerTrade ?? -Infinity) - (a.pnlPerTrade ?? -Infinity))
      .slice(0, 5);
    const topAvgTradeSize = [...active]
      .filter((d) => isFiniteNumber(d.avgTradeSize))
      .sort((a, b) => (b.avgTradeSize ?? -Infinity) - (a.avgTradeSize ?? -Infinity))
      .slice(0, 5);
    return { topBps, topPnlPerTrade, topAvgTradeSize };
  }, [derived]);

  const fmtWinRate = (v: number | null): string => (v == null ? '—' : percent1.format(v));
  const fmtLiquidated = (v: number | null): string => (v == null ? '—' : percent1.format(v));
  const fmtCurrency0 = (v: number | null): string => (v == null ? '—' : currency0.format(v));
  const fmtCurrency2 = (v: number | null): string => (v == null ? '—' : formatSigned(v, currency2));
  const fmtBps = (v: number | null): string =>
    v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)} bps`;
  const fmtRoiPct = (v: number | null): string =>
    v == null ? '—' : `${v >= 0 ? '+' : ''}${percent1.format(v / 100)}`;

  const listItem = (
    item: DerivedTrader,
    metric: string
  ): React.ReactNode => {
    const badge =
      item.userType === 'AI'
        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
        : 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    return (
      <div
        key={`${item.userType}-${item.nickName}-${metric}`}
        className="flex items-center justify-between gap-3 py-2 border-b border-slate-700/50 last:border-b-0"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-200 font-medium truncate">{item.nickName}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge}`}>
              {item.userType}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            #{item.rank} · {texts.leaders.tradesLabel}: {item.trades.toLocaleString(locale)} · {texts.leaders.volumeLabel}:{' '}
            {currency0.format(item.totalVolume)}
          </div>
        </div>
        <div className="text-right font-mono text-sm text-slate-200 shrink-0">{metric}</div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{texts.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{texts.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>
            {texts.banner.prizePoolLabel}:{' '}
            <span className="text-slate-200 font-semibold">{currency0.format(TOTAL_PRIZE_POOL_USD)}</span>
          </span>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300">
              {texts.banner.initialFundsLabel}:{' '}
              <span className="font-semibold text-slate-100">{currency0.format(INITIAL_FUNDS_USDT)}</span>
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300">
              {texts.banner.rewardTokenLabel}:{' '}
              <span className="font-semibold text-slate-100">USDF</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500">{texts.banner.provisionalNote}</div>
        </div>
      </div>

      {/* Prize mechanics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            {texts.prizes.championPrizeTitle}
          </h4>
          <div className="text-xs text-slate-500 mb-3">{texts.prizes.championPrizeRules}</div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-slate-500">{texts.prizes.currentLeaderLabel}</div>
              <div className="text-slate-200 font-semibold truncate">
                {overallLeader ? `${overallLeader.nickName} (${overallLeader.userType})` : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                PnL: {overallLeader ? fmtCurrency0(overallLeader.pnlTotal) : '—'} · {texts.prizes.tieBreakNote}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">{texts.prizes.championPrizeLabel}</div>
              <div className={`font-mono text-lg ${championPrizeAwarded ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currency0.format(championPrizeAmount)}
              </div>
            </div>
          </div>
          {!championPrizeAwarded && (
            <div className="mt-3 text-[11px] text-amber-400/90">{texts.prizes.championUnclaimed}</div>
          )}
        </div>

        <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            {texts.prizes.teamPrizeTitle}
          </h4>
          <div className="text-xs text-slate-500 mb-3">{texts.prizes.teamPrizeRules}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">{texts.prizes.humanTeamLabel} {texts.prizes.teamRoiLabel}</div>
              <div className="font-mono text-slate-200 text-sm">
                {teamStats.roiHuman == null ? '—' : percent2.format(teamStats.roiHuman)}
              </div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
              <div className="text-[11px] text-slate-500">{texts.prizes.aiTeamLabel} {texts.prizes.teamRoiLabel}</div>
              <div className="font-mono text-slate-200 text-sm">
                {teamStats.roiAI == null ? '—' : percent2.format(teamStats.roiAI)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="text-[11px] text-slate-500">
              {texts.prizes.basePoolLabel}: {currency0.format(HUMAN_TEAM_POOL_BASE_USD)} · {texts.prizes.boostedPoolLabel}:{' '}
              {currency0.format(HUMAN_TEAM_POOL_BOOSTED_USD)}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">{texts.prizes.teamPoolLabel}</div>
              <div className={`font-mono text-lg ${teamStats.humanWins ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currency0.format(teamStats.humanTeamPool)}
              </div>
            </div>
          </div>
          <div className={`mt-2 text-[11px] ${teamStats.humanWins ? 'text-emerald-400/90' : 'text-amber-400/90'}`}>
            {teamStats.humanWins ? texts.prizes.teamPoolHumanWins : texts.prizes.teamPoolAiWins}
          </div>
        </div>
      </div>

      {/* Distribution simulation */}
      <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-slate-200 mb-1">{texts.prizes.distributionTitle}</h4>
        <p className="text-xs text-slate-500 mb-4">{texts.prizes.distributionSubtitle}</p>

        {rewardDistribution.length === 0 ? (
          <div className="text-sm text-slate-500">{texts.prizes.distributionEmpty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-2 pr-3 text-left">{texts.prizes.columns.trader}</th>
                  <th className="py-2 px-2 text-right">{texts.prizes.columns.pnl}</th>
                  <th className="py-2 px-2 text-right">{texts.prizes.columns.share}</th>
                  <th className="py-2 pl-2 text-right">{texts.prizes.columns.reward}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {rewardDistribution.map((row) => (
                  <tr key={row.nickName}>
                    <td className="py-2 pr-3 text-slate-200 font-medium">{row.nickName}</td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-400">{formatSigned(row.pnl, currency0)}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-200">{percent2.format(row.share)}</td>
                    <td className="py-2 pl-2 text-right font-mono text-slate-200">{currency0.format(row.reward)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-500">
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-2">{texts.prizes.distributionNotes.positiveOnly}</div>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-2">{texts.prizes.distributionNotes.championExcluded}</div>
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-2">{texts.prizes.distributionNotes.proportional}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Group stats table */}
        <div className="xl:col-span-2 bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            {texts.groupTable.title}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-2 pr-3 text-left">{texts.groupTable.columns.group}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.participants}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.active}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.winRateActive}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.liquidatedRate}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.medianPnl}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.medianRoi}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.medianBps}</th>
                  <th className="py-2 px-2 text-right">{texts.groupTable.columns.medianPnlPerTrade}</th>
                  <th className="py-2 pl-2 text-right">{texts.groupTable.columns.medianAvgTradeSize}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {groupStats.map((row) => (
                  <tr key={row.group}>
                    <td className="py-2 pr-3 text-slate-200 font-medium">{row.group}</td>
                    <td className="py-2 px-2 text-right text-slate-300 font-mono">{row.participants}</td>
                    <td className="py-2 px-2 text-right text-slate-300 font-mono">{row.active}</td>
                    <td className="py-2 px-2 text-right text-slate-200 font-mono">{fmtWinRate(row.winRateActive)}</td>
                    <td className="py-2 px-2 text-right text-slate-200 font-mono">{fmtLiquidated(row.liquidatedRate)}</td>
                    <td className="py-2 px-2 text-right text-slate-200 font-mono">{fmtCurrency0(row.medianPnl)}</td>
                    <td className="py-2 px-2 text-right text-slate-200 font-mono">{fmtRoiPct(row.medianRoiPct)}</td>
                    <td className="py-2 px-2 text-right text-slate-200 font-mono">{fmtBps(row.medianBps)}</td>
                    <td className="py-2 px-2 text-right text-slate-200 font-mono">{fmtCurrency2(row.medianPnlPerTrade)}</td>
                    <td className="py-2 pl-2 text-right text-slate-200 font-mono">{fmtCurrency0(row.medianAvgTradeSize)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            {texts.groupTable.notes.activeOnly} · {texts.groupTable.notes.bpsHint}
          </div>
        </div>

        {/* Status chart */}
        <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            {texts.statusChart.title}
          </h4>
          <p className="text-xs text-slate-500 mb-3">{texts.statusChart.subtitle}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} layout="vertical" margin={{ top: 8, right: 10, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="profitable" name={texts.statusChart.labels.profitable} stackId="a" fill={PROFIT_COLOR} />
                <Bar dataKey="loss" name={texts.statusChart.labels.loss} stackId="a" fill={LOSS_COLOR} />
                <Bar dataKey="inactive" name={texts.statusChart.labels.inactive} stackId="a" fill={INACTIVE_COLOR} />
                <Bar dataKey="liquidated" name={texts.statusChart.labels.liquidated} stackId="a" fill={LIQUIDATED_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROI Histogram */}
      <div className="mt-6 bg-slate-900/30 border border-slate-700 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-1">{texts.roiChart.title}</h4>
        <p className="text-xs text-slate-500 mb-4">{texts.roiChart.subtitle}</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiHistogram} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={55}
                label={{ value: texts.roiChart.axisX, position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                allowDecimals={false}
                label={{ value: texts.roiChart.axisY, angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="human" name={texts.roiChart.human} fill={HUMAN_COLOR} fillOpacity={0.75} />
              <Bar dataKey="ai" name={texts.roiChart.ai} fill={AI_COLOR} fillOpacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaders */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">{texts.leaders.efficiencyTitle}</h4>
          <div className="text-[11px] text-slate-500 mb-3">{texts.leaders.efficiencySubtitle}</div>
          {leaders.topBps.length === 0 ? (
            <div className="text-sm text-slate-500">{texts.leaders.empty}</div>
          ) : (
            leaders.topBps.map((d) => listItem(d, d.pnlPerVolBps == null ? '—' : `${d.pnlPerVolBps >= 0 ? '+' : ''}${d.pnlPerVolBps.toFixed(2)} bps`))
          )}
        </div>

        <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">{texts.leaders.pnlPerTradeTitle}</h4>
          <div className="text-[11px] text-slate-500 mb-3">{texts.leaders.pnlPerTradeSubtitle}</div>
          {leaders.topPnlPerTrade.length === 0 ? (
            <div className="text-sm text-slate-500">{texts.leaders.empty}</div>
          ) : (
            leaders.topPnlPerTrade.map((d) => listItem(d, d.pnlPerTrade == null ? '—' : formatSigned(d.pnlPerTrade, currency2)))
          )}
        </div>

        <div className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">{texts.leaders.avgTradeSizeTitle}</h4>
          <div className="text-[11px] text-slate-500 mb-3">{texts.leaders.avgTradeSizeSubtitle}</div>
          {leaders.topAvgTradeSize.length === 0 ? (
            <div className="text-sm text-slate-500">{texts.leaders.empty}</div>
          ) : (
            leaders.topAvgTradeSize.map((d) => listItem(d, d.avgTradeSize == null ? '—' : currency0.format(d.avgTradeSize)))
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
