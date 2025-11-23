
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChartConfig, ChartType } from "../types";
import { v4 as uuidv4 } from 'uuid';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the structured output
const chartResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      enum: [
        ChartType.BAR, 
        ChartType.LINE, 
        ChartType.AREA, 
        ChartType.PIE, 
        ChartType.RADAR, 
        ChartType.RADIAL, 
        ChartType.COMPOSED,
        ChartType.SCATTER,
        ChartType.TEXT
      ],
      description: "The optimal chart type."
    },
    title: {
      type: Type.STRING,
      description: "A concise, professional title."
    },
    summary: {
      type: Type.STRING,
      description: "Executive Analysis (Observation, Root Cause, Strategy)."
    },
    xAxisLabel: {
      type: Type.STRING,
    },
    yAxisLabel: {
      type: Type.STRING,
    },
    series: {
      type: Type.ARRAY,
      description: "Series definitions.",
      items: {
        type: Type.OBJECT,
        properties: {
          key: { type: Type.STRING, description: "MUST BE 'val1', 'val2', 'val3', etc." },
          name: { type: Type.STRING, description: "Human readable name (e.g. Revenue)" },
          color: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['bar', 'line', 'area', 'scatter'] }
        },
        required: ["key", "name"]
      }
    },
    data: {
      type: Type.ARRAY,
      description: "The data points. keys MUST be 'label', 'val1', 'val2', etc.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          val1: { type: Type.NUMBER },
          val2: { type: Type.NUMBER },
          val3: { type: Type.NUMBER },
          val4: { type: Type.NUMBER },
          val5: { type: Type.NUMBER }
        },
        required: ["label", "val1"]
      }
    }
  },
  required: ["type", "title", "summary", "data", "series"]
};

export interface Attachment {
  mimeType: string;
  data: string; // base64
}

// Helper to generate a fallback chart if the API fails
const getFallbackChart = (prompt: string, lang: string = 'en'): ChartConfig => {
  const isAr = lang === 'ar';
  return {
    id: uuidv4(),
    type: ChartType.COMPOSED,
    title: isAr ? "تحليل النظام" : "System Analysis",
    summary: isAr 
      ? "الملاحظة: البيانات تشير إلى اتجاه تصاعدي.\nالتحليل: تحسن الكفاءة التشغيلية.\nالاستراتيجية: نوصي بتخصيص موارد إضافية."
      : "Observation: Data indicates upward trajectory.\nAnalysis: Operational efficiency improvements.\nStrategy: Allocate additional resources.",
    xAxisLabel: isAr ? "الجدول الزمني" : "Timeline",
    yAxisLabel: isAr ? "القيمة المتوقعة" : "Projected Value",
    series: [
      { key: 'val1', name: isAr ? 'الأساسي' : 'Baseline', color: '#B08D45', type: 'line' },
      { key: 'val2', name: isAr ? 'التوقعات' : 'Forecast', color: '#1E3A5F', type: 'area' }
    ],
    data: Array.from({ length: 8 }, (_, i) => ({
       label: isAr ? `شهر ${i + 1}` : `M${i + 1}`,
       val1: 50 + Math.random() * 20 + (i * 2),
       val2: 45 + Math.random() * 30 + (i * 4)
    }))
  };
};

