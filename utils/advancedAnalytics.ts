/**
 * Advanced Analytics Module
 * Provides Forecasting, Prediction, Montecarlo Simulation, and Statistical Analysis
 */

import { DataPoint } from '../types';

// --- TYPES ---
export interface ForecastResult {
  original: number[];
  forecast: number[];
  confidence: number;
  method: 'linear' | 'exponential' | 'polynomial';
  rmse: number;
}

export interface PredictionResult {
  nextValues: number[];
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface MontecarloResult {
  simulations: number[][];
  mean: number[];
  percentile5: number[];
  percentile95: number[];
  probability: number;
}

export interface StatisticalAnalysis {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  skewness: number;
  kurtosis: number;
}

// --- UTILITY FUNCTIONS ---

/**
 * Calculate mean of array
 */
export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

/**
 * Calculate standard deviation
 */
export const calculateStdDev = (values: number[]): number => {
  const mean = calculateMean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * Calculate variance
 */
export const calculateVariance = (values: number[]): number => {
  const mean = calculateMean(values);
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
};

/**
 * Calculate median
 */
export const calculateMedian = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Calculate skewness
 */
export const calculateSkewness = (values: number[]): number => {
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);
  if (stdDev === 0) return 0;
  const n = values.length;
  const skew = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
  return skew;
};

/**
 * Calculate kurtosis
 */
export const calculateKurtosis = (values: number[]): number => {
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);
  if (stdDev === 0) return 0;
  const n = values.length;
  const kurt = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;
  return kurt;
};

// --- FORECASTING METHODS ---

/**
 * Linear Regression Forecasting
 * Simple trend-based forecasting
 */
export const linearForecast = (data: number[], periods: number = 5): ForecastResult => {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  // Calculate slope and intercept
  const xMean = calculateMean(x);
  const yMean = calculateMean(y);
  const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
  const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Generate forecast
  const forecast = Array.from({ length: periods }, (_, i) => {
    const xVal = n + i;
    return intercept + slope * xVal;
  });

  // Calculate RMSE
  const predictions = x.map(xi => intercept + slope * xi);
  const rmse = Math.sqrt(
    predictions.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0) / n
  );

  // Calculate R-squared for confidence
  const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const confidence = Math.max(0, Math.min(100, rSquared * 100));

  return {
    original: data,
    forecast,
    confidence,
    method: 'linear',
    rmse
  };
};

/**
 * Exponential Smoothing Forecasting
 * Better for data with trends and seasonality
 */
export const exponentialForecast = (data: number[], periods: number = 5, alpha: number = 0.3): ForecastResult => {
  const n = data.length;
  const smoothed: number[] = [data[0]];

  // Apply exponential smoothing
  for (let i = 1; i < n; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
  }

  // Generate forecast
  const lastSmoothed = smoothed[smoothed.length - 1];
  const forecast = Array.from({ length: periods }, () => lastSmoothed);

  // Calculate RMSE
  const rmse = Math.sqrt(
    data.reduce((sum, val, i) => sum + Math.pow(val - smoothed[i], 2), 0) / n
  );

  // Estimate confidence based on trend stability
  const recentTrend = smoothed.slice(-5);
  const trendVariance = calculateVariance(recentTrend);
  const confidence = Math.max(20, Math.min(95, 100 - trendVariance / calculateMean(data) * 50));

  return {
    original: data,
    forecast,
    confidence,
    method: 'exponential',
    rmse
  };
};

/**
 * Polynomial Regression Forecasting
 * For non-linear trends
 */
export const polynomialForecast = (data: number[], periods: number = 5, degree: number = 2): ForecastResult => {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  // Build polynomial features
  const features: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [1]; // intercept
    for (let d = 1; d <= degree; d++) {
      row.push(Math.pow(x[i], d));
    }
    features.push(row);
  }

  // Simple polynomial fit using least squares approximation
  // For simplicity, we'll use a quadratic fit
  if (degree === 2) {
    const x2 = x.map(xi => xi * xi);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumX2 = x2.reduce((a, b) => a + b, 0);
    const sumX3 = x.map(xi => Math.pow(xi, 3)).reduce((a, b) => a + b, 0);
    const sumX4 = x.map(xi => Math.pow(xi, 4)).reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2Y = x2.reduce((sum, xi2, i) => sum + xi2 * y[i], 0);

    const A = [
      [n, sumX, sumX2],
      [sumX, sumX2, sumX3],
      [sumX2, sumX3, sumX4]
    ];

    const B = [sumY, sumXY, sumX2Y];

    // Solve using Cramer's rule (simplified)
    const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
                A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
                A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

    if (Math.abs(det) < 1e-10) {
      return linearForecast(data, periods);
    }

    const c = (B[0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
               A[0][1] * (B[1] * A[2][2] - A[1][2] * B[2]) +
               A[0][2] * (B[1] * A[2][1] - A[1][1] * B[2])) / det;

    const b = (A[0][0] * (B[1] * A[2][2] - A[1][2] * B[2]) -
               B[0] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
               A[0][2] * (A[1][0] * B[2] - B[1] * A[2][0])) / det;

    const a = (A[0][0] * (A[1][1] * B[2] - B[1] * A[2][1]) -
               A[0][1] * (A[1][0] * B[2] - B[1] * A[2][0]) +
               B[0] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])) / det;

    // Generate forecast
    const forecast = Array.from({ length: periods }, (_, i) => {
      const xVal = n + i;
      return a + b * xVal + c * xVal * xVal;
    });

    // Calculate RMSE
    const predictions = x.map(xi => a + b * xi + c * xi * xi);
    const rmse = Math.sqrt(
      predictions.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0) / n
    );

    const yMean = calculateMean(y);
    const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    const confidence = Math.max(0, Math.min(100, rSquared * 100));

    return {
      original: data,
      forecast,
      confidence,
      method: 'polynomial',
      rmse
    };
  }

  return linearForecast(data, periods);
};

