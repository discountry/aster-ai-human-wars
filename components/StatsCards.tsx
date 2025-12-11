import React from 'react';
import { Users, Bot, TrendingUp, DollarSign } from 'lucide-react';
import { StatMetric } from '../types';

interface StatsCardsProps {
  metrics: StatMetric[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ metrics }) => {
  const getIcon = (icon?: StatMetric['icon']) => {
    switch (icon) {
      case 'human':
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'ai':
        return <Bot className="w-5 h-5 text-purple-400" />;
      case 'volume':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 shadow-lg hover:border-slate-600 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-sm font-medium">{metric.label}</span>
            <div className={`p-2 rounded-lg bg-slate-700/50`}>
              {getIcon(metric.icon)}
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
            {metric.subValue && (
               <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                   metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                   metric.trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
                   'bg-slate-700 text-slate-300'
               }`}>
                 {metric.subValue}
               </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