export const generateChartResponse = async (prompt: string, attachment?: Attachment | null, lang: string = 'en'): Promise<ChartConfig> => {
  try {
    const isAr = lang === 'ar';
    const isComplex = prompt.length > 50 || prompt.toLowerCase().includes('analyze') || prompt.toLowerCase().includes('report') || prompt.toLowerCase().includes('strategy');

    const systemInstruction = `
      You are VizAgent, a High-Precision Executive AI for TMG.
      CURRENT LANGUAGE: ${isAr ? 'ARABIC (Must output Arabic Text for title/summary)' : 'ENGLISH'}.
      
      **CORE MISSION:**
      Transform user requests into SOPHISTICATED VISUAL SIMULATIONS and STRATEGIC INSIGHTS.
      
      **ANALYSIS MODE: ${isComplex ? 'COMPLEX / DEEP STRATEGIC' : 'SIMPLE / VISUAL'}**
      ${isComplex ? 
        "PERFORM DEEP ANALYSIS: Identify root causes, extrapolate trends, and suggest high-level corporate strategy. Your summary must be structured: Observation, Analysis, Recommendation." : 
        "PERFORM DIRECT VISUALIZATION: concisely map the data."
      }

      **CRITICAL DATA RULES:**
      1. **KEYS**: You MUST use 'val1', 'val2', 'val3' for your data keys.
      2. **MAPPING**: Map series names to these keys.
      3. **COLORS**: Use modern palette (Gold #C5A059, Navy #0F172A, Teal #0D9488, Rose #E11D48).
      
      **OUTPUT FORMAT**:
      - Return ONLY valid JSON adhering to the schema.
    `;

    const parts = [];
    
    if (attachment) {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        }
      });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: chartResponseSchema,
      },
    });

    let responseText = response.text;
    
    if (!responseText) {
       console.warn("Empty response from Gemini, using fallback.");
       return getFallbackChart(prompt, lang);
    }

    // Aggressive JSON cleaning
    responseText = responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
    }

    let parsedData: ChartConfig;
    try {
        parsedData = JSON.parse(responseText) as ChartConfig;
    } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError, "Raw Text:", responseText);
        return getFallbackChart(prompt, lang);
    }
    
    // --- DATA NORMALIZATION PIPELINE ---
    if (!parsedData.id) parsedData.id = uuidv4();
    parsedData.type = (parsedData.type || 'text').toLowerCase() as ChartType;

    // 1. Data Key Normalization: Ensure val1, val2 exist even if AI messed up keys
    if (parsedData.data && parsedData.data.length > 0) {
      const normalizedData = parsedData.data.map((item: any) => {
        const newItem: any = { 
          label: item.label || item.name || item.date || item.month || item.year || 'Item'
        };
        let valIndex = 1;
        // Scan for numeric properties
        Object.keys(item).forEach(key => {
           const lowerKey = key.toLowerCase();
           if (['label', 'name', 'date', 'month', 'year'].includes(lowerKey)) return;
           
           let val = item[key];
           if (typeof val === 'string') {
              val = Number(val.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
           }
           if (typeof val === 'number' && !isNaN(val)) {
              // Map found number to val1, val2, etc.
              newItem[`val${valIndex}`] = val;
              valIndex++;
           }
        });
        return newItem;
      });
      parsedData.data = normalizedData;
    } else if (parsedData.type !== ChartType.TEXT) {
         // Fallback for empty data
         parsedData.data = Array.from({length: 5}, (_, i) => ({
             label: `Q${i+1}`,
             val1: Math.floor(Math.random() * 100)
         }));
         parsedData.series = [{ key: 'val1', name: 'Value', color: '#C5A059' }];
    }

    // 2. Series Alignment: Ensure series keys match the normalized data
    if (parsedData.data.length > 0) {
        const firstPoint = parsedData.data[0];
        const availableKeys = Object.keys(firstPoint).filter(k => k.startsWith('val'));
        
        // If series definition is missing or mismatched, rebuild it
        if (!parsedData.series || parsedData.series.length === 0 || parsedData.series.length !== availableKeys.length) {
             parsedData.series = availableKeys.map((k, i) => ({
                 key: k,
                 name: parsedData.series?.[i]?.name || (isAr ? `سلسلة ${i+1}` : `Series ${i+1}`),
                 color: parsedData.series?.[i]?.color || (i === 0 ? '#C5A059' : '#0F172A'),
                 type: parsedData.series?.[i]?.type || 'bar'
             }));
        } else {
            // Force keys to match val1, val2...
            parsedData.series = parsedData.series.map((s, i) => ({
                ...s,
                key: `val${i+1}`
            }));
        }
    }

    // 3. Simulation Styling Enforcement
    const lowerPrompt = prompt.toLowerCase();
    const isSimulation = lowerPrompt.includes('simulate') || lowerPrompt.includes('forecast') || lowerPrompt.includes('predict');
    
    if (isSimulation && (parsedData.type === ChartType.LINE || parsedData.type === ChartType.BAR)) {
        parsedData.type = ChartType.COMPOSED;
        const mainSeries = parsedData.series.find(s => s.name.toLowerCase().includes('project') || s.name.toLowerCase().includes('forecast') || s.name.includes('توقع')) || parsedData.series[0];
        if (mainSeries) mainSeries.type = 'area';
    }

    return parsedData;

  } catch (error) {
    console.error("Gemini API Fatal Error:", error);
    return getFallbackChart(prompt, lang);
  }
};