// --- PREDICTION METHODS ---

/**
 * Predict next values based on trend
 */
export const predictNextValues = (data: number[], periods: number = 5): PredictionResult => {
  const n = data.length;
  if (n < 2) {
    return {
      nextValues: Array(periods).fill(data[0] || 0),
      confidence: 0,
      trend: 'stable',
      changePercent: 0
    };
  }

  // Calculate trend
  const recentData = data.slice(-Math.min(10, n));
  const forecast = linearForecast(recentData, periods);
  const nextValues = forecast.forecast;

  // Determine trend
  const lastValue = data[n - 1];
  const avgPredicted = calculateMean(nextValues);
  const changePercent = ((avgPredicted - lastValue) / Math.abs(lastValue)) * 100;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 2) trend = 'up';
  else if (changePercent < -2) trend = 'down';

  return {
    nextValues,
    confidence: forecast.confidence,
    trend,
    changePercent
  };
};

// --- MONTECARLO SIMULATION ---

/**
 * Monte Carlo Simulation
 * Simulates multiple scenarios based on data distribution
 */
export const montecarloSimulation = (
  data: number[],
  periods: number = 5,
  simulations: number = 1000
): MontecarloResult => {
  const mean = calculateMean(data);
  const stdDev = calculateStdDev(data);

  // Generate random normal distribution using Box-Muller transform
  const randomNormal = (): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  };

  // Run simulations
  const simulationResults: number[][] = [];
  for (let sim = 0; sim < simulations; sim++) {
    const path: number[] = [data[data.length - 1]];
    for (let period = 0; period < periods; period++) {
      const nextValue = path[path.length - 1] * (1 + (randomNormal() - mean) / mean);
      path.push(Math.max(0, nextValue)); // Ensure non-negative
    }
    simulationResults.push(path.slice(1)); // Remove initial value
  }

  // Calculate statistics
  const meanPath: number[] = [];
  const percentile5: number[] = [];
  const percentile95: number[] = [];

  for (let period = 0; period < periods; period++) {
    const values = simulationResults.map(sim => sim[period]).sort((a, b) => a - b);
    meanPath.push(calculateMean(values));
    percentile5.push(values[Math.floor(values.length * 0.05)]);
    percentile95.push(values[Math.floor(values.length * 0.95)]);
  }

  // Calculate probability of increase
  const finalValues = simulationResults.map(sim => sim[periods - 1]);
  const lastValue = data[data.length - 1];
  const increaseCount = finalValues.filter(val => val > lastValue).length;
  const probability = increaseCount / simulations;

  return {
    simulations: simulationResults,
    mean: meanPath,
    percentile5,
    percentile95,
    probability
  };
};

// --- STATISTICAL ANALYSIS ---

/**
 * Comprehensive statistical analysis
 */
export const statisticalAnalysis = (data: number[]): StatisticalAnalysis => {
  const sorted = [...data].sort((a, b) => a - b);
  const mean = calculateMean(data);
  const median = calculateMedian(data);
  const stdDev = calculateStdDev(data);
  const variance = calculateVariance(data);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const skewness = calculateSkewness(data);
  const kurtosis = calculateKurtosis(data);

  return {
    mean,
    median,
    stdDev,
    variance,
    min,
    max,
    range,
    skewness,
    kurtosis
  };
};

// --- ANOMALY DETECTION ---

/**
 * Detect anomalies using Z-score method
 */
export const detectAnomalies = (data: number[], threshold: number = 3): number[] => {
  const mean = calculateMean(data);
  const stdDev = calculateStdDev(data);

  if (stdDev === 0) return [];

  return data
    .map((val, idx) => ({
      index: idx,
      zScore: Math.abs((val - mean) / stdDev)
    }))
    .filter(item => item.zScore > threshold)
    .map(item => item.index);
};

// --- CORRELATION ANALYSIS ---

/**
 * Calculate correlation between two series
 */
export const calculateCorrelation = (series1: number[], series2: number[]): number => {
  const n = Math.min(series1.length, series2.length);
  if (n < 2) return 0;

  const data1 = series1.slice(0, n);
  const data2 = series2.slice(0, n);

  const mean1 = calculateMean(data1);
  const mean2 = calculateMean(data2);

  const numerator = data1.reduce((sum, val, i) => sum + (val - mean1) * (data2[i] - mean2), 0);
  const denominator = Math.sqrt(
    data1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
    data2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
  );

  return denominator === 0 ? 0 : numerator / denominator;
};

// --- TREND ANALYSIS ---

/**
 * Analyze trend strength and direction
 */
export const analyzeTrend = (data: number[]): { strength: number; direction: 'up' | 'down' | 'stable' } => {
  if (data.length < 2) return { strength: 0, direction: 'stable' };

  const forecast = linearForecast(data, 1);
  const lastValue = data[data.length - 1];
  const nextValue = forecast.forecast[0];

  const changePercent = ((nextValue - lastValue) / Math.abs(lastValue)) * 100;
  const strength = Math.min(100, Math.abs(changePercent) * 10);

  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 0.5) direction = 'up';
  else if (changePercent < -0.5) direction = 'down';

  return { strength, direction };
};
