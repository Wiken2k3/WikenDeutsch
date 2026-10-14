// src/utils/audio.ts

let synth: SpeechSynthesis | null = null;
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  synth = window.speechSynthesis;
}

let cachedGermanVoice: SpeechSynthesisVoice | null = null;

function findGermanVoice(): SpeechSynthesisVoice | null {
  if (!synth) return null;
  if (cachedGermanVoice) return cachedGermanVoice;

  const voices = synth.getVoices();
  // Try finding native de-DE voices
  const deVoice = voices.find(
    v => v.lang.toLowerCase().replace('_', '-') === 'de-de'
  ) || voices.find(
    v => v.lang.toLowerCase().startsWith('de')
  ) || voices.find(
    v => v.name.toLowerCase().includes('german') || v.name.toLowerCase().includes('deutsch')
  );

  if (deVoice) {
    cachedGermanVoice = deVoice;
  }
  return deVoice || null;
}

// Pre-warm voices on modern browsers
if (typeof window !== 'undefined' && synth) {
  synth.onvoiceschanged = () => {
    findGermanVoice();
  };
}

export function playGermanAudio(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      resolve();
      return;
    }

    try {
      // Cancel previous utterances to avoid queuing delay
      synth.cancel();

      // Clean text: strip brackets or multiple alternatives for smooth pronunciation
      const cleanText = text
        .replace(/\(sich an\)/g, 'sich an')
        .replace(/\(jdn\)/g, '')
        .replace(/\(z\. B\.\)/g, 'zum Beispiel')
        .replace(/der\/die/g, 'der')
        .replace(/,-/g, '')
        .replace(/\//g, ' oder ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'de-DE';
      utterance.rate = rate; // 0.85 - 0.95 gives very clear German diction
      utterance.pitch = 1.0;

      const voice = findGermanVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        resolve();
      };

      synth.speak(utterance);
    } catch (err) {
      console.warn('Failed to speak German text:', err);
      resolve();
    }
  });
}

// Sound effects for gamification (Duolingo style audio bells)
export function playChimeSound(type: 'correct' | 'wrong' | 'complete' | 'level-up') {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(260, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'complete' || type === 'level-up') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
      osc.frequency.setValueAtTime(880, now + 0.3); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch {
    // ignore audio context restrictions
  }
}
