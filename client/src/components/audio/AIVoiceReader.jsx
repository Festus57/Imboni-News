import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiSquare, FiPause, FiVolume2 } from 'react-icons/fi';

// Strip HTML tags to get plain text
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Pick best female voice (prefers Kinyarwanda or French/African accent as fallback)
function pickFemaleVoice(voices) {
  if (!voices.length) return null;

  // Priority order
  const priorities = [
    (v) => /rw|kinyarwanda/i.test(v.lang),               // Kinyarwanda
    (v) => /fr-RW|fr-Africa/i.test(v.lang),               // French Rwanda
    (v) => /fr/i.test(v.lang) && /female|woman|fille/i.test(v.name), // French female
    (v) => /female|woman|girl|zira|nora|ava|samantha|fiona|kate/i.test(v.name), // Generic female name
    (v) => /fr/i.test(v.lang),                            // Any French
    (v) => /en-US/i.test(v.lang) && /female|woman/i.test(v.name),
    (v) => !v.name.toLowerCase().includes('male'),         // Not explicitly male
    (v) => true,                                          // Any voice
  ];

  for (const test of priorities) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0];
}

export default function AIVoiceReader({ text, title }) {
  const [state, setState] = useState('idle'); // 'idle' | 'playing' | 'paused'
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const utterRef = useRef(null);
  const totalCharsRef = useRef(0);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
      const load = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length) setVoices(v);
      };
      load();
      window.speechSynthesis.addEventListener('voiceschanged', load);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const plainText = stripHtml(text);
  const fullText = title ? `${title}. ${plainText}` : plainText;

  const handlePlay = () => {
    if (!supported || !fullText) return;

    if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('playing');
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(fullText);

    const voice = pickFemaleVoice(voices);
    if (voice) utter.voice = voice;

    utter.lang = 'rw-RW';
    utter.rate = 0.92;   // Slightly slower for clarity
    utter.pitch = 1.15;  // Higher pitch for female voice
    utter.volume = 1;

    totalCharsRef.current = fullText.length;

    utter.onboundary = (e) => {
      if (e.name === 'word' && totalCharsRef.current > 0) {
        setProgress(Math.round((e.charIndex / totalCharsRef.current) * 100));
      }
    };

    utter.onend = () => { setState('idle'); setProgress(0); };
    utter.onerror = () => { setState('idle'); setProgress(0); };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setState('playing');
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setState('paused');
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setState('idle');
    setProgress(0);
  };

  if (!supported) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-4 my-4">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          state === 'playing' ? 'bg-primary animate-pulse' : 'bg-gray-700'
        }`}>
          <FiVolume2 size={18} />
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            {state === 'playing' ? '🎙 AI Isoma inkuru...' :
             state === 'paused' ? '⏸ Ihagaritswe — kanda kugirango ukomeze' :
             '🎙 Umva Inkuru (AI Voice)'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Ijwi ry'umukobwa — Kinyarwanda</p>

          {/* Progress bar */}
          {state !== 'idle' && (
            <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {state === 'idle' && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 bg-primary hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              aria-label="Tangira gusoma"
            >
              <FiPlay size={14} /> Umva
            </button>
          )}
          {state === 'playing' && (
            <>
              <button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                aria-label="Hagarika vuba"
              >
                <FiPause size={14} />
              </button>
              <button
                onClick={handleStop}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                aria-label="Hagarika"
              >
                <FiSquare size={14} />
              </button>
            </>
          )}
          {state === 'paused' && (
            <>
              <button
                onClick={handlePlay}
                className="bg-primary hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                aria-label="Komeza"
              >
                <FiPlay size={14} />
              </button>
              <button
                onClick={handleStop}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                aria-label="Hagarika"
              >
                <FiSquare size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Character count hint */}
      {state === 'idle' && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          ~{Math.ceil(plainText.split(/\s+/).length / 130)} min yo gusoma • {plainText.split(/\s+/).length} amagambo
        </p>
      )}
    </div>
  );
}
