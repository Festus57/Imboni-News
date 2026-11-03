import { useState, useEffect, useRef, useCallback } from 'react';
import { FiPlay, FiPause, FiSquare, FiVolume2, FiVolumeX, FiMic, FiMinus, FiPlus } from 'react-icons/fi';

// ─── Strip HTML tags ───────────────────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Add pauses at Kinyarwanda phrase boundaries ──────────────────────────────
function prepareText(text) {
  return text
    .replace(/\b(kandi|ariko|cyakora|naho|nanone|ndetse|hanyuma|nyamara|mbere)\b(?![,.])/gi, '$1,')
    .replace(/(\d+)/g, ' $1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── AI Voice Reader ──────────────────────────────────────────────────────────
function AIVoiceReader({ title, content }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused,  setIsPaused]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [muted,     setMuted]     = useState(false);
  const [speed,     setSpeed]     = useState(0.85);
  const [voiceReady, setVoiceReady] = useState(false);

  const utterRef = useRef(null);
  const totalRef = useRef(0);
  const speedRef = useRef(0.85);

  const clean    = stripHtml(content);
  const fullText = prepareText([title ? `${title}.` : '', clean].filter(Boolean).join(' '));
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readMin   = Math.max(1, Math.ceil(wordCount / (130 * speed)));

  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Wait for browser voices
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const check = () => { if (window.speechSynthesis.getVoices().length > 0) setVoiceReady(true); };
    check();
    window.speechSynthesis.addEventListener('voiceschanged', check);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check);
  }, []);

  // Female English voice priority
  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (!voices.length) return null;
    const find = (...names) => voices.find((v) => names.some((n) => v.name === n || v.name.toLowerCase().includes(n.toLowerCase())));
    return (
      find('Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa', 'Fiona') ||
      find('Google UK English Female') ||
      find('Microsoft Zira', 'Microsoft Hazel', 'Microsoft Susan') ||
      voices.find((v) => v.lang.startsWith('en') && (
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('hazel')
      )) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0]
    );
  }, [voiceReady]);

  const handlePlay = useCallback(() => {
    if (!window.speechSynthesis) {
      alert('Gerageza Google Chrome.');
      return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterRef.current  = utterance;
    totalRef.current  = fullText.length;
    utterance.lang    = 'en-US';
    utterance.rate    = speedRef.current;
    utterance.pitch   = 1.15;  // higher pitch = more feminine
    utterance.volume  = muted ? 0 : 1;
    const v = getVoice();
    if (v) utterance.voice = v;

    utterance.onboundary = (e) => {
      if (e.name === 'word' && totalRef.current > 0) {
        setProgress(Math.min(Math.round(((e.charIndex || 0) / totalRef.current) * 100), 100));
      }
    };
    utterance.onend   = () => { setIsPlaying(false); setIsPaused(false); setProgress(100); };
    utterance.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') { setIsPlaying(false); setIsPaused(false); } };
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true); setIsPaused(false); setProgress(0);
  }, [isPaused, fullText, getVoice, muted]);

  const handlePause = () => { window.speechSynthesis?.pause(); setIsPlaying(false); setIsPaused(true); };
  const handleStop  = () => { window.speechSynthesis?.cancel(); setIsPlaying(false); setIsPaused(false); setProgress(0); };
  const toggleMute  = () => { const n = !muted; setMuted(n); if (utterRef.current) utterRef.current.volume = n ? 0 : 1; };

  const changeSpeed = (delta) => {
    const next = Math.min(2, Math.max(0.5, parseFloat((speed + delta).toFixed(2))));
    setSpeed(next); speedRef.current = next;
    if (isPlaying) { handleStop(); setTimeout(handlePlay, 80); }
  };

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  if (!window.speechSynthesis) return null;

  const LABELS = { 0.5: 'Buhoro cyane', 0.75: 'Buhoro', 0.85: 'Bisanzwe', 1: 'Vuba', 1.25: 'Vuba cyane', 1.5: 'Vuba rwose', 2: 'Vuba cyane rwose' };

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 py-3 flex items-center gap-3">
        <div className={`rounded-full p-2 flex-shrink-0 ${isPlaying ? 'bg-primary/40 animate-pulse' : 'bg-white/10'}`}>
          <FiMic size={16} className={isPlaying ? 'text-red-400' : 'text-gray-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">AI Voice 🇬🇧 English</p>
          <p className="text-sm text-white font-medium truncate">
            {isPlaying ? '▶ Reading article...' : isPaused ? '⏸ Paused' : "Listen with AI female voice"}
          </p>
        </div>
        <button onClick={toggleMute} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          {muted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
        </button>
      </div>

      {/* Progress */}
      <div className="bg-gray-800 px-4 pt-3 pb-1">
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-red-400 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/30">{progress}%</span>
          <span className="text-xs text-white/30">≈ {readMin} min</span>
        </div>
      </div>

      {/* Speed */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-t border-white/5">
        <span className="text-xs text-white/40 w-24 flex-shrink-0">Umuvuduko:</span>
        <button onClick={() => changeSpeed(-0.25)} disabled={speed <= 0.5} className="text-white/50 hover:text-white disabled:opacity-20 p-1 rounded hover:bg-white/10"><FiMinus size={13} /></button>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
          <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${((speed - 0.5) / 1.5) * 100}%` }} />
        </div>
        <button onClick={() => changeSpeed(0.25)} disabled={speed >= 2} className="text-white/50 hover:text-white disabled:opacity-20 p-1 rounded hover:bg-white/10"><FiPlus size={13} /></button>
        <span className="text-xs text-white/60 w-24 text-right flex-shrink-0">{speed}× {LABELS[speed] || ''}</span>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 pb-4 pt-2 flex gap-2">
        {!isPlaying ? (
          <button onClick={handlePlay} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
            <FiPlay size={16} /> {isPaused ? 'Komeza Gusoma' : 'Umva Inkuru'}
          </button>
        ) : (
          <button onClick={handlePause} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
            <FiPause size={16} /> Hagarika
          </button>
        )}
        {(isPlaying || isPaused || progress > 0) && (
          <button onClick={handleStop} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
            <FiSquare size={13} /> Siba
          </button>
        )}
      </div>
    </div>
  );
}

// ─── File Audio Player ────────────────────────────────────────────────────────
function FileAudioPlayer({ url, title }) {
  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <FiMic size={16} className="text-primary" />
        <span className="text-sm font-medium text-gray-300">{title || 'Umva inkuru'}</span>
      </div>
      <audio controls src={url} className="w-full" style={{ height: 36 }} aria-label={title || 'Audio'}>
        Mushakisha browser ishobora kuvuga audio.
      </audio>
    </div>
  );
}

export default function AudioPlayer({ url, title, content }) {
  if (url) return <FileAudioPlayer url={url} title={title} />;
  if (content || title) return <AIVoiceReader title={title || ''} content={content || ''} />;
  return null;
}
