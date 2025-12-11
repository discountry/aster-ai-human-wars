import React, { useMemo, useState, useEffect } from 'react';
import { RAW_DATA } from './constants';
import StatsCards from './components/StatsCards';
import AnalysisCharts from './components/AnalysisCharts';
import LeaderboardTable from './components/LeaderboardTable';
import { StatMetric, TraderData, ApiResponse } from './types';
import { BrainCircuit, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<TraderData[]>(RAW_DATA.data.data);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://www.asterdex.com/bapi/futures/v1/public/campaign/human-ai/query-leader-board-by-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          rows: 100,
          sort: "rank",
          order: "asc"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      if (json.success && json.data && Array.isArray(json.data.data)) {
        setData(json.data.data);
        setIsLive(true);
        setLastUpdated(new Date());
      } else {
        console.warn('API returned unsuccessful response or invalid format:', json);
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error);
      // We keep the RAW_DATA as fallback, but set isLive to false
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate summary metrics
  const stats = useMemo<StatMetric[]>(() => {
    const totalTraders = data.length;
    const humanTraders = data.filter(d => d.user.userType === 'HUMAN');
    const aiTraders = data.filter(d => d.user.userType === 'AI');
    
    // Average PnL
    const avgHumanPnL = humanTraders.length > 0 
      ? humanTraders.reduce((acc, curr) => acc + curr.pnlTotal, 0) / humanTraders.length 
      : 0;
    const avgAiPnL = aiTraders.length > 0 
      ? aiTraders.reduce((acc, curr) => acc + curr.pnlTotal, 0) / aiTraders.length 
      : 0;
    
    // Best Performer
    const topTrader = [...data].sort((a, b) => b.pnlTotal - a.pnlTotal)[0];
    
    // Total Volume
    const totalVol = data.reduce((acc, curr) => acc + curr.totalVolume, 0);

    return [
      {
        label: "Total Volume",
        value: `$${(totalVol / 1000000).toFixed(1)}M`,
        subValue: `${totalTraders} Active Traders`,
        trend: 'neutral'
      },
      {
        label: "Top Performer",
        value: topTrader ? topTrader.user.nickName : 'N/A',
        subValue: topTrader ? `$${topTrader.pnlTotal.toFixed(0)} Profit` : '-',
        trend: 'up',
        color: topTrader?.user.userType === 'AI' ? 'text-purple-400' : 'text-blue-400'
      },
      {
        label: "Avg Human PnL",
        value: `$${avgHumanPnL.toFixed(0)}`,
        subValue: `${humanTraders.length} Participants`,
        trend: avgHumanPnL > 0 ? 'up' : 'down'
      },
      {
        label: "Avg AI PnL",
        value: `$${avgAiPnL.toFixed(0)}`,
        subValue: `${aiTraders.length} Participants`,
        trend: avgAiPnL > 0 ? 'up' : 'down'
      }
    ];
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                AI vs Human
              </span>
              <span className="text-slate-500 font-light">Wars</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Live performance tracking of algorithmic trading bots versus human traders. 
              Who dominates the market today?
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Data Status</div>
            <div className="flex items-center gap-4 justify-end mt-1">
              <button 
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                {lastUpdated.toLocaleTimeString()}
              </button>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className={`${isLive ? 'text-emerald-400' : 'text-amber-400'} text-sm font-medium`}>
                  {loading ? 'Updating...' : isLive ? 'Live Feed' : 'Cached Data'}
                </span>
              </div>
            </div>
            {!isLive && !loading && (
              <div className="text-[10px] text-amber-500/80 mt-1">
                Using local fallback data (API unavailable)
              </div>
            )}
          </div>
        </header>

        {/* Key Metrics */}
        <StatsCards metrics={stats} />

        {/* Charts Section */}
        <AnalysisCharts data={data} />

        {/* Leaderboard */}
        <LeaderboardTable data={data} />
        
        <footer className="mt-12 text-center text-slate-600 text-sm">
          <p>© 2024 AI Trading Wars Dashboard. Data provided by AsterIndex.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;