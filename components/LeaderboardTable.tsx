import React, { useMemo, useState } from 'react';
import { TraderData } from '../types';
import { Trophy, TrendingUp, TrendingDown, Bot, User, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { LeaderboardTexts, Language } from '../i18n';

interface LeaderboardTableProps {
  data: TraderData[];
  texts: LeaderboardTexts;
  language: Language;
}

type SortField = 'rank' | 'pnlTotal' | 'balance' | 'pnl24H' | 'totalVolume' | 'trades';
type SortOrder = 'asc' | 'desc';

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data, texts, language }) => {
  const [filter, setFilter] = useState<'ALL' | 'HUMAN' | 'AI'>('ALL');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to high-to-low for metrics usually
    }
  };

  const filteredData = data.filter(item => {
    if (filter === 'ALL') return true;
    return item.user.userType === filter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return (a[sortField] - b[sortField]) * multiplier;
  });

  const formatCurrency = (val: number) => currencyFormatter.format(val);

  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    const isAsc = sortOrder === 'asc';
    
    if (!isActive) {
      return (
        <ArrowUpDown 
          className="w-3.5 h-3.5 ml-1.5 inline-block opacity-0 group-hover:opacity-50 transition-all duration-200 text-slate-400 group-hover:text-slate-300" 
        />
      );
    }
    
    return (
      <div className="ml-1.5 inline-flex items-center">
        {isAsc ? (
          <ArrowUp className="w-3.5 h-3.5 text-blue-400 transition-all duration-200" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5 text-blue-400 transition-all duration-200" />
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden shadow-lg">
      <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {texts.title}
        </h3>
        <div className="flex bg-slate-900/50 p-1 rounded-lg">
          {(['ALL', 'HUMAN', 'AI'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
              <th 
                className="p-4 cursor-pointer hover:text-white group transition-all duration-200 w-22 text-center hover:bg-slate-800/30 rounded-tl-lg"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center justify-center gap-1">{texts.columns.rank} <SortIcon field="rank" /></div>
              </th>
              <th className="p-4">{texts.columns.trader}</th>
              <th 
                className="p-4 text-right cursor-pointer hover:text-white group transition-all duration-200 hover:bg-slate-800/30"
                onClick={() => handleSort('pnlTotal')}
              >
                <div className="flex items-center justify-end gap-1">{texts.columns.totalPnL} <SortIcon field="pnlTotal" /></div>
              </th>
              <th 
                className="p-4 text-right cursor-pointer hover:text-white group transition-all duration-200 hover:bg-slate-800/30"
                onClick={() => handleSort('balance')}
              >
                <div className="flex items-center justify-end gap-1">{texts.columns.balance} <SortIcon field="balance" /></div>
              </th>
               <th 
                className="p-4 text-right cursor-pointer hover:text-white group transition-all duration-200 hover:bg-slate-800/30 hidden md:table-cell"
                onClick={() => handleSort('pnl24H')}
              >
                <div className="flex items-center justify-end gap-1">{texts.columns.pnl24H} <SortIcon field="pnl24H" /></div>
              </th>
              <th 
                className="p-4 text-right cursor-pointer hover:text-white group transition-all duration-200 hover:bg-slate-800/30 hidden sm:table-cell"
                onClick={() => handleSort('totalVolume')}
              >
                <div className="flex items-center justify-end gap-1">{texts.columns.volume} <SortIcon field="totalVolume" /></div>
              </th>
              <th 
                className="p-4 text-right cursor-pointer hover:text-white group transition-all duration-200 hover:bg-slate-800/30 hidden lg:table-cell rounded-tr-lg"
                onClick={() => handleSort('trades')}
              >
                <div className="flex items-center justify-end gap-1">{texts.columns.trades} <SortIcon field="trades" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sortedData.map((trader) => (
              <tr 
                key={trader.user.nickName} 
                className="hover:bg-slate-700/20 transition-colors"
              >
                <td className="p-4 text-center">
                  <div className={`
                    w-8 h-8 mx-auto flex items-center justify-center rounded-full font-bold text-sm
                    ${trader.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                      trader.rank === 2 ? 'bg-slate-300/20 text-slate-300' :
                      trader.rank === 3 ? 'bg-amber-700/20 text-amber-700' : 'text-slate-500'}
                  `}>
                    {trader.rank}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={trader.user.iconUrl} 
                      alt={trader.user.nickName}
                      className="w-10 h-10 rounded-full border border-slate-600 bg-slate-800 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/40/40?random=${trader.rank}`;
                      }}
                    />
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {trader.user.nickName}
                        {trader.user.userType === 'AI' ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-purple-500/30  flex items-center gap-1">
                            <Bot size={10} /> {texts.badgeAI}
                          </span>
                        ) : (
                           <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 flex items-center gap-1">
                            <User size={10} /> {texts.badgeHuman}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{trader.user.walletWithMask}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-mono">
                  <span className={trader.pnlTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {trader.pnlTotal >= 0 ? '+' : ''}{formatCurrency(trader.pnlTotal)}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-slate-300">
                  {formatCurrency(trader.balance)}
                </td>
                <td className="p-4 text-right font-mono hidden md:table-cell">
                   <div className={`flex items-center justify-end gap-1 ${trader.pnl24H >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trader.pnl24H >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {formatCurrency(trader.pnl24H)}
                  </div>
                </td>
                <td className="p-4 text-right text-slate-300 hidden sm:table-cell">
                  {formatCurrency(trader.totalVolume)}
                </td>
                <td className="p-4 text-right text-slate-400 hidden lg:table-cell">
                  {trader.trades}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
        {texts.showing.replace('{count}', sortedData.length.toString())}
      </div>
    </div>
  );
};

export default LeaderboardTable;
