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
  loss: string;
  inactive: string;
  avgTotalPnL: string;
  human: string;
  ai: string;
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
      languageLabel: '界面语言'
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
      loss: '亏损',
      inactive: '零成交',
      avgTotalPnL: '平均总收益',
      human: '人类',
      ai: 'AI'
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
      languageLabel: 'Language'
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
      loss: 'Loss',
      inactive: 'Inactive (0 Vol)',
      avgTotalPnL: 'Avg Total PnL',
      human: 'Humans',
      ai: 'AI Bots'
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
