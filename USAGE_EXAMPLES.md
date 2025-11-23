# Smart-City Advanced Charts - Usage Examples

## 📚 أمثلة الاستخدام الشاملة

---

## 1. استخدام EnhancedChartRenderer الأساسي

```typescript
import { EnhancedChartRenderer } from './components/EnhancedChartRenderer';
import { ChartConfig, ChartType } from './types';

const chartConfig: ChartConfig = {
  type: ChartType.LINE,
  title: 'Sales Performance',
  summary: 'Monthly sales trend',
  series: [
    { key: 'sales', name: 'Sales', color: '#1E40AF' },
    { key: 'revenue', name: 'Revenue', color: '#DC2626' }
  ],
  data: [
    { label: 'Jan', sales: 4000, revenue: 2400 },
    { label: 'Feb', sales: 3000, revenue: 1398 },
    { label: 'Mar', sales: 2000, revenue: 9800 },
    { label: 'Apr', sales: 2780, revenue: 3908 },
    { label: 'May', sales: 1890, revenue: 4800 }
  ]
};

export default function SalesChart() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="w-full h-screen">
      <EnhancedChartRenderer
        config={chartConfig}
        isDarkMode={isDarkMode}
        lang="ar"
        colorPalette="financial"
        enableAnalytics={true}
        enableForecasting={true}
        enablePrediction={true}
        forecastPeriods={5}
      />
    </div>
  );
}
```

---

## 2. استخدام مع Forecasting متقدم

```typescript
import { EnhancedChartRenderer } from './components/EnhancedChartRenderer';
import { useAdvancedAnalytics } from './hooks/useAdvancedAnalytics';

export function AdvancedForecastingChart() {
  const data = [100, 120, 115, 130, 145, 160, 155, 170];

  const analytics = useAdvancedAnalytics(data, {
    enableForecasting: true,
    enablePrediction: true,
    enableMontecarlo: true,
    enableAnomalyDetection: true,
    enableStatistics: true,
    forecastPeriods: 5,
    montecarloSimulations: 1000
  });

  return (
    <div className="space-y-4">
      <div className="h-96">
        <EnhancedChartRenderer
          config={{
            type: ChartType.LINE,
            title: 'Advanced Forecasting',
            summary: 'With Monte Carlo Simulation',
            series: [{ key: 'value', name: 'Value', color: '#1E40AF' }],
            data: data.map((val, i) => ({ label: `T${i}`, value: val }))
          }}
          isDarkMode={true}
          colorPalette="tech"
          enableAnalytics={true}
          enableMontecarlo={true}
        />
      </div>

      {/* عرض نتائج التحليلات */}
      {analytics.forecast && (
        <div className="p-4 bg-slate-900 rounded-lg">
          <h3 className="font-bold mb-2">Forecast Results</h3>
          <p>Confidence: {analytics.forecast.confidence.toFixed(2)}%</p>
          <p>RMSE: {analytics.forecast.rmse.toFixed(4)}</p>
          <p>Next values: {analytics.forecast.forecast.map(v => v.toFixed(2)).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 3. استخدام مع Multiple Color Palettes

```typescript
import { EnhancedChartRenderer } from './components/EnhancedChartRenderer';
import { ColorPalettePicker } from './components/ColorPalettePicker';
import { useState } from 'react';

export function MultiPaletteChart() {
  const [palette, setPalette] = useState<'executive' | 'tech' | 'financial'>('executive');

  const chartConfig: ChartConfig = {
    type: ChartType.BAR,
    title: 'Department Performance',
    summary: 'Q4 2024 Results',
    series: [
      { key: 'target', name: 'Target', color: '#1E40AF' },
      { key: 'actual', name: 'Actual', color: '#DC2626' }
    ],
    data: [
      { label: 'Sales', target: 100, actual: 95 },
      { label: 'Marketing', target: 80, actual: 85 },
      { label: 'Operations', target: 90, actual: 88 },
      { label: 'IT', target: 75, actual: 92 }
    ]
  };

  return (
    <div className="space-y-4">
      <ColorPalettePicker
        onPaletteChange={setPalette}
        isDarkMode={false}
        lang="ar"
        currentPalette={palette}
      />

      <div className="h-96">
        <EnhancedChartRenderer
          config={chartConfig}
          isDarkMode={false}
          colorPalette={palette}
          enableAnalytics={true}
        />
      </div>
    </div>
  );
}
```

---

## 4. استخدام Analytics Panel منفصل

```typescript
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { useAdvancedAnalytics } from './hooks/useAdvancedAnalytics';

