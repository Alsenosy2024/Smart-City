/**
 * Advanced Analytics Panel Component
 * Displays Forecasting, Prediction, Monte Carlo, and Statistical Analysis
 */

import React, { memo } from 'react';
import {
  TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle2,
  BarChart3, Zap, Target, Eye, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ForecastResult,
  PredictionResult,
  MontecarloResult,
  StatisticalAnalysis
} from '../utils/advancedAnalytics';

interface AnalyticsPanelProps {
  forecast?: ForecastResult;
  prediction?: PredictionResult;
  montecarlo?: MontecarloResult;
  statistics?: StatisticalAnalysis;
  anomalies?: number[];
  isDarkMode: boolean;
  lang?: string;
  compact?: boolean;
}

const translations = {
  en: {
    analytics: 'Advanced Analytics',
    forecasting: 'Forecasting',
    prediction: 'Prediction',
    montecarlo: 'Monte Carlo',
    statistics: 'Statistics',
    trend: 'Trend',
    confidence: 'Confidence',
    rmse: 'RMSE',
    mean: 'Mean',
    median: 'Median',
    stdDev: 'Std Deviation',
    variance: 'Variance',
    min: 'Minimum',
    max: 'Maximum',
    range: 'Range',
    skewness: 'Skewness',
    kurtosis: 'Kurtosis',
    anomalies: 'Anomalies Detected',
    probability: 'Probability of Increase',
    nextValues: 'Next Values',
    changePercent: 'Change %',
    up: 'Uptrend',
    down: 'Downtrend',
    stable: 'Stable'
  },
  ar: {
    analytics: 'التحليلات المتقدمة',
    forecasting: 'التنبؤ',
    prediction: 'التوقع',
    montecarlo: 'محاكاة مونت كارلو',
    statistics: 'الإحصائيات',
    trend: 'الاتجاه',
    confidence: 'مستوى الثقة',
    rmse: 'الخطأ المربع',
    mean: 'المتوسط',
    median: 'الوسيط',
    stdDev: 'الانحراف المعياري',
    variance: 'التباين',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    range: 'النطاق',
    skewness: 'الانحراف',
    kurtosis: 'التفرطح',
    anomalies: 'الشذوذ المكتشف',
    probability: 'احتمالية الارتفاع',
    nextValues: 'القيم التالية',
    changePercent: 'نسبة التغير',
    up: 'اتجاه صاعد',
    down: 'اتجاه هابط',
    stable: 'مستقر'
  }
};

