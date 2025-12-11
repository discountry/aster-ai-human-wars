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

interface AnalysisChartsProps {
  data: TraderData[];
}

const COLORS = ['#60A5FA', '#A78BFA']; // Blue for Human, Purple for AI
const PROFIT_COLOR = '#10B981'; // Emerald-500
const LOSS_COLOR = '#EF4444';   // Red-500
const INACTIVE_COLOR = '#64748B'; // Slate-500

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs">
        <p className="font-bold text-slate-200 mb-1">{label || payload[0].payload.name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.payload.color || entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ data }) => {
  // 1. Data for Pie Chart (PnL Distribution)
  let profitableCount = 0;
  let lossCount = 0;
  let inactiveCount = 0;

  data.forEach(d => {
    if (d.totalVolume === 0) {
      inactiveCount++;
    } else if (d.pnlTotal >= 0) {
      profitableCount++;
    } else {
      lossCount++;
    }
  });

  const pieData = [
    { name: 'Profitable', value: profitableCount, color: PROFIT_COLOR },
    { name: 'Loss', value: lossCount, color: LOSS_COLOR },
    { name: 'Inactive (0 Vol)', value: inactiveCount, color: INACTIVE_COLOR },
  ].filter(d => d.value > 0);

  // 2. Data for Average PnL Comparison
  const humanCount = data.filter(d => d.user.userType === 'HUMAN').length;
  const aiCount = data.filter(d => d.user.userType === 'AI').length;
  
  const humanPnL = data.filter(d => d.user.userType === 'HUMAN').reduce((acc, curr) => acc + curr.pnlTotal, 0);
  const aiPnL = data.filter(d => d.user.userType === 'AI').reduce((acc, curr) => acc + curr.pnlTotal, 0);
  
  const avgHumanPnL = humanCount ? humanPnL / humanCount : 0;
  const avgAiPnL = aiCount ? aiPnL / aiCount : 0;

  const barData = [
    { name: 'Avg Total PnL', Human: Math.round(avgHumanPnL), AI: Math.round(avgAiPnL) }
  ];

  // 3. Scatter Data (Trades vs PnL)
  const scatterDataHuman = data
    .filter(d => d.user.userType === 'HUMAN')
    .map(d => ({ x: d.trades, y: d.pnlTotal, z: d.totalVolume, name: d.user.nickName }));
    
  const scatterDataAI = data
    .filter(d => d.user.userType === 'AI')
    .map(d => ({ x: d.trades, y: d.pnlTotal, z: d.totalVolume, name: d.user.nickName }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Profitability Distribution */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Profitability Distribution</h3>
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
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Avg. PnL (Human vs AI)</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `$${val}`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" hide />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="Human" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                <Bar dataKey="AI" fill={COLORS[1]} radius={[0, 4, 4, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

       {/* Chart 3: Scatter Performance */}
       <div className="col-span-1 lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Trade Frequency vs Profitability</h3>
        <p className="text-xs text-slate-400 mb-4">X-Axis: Number of Trades, Y-Axis: Total PnL ($). Bubble size represents volume.</p>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="x" name="Trades" stroke="#94a3b8" label={{ value: 'Trades', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }} />
                <YAxis type="number" dataKey="y" name="PnL" stroke="#94a3b8" label={{ value: 'PnL ($)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Volume" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Legend />
                <Scatter name="Human" data={scatterDataHuman} fill={COLORS[0]} fillOpacity={0.6} shape="circle" />
                <Scatter name="AI" data={scatterDataAI} fill={COLORS[1]} fillOpacity={0.6} shape="triangle" />
            </ScatterChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;