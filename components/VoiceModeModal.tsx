import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Task } from '../types';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
}

const API_KEY = process.env.GEMINI_API_KEY;

// Audio Utils
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return new Blob([int16], { type: 'audio/pcm' });
}

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'processing'>('connecting');
  const [volume, setVolume] = useState(0);

  // Refs for audio handling
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<Promise<any> | null>(null);

  // Tool Definition
  const addTaskTool: FunctionDeclaration = {
    name: 'addTask',
    parameters: {
      type: Type.OBJECT,
      description: 'Create a new task in the todo list.',
      properties: {
        title: { type: Type.STRING, description: 'The content of the task' },
        dueDate: { type: Type.STRING, description: 'ISO date string for the due date. Defaults to today if not specified.' },
        category: { type: Type.STRING, enum: ['work', 'personal', 'others'], description: 'Category of the task' },
        hasReminder: { type: Type.BOOLEAN, description: 'Whether the task is urgent or needs a reminder' }
      },
      required: ['title', 'category']
    }
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
    return () => {
        stopSession();
    };
  }, [isOpen]);

  // Visualizer Animation Loop
  useEffect(() => {
    if (!isOpen) return;
    
    let animationFrameId: number;
    const updateVolume = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        // Smooth dampening
        setVolume(v => v * 0.8 + (avg / 255) * 0.2); 
      }
      animationFrameId = requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen]);

  const startSession = async () => {
    setStatus('connecting');
    try {
      if (!API_KEY) throw new Error("Missing API Key");

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      // Setup Audio Contexts
      inputContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Setup Analyser for Visualizer
      analyserRef.current = inputContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      // Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = inputContextRef.current.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(analyserRef.current); // Connect mic to analyser
      source.connect(processor);
      processor.connect(inputContextRef.current.destination);

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
          },
          systemInstruction: `You are a friendly, concise task assistant. Current date is ${new Date().toLocaleDateString()}. Your job is to help the user add tasks to their list. When they state a task, call the addTask tool immediately. Be brief. If they say 'Cancel' or 'Stop', just acknowledge.`,
          tools: [{ functionDeclarations: [addTaskTool] }],
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Connected");
            setStatus('listening');
            setIsListening(true);
            
            // Start streaming audio
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let binary = '';
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                const int16 = s < 0 ? s * 0x8000 : s * 0x7FFF;
                binary += String.fromCharCode(int16 & 255, (int16 >> 8) & 255);
              }
              const b64Data = btoa(binary);

              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  mimeType: 'audio/pcm;rate=16000',
                  data: b64Data
                });
              });
            };
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
               setStatus('speaking');
               const ctx = outputContextRef.current;
               const bytes = base64ToUint8Array(audioData);
               const buffer = await decodeAudioData(bytes, ctx);
               
               const source = ctx.createBufferSource();
               source.buffer = buffer;
               source.connect(ctx.destination);
               
               const now = ctx.currentTime;
               const startTime = Math.max(now, nextStartTimeRef.current);
               source.start(startTime);
               nextStartTimeRef.current = startTime + buffer.duration;
               
               source.onended = () => {
                 if (ctx.currentTime >= nextStartTimeRef.current) {
                   setStatus('listening');
                 }
               };
            }

            // Handle Tool Calls
            if (msg.toolCall) {
              setStatus('processing');
              for (const call of msg.toolCall.functionCalls) {
                if (call.name === 'addTask') {
                  const args = call.args as any;
                  
                  onAdd({
                    title: args.title,
                    dueDate: args.dueDate ? new Date(args.dueDate) : new Date(),
                    category: (args.category as any) || 'personal',
                    hasReminder: !!args.hasReminder
                  });

                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        functionResponses: [
                            {
                                id: call.id,
                                name: call.name,
                                response: { result: "Task added successfully" }
                            }
                        ]
                      }
                    });
                  });
                }
              }
            }
          },
          onclose: () => {
            console.log("Session closed");
            setStatus('connecting');
          },
          onerror: (err) => {
            console.error("Session error:", err);
            setStatus('connecting');
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to start voice session", e);
    }
  };

  const stopSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (inputContextRef.current) {
        if (inputContextRef.current.state !== 'closed') {
            inputContextRef.current.close().catch(e => console.warn("InputCtx close error", e));
        }
        inputContextRef.current = null;
    }
    if (outputContextRef.current) {
        if (outputContextRef.current.state !== 'closed') {
            outputContextRef.current.close().catch(e => console.warn("OutputCtx close error", e));
        }
        outputContextRef.current = null;
    }

    if (sessionRef.current) {
        sessionRef.current.then(session => {
            try {
                session.close();
            } catch (e) {
                console.warn("Session close error", e);
            }
        }).catch(e => console.warn("Session promise error", e));
        sessionRef.current = null;
    }

    setIsListening(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-md mx-auto pointer-events-none">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="pointer-events-auto absolute top-6 right-6 w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all"
        >
          <X size={20} />
        </button>

        {/* Visualizer Container */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
           {/* Glow Layer */}
           <div 
              className="absolute inset-0 rounded-full blur-3xl transition-all duration-100 ease-out"
              style={{
                background: `radial-gradient(circle, rgba(212,134,33,0.2) 0%, transparent 70%)`,
                transform: `scale(${1 + volume * 1.5})`,
                opacity: 0.5 + volume
              }}
           ></div>

           {/* The Core Orb */}
           <div 
              className="w-32 h-32 rounded-full relative z-10 border border-amber-500/30 flex items-center justify-center bg-zinc-900/50 backdrop-blur-md shadow-[0_0_30px_rgba(212,134,33,0.1)] transition-transform duration-75 ease-out"
              style={{
                transform: `scale(${1 + volume * 0.2})`
              }}
           >
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
           </div>

           {/* Orbiting Ring */}
           <div className="absolute inset-0 border border-zinc-800 rounded-full animate-[spin_10s_linear_infinite]"></div>
           <div className="absolute inset-8 border border-zinc-800/50 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-3 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-mono font-light text-zinc-200 tracking-tight">
            {status === 'connecting' && "INITIALIZING..."}
            {status === 'listening' && "LISTENING..."}
            {status === 'speaking' && "AI ACTIVE..."}
            {status === 'processing' && "PROCESSING..."}
          </h3>
          <p className="text-zinc-500 text-xs font-mono tracking-wide uppercase">
            {status === 'listening' ? "Say 'Add a meeting tomorrow'" : "Standby"}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-16 pointer-events-auto flex gap-6">
           <button 
             onClick={isListening ? stopSession : startSession}
             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border ${isListening ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
           >
             {isListening ? <MicOff size={24} /> : <Mic size={24} />}
           </button>
        </div>

      </div>
    </div>
  );
};
