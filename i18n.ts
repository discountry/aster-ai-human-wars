export type Language = 'zh' | 'en';

export interface HeaderTexts {
  titleMain: string;
  titleSuffix: string;
  description: string;
  cta: string;
  dataStatus: string;
  live: string;
  cached: string;
  updating: string;
  fallback: string;
  languageLabel: string;
}

export interface StatsTexts {
  totalVolume: string;
  activeTradersSuffix: string;
  topPerformer: string;
  profitLabel: string;
  avgHuman: string;
  avgAI: string;
  participantsSuffix: string;
}

export interface ChartTexts {
  profitabilityTitle: string;
  averageTitle: string;
  scatterTitle: string;
  scatterSubtitle: string;
  axisTrades: string;
  axisPnL: string;
  axisVolume: string;
  profitable: string;
  liquidated: string;
  loss: string;
  inactive: string;
  avgTotalPnL: string;
  human: string;
  ai: string;
}

export interface CorrelationTexts {
  title: string;
  subtitle: string;
  summary: string; // placeholders: {n}, {active}, {total}
  filters: {
    all: string;
    human: string;
    ai: string;
  };
  activeOnly: string;
  metricLabel: string;
  metrics: {
    pnlTotal: string;
    pnl24H: string;
    pnlPerVolBps: string;
    pnlPerTrade: string;
  };
  tableTitle: string;
  tableHeaders: {
    pair: string;
    pearson: string;
    spearman: string;
    n: string;
  };
  pairs: {
    volTrades: string;
    volMetric: string; // placeholder: {metric}
    tradesMetric: string; // placeholder: {metric}
  };
  chartTitle: string;
  chartSubtitle: string; // placeholder: {metric}
  axisVolume: string;
  axisTrades: string;
  humanLabel: string;
  aiLabel: string;
  tooltip: {
    volume: string;
    trades: string;
  };
}

export interface LeaderboardTexts {
  title: string;
  filters: {
    all: string;
    human: string;
    ai: string;
  };
  columns: {
    rank: string;
    trader: string;
    totalPnL: string;
    balance: string;
    pnl24H: string;
    volume: string;
    trades: string;
  };
  badgeHuman: string;
  badgeAI: string;
  showing: string;
}

export interface TranslationContent {
  header: HeaderTexts;
  stats: StatsTexts;
  charts: ChartTexts;
  correlation: CorrelationTexts;
  leaderboard: LeaderboardTexts;
  footer: string;
  general: {
    notAvailable: string;
  };
}

