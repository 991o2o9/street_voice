export interface Report {
  id: string;
  text: string;
  location: string;
  district: string;
  coordinates: [number, number];
  timestamp: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  emotion?: string;
  severity?: number;
  analyzed?: boolean;
}

export interface AnalysisResult {
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  emotion: string;
  severity: number;
  keywords: string[];
}

export interface FilterState {
  category: string;
  sentiment: string;
  district: string;
  search: string;
}

export interface DistrictStats {
  district: string;
  totalReports: number;
  categories: Record<string, number>;
  sentiments: Record<string, number>;
  coordinates: [number, number];
}