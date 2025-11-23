
export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area',
  PIE = 'pie',
  RADAR = 'radar',      // For multivariate analysis
  RADIAL = 'radial',    // Ring charts
  SCATTER = 'scatter',  // For correlation/distribution
  COMPOSED = 'composed', // For Monte Carlo/Forecasting (Line + Area)
  TEXT = 'text'
}

export interface DataPoint {
  label: string;
  [key: string]: string | number;
}

export interface SeriesConfig {
  key: string;
  name: string;
  color: string;
  type?: 'bar' | 'line' | 'area' | 'scatter'; // Specific override for Composed charts
}

export interface ChartConfig {
  id?: string;
  type: ChartType;
  title: string;
  summary: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  series: SeriesConfig[];
  data: DataPoint[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | ChartConfig;
  timestamp: number;
  isLoading?: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: Date;
}

// --- NEW ADVANCED ANALYTICS TYPES ---

export type ColorPaletteType = 
  | 'executive' 
  | 'tech' 
  | 'financial' 
  | 'healthcare' 
  | 'nature' 
  | 'pastel' 
  | 'vibrant' 
  | 'monoBlue' 
  | 'monoGreen' 
  | 'sunset' 
  | 'ocean' 
  | 'auto';

export interface AdvancedChartConfig extends ChartConfig {
  enableForecasting?: boolean;
  enablePrediction?: boolean;
  enableMontecarlo?: boolean;
  enableAnomalyDetection?: boolean;
  forecastPeriods?: number;
  colorPalette?: ColorPaletteType;
  showAnalyticsPanel?: boolean;
}

export interface AnalyticsOptions {
  enableForecasting: boolean;
  enablePrediction: boolean;
  enableMontecarlo: boolean;
  enableAnomalyDetection: boolean;
  enableStatistics: boolean;
  enableTrendAnalysis: boolean;
  forecastPeriods: number;
  montecarloSimulations: number;
  anomalyThreshold: number;
}

export interface ChartTheme {
  isDarkMode: boolean;
  colorPalette: ColorPaletteType;
  accentColor: string;
  borderRadius: number;
  animationDuration: number;
}