const StatCard = memo(({
  icon: Icon,
  label,
  value,
  unit = '',
  isDarkMode,
  color = 'blue'
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  isDarkMode: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) => {
  const colorClasses = {
    blue: isDarkMode ? 'bg-blue-900/30 border-blue-700/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600',
    green: isDarkMode ? 'bg-green-900/30 border-green-700/50 text-green-400' : 'bg-green-50 border-green-200 text-green-600',
    red: isDarkMode ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600',
    yellow: isDarkMode ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-600',
    purple: isDarkMode ? 'bg-purple-900/30 border-purple-700/50 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-medium opacity-70">{label}</p>
          <p className="text-lg font-bold mt-1">
            {typeof value === 'number' ? value.toFixed(2) : value}
            {unit && <span className="text-xs ml-1 opacity-60">{unit}</span>}
          </p>
        </div>
        <div className="text-xl opacity-50">{Icon}</div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = memo(({
  forecast,
  prediction,
  montecarlo,
  statistics,
  anomalies,
  isDarkMode,
  lang = 'en',
  compact = false
}) => {
  const t = translations[lang as keyof typeof translations] || translations.en;

  if (!forecast && !prediction && !montecarlo && !statistics) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'} backdrop-blur-sm rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'} p-6`}
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={20} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
        <h3 className="text-lg font-bold">{t.analytics}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Forecasting Section */}
        {forecast && (
          <>
            <StatCard
              icon={<TrendingUp size={18} />}
              label={t.forecasting}
              value={forecast.confidence}
              unit="%"
              isDarkMode={isDarkMode}
              color="blue"
            />
            <StatCard
              icon={<Gauge size={18} />}
              label={t.rmse}
              value={forecast.rmse}
              isDarkMode={isDarkMode}
              color="purple"
            />
            <StatCard
              icon={<Target size={18} />}
              label={`${t.forecasting} (${forecast.method})`}
              value={forecast.forecast[0]}
              isDarkMode={isDarkMode}
              color="blue"
            />
          </>
        )}

        {/* Prediction Section */}
        {prediction && (
          <>
            <StatCard
              icon={
                prediction.trend === 'up' ? <TrendingUp size={18} className="text-green-500" /> :
                  prediction.trend === 'down' ? <TrendingDown size={18} className="text-red-500" /> :
                    <Activity size={18} className="text-yellow-500" />
              }
              label={t.prediction}
              value={prediction.confidence}
              unit="%"
              isDarkMode={isDarkMode}
              color={prediction.trend === 'up' ? 'green' : prediction.trend === 'down' ? 'red' : 'yellow'}
            />
            <StatCard
              icon={<Zap size={18} />}
              label={t.changePercent}
              value={prediction.changePercent}
              unit="%"
              isDarkMode={isDarkMode}
              color={prediction.changePercent > 0 ? 'green' : 'red'}
            />
            <StatCard
              icon={<Eye size={18} />}
              label={t.nextValues}
              value={prediction.nextValues[0]}
              isDarkMode={isDarkMode}
              color="purple"
            />
          </>
        )}

        {/* Statistics Section */}
        {statistics && (
          <>
            <StatCard
              icon={<BarChart3 size={18} />}
              label={t.mean}
              value={statistics.mean}
              isDarkMode={isDarkMode}
              color="blue"
            />
            <StatCard
              icon={<Activity size={18} />}
              label={t.stdDev}
              value={statistics.stdDev}
              isDarkMode={isDarkMode}
              color="purple"
            />
            <StatCard
              icon={<Target size={18} />}
              label={t.median}
              value={statistics.median}
              isDarkMode={isDarkMode}
              color="green"
            />
            <StatCard
              icon={<Gauge size={18} />}
              label={t.min}
              value={statistics.min}
              isDarkMode={isDarkMode}
              color="red"
            />
            <StatCard
              icon={<Zap size={18} />}
              label={t.max}
              value={statistics.max}
              isDarkMode={isDarkMode}
              color="green"
            />
            <StatCard
              icon={<Eye size={18} />}
              label={t.range}
              value={statistics.range}
              isDarkMode={isDarkMode}
              color="yellow"
            />
          </>
        )}

        {/* Monte Carlo Section */}
        {montecarlo && (
          <>
            <StatCard
              icon={<TrendingUp size={18} />}
              label={t.montecarlo}
              value={montecarlo.probability}
              unit="%"
              isDarkMode={isDarkMode}
              color={montecarlo.probability > 0.5 ? 'green' : 'red'}
            />
            <StatCard
              icon={<Target size={18} />}
              label={`${t.montecarlo} Mean`}
              value={montecarlo.mean[0]}
              isDarkMode={isDarkMode}
              color="blue"
            />
            <StatCard
              icon={<Activity size={18} />}
              label={`${t.montecarlo} Range`}
              value={montecarlo.percentile95[0] - montecarlo.percentile5[0]}
              isDarkMode={isDarkMode}
              color="purple"
            />
          </>
        )}

        {/* Anomalies Section */}
        {anomalies && anomalies.length > 0 && (
          <StatCard
            icon={<AlertCircle size={18} />}
            label={t.anomalies}
            value={anomalies.length}
            isDarkMode={isDarkMode}
            color="red"
          />
        )}
      </div>

      {/* Detailed Forecast Values */}
      {forecast && forecast.forecast.length > 0 && !compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-slate-700/30' : 'border-slate-200/30'}`}
        >
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            {t.forecasting} - {t.nextValues}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {forecast.forecast.map((value, idx) => (
              <div key={idx} className={`p-2 rounded text-center text-xs ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <div className="opacity-60">+{idx + 1}</div>
                <div className="font-mono font-bold">{value.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Prediction Details */}
      {prediction && !compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-slate-700/30' : 'border-slate-200/30'}`}
        >
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            {prediction.trend === 'up' ? <TrendingUp size={16} className="text-green-500" /> :
              prediction.trend === 'down' ? <TrendingDown size={16} className="text-red-500" /> :
                <Activity size={16} className="text-yellow-500" />}
            {t.prediction} - {t.trend}: {t[prediction.trend as keyof typeof t]}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {prediction.nextValues.map((value, idx) => (
              <div key={idx} className={`p-2 rounded text-center text-xs ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <div className="opacity-60">+{idx + 1}</div>
                <div className="font-mono font-bold">{value.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Anomalies Details */}
      {anomalies && anomalies.length > 0 && !compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${isDarkMode ? 'border-red-700/30' : 'border-red-200/50'}`}
        >
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            {t.anomalies}
          </h4>
          <p className="text-xs opacity-70">
            {lang === 'ar' ? `تم اكتشاف ${anomalies.length} نقطة شذوذ في المؤشرات: ${anomalies.join(', ')}` : `Detected ${anomalies.length} anomalies at indices: ${anomalies.join(', ')}`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
});

AnalyticsPanel.displayName = 'AnalyticsPanel';
