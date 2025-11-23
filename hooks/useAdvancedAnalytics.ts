/**
 * Custom Hook for Advanced Analytics
 * Manages forecasting, prediction, and statistical analysis
 */

import { useMemo, useCallback } from 'react';
import {
  linearForecast,
  exponentialForecast,
  polynomialForecast,
  predictNextValues,
  montecarloSimulation,
  statisticalAnalysis,
  detectAnomalies,
  analyzeTrend,
  calculateCorrelation,
  type ForecastResult,
  type PredictionResult,
  type MontecarloResult,
  type StatisticalAnalysis
} from '../utils/advancedAnalytics';

export interface UseAdvancedAnalyticsOptions {
  enableForecasting?: boolean;
  enablePrediction?: boolean;
  enableMontecarlo?: boolean;
  enableAnomalyDetection?: boolean;
  enableStatistics?: boolean;
  enableTrendAnalysis?: boolean;
  forecastPeriods?: number;
  montecarloSimulations?: number;
  anomalyThreshold?: number;
  forecastMethod?: 'linear' | 'exponential' | 'polynomial';
}

export interface AnalyticsResult {
  forecast?: ForecastResult;
  prediction?: PredictionResult;
  montecarlo?: MontecarloResult;
  statistics?: StatisticalAnalysis;
  anomalies?: number[];
  trend?: { strength: number; direction: 'up' | 'down' | 'stable' };
  isLoading: boolean;
  error?: string;
}

/**
 * Custom hook for advanced analytics
 */
export const useAdvancedAnalytics = (
  data: number[],
  options: UseAdvancedAnalyticsOptions = {}
): AnalyticsResult => {
  const {
    enableForecasting = true,
    enablePrediction = true,
    enableMontecarlo = false,
    enableAnomalyDetection = true,
    enableStatistics = true,
    enableTrendAnalysis = true,
    forecastPeriods = 5,
    montecarloSimulations = 500,
    anomalyThreshold = 2.5,
    forecastMethod = 'linear'
  } = options;

  const result = useMemo<AnalyticsResult>(() => {
    try {
      if (!data || data.length === 0) {
        return { isLoading: false };
      }

      const validData = data.filter(v => typeof v === 'number' && !isNaN(v));

      if (validData.length === 0) {
        return { isLoading: false, error: 'No valid numeric data' };
      }

      const analytics: AnalyticsResult = { isLoading: false };

      // Forecasting
      if (enableForecasting && validData.length > 2) {
        try {
          if (forecastMethod === 'linear') {
            analytics.forecast = linearForecast(validData, forecastPeriods);
          } else if (forecastMethod === 'exponential') {
            analytics.forecast = exponentialForecast(validData, forecastPeriods);
          } else if (forecastMethod === 'polynomial') {
            analytics.forecast = polynomialForecast(validData, forecastPeriods);
          }
        } catch (err) {
          console.warn('Forecasting error:', err);
        }
      }

      // Prediction
      if (enablePrediction && validData.length > 2) {
        try {
          analytics.prediction = predictNextValues(validData, forecastPeriods);
        } catch (err) {
          console.warn('Prediction error:', err);
        }
      }

      // Monte Carlo Simulation
      if (enableMontecarlo && validData.length > 5) {
        try {
          analytics.montecarlo = montecarloSimulation(validData, forecastPeriods, montecarloSimulations);
        } catch (err) {
          console.warn('Monte Carlo error:', err);
        }
      }

      // Statistics
      if (enableStatistics && validData.length > 1) {
        try {
          analytics.statistics = statisticalAnalysis(validData);
        } catch (err) {
          console.warn('Statistics error:', err);
        }
      }

      // Anomaly Detection
      if (enableAnomalyDetection && validData.length > 3) {
        try {
          analytics.anomalies = detectAnomalies(validData, anomalyThreshold);
        } catch (err) {
          console.warn('Anomaly detection error:', err);
        }
      }

      // Trend Analysis
      if (enableTrendAnalysis && validData.length > 2) {
        try {
          analytics.trend = analyzeTrend(validData);
        } catch (err) {
          console.warn('Trend analysis error:', err);
        }
      }

      return analytics;
    } catch (err) {
      console.error('Analytics error:', err);
      return {
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }, [
    data,
    enableForecasting,
    enablePrediction,
    enableMontecarlo,
    enableAnomalyDetection,
    enableStatistics,
    enableTrendAnalysis,
    forecastPeriods,
    montecarloSimulations,
    anomalyThreshold,
    forecastMethod
  ]);

  return result;
};

/**
 * Hook for correlation analysis between multiple series
 */
export const useCorrelationAnalysis = (
  series1: number[],
  series2: number[]
): { correlation: number; strength: string } => {
  return useMemo(() => {
    const correlation = calculateCorrelation(series1, series2);
    let strength = 'No correlation';

    if (Math.abs(correlation) > 0.7) {
      strength = correlation > 0 ? 'Strong positive' : 'Strong negative';
    } else if (Math.abs(correlation) > 0.5) {
      strength = correlation > 0 ? 'Moderate positive' : 'Moderate negative';
    } else if (Math.abs(correlation) > 0.3) {
      strength = correlation > 0 ? 'Weak positive' : 'Weak negative';
    }

    return { correlation, strength };
  }, [series1, series2]);
};

/**
 * Hook for batch analytics on multiple series
 */
export const useBatchAnalytics = (
  seriesData: Record<string, number[]>,
  options: UseAdvancedAnalyticsOptions = {}
): Record<string, AnalyticsResult> => {
  return useMemo(() => {
    const results: Record<string, AnalyticsResult> = {};

    for (const [key, data] of Object.entries(seriesData)) {
      results[key] = useAdvancedAnalytics(data, options);
    }

    return results;
  }, [seriesData, options]);
};

/**
 * Hook for comparing multiple forecasts
 */
export const useComparativeForecasting = (
  data: number[],
  forecastPeriods: number = 5
): {
  linear: ForecastResult;
  exponential: ForecastResult;
  polynomial: ForecastResult;
  best: ForecastResult;
  bestMethod: 'linear' | 'exponential' | 'polynomial';
} => {
  return useMemo(() => {
    if (!data || data.length < 2) {
      return {
        linear: { original: data, forecast: [], confidence: 0, method: 'linear', rmse: 0 },
        exponential: { original: data, forecast: [], confidence: 0, method: 'exponential', rmse: 0 },
        polynomial: { original: data, forecast: [], confidence: 0, method: 'polynomial', rmse: 0 },
        best: { original: data, forecast: [], confidence: 0, method: 'linear', rmse: 0 },
        bestMethod: 'linear'
      };
    }

    const linear = linearForecast(data, forecastPeriods);
    const exponential = exponentialForecast(data, forecastPeriods);
    const polynomial = polynomialForecast(data, forecastPeriods);

    // Select best based on confidence and RMSE
    let best = linear;
    let bestMethod: 'linear' | 'exponential' | 'polynomial' = 'linear';

    if (exponential.confidence > best.confidence && exponential.rmse < best.rmse) {
      best = exponential;
      bestMethod = 'exponential';
    }

    if (polynomial.confidence > best.confidence && polynomial.rmse < best.rmse) {
      best = polynomial;
      bestMethod = 'polynomial';
    }

    return {
      linear,
      exponential,
      polynomial,
      best,
      bestMethod
    };
  }, [data, forecastPeriods]);
};
