import React, { useMemo, useState, useEffect } from 'react';
import { RAW_DATA } from './constants';
import StatsCards from './components/StatsCards';
import AnalysisCharts from './components/AnalysisCharts';
import LeaderboardTable from './components/LeaderboardTable';
import { StatMetric, TraderData, ApiResponse } from './types';
import { BrainCircuit, RefreshCw, Swords } from 'lucide-react';
import { translations, type Language } from './i18n';

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
];

const App: React.FC = () => {
  const [data, setData] = useState<TraderData[]>(RAW_DATA.data.data);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [language, setLanguage] = useState<Language>('zh');

  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const t = translations[language];

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [locale]
  );

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

    const totalTradersLabel = `${totalTraders} ${t.stats.activeTradersSuffix}`;
    const humanParticipants = `${humanTraders.length} ${t.stats.participantsSuffix}`;
    const aiParticipants = `${aiTraders.length} ${t.stats.participantsSuffix}`;

    return [
      {
        label: t.stats.totalVolume,
        value: `$${(totalVol / 1000000).toFixed(1)}M`,
        subValue: totalTradersLabel,
        trend: 'neutral',
        icon: 'volume'
      },
      {
        label: t.stats.topPerformer,
        value: topTrader ? topTrader.user.nickName : t.general.notAvailable,
        subValue: topTrader ? `${currencyFormatter.format(topTrader.pnlTotal)} ${t.stats.profitLabel}` : '-',
        trend: 'up',
        color: topTrader?.user.userType === 'AI' ? 'text-purple-400' : 'text-blue-400',
        icon: topTrader?.user.userType === 'AI' ? 'ai' : 'human'
      },
      {
        label: t.stats.avgHuman,
        value: currencyFormatter.format(avgHumanPnL),
        subValue: humanParticipants,
        trend: avgHumanPnL > 0 ? 'up' : 'down',
        icon: 'human'
      },
      {
        label: t.stats.avgAI,
        value: currencyFormatter.format(avgAiPnL),
        subValue: aiParticipants,
        trend: avgAiPnL > 0 ? 'up' : 'down',
        icon: 'ai'
      }
    ];
  }, [currencyFormatter, data, language]);

  const formattedTime = lastUpdated.toLocaleTimeString(locale, { hour12: language === 'en' });
  const statusText = loading ? t.header.updating : isLive ? t.header.live : t.header.cached;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                {t.header.titleMain}
              </span>
              <span className="text-slate-500 font-light">{t.header.titleSuffix}</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              {t.header.description}
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
            <div className="flex items-center justify-between md:justify-end gap-3 w-full">
              <span className="text-xs text-slate-500 tracking-wider font-semibold">{t.header.languageLabel}</span>
              <div className="flex bg-slate-900/60 rounded-full p-1">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setLanguage(option.code)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                      language === option.code
                        ? 'bg-slate-700 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    aria-pressed={language === option.code}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <a 
              href="https://www.asterdex.com/zh-CN/referral/4665f3" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto text-sm md:text-base"
            >
              <Swords size={18} />
              {t.header.cta}
            </a>

            <div className="text-right hidden md:block">
              <div className="text-xs text-slate-500 tracking-wider font-semibold">{t.header.dataStatus}</div>
              <div className="flex items-center gap-4 justify-end mt-1">
                <button 
                  onClick={fetchData}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  {formattedTime}
                </button>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  </span>
                  <span className={`${isLive ? 'text-emerald-400' : 'text-amber-400'} text-sm font-medium`}>
                    {statusText}
                  </span>
                </div>
              </div>
              {!isLive && !loading && (
                <div className="text-[10px] text-amber-500/80 mt-1">
                  {t.header.fallback}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Key Metrics */}
        <StatsCards metrics={stats} />

        {/* Charts Section */}
        <AnalysisCharts data={data} texts={t.charts} />

        {/* Leaderboard */}
        <LeaderboardTable data={data} texts={t.leaderboard} language={language} />
        
        <footer className="mt-12 text-center text-slate-600 text-sm">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
