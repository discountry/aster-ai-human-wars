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
  prizePool: string;
  initialFunds: string;
  teamHumanRoi: string;
  teamAiRoi: string;
  humanTeamPool: string;
  championPrize: string;
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
  provisionalNote: string;
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
  provisionalNote: string;
  tieBreakNote: string;
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

export interface InsightsTexts {
  title: string;
  subtitle: string;
  banner: {
    prizePoolLabel: string;
    initialFundsLabel: string;
    rewardTokenLabel: string;
    provisionalNote: string;
  };
  prizes: {
    title: string;
    championPrizeTitle: string;
    championPrizeLabel: string;
    currentLeaderLabel: string;
    championPrizeRules: string;
    championUnclaimed: string;
    teamPrizeTitle: string;
    teamPrizeRules: string;
    basePoolLabel: string;
    boostedPoolLabel: string;
    teamRoiLabel: string;
    humanTeamLabel: string;
    aiTeamLabel: string;
    teamPoolLabel: string;
    teamPoolHumanWins: string;
    teamPoolAiWins: string;
    tieBreakNote: string;
    distributionTitle: string;
    distributionSubtitle: string;
    distributionEmpty: string;
    distributionNotes: {
      positiveOnly: string;
      championExcluded: string;
      proportional: string;
    };
    columns: {
      trader: string;
      pnl: string;
      share: string;
      reward: string;
    };
  };
  groupLabels: {
    human: string;
    ai: string;
  };
  groupTable: {
    title: string;
    columns: {
      group: string;
      participants: string;
      active: string;
      winRateActive: string;
      liquidatedRate: string;
      medianPnl: string;
      medianRoi: string;
      medianBps: string;
      medianPnlPerTrade: string;
      medianAvgTradeSize: string;
    };
    notes: {
      activeOnly: string;
      bpsHint: string;
    };
  };
  statusChart: {
    title: string;
    subtitle: string;
    labels: {
      profitable: string;
      loss: string;
      inactive: string;
      liquidated: string;
    };
  };
  roiChart: {
    title: string;
    subtitle: string;
    axisX: string;
    axisY: string;
    human: string;
    ai: string;
  };
  leaders: {
    tradesLabel: string;
    volumeLabel: string;
    empty: string;
    efficiencyTitle: string;
    efficiencySubtitle: string;
    pnlPerTradeTitle: string;
    pnlPerTradeSubtitle: string;
    avgTradeSizeTitle: string;
    avgTradeSizeSubtitle: string;
  };
}

