
import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { createBlob, decode, decodeAudioData, downsampleBuffer } from '../utils/audioUtils';
import { ChartConfig, ChartType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UseLiveSessionProps {
  onChartGenerated: (chart: ChartConfig) => void;
  onNavigate: (viewId: string) => void;
  lang?: 'en' | 'ar';
}

const renderChartTool: FunctionDeclaration = {
  name: 'render_chart',
  description: 'Generates and displays a chart. Use this when the user asks to visualize data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ["bar", "line", "area", "pie", "text"],
        description: "Chart type."
      },
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      xAxisLabel: { type: Type.STRING },
      yAxisLabel: { type: Type.STRING },
      series: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING },
            name: { type: Type.STRING },
            color: { type: Type.STRING }
          },
          required: ["key", "name"]
        }
      },
      data: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            val1: { type: Type.NUMBER },
            val2: { type: Type.NUMBER }
          },
          required: ["label", "val1"]
        }
      }
    },
    required: ["type", "title", "summary", "series", "data"]
  }
};

const navigateTool: FunctionDeclaration = {
  name: 'navigate_app',
  description: 'Navigates to a specific department or view.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      view_id: {
        type: Type.STRING,
        enum: ['pm', 'assets', 'hse', 'proc', 'fin', 'settings']
      }
    },
    required: ["view_id"]
  }
};

export const useLiveSession = ({ onChartGenerated, onNavigate, lang = 'en' }: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<Promise<any> | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  const lastVolumeUpdateRef = useRef(0);
  
  const onChartGeneratedRef = useRef(onChartGenerated);
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onChartGeneratedRef.current = onChartGenerated;
  }, [onChartGenerated]);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    if (isConnectedRef.current || isConnectingRef.current) return;
    
    isConnectingRef.current = true;
    const sessionId = uuidv4();
    currentSessionIdRef.current = sessionId;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass();
      const outputCtx = new AudioContextClass();
      await inputCtx.resume();
      await outputCtx.resume();
      
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are VizAgent, TMG's Executive AI. 
          CURRENT LANGUAGE CONTEXT: ${lang === 'ar' ? 'ARABIC (Speak Arabic)' : 'ENGLISH (Speak English)'}.
          If user asks to visualize/chart, call 'render_chart'. 
          If user asks to change views, call 'navigate_app'. 
          Speak concisely.`,
          tools: [{ functionDeclarations: [renderChartTool, navigateTool] }],
        },
        callbacks: {
          onopen: () => {
            if (currentSessionIdRef.current !== sessionId) return;
            console.log("Live Session Connected");
            setIsConnected(true);
            isConnectedRef.current = true;
            isConnectingRef.current = false;

            const source = inputCtx.createMediaStreamSource(stream);
            const analyzer = inputCtx.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);
            
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (!isConnectedRef.current || currentSessionIdRef.current !== sessionId) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              const downsampledData = downsampleBuffer(inputData, inputCtx.sampleRate, 16000);
              const pcmBlob = createBlob(downsampledData, 16000);
              
              const now = Date.now();
              if (now - lastVolumeUpdateRef.current > 100) {
                  const dataArray = new Uint8Array(analyzer.frequencyBinCount);
                  analyzer.getByteFrequencyData(dataArray);
                  const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                  setVolume(avg / 255);
                  lastVolumeUpdateRef.current = now;
              }

              sessionPromise.then((session) => {
                if (isConnectedRef.current && currentSessionIdRef.current === sessionId) {
                  try { session.sendRealtimeInput({ media: pcmBlob }); } catch (e) {}
                }
              }).catch(err => console.error("Session input error:", err));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (currentSessionIdRef.current !== sessionId) return;
            try {
              if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
                sourcesRef.current.clear();
                if (outputCtx) nextStartTimeRef.current = outputCtx.currentTime;
                setIsSpeaking(false);
              }

              if (msg.toolCall) {
                const functionResponses = msg.toolCall.functionCalls.map(fc => {
                  if (fc.name === 'render_chart') {
                    try {
                      const rawArgs = (fc.args || {}) as any;
                      const chartConfig: ChartConfig = {
                        type: (rawArgs.type || 'text').toLowerCase() as ChartType,
                        title: rawArgs.title || "Analysis",
                        summary: rawArgs.summary || "Data analysis generated.",
                        xAxisLabel: rawArgs.xAxisLabel || "",
                        yAxisLabel: rawArgs.yAxisLabel || "",
                        series: rawArgs.series || [],
                        data: rawArgs.data || [],
                        id: uuidv4()
                      };
                      onChartGeneratedRef.current(chartConfig);
                      return { id: fc.id, name: fc.name, response: { result: { status: "success" } } };
                    } catch (e) {
                      return { id: fc.id, name: fc.name, response: { result: { error: "failed" } } };
                    }
                  }
                  if (fc.name === 'navigate_app') {
                    const viewId = (fc.args as any).view_id;
                    if (viewId) onNavigateRef.current(viewId);
                    return { id: fc.id, name: fc.name, response: { result: { status: "success" } } };
                  }
                  return { id: fc.id, name: fc.name, response: { result: { ok: true } } };
                });
                sessionPromise.then((session) => session.sendToolResponse({ functionResponses }));
              }

              const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && outputCtx) {
                setIsSpeaking(true);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                  if (sourcesRef.current) {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) setIsSpeaking(false);
                  }
                });
                source.start(nextStartTimeRef.current);
                sourcesRef.current?.add(source);
                nextStartTimeRef.current += audioBuffer.duration;
              }
            } catch (msgError) {
               console.error("Message processing error:", msgError);
            }
          },
          onclose: () => {
             if (currentSessionIdRef.current === sessionId) {
                setIsConnected(false);
                isConnectedRef.current = false;
                isConnectingRef.current = false;
                setIsSpeaking(false);
            }
          },
          onerror: () => {
             if (currentSessionIdRef.current === sessionId) {
                setIsConnected(false);
                isConnectedRef.current = false;
                isConnectingRef.current = false;
                disconnect(); 
            }
          }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (error) {
      console.error("Connection failed:", error);
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    isConnectedRef.current = false;
    isConnectingRef.current = false;
    currentSessionIdRef.current = null;
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    sourcesRef.current.clear();
    if (sessionRef.current) {
      try { const session = await sessionRef.current; await session.close(); } catch (e) {}
      sessionRef.current = null;
    }
    if (inputAudioContextRef.current) { try { await inputAudioContextRef.current.close(); } catch (e) {} inputAudioContextRef.current = null; }
    if (audioContextRef.current) { try { await audioContextRef.current.close(); } catch (e) {} audioContextRef.current = null; }
    setIsConnected(false);
    setIsSpeaking(false);
    setVolume(0);
  };

  return { connect, disconnect, isConnected, isSpeaking, volume };
};
