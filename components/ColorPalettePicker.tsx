/**
 * Color Palette Picker Component
 * Allows users to select and preview color palettes
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown } from 'lucide-react';
import {
  PROFESSIONAL_PALETTES,
  SEMANTIC_COLORS,
  getContrastRatio
} from '../utils/colorSystem';

interface ColorPalettePickerProps {
  onPaletteChange: (palette: 'executive' | 'tech' | 'financial' | 'healthcare' | 'nature' | 'pastel' | 'vibrant' | 'monoBlue' | 'monoGreen' | 'sunset' | 'ocean') => void;
  isDarkMode: boolean;
  lang?: string;
  currentPalette?: string;
}

const paletteDescriptions = {
  en: {
    executive: 'Professional & Trustworthy',
    tech: 'Modern & Bold',
    financial: 'Stable & Secure',
    healthcare: 'Calm & Professional',
    nature: 'Organic & Warm',
    pastel: 'Soft & Modern',
    vibrant: 'Bold & Energetic',
    monoBlue: 'Monochromatic Blue',
    monoGreen: 'Monochromatic Green',
    sunset: 'Warm Gradient',
    ocean: 'Cool Gradient'
  },
  ar: {
    executive: 'احترافي وموثوق',
    tech: 'حديث وجريء',
    financial: 'مستقر وآمن',
    healthcare: 'هادئ واحترافي',
    nature: 'عضوي ودافئ',
    pastel: 'ناعم وحديث',
    vibrant: 'جريء ونشيط',
    monoBlue: 'أزرق أحادي',
    monoGreen: 'أخضر أحادي',
    sunset: 'تدرج دافئ',
    ocean: 'تدرج بارد'
  }
};

const PalettePreview = memo(({
  colors,
  name,
  description,
  isDarkMode,
  isSelected,
  onClick
}: {
  colors: string[];
  name: string;
  description: string;
  isDarkMode: boolean;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-4 rounded-lg border-2 transition-all ${isSelected
        ? isDarkMode
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-blue-500 bg-blue-50'
        : isDarkMode
          ? 'border-slate-700 hover:border-slate-600'
          : 'border-slate-200 hover:border-slate-300'
        }`}
    >
      <div className="mb-3">
        <h4 className="font-bold text-sm">{name}</h4>
        <p className="text-xs opacity-60">{description}</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {colors.slice(0, 8).map((color, idx) => (
          <motion.div
            key={idx}
            className="w-8 h-8 rounded-lg shadow-md border border-white/10"
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.1 }}
            title={`Contrast: ${getContrastRatio(color, isDarkMode ? '#000000' : '#FFFFFF').toFixed(2)}:1`}
          />
        ))}
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs font-bold text-blue-500 flex items-center gap-1"
        >
          ✓ {lang === 'ar' ? 'مختار' : 'Selected'}
        </motion.div>
      )}
    </motion.button>
  );
});

PalettePreview.displayName = 'PalettePreview';

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = memo(({
  onPaletteChange,
  isDarkMode,
  lang = 'en',
  currentPalette = 'executive'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const descriptions = paletteDescriptions[lang as keyof typeof paletteDescriptions] || paletteDescriptions.en;
  const palettes = PROFESSIONAL_PALETTES as Record<string, string[]>;

  const paletteNames = Object.keys(palettes) as Array<keyof typeof PROFESSIONAL_PALETTES>;

  return (
    <div className="w-full">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-lg border flex items-center justify-between ${isDarkMode
          ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
          : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
      >
        <div className="flex items-center gap-2">
          <Palette size={18} />
          <span className="text-sm font-medium">
            {lang === 'ar' ? 'نظام الألوان' : 'Color Palette'}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-2 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto ${isDarkMode
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-200'
              }`}
          >
            {paletteNames.map((paletteName) => (
              <PalettePreview
                key={paletteName}
                colors={palettes[paletteName]}
                name={paletteName.charAt(0).toUpperCase() + paletteName.slice(1)}
                description={descriptions[paletteName as keyof typeof descriptions] || ''}
                isDarkMode={isDarkMode}
                isSelected={currentPalette === paletteName}
                onClick={() => {
                  onPaletteChange(paletteName as any);
                  setIsOpen(false);
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Semantic Colors Reference */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mt-4 p-3 rounded-lg border ${isDarkMode
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-slate-50/50 border-slate-200/50'
          }`}
      >
        <h4 className="text-xs font-bold mb-2 opacity-70">
          {lang === 'ar' ? 'الألوان الدلالية' : 'Semantic Colors'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(SEMANTIC_COLORS).map(([key, color]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-lg shadow-md border border-white/10"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs opacity-60 capitalize">{key}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

ColorPalettePicker.displayName = 'ColorPalettePicker';
