import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { TraderData } from '../types';
import type { ChartTexts } from '../i18n';

interface AnalysisChartsProps {
  data: TraderData[];
  texts: ChartTexts;
}

const COLORS = ['#60A5FA', '#A78BFA']; // Blue for Human, Purple for AI
const PROFIT_COLOR = '#10B981'; // Emerald-500
const LOSS_COLOR = '#EF4444';   // Red-500
const LIQUIDATED_COLOR = '#991B1B'; // Red-800 (deep red)
const INACTIVE_COLOR = '#64748B'; // Slate-500
const LIQUIDATED_BALANCE_THRESHOLD = 1; // <$1 treated as "zero" (dust) in sample data

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const filteredPayload = payload.filter((entry) => entry.payload != null);
  const displayPayload = filteredPayload.length > 0 ? filteredPayload : payload;
  const titleEntry = displayPayload[0];
  const payloadObj = titleEntry?.payload != null && isRecord(titleEntry.payload) ? titleEntry.payload : null;
  const payloadName = payloadObj && typeof payloadObj.name === 'string' ? payloadObj.name : null;
  const title = payloadName ?? label ?? titleEntry?.name ?? '';

  return (
    <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs">
      <p className="font-bold text-slate-200 mb-1">{title}</p>
      {displayPayload.map((entry, index) => {
        const entryPayloadColor =
          entry.payload != null && isRecord(entry.payload) && typeof entry.payload.color === 'string'
            ? entry.payload.color
            : null;
        const color = entryPayloadColor ?? entry.color ?? '#94a3b8';
        const value =
          typeof entry.value === 'number'
            ? entry.value.toLocaleString()
            : entry.value == null
              ? '-'
              : String(entry.value);

        return (
          <p key={`${entry.name ?? 'item'}-${index}`} style={{ color }}>
            {entry.name}: {value}
          </p>
        );
      })}
    </div>
  );
};

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ data, texts }) => {
  // 1. Data for Pie Chart (PnL Distribution)
  let profitableCount = 0;
  let lossCount = 0;
  let liquidatedCount = 0;
  let inactiveCount = 0;

  data.forEach(d => {
    // Liquidated/blown up users can have tiny residual "dust" balances in sample data.
    if (d.balance < LIQUIDATED_BALANCE_THRESHOLD) {
      liquidatedCount++;
    } else if (d.totalVolume === 0) {
      inactiveCount++;
    } else if (d.pnlTotal >= 0) {
      profitableCount++;
    } else {
      lossCount++;
    }
  });

  const pieData = [
    { name: texts.profitable, value: profitableCount, color: PROFIT_COLOR },
    { name: texts.liquidated, value: liquidatedCount, color: LIQUIDATED_COLOR },
    { name: texts.loss, value: lossCount, color: LOSS_COLOR },
    { name: texts.inactive, value: inactiveCount, color: INACTIVE_COLOR },
  ].filter(d => d.value > 0);

  // 2. Data for Average PnL Comparison
  const humanCount = data.filter(d => d.user.userType === 'HUMAN').length;
  const aiCount = data.filter(d => d.user.userType === 'AI').length;
  
  const humanPnL = data.filter(d => d.user.userType === 'HUMAN').reduce((acc, curr) => acc + curr.pnlTotal, 0);
  const aiPnL = data.filter(d => d.user.userType === 'AI').reduce((acc, curr) => acc + curr.pnlTotal, 0);
  
  const avgHumanPnL = humanCount ? humanPnL / humanCount : 0;
  const avgAiPnL = aiCount ? aiPnL / aiCount : 0;

  const barData = [
    { name: texts.avgTotalPnL, human: Math.round(avgHumanPnL), ai: Math.round(avgAiPnL) }
  ];

  // 3. Scatter Data (Trades vs PnL)
  const formatScatterPoint = (trader: TraderData) => ({
    x: trader.trades,
    y: trader.pnlTotal,
    z: trader.totalVolume,
    name: trader.user.nickName,
  });

  // Keep arrays aligned with the original data indexes so the tooltip index stays in sync.
  const scatterDataHuman = data.map((trader) =>
    trader.user.userType === 'HUMAN' ? formatScatterPoint(trader) : null
  );

  const scatterDataAI = data.map((trader) =>
    trader.user.userType === 'AI' ? formatScatterPoint(trader) : null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Profitability Distribution */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">{texts.profitabilityTitle}</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                >
                {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Average Performance */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">{texts.averageTitle}</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `$${val}`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" hide />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="human" name={texts.human} fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                <Bar dataKey="ai" name={texts.ai} fill={COLORS[1]} radius={[0, 4, 4, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

       {/* Chart 3: Scatter Performance */}
       <div className="col-span-1 lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">{texts.scatterTitle}</h3>
        <p className="text-xs text-slate-400 mb-4">{texts.scatterSubtitle}</p>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="x" name={texts.axisTrades} stroke="#94a3b8" label={{ value: texts.axisTrades, position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }} />
                <YAxis type="number" dataKey="y" name={texts.axisPnL} stroke="#94a3b8" label={{ value: texts.axisPnL, angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name={texts.axisVolume} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Legend />
                <Scatter name={texts.human} data={scatterDataHuman} fill={COLORS[0]} fillOpacity={0.6} shape="circle" />
                <Scatter name={texts.ai} data={scatterDataAI} fill={COLORS[1]} fillOpacity={0.6} shape="triangle" />
            </ScatterChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;
