/**
 * Advanced Color System
 * Provides professional, dynamic, and data-driven color palettes
 */

// --- COLOR PALETTES ---

export const PROFESSIONAL_PALETTES = {
  // Modern Executive - High contrast, professional
  executive: [
    '#1E40AF', // Deep Blue
    '#DC2626', // Vibrant Red
    '#059669', // Emerald Green
    '#7C3AED', // Royal Purple
    '#F59E0B', // Amber
    '#0891B2', // Cyan
    '#EA580C', // Orange
    '#BE185D', // Rose
  ],

  // Tech/Data - Neon and modern
  tech: [
    '#00D9FF', // Cyan
    '#FF006E', // Magenta
    '#FFBE0B', // Yellow
    '#FB5607', // Orange
    '#8338EC', // Purple
    '#3A86FF', // Blue
    '#06FFA5', // Green
    '#FF006E', // Pink
  ],

  // Financial - Trustworthy and stable
  financial: [
    '#1F2937', // Dark Gray
    '#059669', // Green (Profit)
    '#DC2626', // Red (Loss)
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#F59E0B', // Amber
    '#06B6D4', // Cyan
    '#8B5CF6', // Violet
  ],

  // Healthcare - Calm and professional
  healthcare: [
    '#0369A1', // Sky Blue
    '#059669', // Green
    '#DC2626', // Red (Warning)
    '#7C3AED', // Purple
    '#F59E0B', // Amber
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#6366F1', // Indigo
  ],

  // Nature - Organic and warm
  nature: [
    '#92400E', // Brown
    '#15803D', // Green
    '#EA580C', // Orange
    '#7C2D12', // Dark Brown
    '#65A30D', // Lime
    '#B45309', // Amber
    '#16A34A', // Emerald
    '#F97316', // Orange
  ],

  // Pastel - Soft and modern
  pastel: [
    '#A78BFA', // Soft Purple
    '#86EFAC', // Soft Green
    '#FCA5A5', // Soft Red
    '#93C5FD', // Soft Blue
    '#FBCFE8', // Soft Pink
    '#DBEAFE', // Soft Sky
    '#FED7AA', // Soft Orange
    '#D1D5DB', // Soft Gray
  ],

  // Vibrant - Bold and energetic
  vibrant: [
    '#FF0080', // Hot Pink
    '#FF8C00', // Dark Orange
    '#00FF00', // Lime
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#FFD700', // Gold
    '#FF4500', // Red Orange
    '#00CED1', // Dark Turquoise
  ],

  // Monochromatic Blue
  monoBlue: [
    '#0F172A', // Dark
    '#1E293B', // Darker
    '#334155', // Dark Gray
    '#475569', // Gray
    '#64748B', // Light Gray
    '#94A3B8', // Lighter
    '#CBD5E1', // Very Light
    '#E2E8F0', // Almost White
  ],

  // Monochromatic Green
  monoGreen: [
    '#064E3B', // Dark
    '#065F46', // Darker
    '#047857', // Base
    '#059669', // Light
    '#10B981', // Lighter
    '#34D399', // Very Light
    '#6EE7B7', // Almost White
    '#D1FAE5', // Pale
  ],

  // Sunset - Warm gradient
  sunset: [
    '#7C2D12', // Dark Brown
    '#B45309', // Brown
    '#EA580C', // Orange
    '#F97316', // Light Orange
    '#FB923C', // Lighter Orange
    '#FCA5A5', // Soft Red
    '#FEE2E2', // Very Light
    '#FEF2F2', // Pale
  ],

  // Ocean - Cool gradient
  ocean: [
    '#0C4A6E', // Dark Blue
    '#0369A1', // Blue
    '#0284C7', // Light Blue
    '#0EA5E9', // Sky
    '#38BDF8', // Light Sky
    '#7DD3FC', // Very Light
    '#BAE6FD', // Pale
    '#E0F2FE', // Almost White
  ],
};

// --- SEMANTIC COLORS ---

export const SEMANTIC_COLORS = {
  positive: '#10B981', // Green - Success, Profit, Growth
  negative: '#EF4444', // Red - Failure, Loss, Decline
  warning: '#F59E0B', // Amber - Caution, Warning
  info: '#3B82F6', // Blue - Information
  neutral: '#6B7280', // Gray - Neutral
  success: '#10B981', // Green
  error: '#EF4444', // Red
  pending: '#F59E0B', // Amber
  completed: '#10B981', // Green
};

