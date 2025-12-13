import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { TraderData } from '../types';
import type { CorrelationTexts, Language } from '../i18n';

type UserTypeFilter = 'ALL' | 'HUMAN' | 'AI';
type MetricKey = 'pnlTotal' | 'pnl24H' | 'pnlPerVolBps' | 'pnlPerTrade';

interface CorrelationAnalysisProps {
  data: TraderData[];
  language: Language;
  texts: CorrelationTexts;
}

interface ScatterPoint {
  x: number; // log1p(totalVolume)
  y: number; // log1p(trades)
  z: number; // totalVolume (bubble size)
  metric: number | null;
  metricLabel: string;
  nickName: string;
  userType: TraderData['user']['userType'];
  walletWithMask: string;
  totalVolume: number;
  trades: number;
  positions: number;
  pnlTotal: number;
  pnl24H: number;
  balance: number;
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
}

const PROFIT_COLOR = '#10B981'; // Emerald-500
const LOSS_COLOR = '#EF4444'; // Red-500
const NEUTRAL_COLOR = '#64748B'; // Slate-500

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  if (normalized.length !== 6) return null;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return null;
  return { r, g, b };
};

const rgbToHex = (rgb: { r: number; g: number; b: number }): string => {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const interpolateHex = (a: string, b: string, t: number): string => {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  return rgbToHex({
    r: lerp(ra.r, rb.r, t),
    g: lerp(ra.g, rb.g, t),
    b: lerp(ra.b, rb.b, t),
  });
};

const divergingColor = (value: number, maxAbs: number): string => {
  if (!Number.isFinite(maxAbs) || maxAbs <= 0) return NEUTRAL_COLOR;
  const t = clamp(value / maxAbs, -1, 1);
  if (t === 0) return NEUTRAL_COLOR;
  if (t < 0) return interpolateHex(NEUTRAL_COLOR, LOSS_COLOR, Math.abs(t));
  return interpolateHex(NEUTRAL_COLOR, PROFIT_COLOR, t);
};

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

const pearson = (xs: number[], ys: number[]): number | null => {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i += 1) {
    const a = xs[i] - meanX;
    const b = ys[i] - meanY;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
};

const ranksWithTies = (values: number[]): number[] => {
  const indexed = values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v);

  const out = new Array<number>(values.length);
  for (let i = 0; i < indexed.length; ) {
    let j = i + 1;
    while (j < indexed.length && indexed[j].v === indexed[i].v) j += 1;
    const avgRank = (i + 1 + j) / 2; // 1-based ranks
    for (let k = i; k < j; k += 1) {
      out[indexed[k].i] = avgRank;
    }
    i = j;
  }
  return out;
};

const spearman = (xs: number[], ys: number[]): number | null => {
  if (xs.length !== ys.length || xs.length < 3) return null;
  return pearson(ranksWithTies(xs), ranksWithTies(ys));
};

const formatCorr = (value: number | null): string => {
  if (!isFiniteNumber(value)) return '—';
  return value.toFixed(3);
};

interface CorrelationTooltipProps extends CustomTooltipProps {
  locale: string;
  currencyFormatter: Intl.NumberFormat;
  metricKey: MetricKey;
  metricLabel: string;
  volumeLabel: string;
  tradesLabel: string;
}