export const translations: Record<Language, TranslationContent> = {
  zh: {
    header: {
      titleMain: '人机对决',
      titleSuffix: '巅峰战场',
      description: '实时追踪算法交易机器人与人类交易员的收益表现，今天谁统治市场？',
      cta: '立即参战',
      dataStatus: '数据状态',
      live: '实时数据',
      cached: '本地缓存',
      updating: '更新中…',
      fallback: '当前使用本地备份数据（API 暂不可用）',
      languageLabel: 'Language'
    },
    stats: {
      totalVolume: '成交总量',
      activeTradersSuffix: '名活跃交易者',
      topPerformer: '最佳选手',
      profitLabel: '收益',
      avgHuman: '人类平均收益',
      avgAI: 'AI 平均收益',
      participantsSuffix: '名参赛者'
    },
    charts: {
      profitabilityTitle: '盈亏分布',
      averageTitle: '平均收益（人类 vs AI）',
      scatterTitle: '交易频率与盈亏',
      scatterSubtitle: '横轴为成交笔数，纵轴为总收益（美元），圆点大小代表成交量。',
      axisTrades: '成交笔数',
      axisPnL: '总收益（美元）',
      axisVolume: '成交量',
      profitable: '盈利',
      liquidated: '爆仓',
      loss: '亏损',
      inactive: '零成交',
      avgTotalPnL: '平均总收益',
      human: '人类',
      ai: 'AI'
    },
    correlation: {
      title: '相关性分析',
      subtitle: '基于榜单横截面数据：成交量、成交笔数与盈亏指标的关系。',
      summary: '样本：{n}（活跃 {active} / 总计 {total}）',
      filters: {
        all: '全部',
        human: '仅人类',
        ai: '仅 AI',
      },
      activeOnly: '仅活跃（成交量>0 且笔数>0）',
      metricLabel: '指标',
      metrics: {
        pnlTotal: '累计收益',
        pnl24H: '24 小时收益',
        pnlPerVolBps: '收益/成交量（bps）',
        pnlPerTrade: '收益/笔',
      },
      tableTitle: '相关系数',
      tableHeaders: {
        pair: '维度',
        pearson: 'Pearson',
        spearman: 'Spearman',
        n: 'N',
      },
      pairs: {
        volTrades: '成交量 ↔ 成交笔数',
        volMetric: '成交量 ↔ {metric}',
        tradesMetric: '成交笔数 ↔ {metric}',
      },
      chartTitle: '成交量 vs 成交笔数（点色=指标）',
      chartSubtitle: '点色表示 {metric}，点大小表示成交量。',
      axisVolume: '成交量（log）',
      axisTrades: '成交笔数（log）',
      humanLabel: '人类',
      aiLabel: 'AI',
      tooltip: {
        volume: '成交量',
        trades: '成交笔数',
      },
    },
    leaderboard: {
      title: '排行榜',
      filters: {
        all: '全部',
        human: '仅人类',
        ai: '仅 AI'
      },
      columns: {
        rank: '排名',
        trader: '交易员',
        totalPnL: '累计收益',
        balance: '账户余额',
        pnl24H: '24 小时收益',
        volume: '成交量',
        trades: '成交笔数'
      },
      badgeHuman: '人类',
      badgeAI: 'AI',
      showing: '根据当前筛选显示前 {count} 名交易员'
    },
    footer: '© 2024 人机交易战争看板 · 数据源自 AsterIndex。',
    general: {
      notAvailable: '暂无数据'
    }
  },
  en: {
    header: {
      titleMain: 'AI vs Human',
      titleSuffix: 'Wars',
      description: 'Live performance tracking of algorithmic trading bots versus human traders. Who dominates the market today?',
      cta: 'Join the Battle',
      dataStatus: 'Data Status',
      live: 'Live Feed',
      cached: 'Cached Data',
      updating: 'Updating...',
      fallback: 'Using local fallback data (API unavailable)',
      languageLabel: '界面语言'
    },
    stats: {
      totalVolume: 'Total Volume',
      activeTradersSuffix: 'Active Traders',
      topPerformer: 'Top Performer',
      profitLabel: 'Profit',
      avgHuman: 'Avg Human PnL',
      avgAI: 'Avg AI PnL',
      participantsSuffix: 'Participants'
    },
    charts: {
      profitabilityTitle: 'Profitability Distribution',
      averageTitle: 'Avg. PnL (Human vs AI)',
      scatterTitle: 'Trade Frequency vs Profitability',
      scatterSubtitle: 'X-axis shows number of trades, Y-axis is total PnL (USD) and bubble size represents total volume.',
      axisTrades: 'Trades',
      axisPnL: 'PnL ($)',
      axisVolume: 'Volume',
      profitable: 'Profitable',
      liquidated: 'Liquidated',
      loss: 'Loss',
      inactive: 'Inactive (0 Vol)',
      avgTotalPnL: 'Avg Total PnL',
      human: 'Humans',
      ai: 'AI Bots'
    },
    correlation: {
      title: 'Correlation Analysis',
      subtitle: 'Cross-sectional view: how volume and trade count relate to P&L metrics.',
      summary: 'Samples: {n} (active {active} / total {total})',
      filters: {
        all: 'All',
        human: 'Humans',
        ai: 'AI',
      },
      activeOnly: 'Active only (volume>0 & trades>0)',
      metricLabel: 'Metric',
      metrics: {
        pnlTotal: 'Total PnL',
        pnl24H: '24h PnL',
        pnlPerVolBps: 'PnL / Volume (bps)',
        pnlPerTrade: 'PnL / Trade',
      },
      tableTitle: 'Correlations',
      tableHeaders: {
        pair: 'Pair',
        pearson: 'Pearson',
        spearman: 'Spearman',
        n: 'N',
      },
      pairs: {
        volTrades: 'Volume ↔ Trades',
        volMetric: 'Volume ↔ {metric}',
        tradesMetric: 'Trades ↔ {metric}',
      },
      chartTitle: 'Volume vs Trades (color = metric)',
      chartSubtitle: 'Point color encodes {metric}; bubble size encodes volume.',
      axisVolume: 'Volume (log)',
      axisTrades: 'Trades (log)',
      humanLabel: 'Humans',
      aiLabel: 'AI',
      tooltip: {
        volume: 'Volume',
        trades: 'Trades',
      },
    },
    leaderboard: {
      title: 'Leaderboard',
      filters: {
        all: 'All Traders',
        human: 'Humans',
        ai: 'AI Bots'
      },
      columns: {
        rank: 'Rank',
        trader: 'Trader',
        totalPnL: 'Total PnL',
        balance: 'Balance',
        pnl24H: '24h PnL',
        volume: 'Volume',
        trades: 'Trades'
      },
      badgeHuman: 'HUMAN',
      badgeAI: 'AI',
      showing: 'Showing top {count} traders based on current filters'
    },
    footer: '© 2024 AI Trading Wars Dashboard. Data provided by AsterIndex.',
    general: {
      notAvailable: 'N/A'
    }
  }
};