export function StandaloneAnalytics() {
  const data = [45, 52, 48, 61, 55, 67, 72, 68, 75, 80];

  const analytics = useAdvancedAnalytics(data, {
    enableForecasting: true,
    enablePrediction: true,
    enableMontecarlo: true,
    enableStatistics: true,
    enableAnomalyDetection: true,
    enableTrendAnalysis: true,
    forecastPeriods: 5
  });

  return (
    <div className="p-6 bg-slate-50 rounded-lg">
      <AnalyticsPanel
        forecast={analytics.forecast}
        prediction={analytics.prediction}
        montecarlo={analytics.montecarlo}
        statistics={analytics.statistics}
        anomalies={analytics.anomalies}
        isDarkMode={false}
        lang="ar"
        compact={false}
      />
    </div>
  );
}
```

---

## 5. استخدام useAdvancedAnalytics Hook

```typescript
import { useAdvancedAnalytics, useComparativeForecasting } from './hooks/useAdvancedAnalytics';

export function AnalyticsHookExample() {
  const data = [10, 15, 20, 25, 30, 35, 40, 45];

  // استخدام Hook الأساسي
  const analytics = useAdvancedAnalytics(data, {
    enableForecasting: true,
    enablePrediction: true,
    enableMontecarlo: false,
    forecastMethod: 'linear'
  });

  // مقارنة طرق الفوركاستنج
  const comparison = useComparativeForecasting(data, 5);

  return (
    <div className="space-y-4">
      {/* نتائج الفوركاستنج */}
      {analytics.forecast && (
        <div>
          <h3>Forecast Results</h3>
          <pre>{JSON.stringify(analytics.forecast, null, 2)}</pre>
        </div>
      )}

      {/* نتائج التنبؤ */}
      {analytics.prediction && (
        <div>
          <h3>Prediction Results</h3>
          <p>Trend: {analytics.prediction.trend}</p>
          <p>Change: {analytics.prediction.changePercent.toFixed(2)}%</p>
        </div>
      )}

      {/* الإحصائيات */}
      {analytics.statistics && (
        <div>
          <h3>Statistics</h3>
          <p>Mean: {analytics.statistics.mean.toFixed(2)}</p>
          <p>Std Dev: {analytics.statistics.stdDev.toFixed(2)}</p>
          <p>Skewness: {analytics.statistics.skewness.toFixed(2)}</p>
        </div>
      )}

      {/* مقارنة الطرق */}
      <div>
        <h3>Best Forecast Method: {comparison.bestMethod}</h3>
        <p>Confidence: {comparison.best.confidence.toFixed(2)}%</p>
      </div>
    </div>
  );
}
```

---

## 6. استخدام Color System مباشرة

```typescript
import {
  selectPaletteByContext,
  mapValueToColor,
  getContrastRatio,
  generateGradient,
  PROFESSIONAL_PALETTES,
  SEMANTIC_COLORS
} from './utils/colorSystem';

