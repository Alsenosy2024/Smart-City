const statusEl = document.getElementById('status');
const processingEl = document.getElementById('processing');
const chartTitleEl = document.getElementById('chartTitle');
const pointCountEl = document.getElementById('pointCount');
const modeButtons = document.querySelectorAll('.mode-button');

const palette = {
  direct: '#1f77b4',
  predicted: '#ff7f0e',
  surface: '#0b1220',
};

let chart;

const buildLabels = (count) => Array.from({ length: count }, (_, i) => `نقطة ${i + 1}`);

const buildSeries = (count, offset = 0, noise = 8) => {
  const baseline = Math.random() * 20 + 30;
  return Array.from({ length: count }, (_, i) => {
    const trend = i * (Math.random() * 1.2 + 0.3);
    const variance = (Math.random() - 0.5) * noise;
    return Math.max(10, Math.round(baseline + trend + variance + offset));
  });
};

const smoothSeries = (series) => series.map((value, index, arr) => {
  if (index === 0 || index === arr.length - 1) return value;
  const prev = arr[index - 1];
  const next = arr[index + 1];
  return Math.round((prev + value + next) / 3);
});

const createChart = () => new Chart(document.getElementById('chart').getContext('2d'), {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        borderColor: '#1f2937',
        borderWidth: 1,
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => `${item.dataset.label}: ${item.formattedValue}`,
        },
      },
    },
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        beginAtZero: true,
      },
    },
  },
  data: { labels: [], datasets: [] },
});

const updateChart = ({ mode, count }) => {
  const labels = buildLabels(count);
  const directSeries = buildSeries(count);
  const predictedSeries = smoothSeries(directSeries.map((v, idx) => v + Math.sin(idx) * 4));

  const datasets = [
    {
      label: 'مباشر',
      data: directSeries,
      borderColor: palette.direct,
      backgroundColor: Chart.helpers.color(palette.direct).alpha(0.15).rgbString(),
      tension: 0.35,
      fill: true,
    },
  ];

  if (mode === 'simulation') {
    datasets.push({
      label: 'محاكاة/تنبؤ',
      data: predictedSeries,
      borderColor: palette.predicted,
      backgroundColor: Chart.helpers.color(palette.predicted).alpha(0.12).rgbString(),
      borderDash: [6, 4],
      tension: 0.35,
      fill: true,
    });
  }

  chart.data.labels = labels;
  chart.data.datasets = datasets;
  chart.update();
};

const setActiveMode = (mode) => {
  modeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
};

const simulateProcessing = async () => new Promise((resolve) => {
  processingEl.hidden = false;
  statusEl.textContent = 'جارٍ تنفيذ معالجة التنبؤ...';
  setTimeout(() => {
    processingEl.hidden = true;
    resolve();
  }, 850);
});

const setMode = async (mode) => {
  const count = Number(pointCountEl.value);
  setActiveMode(mode);

  if (mode === 'direct') {
    processingEl.hidden = true;
    statusEl.textContent = 'توليد فوري للتشارط المباشر';
    chartTitleEl.textContent = 'أداء مباشر';
    updateChart({ mode, count });
    return;
  }

  statusEl.textContent = 'محاكاة أو تنبؤ مع معالجة بيانات...';
  chartTitleEl.textContent = 'نتائج معالجة / تنبؤ';
  await simulateProcessing();
  updateChart({ mode, count });
  statusEl.textContent = 'تم إنشاء التشارط بعد المعالجة';
};

const init = () => {
  chart = createChart();
  setMode('direct');

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  pointCountEl.addEventListener('input', () => {
    const activeMode = document.querySelector('.mode-button.active')?.dataset.mode || 'direct';
    setMode(activeMode);
  });
};

document.addEventListener('DOMContentLoaded', init);

