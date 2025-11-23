/**
 * Enhanced Chart Renderer Component
 * Improved version with advanced analytics, better colors, and professional design
 */

import React, { memo, useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, ScatterChart, Scatter, RadialBarChart, RadialBar, Legend,
  ReferenceLine, ReferenceArea
} from 'recharts';
import { ChartConfig, ChartType, SeriesConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  selectPaletteByContext,
  PROFESSIONAL_PALETTES,
  mapValueToColor,
  getContrastingTextColor,
  generateGradient
} from '../utils/colorSystem';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';
import { AnalyticsPanel } from './AnalyticsPanel';

interface EnhancedChartRendererProps {
  config: ChartConfig;
  isDarkMode: boolean;
  lang?: string;
  colorPalette?: 'executive' | 'tech' | 'financial' | 'healthcare' | 'nature' | 'pastel' | 'vibrant' | 'monoBlue' | 'monoGreen' | 'sunset' | 'ocean' | 'auto';
  enableAnalytics?: boolean;
  enableForecasting?: boolean;
  enablePrediction?: boolean;
  enableMontecarlo?: boolean;
  forecastPeriods?: number;
  showSettings?: boolean;
}

const ANIMATION_DURATION = 1500;

export const EnhancedChartRenderer: React.FC<EnhancedChartRendererProps> = memo(({
  config,
  isDarkMode,
  lang = 'en',
  colorPalette = 'auto',
  enableAnalytics = true,
  enableForecasting = true,
  enablePrediction = true,
  enableMontecarlo = false,
  forecastPeriods = 5,
  showSettings = false
}) => {
  const { type, data = [], series = [], id } = config;
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(enableAnalytics);
  const [currentColorPalette, setCurrentColorPalette] = useState(colorPalette);

  const uniqueId = useMemo(() => {
    return id ? `${id}-${Math.random().toString(36).substr(2, 5)}` : uuidv4();
  }, [id]);

  // --- PALETTE SELECTION ---
  const selectedPalette = useMemo(() => {
    return selectPaletteByContext(currentColorPalette as any);
  }, [currentColorPalette]);

  const colors = {
    grid: isDarkMode ? '#334155' : '#cbd5e1',
    tooltipBg: isDarkMode ? 'rgba(2, 6, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    text: isDarkMode ? '#94a3b8' : '#64748b',
    textHighlight: isDarkMode ? '#f8fafc' : '#0f172a'
  };

  // --- DATA PROCESSING ---
  const { processedData, processedSeries, seriesDataMap } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [], processedSeries: [], seriesDataMap: {} };
    }

    const validSeries = series.map((s, i) => ({
      ...s,
      key: s.key || `val${i + 1}`,
      color: selectedPalette[i % selectedPalette.length]
    }));

    const safeData = data.map(d => {
      const newD = { ...d };
      validSeries.forEach((s, idx) => {
        if (newD[s.key] === undefined) {
          const numericValues = Object.values(d).filter(v => typeof v === 'number');
          if (numericValues[idx] !== undefined) {
            newD[s.key] = numericValues[idx];
          }
        }
      });
      return newD;
    });

    // Build series data map for analytics
    const dataMap: Record<string, number[]> = {};
    validSeries.forEach(s => {
      dataMap[s.key] = safeData.map(d => d[s.key] as number).filter(v => typeof v === 'number');
    });

    return { processedData: safeData, processedSeries: validSeries, seriesDataMap: dataMap };
  }, [data, series, selectedPalette]);

  // --- ADVANCED ANALYTICS ---
  const firstSeriesKey = processedSeries[0]?.key;
  const firstSeriesData = seriesDataMap[firstSeriesKey] || [];
  const analytics = useAdvancedAnalytics(firstSeriesData, {
    enableForecasting,
    enablePrediction,
    enableMontecarlo,
    enableAnomalyDetection: true,
    enableStatistics: true,
    enableTrendAnalysis: true,
    forecastPeriods,
    forecastMethod: 'linear'
  });

  if (processedData.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center opacity-50 bg-slate-900/5 rounded-xl border border-dashed border-slate-500/30">
        <AlertTriangle size={32} className="mx-auto mb-2 text-slate-400" />
        <p className="text-sm font-mono uppercase tracking-widest text-slate-500">
          {lang === 'ar' ? 'لا توجد بيانات قابلة للعرض' : 'No Renderable Data'}
        </p>
      </div>
    );
  }

  // --- CUSTOM TOOLTIP ---
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl shadow-2xl rounded-2xl border"
          style={{
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            padding: '16px',
            minWidth: '240px'
          }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <p className={`font-bold mb-3 font-sans text-xs uppercase tracking-wider opacity-70 ${isDarkMode ? 'text-white' : 'text-navy-900'}`}>
            {label}
          </p>
          <div className="space-y-3">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{
                      backgroundColor: entry.color,
                      boxShadow: `0 0 12px ${entry.color}60`
                    }}
                  />
                  <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} font-medium text-xs`}>
                    {entry.name}:
                  </span>
                </div>
                <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-navy-900'}`}>
                  {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const axisProps = {
    stroke: colors.grid,
    strokeWidth: 0,
    fontSize: 11,
    tickLine: false,
    axisLine: false,
    tick: { fill: colors.text, fontWeight: 500, fontSize: 10, fontFamily: 'Inter' },
    dy: 12
  };

  const yAxisProps = {
    ...axisProps,
    dy: 0,
    dx: -12,
    tickFormatter: (value: number) =>
      value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` :
        value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
  };

  // --- DYNAMIC DEFINITIONS ---
  const Defs = () => (
    <defs>
      <filter id={`neonGlow-${uniqueId}`} height="300%" width="300%" x="-100%" y="-100%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gradients for each series */}
      {processedSeries.map((s, i) => (
        <linearGradient key={`gradient-${s.key}-${uniqueId}`} id={`gradient-${s.key}-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.color} stopOpacity={isDarkMode ? 0.7 : 0.85} />
          <stop offset="95%" stopColor={s.color} stopOpacity={isDarkMode ? 0.1 : 0.15} />
        </linearGradient>
      ))}

      {/* Glow effects for dark mode */}
      {isDarkMode && (
        <>
          {processedSeries.map((s, i) => (
            <filter key={`glow-${s.key}-${uniqueId}`} id={`glow-${s.key}-${uniqueId}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </>
      )}
    </defs>
  );

  // --- RENDER CHART ---
  const renderChart = () => {
    switch (type) {
      case ChartType.BAR:
        return (
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Defs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} opacity={0.15} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? '#ffffff08' : '#00000008' }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', opacity: 0.85 }} />
            {processedSeries.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={`url(#gradient-${s.key}-${uniqueId})`}
                stroke={s.color}
                strokeWidth={1.5}
                radius={[12, 12, 4, 4]}
                barSize={45}
                animationDuration={ANIMATION_DURATION}
                animationBegin={i * 200}
                filter={isDarkMode ? `url(#glow-${s.key}-${uniqueId})` : undefined}
              />
            ))}
          </BarChart>
        );

      case ChartType.LINE:
        return (
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Defs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} opacity={0.15} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.text, strokeWidth: 2, strokeDasharray: '5 5' }} />
            <Legend iconType="plainline" wrapperStyle={{ paddingTop: '20px', opacity: 0.85 }} />
            {processedSeries.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 8, strokeWidth: 0, fill: s.color }}
                animationDuration={ANIMATION_DURATION}
                filter={isDarkMode ? `url(#glow-${s.key}-${uniqueId})` : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </LineChart>
        );

      case ChartType.AREA:
        return (
          <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Defs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} opacity={0.15} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', opacity: 0.85 }} />
            {processedSeries.map((s, i) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={3}
                fill={`url(#gradient-${s.key}-${uniqueId})`}
                animationDuration={ANIMATION_DURATION}
                filter={isDarkMode ? `url(#glow-${s.key}-${uniqueId})` : undefined}
              />
            ))}
          </AreaChart>
        );

      case ChartType.PIE:
        return (
          <PieChart>
            <Defs />
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={135}
              paddingAngle={6}
              dataKey="val1"
              nameKey="label"
              stroke="none"
              animationDuration={ANIMATION_DURATION}
            >
              {processedData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={selectedPalette[index % selectedPalette.length]}
                  filter={isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ opacity: 0.85 }} />
          </PieChart>
        );

      case ChartType.RADAR:
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={processedData}>
            <Defs />
            <PolarGrid stroke={colors.grid} opacity={0.25} />
            <PolarAngleAxis dataKey="label" tick={{ fill: colors.text, fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke={colors.grid} opacity={0} tick={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px', opacity: 0.85 }} />
            {processedSeries.map((s, i) => (
              <Radar
                key={s.key}
                name={s.name}
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={3}
                fill={s.color}
                fillOpacity={0.35}
                animationDuration={ANIMATION_DURATION}
                filter={isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined}
              />
            ))}
          </RadarChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full select-none relative flex flex-col"
      style={{ minHeight: 0 }}
    >
      {/* Chart Container */}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div className="flex items-center justify-center h-full text-slate-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>}
        </ResponsiveContainer>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalyticsPanel && enableAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'} p-4 mt-4`}
          >
            <AnalyticsPanel
              forecast={analytics.forecast}
              prediction={analytics.prediction}
              montecarlo={analytics.montecarlo}
              statistics={analytics.statistics}
              anomalies={analytics.anomalies}
              isDarkMode={isDarkMode}
              lang={lang}
              compact={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Analytics Button */}
      {enableAnalytics && (
        <motion.button
          onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
          className={`absolute top-4 right-4 p-2 rounded-lg backdrop-blur-sm transition-all ${isDarkMode
            ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50'
            : 'bg-white/50 hover:bg-white/70 border border-slate-200/50'
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={lang === 'ar' ? 'التحليلات' : 'Analytics'}
        >
          <Settings size={18} className={analytics.trend?.direction === 'up' ? 'text-green-500' : 'text-slate-400'} />
        </motion.button>
      )}
    </motion.div>
  );
});

EnhancedChartRenderer.displayName = 'EnhancedChartRenderer';
