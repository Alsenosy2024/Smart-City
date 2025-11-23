
import React, { memo, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, ScatterChart, Scatter, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { ChartConfig, ChartType, SeriesConfig } from '../types';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ChartRendererProps {
  config: ChartConfig;
  isDarkMode: boolean;
  lang?: string;
}

const ANIMATION_DURATION = 1500;

export const ChartRenderer: React.FC<ChartRendererProps> = memo(({ config, isDarkMode, lang = 'en' }) => {
  const { type, data = [], series = [], id } = config;

  // Unique ID for SVG filters to prevent conflicts
  const uniqueId = useMemo(() => {
     return id ? `${id}-${Math.random().toString(36).substr(2, 5)}` : uuidv4();
  }, [id]);

  // --- SMART PALETTES ---
  // Designed for maximum contrast and "Executive Modern" aesthetic
  const PALETTE = useMemo(() => {
    if (isDarkMode) {
      // Dark Mode: High luminosity, Neon-Pastel, "Cyberpunk Executive"
      return [
        '#C5A059', // TMG Gold (Primary)
        '#38BDF8', // Electric Sky (Cyan 400)
        '#A78BFA', // Soft Violet (Violet 400)
        '#34D399', // Emerald Glow (Emerald 400)
        '#FB7185', // Rose (Rose 400)
        '#F472B6', // Pink
      ];
    } else {
      // Light Mode: Deep, saturated, "Corporate Trust"
      return [
        '#B08D45', // TMG Dark Gold
        '#0F172A', // Deep Navy (Slate 900)
        '#0D9488', // Professional Teal (Teal 600)
        '#7C3AED', // Royal Violet (Violet 600)
        '#E11D48', // Corporate Rose (Rose 600)
        '#0369A1', // Ocean Blue
      ];
    }
  }, [isDarkMode]);

  const colors = {
    grid: isDarkMode ? '#334155' : '#cbd5e1',
    tooltipBg: isDarkMode ? 'rgba(2, 6, 23, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    tooltipBorder: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    text: isDarkMode ? '#94a3b8' : '#64748b', // Muted text for axes
    textHighlight: isDarkMode ? '#f8fafc' : '#0f172a' // Bright text for values
  };

  // --- RENDERING PREPARATION ---
  const { processedData, processedSeries } = useMemo(() => {
      if (!data || data.length === 0) return { processedData: [], processedSeries: [] };

      // Ensure data points have numeric values and map colors
      const validSeries = series.map((s, i) => ({
          ...s,
          key: s.key || `val${i+1}`,
          // Override AI color if it matches the background or is too plain, 
          // enforcing our Theme Palette for consistency.
          color: PALETTE[i % PALETTE.length] 
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

      return { processedData: safeData, processedSeries: validSeries };
  }, [data, series, PALETTE]);


  if (processedData.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center opacity-50 bg-slate-900/5 rounded-xl border border-dashed border-slate-500/30">
         <div className="text-center">
             <AlertTriangle size={32} className="mx-auto mb-2 text-slate-400"/>
             <p className="text-sm font-mono uppercase tracking-widest text-slate-500">
                {lang === 'ar' ? 'لا توجد بيانات قابلة للعرض' : 'No Renderable Data'}
             </p>
         </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="backdrop-blur-xl shadow-2xl rounded-2xl border"
          style={{ 
            backgroundColor: colors.tooltipBg, 
            borderColor: colors.tooltipBorder,
            padding: '16px',
            minWidth: '200px'
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
                      className="w-2.5 h-2.5 rounded-full shadow-sm" 
                      style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}40` }} 
                   />
                   <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} font-medium text-xs`}>{entry.name}:</span>
                </div>
                <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-navy-900'}`}>
                  {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
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
     tickFormatter: (value: number) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}k` : `${value}`
  };

  // --- DYNAMIC DEFINITIONS (Gradients & Filters) ---
  const Defs = () => (
    <defs>
      {/* Neon Glow Filter for Dark Mode */}
      <filter id={`neonGlow-${uniqueId}`} height="300%" width="300%" x="-100%" y="-100%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gradients for each series color */}
      {processedSeries.map((s, i) => (
         <linearGradient key={`gradient-${s.key}-${uniqueId}`} id={`gradient-${s.key}-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stopColor={s.color} stopOpacity={isDarkMode ? 0.6 : 0.8} />
           <stop offset="95%" stopColor={s.color} stopOpacity={isDarkMode ? 0.05 : 0.1} />
         </linearGradient>
      ))}
    </defs>
  );

  const renderChart = () => {
    switch (type) {
      case ChartType.BAR:
        return (
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Defs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} opacity={0.1} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: isDarkMode ? '#ffffff05' : '#00000005'}} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', opacity: 0.7 }} />
            {processedSeries.map((s, i) => (
              <Bar 
                key={s.key} 
                dataKey={s.key} 
                name={s.name}
                fill={`url(#gradient-${s.key}-${uniqueId})`}
                stroke={s.color} // Add stroke to define edges
                strokeWidth={1}
                radius={[8, 8, 2, 2]} 
                barSize={32}
                animationDuration={ANIMATION_DURATION}
                animationBegin={i * 200}
              />
            ))}
          </BarChart>
        );

      case ChartType.LINE:
        return (
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Defs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} opacity={0.1} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.text, strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend iconType="plainline" wrapperStyle={{ paddingTop: '20px', opacity: 0.7 }} />
            {processedSeries.map((s, i) => (
              <Line
                key={s.key}
                type="monotone" // Soft curves
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: s.color, filter: isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined }}
                animationDuration={ANIMATION_DURATION}
                filter={isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined}
                strokeLinecap="round"
              />
            ))}
          </LineChart>
        );

      case ChartType.AREA:
        return (
          <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Defs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} opacity={0.1} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', opacity: 0.7 }} />
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
                filter={isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined}
              />
            ))}
          </AreaChart>
        );

      case ChartType.COMPOSED:
        return (
          <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Defs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} opacity={0.1} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', opacity: 0.7 }} />
            
            {processedSeries.map((s, i) => {
              if (s.type === 'area') {
                 return (
                   <Area 
                     key={s.key} 
                     type="monotone" 
                     dataKey={s.key} 
                     name={s.name} 
                     fill={`url(#gradient-${s.key}-${uniqueId})`} 
                     stroke={s.color} 
                     strokeWidth={2}
                     fillOpacity={1}
                     animationDuration={ANIMATION_DURATION} 
                    />
                 );
              } else if (s.type === 'bar') {
                 return (
                   <Bar 
                     key={s.key} 
                     dataKey={s.key} 
                     name={s.name} 
                     fill={`url(#gradient-${s.key}-${uniqueId})`}
                     stroke={s.color}
                     radius={[6, 6, 2, 2]} 
                     barSize={24} 
                     animationDuration={ANIMATION_DURATION} 
                    />
                 );
              } else {
                 return (
                   <Line 
                     key={s.key} 
                     type="monotone" 
                     dataKey={s.key} 
                     name={s.name} 
                     stroke={s.color} 
                     strokeWidth={3}
                     strokeDasharray={s.name?.toLowerCase().includes('project') ? '5 5' : ''}
                     dot={false} 
                     activeDot={{r: 6, filter: isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined}} 
                     animationDuration={ANIMATION_DURATION} 
                     filter={isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined}
                    />
                 );
              }
            })}
          </ComposedChart>
        );

      case ChartType.RADAR:
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={processedData}>
            <Defs />
            <PolarGrid stroke={colors.grid} opacity={0.2} />
            <PolarAngleAxis dataKey="label" tick={{ fill: colors.text, fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke={colors.grid} opacity={0} tick={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px', opacity: 0.7 }} />
            {processedSeries.map((s, i) => (
              <Radar
                key={s.key}
                name={s.name}
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={3}
                fill={s.color}
                fillOpacity={0.3}
                animationDuration={ANIMATION_DURATION}
                filter={isDarkMode ? `url(#neonGlow-${uniqueId})` : undefined}
              />
            ))}
          </RadarChart>
        );

      case ChartType.RADIAL:
        return (
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="30%" 
            outerRadius="100%" 
            barSize={24} 
            data={processedData}
            startAngle={180} 
            endAngle={0}
          >
            <RadialBar
              label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 700 }}
              background={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
              dataKey="val1"
              cornerRadius={12}
              animationDuration={ANIMATION_DURATION}
            >
               {processedData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
               ))}
            </RadialBar>
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, opacity: 0.7 }} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        );

      case ChartType.PIE:
        return (
          <PieChart>
            <Defs />
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={4}
              dataKey="val1"
              nameKey="label"
              stroke="none"
              animationDuration={ANIMATION_DURATION}
            >
              {processedData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ opacity: 0.7 }} />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full h-full select-none relative"
      style={{ minHeight: 0 }} 
    >
       <div className="absolute inset-0 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
             {renderChart() || <div className="flex items-center justify-center h-full text-slate-500">{lang === 'ar' ? 'جاري التحميل...' : 'Initializing Visuals...'}</div>}
          </ResponsiveContainer>
       </div>
    </motion.div>
  );
});