export function ColorSystemExample() {
  // اختيار نظام ألوان
  const palette = selectPaletteByContext('financial');
  console.log('Financial Palette:', palette);

  // تعيين الألوان حسب القيم (Heatmap)
  const color1 = mapValueToColor(25, 0, 100, 'heatmap');   // أحمر
  const color2 = mapValueToColor(50, 0, 100, 'heatmap');   // أصفر
  const color3 = mapValueToColor(75, 0, 100, 'heatmap');   // أخضر

  // فحص التباين
  const ratio = getContrastRatio('#000000', '#FFFFFF');
  console.log('Contrast Ratio:', ratio); // 21:1 (AAA)

  // توليد تدرج لوني
  const gradient = generateGradient('#FF0000', '#00FF00', 5);
  console.log('Gradient:', gradient);

  // استخدام الألوان الدلالية
  console.log('Semantic Colors:', SEMANTIC_COLORS);
  // {
  //   positive: '#10B981',
  //   negative: '#EF4444',
  //   warning: '#F59E0B',
  //   info: '#3B82F6',
  //   neutral: '#6B7280'
  // }

  return (
    <div className="space-y-4">
      {/* عرض الألوان */}
      <div className="flex gap-2">
        {palette.map((color, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* عرض Heatmap */}
      <div className="flex gap-2">
        <div className="w-12 h-12 rounded" style={{ backgroundColor: color1 }} title="25%" />
        <div className="w-12 h-12 rounded" style={{ backgroundColor: color2 }} title="50%" />
        <div className="w-12 h-12 rounded" style={{ backgroundColor: color3 }} title="75%" />
      </div>
    </div>
  );
}
```

---

## 7. استخدام مع Real-time Data

```typescript
import { EnhancedChartRenderer } from './components/EnhancedChartRenderer';
import { useState, useEffect } from 'react';

export function RealtimeChart() {
  const [data, setData] = useState<Array<{ label: string; value: number }>>([
    { label: '00:00', value: 50 },
    { label: '01:00', value: 55 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => [
        ...prev.slice(-23),
        {
          label: new Date().toLocaleTimeString(),
          value: Math.random() * 100
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <EnhancedChartRenderer
      config={{
        type: ChartType.AREA,
        title: 'Real-time Monitoring',
        summary: 'Live data stream',
        series: [{ key: 'value', name: 'Value', color: '#1E40AF' }],
        data
      }}
      isDarkMode={true}
      colorPalette="tech"
      enableAnalytics={true}
      enableForecasting={true}
    />
  );
}
```

---

## 8. استخدام مع Multiple Series و Comparative Analysis

```typescript
import { useCorrelationAnalysis } from './hooks/useAdvancedAnalytics';

export function CorrelationAnalysis() {
  const series1 = [10, 20, 30, 40, 50];
  const series2 = [15, 25, 35, 45, 55];

  const { correlation, strength } = useCorrelationAnalysis(series1, series2);

  return (
    <div className="p-4 bg-white rounded-lg">
      <h3>Correlation Analysis</h3>
      <p>Correlation Coefficient: {correlation.toFixed(3)}</p>
      <p>Strength: {strength}</p>
      <p>
        {strength === 'Strong positive' && '📈 البيانات ترتفع معاً بقوة'}
        {strength === 'Moderate positive' && '📊 البيانات ترتفع معاً بشكل معتدل'}
        {strength === 'Weak positive' && '📉 البيانات ترتفع معاً بضعف'}
        {strength === 'No correlation' && '⚪ لا توجد علاقة بين البيانات'}
      </p>
    </div>
  );
}
```

---

## 9. استخدام مع Custom Styling

```typescript
import { EnhancedChartRenderer } from './components/EnhancedChartRenderer';

export function StyledChart() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 h-full">
        <h2 className="text-2xl font-bold text-white mb-4">Advanced Analytics Dashboard</h2>

        <div className="h-96">
          <EnhancedChartRenderer
            config={{
              type: ChartType.LINE,
              title: 'Performance Metrics',
              summary: 'Last 30 days',
              series: [
                { key: 'metric1', name: 'Metric 1', color: '#38BDF8' },
                { key: 'metric2', name: 'Metric 2', color: '#34D399' }
              ],
              data: Array.from({ length: 30 }, (_, i) => ({
                label: `Day ${i + 1}`,
                metric1: Math.random() * 100,
                metric2: Math.random() * 100
              }))
            }}
            isDarkMode={true}
            colorPalette="tech"
            enableAnalytics={true}
            enableForecasting={true}
            enablePrediction={true}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 10. استخدام مع Error Handling

```typescript
import { EnhancedChartRenderer } from './components/EnhancedChartRenderer';
import { useAdvancedAnalytics } from './hooks/useAdvancedAnalytics';

export function SafeChartComponent() {
  const [data, setData] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  const analytics = useAdvancedAnalytics(data);

  const handleDataUpdate = (newData: number[]) => {
    try {
      // التحقق من البيانات
      if (!Array.isArray(newData) || newData.length === 0) {
        setError('Invalid data format');
        return;
      }

      if (newData.some(v => typeof v !== 'number' || isNaN(v))) {
        setError('Data contains non-numeric values');
        return;
      }

      setData(newData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {data.length > 0 ? (
        <EnhancedChartRenderer
          config={{
            type: ChartType.LINE,
            title: 'Safe Chart',
            summary: 'With error handling',
            series: [{ key: 'value', name: 'Value', color: '#1E40AF' }],
            data: data.map((val, i) => ({ label: `${i}`, value: val }))
          }}
          isDarkMode={false}
          enableAnalytics={true}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No data available. Please load data first.
        </div>
      )}

      {analytics.error && (
        <div className="text-yellow-600 mt-4">
          Analytics Warning: {analytics.error}
        </div>
      )}
    </div>
  );
}
```

---

## 📝 ملاحظات مهمة

1. **البيانات**: تأكد من أن البيانات رقمية وصحيحة
2. **الأداء**: استخدم `useMemo` مع البيانات الكبيرة
3. **الألوان**: اختر نظام ألوان مناسب للسياق
4. **التحليلات**: فعّل فقط التحليلات التي تحتاجها
5. **اللغة**: استخدم `lang="ar"` للعربية و `lang="en"` للإنجليزية

---

## 🔗 الروابط المفيدة

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - شرح التحسينات
- [types.ts](./types.ts) - أنواع TypeScript
- [advancedAnalytics.ts](./utils/advancedAnalytics.ts) - وحدة التحليلات
- [colorSystem.ts](./utils/colorSystem.ts) - نظام الألوان

---

**آخر تحديث:** نوفمبر 2025