const CorrelationTooltip: React.FC<CorrelationTooltipProps> = ({
  active,
  payload,
  locale,
  currencyFormatter,
  metricKey,
  metricLabel,
  volumeLabel,
  tradesLabel,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload.find((p) => p && p.payload != null)?.payload;
  if (!isRecord(item)) return null;

  const nickName = typeof item.nickName === 'string' ? item.nickName : '';
  const userType = item.userType === 'AI' || item.userType === 'HUMAN' ? item.userType : null;
  const walletWithMask = typeof item.walletWithMask === 'string' ? item.walletWithMask : null;
  const totalVolume = isFiniteNumber(item.totalVolume) ? item.totalVolume : null;
  const trades = isFiniteNumber(item.trades) ? item.trades : null;
  const metricValue = isFiniteNumber(item.metric) ? item.metric : null;

  const formatMetric = (): string => {
    if (!isFiniteNumber(metricValue)) return '—';
    if (metricKey === 'pnlPerVolBps') {
      return `${metricValue >= 0 ? '+' : ''}${metricValue.toFixed(2)} bps`;
    }
    if (metricKey === 'pnlPerTrade') {
      const fmt = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      });
      return `${metricValue >= 0 ? '+' : ''}${fmt.format(metricValue)}`;
    }
    return `${metricValue >= 0 ? '+' : ''}${currencyFormatter.format(metricValue)}`;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-slate-200">{nickName}</p>
        {userType && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
              userType === 'AI'
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}
          >
            {userType}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-1 text-slate-300">
        {walletWithMask && <div className="text-slate-500">{walletWithMask}</div>}
        {totalVolume != null && <div>{volumeLabel}: {currencyFormatter.format(totalVolume)}</div>}
        {trades != null && <div>{tradesLabel}: {trades.toLocaleString(locale)}</div>}
        <div className="pt-1 border-t border-slate-700/70 text-slate-200">
          {metricLabel}: <span className="font-semibold">{formatMetric()}</span>
        </div>
      </div>
    </div>
  );
};

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  data,
  language,
  texts,
}) => {
  const [filter, setFilter] = useState<UserTypeFilter>('ALL');
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  const [metricKey, setMetricKey] = useState<MetricKey>('pnlTotal');

  const locale = language === 'zh' ? 'zh-CN' : 'en-US';

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [locale]
  );

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    [locale]
  );

  const totalInFilter = useMemo(() => {
    if (filter === 'ALL') return data.length;
    return data.filter((d) => d.user.userType === filter).length;
  }, [data, filter]);

  const activeInFilter = useMemo(() => {
    const base = filter === 'ALL' ? data : data.filter((d) => d.user.userType === filter);
    return base.filter((d) => d.totalVolume > 0 && d.trades > 0).length;
  }, [data, filter]);

  const filteredData = useMemo(() => {
    const base = filter === 'ALL' ? data : data.filter((d) => d.user.userType === filter);
    if (!activeOnly) return base;
    return base.filter((d) => d.totalVolume > 0 && d.trades > 0);
  }, [activeOnly, data, filter]);

  const metricLabel = useMemo(() => {
    switch (metricKey) {
      case 'pnlTotal':
        return texts.metrics.pnlTotal;
      case 'pnl24H':
        return texts.metrics.pnl24H;
      case 'pnlPerVolBps':
        return texts.metrics.pnlPerVolBps;
      case 'pnlPerTrade':
        return texts.metrics.pnlPerTrade;
      default: {
        const _exhaustiveCheck: never = metricKey;
        return _exhaustiveCheck;
      }
    }
  }, [metricKey, texts.metrics]);

  const points = useMemo<ScatterPoint[]>(() => {
    return filteredData.map((trader) => {
      const logVol = Math.log1p(Math.max(0, trader.totalVolume));
      const logTrades = Math.log1p(Math.max(0, trader.trades));
      const pnlPerVolBps =
        trader.totalVolume > 0 ? (trader.pnlTotal / trader.totalVolume) * 10000 : null;
      const pnlPerTrade = trader.trades > 0 ? trader.pnlTotal / trader.trades : null;

      const metric =
        metricKey === 'pnlTotal'
          ? trader.pnlTotal
          : metricKey === 'pnl24H'
            ? trader.pnl24H
            : metricKey === 'pnlPerVolBps'
              ? pnlPerVolBps
              : pnlPerTrade;

      return {
        x: logVol,
        y: logTrades,
        z: trader.totalVolume,
        metric: isFiniteNumber(metric) ? metric : null,
        metricLabel,
        nickName: trader.user.nickName,
        userType: trader.user.userType,
        walletWithMask: trader.user.walletWithMask,
        totalVolume: trader.totalVolume,
        trades: trader.trades,
        positions: trader.positions,
        pnlTotal: trader.pnlTotal,
        pnl24H: trader.pnl24H,
        balance: trader.balance,
      };
    });
  }, [filteredData, metricKey, metricLabel]);

  const seriesHuman = useMemo(
    () => points.filter((p) => p.userType === 'HUMAN'),
    [points]
  );
  const seriesAI = useMemo(() => points.filter((p) => p.userType === 'AI'), [points]);

  const metricScale = useMemo(() => {
    const absValues = points
      .map((p) => (isFiniteNumber(p.metric) ? Math.abs(p.metric) : null))
      .filter(isFiniteNumber)
      .sort((a, b) => a - b);
    const p95 = absValues.length > 0 ? quantile(absValues, 0.95) : null;
    return isFiniteNumber(p95) && p95 > 0 ? p95 : 1;
  }, [points]);

  const medianX = useMemo(() => median(points.map((p) => p.x)), [points]);
  const medianY = useMemo(() => median(points.map((p) => p.y)), [points]);

  const correlations = useMemo(() => {
    const xsVol = points.map((p) => p.x);
    const ysTrades = points.map((p) => p.y);
    const ms = points.map((p) => p.metric);

    const volTrades = {
      n: xsVol.length,
      pearson: pearson(xsVol, ysTrades),
      spearman: spearman(xsVol, ysTrades),
    };

    const pairsMetric = ms
      .map((m, i) => ({ m, i }))
      .filter((p) => isFiniteNumber(p.m));

    const xsVolM = pairsMetric.map((p) => xsVol[p.i]);
    const ysTradesM = pairsMetric.map((p) => ysTrades[p.i]);
    const msOnly = pairsMetric.map((p) => p.m);

    const volMetric = {
      n: msOnly.length,
      pearson: pearson(xsVolM, msOnly),
      spearman: spearman(xsVolM, msOnly),
    };
    const tradesMetric = {
      n: msOnly.length,
      pearson: pearson(ysTradesM, msOnly),
      spearman: spearman(ysTradesM, msOnly),
    };

    return { volTrades, volMetric, tradesMetric };
  }, [points]);

  const formatLogTick = (val: unknown): string => {
    const n = typeof val === 'number' ? val : Number(val);
    if (!Number.isFinite(n)) return '';
    const original = Math.expm1(n);
    if (!Number.isFinite(original)) return '';
    return compactFormatter.format(original);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{texts.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{texts.subtitle}</p>
          <div className="mt-2 text-[11px] text-slate-500">
            {texts.summary
              .replace('{n}', filteredData.length.toString())
              .replace('{active}', activeInFilter.toString())
              .replace('{total}', totalInFilter.toString())}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-900/50 p-1 rounded-lg w-full sm:w-auto">
            {(['ALL', 'HUMAN', 'AI'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex-1 sm:flex-none ${
                  filter === type
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'ALL'
                  ? texts.filters.all
                  : type === 'HUMAN'
                    ? texts.filters.human
                    : texts.filters.ai}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-300 select-none">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900/60 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-slate-400">{texts.activeOnly}</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold tracking-wider">
              {texts.metricLabel}
            </span>
            <select
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value as MetricKey)}
              className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pnlTotal">{texts.metrics.pnlTotal}</option>
              <option value="pnl24H">{texts.metrics.pnl24H}</option>
              <option value="pnlPerVolBps">{texts.metrics.pnlPerVolBps}</option>
              <option value="pnlPerTrade">{texts.metrics.pnlPerTrade}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3">{texts.tableTitle}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-2 pr-3">{texts.tableHeaders.pair}</th>
                  <th className="py-2 px-2 text-right">{texts.tableHeaders.pearson}</th>
                  <th className="py-2 px-2 text-right">{texts.tableHeaders.spearman}</th>
                  <th className="py-2 pl-2 text-right">{texts.tableHeaders.n}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr>
                  <td className="py-2 pr-3 text-slate-300">{texts.pairs.volTrades}</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-200">
                    {formatCorr(correlations.volTrades.pearson)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-200">
                    {formatCorr(correlations.volTrades.spearman)}
                  </td>
                  <td className="py-2 pl-2 text-right font-mono text-slate-500">
                    {correlations.volTrades.n}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-slate-300">
                    {texts.pairs.volMetric.replace('{metric}', metricLabel)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-200">
                    {formatCorr(correlations.volMetric.pearson)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-200">
                    {formatCorr(correlations.volMetric.spearman)}
                  </td>
                  <td className="py-2 pl-2 text-right font-mono text-slate-500">
                    {correlations.volMetric.n}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-slate-300">
                    {texts.pairs.tradesMetric.replace('{metric}', metricLabel)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-200">
                    {formatCorr(correlations.tradesMetric.pearson)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-200">
                    {formatCorr(correlations.tradesMetric.spearman)}
                  </td>
                  <td className="py-2 pl-2 text-right font-mono text-slate-500">
                    {correlations.tradesMetric.n}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-1">{texts.chartTitle}</h4>
          <p className="text-xs text-slate-500 mb-4">
            {texts.chartSubtitle.replace('{metric}', metricLabel)}
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  dataKey="x"
                  stroke="#94a3b8"
                  tickFormatter={formatLogTick}
                  label={{
                    value: texts.axisVolume,
                    position: 'insideBottomRight',
                    offset: -10,
                    fill: '#94a3b8',
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  stroke="#94a3b8"
                  tickFormatter={formatLogTick}
                  label={{
                    value: texts.axisTrades,
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#94a3b8',
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 360]} />
                {isFiniteNumber(medianX) && (
                  <ReferenceLine x={medianX} stroke="#334155" strokeDasharray="3 3" />
                )}
                {isFiniteNumber(medianY) && (
                  <ReferenceLine y={medianY} stroke="#334155" strokeDasharray="3 3" />
                )}
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <CorrelationTooltip
                      locale={locale}
                      currencyFormatter={currencyFormatter}
                      metricKey={metricKey}
                      metricLabel={metricLabel}
                      volumeLabel={texts.tooltip.volume}
                      tradesLabel={texts.tooltip.trades}
                    />
                  }
                />
                <Legend />
                <Scatter name={texts.humanLabel} data={seriesHuman} shape="circle" fillOpacity={0.75}>
                  {seriesHuman.map((p, idx) => (
                    <Cell
                      key={`h-${idx}`}
                      fill={isFiniteNumber(p.metric) ? divergingColor(p.metric, metricScale) : NEUTRAL_COLOR}
                    />
                  ))}
                </Scatter>
                <Scatter name={texts.aiLabel} data={seriesAI} shape="triangle" fillOpacity={0.75}>
                  {seriesAI.map((p, idx) => (
                    <Cell
                      key={`a-${idx}`}
                      fill={isFiniteNumber(p.metric) ? divergingColor(p.metric, metricScale) : NEUTRAL_COLOR}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;

