export interface TraderUser {
  userType: 'HUMAN' | 'AI';
  nickName: string;
  walletWithMask: string;
  twitterUrl: string;
  polyMarketUrl: string;
  iconUrl: string;
}

export interface TraderData {
  rank: number;
  user: TraderUser;
  totalVolume: number;
  positions: number;
  trades: number;
  pnl24H: number;
  pnlTotal: number;
  balance: number;
}

export interface ApiResponse {
  code: string;
  message: string | null;
  messageDetail: string | null;
  data: {
    data: TraderData[];
    total: number;
    pageSize: number;
    current: number;
    pages: number;
  };
  success: boolean;
}

export interface StatMetric {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}