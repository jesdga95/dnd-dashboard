"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export interface UseSpeechToText {
  supported: boolean;
  activeId: string | null;
  interim: string;
  error: string | null;
  start: (id: string, onAppend: (text: string) => void) => void;
  stop: () => void;
}

export function useSpeechToText(): UseSpeechToText {
  const [supported, setSupported] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const onAppendRef = useRef<((text: string) => void) | null>(null);

  // Feature-detect client-side only (SSR-safe: supported starts false)
  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only feature detection on mount
    setSupported(true);
    return () => {
      try { recRef.current?.abort(); } catch {}
      recRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setActiveId(null);
    setInterim("");
  }, []);

  const start = useCallback((id: string, onAppend: (text: string) => void) => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;

    // Stop any previous session first
    try { recRef.current?.abort(); } catch {}
    setActiveId(null);
    setInterim("");
    setError(null);

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";

    onAppendRef.current = onAppend;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interimChunk += r[0].transcript;
      }
      if (finalChunk && onAppendRef.current) {
        onAppendRef.current(finalChunk);
        setInterim("");
      } else {
        setInterim(interimChunk);
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(e.error ?? "error");
      setActiveId(null);
      setInterim("");
    };

    rec.onend = () => {
      setActiveId(null);
      setInterim("");
    };

    recRef.current = rec;
    try {
      rec.start();
      setActiveId(id);
    } catch {
      setActiveId(null);
    }
  }, []);

  return { supported, activeId, interim, error, start, stop };
}