// --- GRADIENT GENERATORS ---

/**
 * Generate a gradient from one color to another
 */
export const generateGradient = (startColor: string, endColor: string, steps: number = 5): string[] => {
  const colors: string[] = [];

  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const [r1, g1, b1] = hexToRgb(startColor);
  const [r2, g2, b2] = hexToRgb(endColor);

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = r1 + (r2 - r1) * ratio;
    const g = g1 + (g2 - g1) * ratio;
    const b = b1 + (b2 - b1) * ratio;
    colors.push(rgbToHex(r, g, b));
  }

  return colors;
};

// --- DATA-DRIVEN COLOR MAPPING ---

/**
 * Map values to colors based on range
 * Useful for heatmaps and value-based coloring
 */
export const mapValueToColor = (
  value: number,
  min: number,
  max: number,
  colorScheme: 'heatmap' | 'traffic' | 'diverging' = 'heatmap'
): string => {
  // Normalize value to 0-1
  const normalized = (value - min) / (max - min);
  const clipped = Math.max(0, Math.min(1, normalized));

  if (colorScheme === 'heatmap') {
    // Red to Yellow to Green
    if (clipped < 0.5) {
      // Red to Yellow
      const ratio = clipped * 2;
      return interpolateColor('#EF4444', '#FBBF24', ratio);
    } else {
      // Yellow to Green
      const ratio = (clipped - 0.5) * 2;
      return interpolateColor('#FBBF24', '#10B981', ratio);
    }
  } else if (colorScheme === 'traffic') {
    // Red to Yellow to Green (traffic light)
    if (clipped < 0.33) {
      return '#EF4444'; // Red
    } else if (clipped < 0.66) {
      return '#F59E0B'; // Yellow
    } else {
      return '#10B981'; // Green
    }
  } else if (colorScheme === 'diverging') {
    // Blue to White to Red (diverging)
    if (clipped < 0.5) {
      const ratio = clipped * 2;
      return interpolateColor('#3B82F6', '#F3F4F6', ratio);
    } else {
      const ratio = (clipped - 0.5) * 2;
      return interpolateColor('#F3F4F6', '#EF4444', ratio);
    }
  }

  return '#000000';
};

/**
 * Interpolate between two colors
 */
export const interpolateColor = (color1: string, color2: string, ratio: number): string => {
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const r = r1 + (r2 - r1) * ratio;
  const g = g1 + (g2 - g1) * ratio;
  const b = b1 + (b2 - b1) * ratio;

  return rgbToHex(r, g, b);
};

// --- PALETTE SELECTION ---

/**
 * Select best palette based on context
 */
export const selectPaletteByContext = (context: 'executive' | 'tech' | 'financial' | 'healthcare' | 'nature' | 'auto'): string[] => {
  const palettes = PROFESSIONAL_PALETTES as Record<string, string[]>;

  if (context === 'auto') {
    // Auto-select based on time of day or random
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return palettes.tech;
    if (hour >= 12 && hour < 18) return palettes.financial;
    if (hour >= 18 && hour < 22) return palettes.sunset;
    return palettes.ocean;
  }

  return palettes[context] || palettes.executive;
};

// --- CONTRAST CHECKING ---

/**
 * Calculate contrast ratio between two colors
 * Used for accessibility compliance
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(x => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

// --- THEME COLORS ---

export const THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    accent: '#2563EB',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    border: '#334155',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    accent: '#38BDF8',
  },
};

// --- UTILITY FUNCTIONS ---

/**
 * Get contrasting text color (black or white) for a background
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const [r, g, b] = hexToRgb(backgroundColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Lighten a color by a percentage
 */
export const lightenColor = (color: string, percent: number): string => {
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const [r, g, b] = hexToRgb(color);
  const amount = Math.round(255 * (percent / 100));

  return rgbToHex(
    Math.min(255, r + amount),
    Math.min(255, g + amount),
    Math.min(255, b + amount)
  );
};

/**
 * Darken a color by a percentage
 */
export const darkenColor = (color: string, percent: number): string => {
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const [r, g, b] = hexToRgb(color);
  const amount = Math.round(255 * (percent / 100));

  return rgbToHex(
    Math.max(0, r - amount),
    Math.max(0, g - amount),
    Math.max(0, b - amount)
  );
};