export interface TranslationContent {
  header: HeaderTexts;
  stats: StatsTexts;
  charts: ChartTexts;
  correlation: CorrelationTexts;
  insights: InsightsTexts;
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
      description:
        'Human vs AI 期货实盘对决：$200,000 奖池 · 100 位资金账号 · 每人 10,000 USDT · 人类零亏损（亏损由平台承担）。',
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
      participantsSuffix: '名参赛者',
      prizePool: '奖池总览',
      initialFunds: '初始资金',
      teamHumanRoi: '人类团队 ROI',
      teamAiRoi: 'AI 团队 ROI',
      humanTeamPool: '人类团队奖池',
      championPrize: '冠军奖励'
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
      liquidated: '爆仓（余额≈0）',
      loss: '亏损',
      inactive: '零成交',
      avgTotalPnL: '平均总收益',
      human: '人类',
      ai: 'AI'
    },
    correlation: {
      title: '相关性分析',
      subtitle: '基于榜单横截面数据：成交量、成交笔数与盈亏指标的关系。',
      provisionalNote: '提示：榜单为周期性更新的“临时排名”，最终结果以赛后审计为准。',
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
    insights: {
      title: '深度洞察',
      subtitle: '按官方规则补充：团队 ROI、奖池是否翻倍，以及人类团队奖励分配模拟。',
      banner: {
        prizePoolLabel: '总奖池',
        initialFundsLabel: '每人初始资金',
        rewardTokenLabel: '奖励发放',
        provisionalNote: '榜单仅供参考，赛后将审计并公布最终排名。',
      },
      prizes: {
        title: '奖池与奖励规则（可计算）',
        championPrizeTitle: '个人冠军奖（$100,000）',
      championPrizeLabel: '冠军奖励',
      currentLeaderLabel: '当前第 1 名',
        championPrizeRules: '仅当总 PnL 第 1 名为人类时发放；若 AI 拿下 #1，则该奖项不发放。',
        championUnclaimed: '当前 #1 为 AI：个人冠军奖将“不发放”（若以当前快照结算）。',
        teamPrizeTitle: '人类团队奖池（$50,000 / $100,000）',
        teamPrizeRules: '若 Team Human 的团队 ROI > Team AI，则人类团队奖池翻倍至 $100,000；否则为 $50,000。',
        basePoolLabel: '基础奖池',
        boostedPoolLabel: '翻倍奖池',
        teamRoiLabel: '团队 ROI',
        humanTeamLabel: '人类',
        aiTeamLabel: 'AI',
        teamPoolLabel: '当前人类团队奖池',
        teamPoolHumanWins: '人类领先（奖池翻倍）',
        teamPoolAiWins: 'AI 领先（不翻倍）',
      tieBreakNote: '同 PnL 时按有效成交量更高者排名更高。',
        distributionTitle: '人类团队奖励分配（模拟）',
        distributionSubtitle:
          '按规则：仅“PnL > 0”的人类可分奖池；按正收益占比瓜分；人类冠军（人类中 PnL 最高者）不参与团队奖池分配。',
        distributionEmpty: '当前无可分配样本（可能：没有正收益人类，或仅有人类冠军为正收益）。',
        distributionNotes: {
          positiveOnly: '仅 PnL > 0 的人类可参与分配。',
          championExcluded: '人类冠军不参与团队奖池分配（但仍保留其交易收益）。',
          proportional: '奖励 = (个人正收益 / 所有人类正收益总和) × 人类团队奖池。',
        },
        columns: {
          trader: '交易员',
          pnl: '正收益',
          share: '占比',
          reward: '预计奖励（USDF）',
        },
      },
      groupLabels: {
        human: '人类',
        ai: 'AI',
      },
      groupTable: {
        title: '分组稳健统计（中位数 + 比例）',
        columns: {
          group: '组别',
          participants: '参赛者',
          active: '活跃',
          winRateActive: '活跃胜率',
          liquidatedRate: '爆仓率',
          medianPnl: '中位数收益',
          medianRoi: '中位数 ROI',
          medianBps: '中位数效率（bps）',
          medianPnlPerTrade: '中位数/笔',
          medianAvgTradeSize: '中位数单笔规模',
        },
        notes: {
          activeOnly: '“活跃”口径：成交量>0 且笔数>0；效率/单笔统计仅在活跃样本上计算。',
          bpsHint: 'bps = (PnL / Volume) × 10000（成交量收益率的“每万分之一”）。',
        },
      },
      statusChart: {
        title: '生存状态分布',
        subtitle: '将参赛者按 盈利/亏损/零成交/爆仓 分类（人数）。',
        labels: {
          profitable: '盈利',
          loss: '亏损',
          inactive: '零成交',
          liquidated: '爆仓（余额≈0）',
        },
      },
      roiChart: {
        title: 'ROI 分布直方图（按组别）',
        subtitle: 'ROI = 总收益 / 初始本金。使用推断初始本金计算，区间为 25% 一档（人数）。',
        axisX: 'ROI 区间',
        axisY: '人数',
        human: '人类',
        ai: 'AI',
      },
      leaders: {
        tradesLabel: '笔数',
        volumeLabel: '成交量',
        empty: '暂无可用样本',
        efficiencyTitle: '效率榜（PnL/成交量，bps）',
        efficiencySubtitle: '仅活跃样本；越高表示单位成交量赚得越多。',
        pnlPerTradeTitle: '单笔收益榜（PnL/笔）',
        pnlPerTradeSubtitle: '仅活跃样本；越高表示每一笔的平均收益更高。',
        avgTradeSizeTitle: '单笔规模榜（成交量/笔）',
        avgTradeSizeSubtitle: '仅活跃样本；越高表示更偏“大单/低频”。',
      },
    },
    leaderboard: {
      title: '排行榜',
      provisionalNote: '榜单为临时排名；赛后将审计并公布最终结果。',
      tieBreakNote: '同 PnL 时按有效成交量更高者排名更高。',
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
      description:
        'Live Perps battle: $200,000 prize pool · 100 funded accounts · 10,000 USDT each · zero downside for Humans (losses covered by Aster).',
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
      participantsSuffix: 'Participants',
      prizePool: 'Prize pool',
      initialFunds: 'Initial funds',
      teamHumanRoi: 'Human team ROI',
      teamAiRoi: 'AI team ROI',
      humanTeamPool: 'Human team pool',
      championPrize: 'Champion prize'
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
      liquidated: 'Wiped (≈$0 balance)',
      loss: 'Loss',
      inactive: 'Inactive (0 Vol)',
      avgTotalPnL: 'Avg Total PnL',
      human: 'Humans',
      ai: 'AI Bots'
    },
    correlation: {
      title: 'Correlation Analysis',
      subtitle: 'Cross-sectional view: how volume and trade count relate to P&L metrics.',
      provisionalNote: 'Note: leaderboard is provisional and will be finalized after post-event audit.',
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
    insights: {
      title: 'Advanced Insights',
      subtitle: 'Aligned with the official rules: team ROI, prize pool doubling, and Human reward distribution simulation.',
      banner: {
        prizePoolLabel: 'Total prize pool',
        initialFundsLabel: 'Initial funds (each)',
        rewardTokenLabel: 'Payout token',
        provisionalNote: 'This leaderboard is provisional; final results will be audited and announced separately.',
      },
      prizes: {
        title: 'Prize mechanics (computable)',
        championPrizeTitle: 'Individual Champion Prize ($100,000)',
      championPrizeLabel: 'Champion prize',
      currentLeaderLabel: 'Current #1',
        championPrizeRules:
          'Awarded only if the #1 total PnL trader is Human. If an AI takes #1, this prize is not awarded.',
        championUnclaimed: 'Current #1 is AI: the $100,000 individual prize would be unclaimed (if settled on this snapshot).',
        teamPrizeTitle: 'Human Team Prize Pool ($50,000 / $100,000)',
        teamPrizeRules:
          'If Team Human ROI > Team AI ROI, the Human team pool doubles to $100,000; otherwise it stays at $50,000.',
        basePoolLabel: 'Base pool',
        boostedPoolLabel: 'Boosted pool',
        teamRoiLabel: 'Team ROI',
        humanTeamLabel: 'Humans',
        aiTeamLabel: 'AI',
        teamPoolLabel: 'Current Human team pool',
        teamPoolHumanWins: 'Humans lead (pool doubled)',
        teamPoolAiWins: 'AI leads (no doubling)',
      tieBreakNote: 'Tie-break: if PnL ties, higher valid trading volume ranks higher.',
        distributionTitle: 'Human team reward distribution (simulation)',
        distributionSubtitle:
          'Per rules: only Humans with PnL>0 share the pool; proportional to positive PnL; Human champion (top Human PnL) is excluded.',
        distributionEmpty: 'No distributable set right now (e.g., no positive-PnL Humans, or only the Human champion is positive).',
        distributionNotes: {
          positiveOnly: 'Only Humans with PnL > 0 are eligible.',
          championExcluded: 'Human champion is excluded from the team pool distribution (but keeps trading profits).',
          proportional: 'Reward = (individual positive PnL / total positive Human PnL) × Human team pool.',
        },
        columns: {
          trader: 'Trader',
          pnl: 'Positive PnL',
          share: 'Share',
          reward: 'Est. reward (USDF)',
        },
      },
      groupLabels: {
        human: 'Humans',
        ai: 'AI',
      },
      groupTable: {
        title: 'Robust group stats (median + rates)',
        columns: {
          group: 'Group',
          participants: 'Participants',
          active: 'Active',
          winRateActive: 'Active win rate',
          liquidatedRate: 'Liquidation rate',
          medianPnl: 'Median PnL',
          medianRoi: 'Median ROI',
          medianBps: 'Median edge (bps)',
          medianPnlPerTrade: 'Median PnL/trade',
          medianAvgTradeSize: 'Median trade size',
        },
        notes: {
          activeOnly: '"Active" means volume>0 and trades>0. Efficiency and per-trade metrics are computed on active samples only.',
          bpsHint: 'bps = (PnL / Volume) × 10000 (basis points per traded volume).',
        },
      },
      statusChart: {
        title: 'Survival status breakdown',
        subtitle: 'Classifies traders into profitable / loss / inactive / liquidated (counts).',
        labels: {
          profitable: 'Profitable',
          loss: 'Loss',
          inactive: 'Inactive',
          liquidated: 'Wiped (≈$0)',
        },
      },
      roiChart: {
        title: 'ROI histogram (by group)',
        subtitle: 'ROI = total PnL / starting capital. Uses inferred starting capital; 25% bins (counts).',
        axisX: 'ROI bin',
        axisY: 'Count',
        human: 'Humans',
        ai: 'AI',
      },
      leaders: {
        tradesLabel: 'Trades',
        volumeLabel: 'Volume',
        empty: 'No available samples',
        efficiencyTitle: 'Efficiency leaders (PnL/Volume, bps)',
        efficiencySubtitle: 'Active only; higher means better edge per traded volume.',
        pnlPerTradeTitle: 'PnL per trade leaders',
        pnlPerTradeSubtitle: 'Active only; higher means better average PnL per trade.',
        avgTradeSizeTitle: 'Trade size leaders (Volume/Trade)',
        avgTradeSizeSubtitle: 'Active only; higher tends to mean larger tickets / lower frequency.',
      },
    },
    leaderboard: {
      title: 'Leaderboard',
      provisionalNote: 'Provisional leaderboard; final rankings are determined after audit.',
      tieBreakNote: 'If PnL ties, higher valid trading volume ranks higher.',
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
