/**
 * Web Audio API synthesizer for atmospheric pad chords.
 *
 * 5 selectable timbres, chord playback with envelopes, and a
 * progression sequencer. Designed to be swapped for sample-based
 * audio later.
 */

/* ------------------------------------------------------------------ */
/*  Note & chord data                                                  */
/* ------------------------------------------------------------------ */

const N: Record<string, number> = {
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  E4: 329.63,
  "F#4": 369.99,
};

const CHORDS: Record<string, number[]> = {
  EbMaj: [N.Eb3, N.G3, N.Bb3],
  DMaj: [N.D3, N["F#3"], N.A3],
  FMaj: [N.F3, N.A3, N.C4],
  DMaj7: [N.D3, N["F#3"], N.A3, N["C#4"]],
  FMaj7: [N.F3, N.A3, N.C4, N.E4],
  Gmin: [N.G3, N.Bb3, N.D4],
  Em11: [N.E3, N.G3, N.B3, N.D4, N["F#4"], N.A3],
};

/* ------------------------------------------------------------------ */
/*  Timbres                                                            */
/* ------------------------------------------------------------------ */

export type TimbreName = "warm" | "glass" | "dark" | "ethereal" | "bright";

interface TimbreConfig {
  label: string;
  oscType: OscillatorType;
  /** Number of detuned oscillator layers per note */
  layers: number;
  /** Cents of detuning spread across layers */
  detuneSpread: number;
  filterType: BiquadFilterType;
  filterFreq: number;
  filterQ: number;
  /** Attack time in seconds */
  attack: number;
  /** Release time in seconds */
  release: number;
  /** Gain per oscillator (keep low — many play at once) */
  noteGain: number;
  /** Add a sub-octave layer for depth */
  subOctave?: boolean;
}

const TIMBRES: Record<TimbreName, TimbreConfig> = {
  warm: {
    label: "Warm Pad",
    oscType: "sawtooth",
    layers: 2,
    detuneSpread: 12,
    filterType: "lowpass",
    filterFreq: 800,
    filterQ: 1,
    attack: 0.8,
    release: 1.5,
    noteGain: 0.07,
  },
  glass: {
    label: "Glass Pad",
    oscType: "sine",
    layers: 3,
    detuneSpread: 7,
    filterType: "bandpass",
    filterFreq: 1200,
    filterQ: 0.5,
    attack: 0.5,
    release: 1.2,
    noteGain: 0.09,
  },
  dark: {
    label: "Dark Pad",
    oscType: "square",
    layers: 2,
    detuneSpread: 6,
    filterType: "lowpass",
    filterFreq: 400,
    filterQ: 2,
    attack: 1.0,
    release: 2.0,
    noteGain: 0.04,
    subOctave: true,
  },
  ethereal: {
    label: "Ethereal Pad",
    oscType: "triangle",
    layers: 3,
    detuneSpread: 10,
    filterType: "lowpass",
    filterFreq: 1500,
    filterQ: 0.7,
    attack: 1.2,
    release: 1.8,
    noteGain: 0.09,
  },
  bright: {
    label: "Bright Pad",
    oscType: "sawtooth",
    layers: 2,
    detuneSpread: 15,
    filterType: "lowpass",
    filterFreq: 2000,
    filterQ: 1.5,
    attack: 0.4,
    release: 1.0,
    noteGain: 0.06,
  },
};

/* ------------------------------------------------------------------ */
/*  Voice tracking                                                     */
/* ------------------------------------------------------------------ */

interface ActiveVoice {
  oscillators: OscillatorNode[];
  masterGain: GainNode;
  cleanup: ReturnType<typeof setTimeout>;
}

/* ------------------------------------------------------------------ */
/*  Synth Engine                                                       */
/* ------------------------------------------------------------------ */

class SynthEngine {
  private ctx: AudioContext | null = null;
  private output: GainNode | null = null;
  private timbre: TimbreName = "dark";
  private muted = false;
  private voices: Map<string, ActiveVoice> = new Map();

  /* --- Progression state --- */
  private progTimer: ReturnType<typeof setTimeout> | null = null;
  private progChain: string[] = [];
  private progIndex = 0;
  private progLoop = false;
  private progChordMap: Record<string, string> = {};
  private progDuration = 3;

  /* --- Callbacks --- */
  onChordStart?: (blobId: string) => void;
  onChordEnd?: (blobId: string) => void;
  onProgressionEnd?: () => void;

  /* ---- Lifecycle ---- */

  async init(): Promise<void> {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.output = this.ctx.createGain();
    this.output.gain.value = 0.5; // master volume
    this.output.connect(this.ctx.destination);
  }

  isInitialized(): boolean {
    return this.ctx !== null;
  }

  /* ---- Timbre ---- */

  setTimbre(name: TimbreName): void {
    this.timbre = name;
  }

  getTimbre(): TimbreName {
    return this.timbre;
  }

  getTimbreList(): { name: TimbreName; label: string }[] {
    return Object.entries(TIMBRES).map(([name, cfg]) => ({
      name: name as TimbreName,
      label: cfg.label,
    }));
  }

  /* ---- Mute ---- */

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      // Silence audio but preserve progression state so extending
      // the chain still works correctly after unmuting
      if (this.progTimer) {
        clearTimeout(this.progTimer);
        this.progTimer = null;
      }
      this.stopAll();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  /* ---- Chord playback ---- */

  playChord(chordName: string, duration = 3): void {
    if (!this.ctx || !this.output || this.muted) return;

    const freqs = CHORDS[chordName];
    if (!freqs) return;

    this.stopChord(chordName);

    const cfg = TIMBRES[this.timbre];
    const now = this.ctx.currentTime;

    // Master gain with envelope
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(1, now + cfg.attack);
    const releaseStart = Math.max(now + duration - cfg.release, now + cfg.attack + 0.05);
    master.gain.setValueAtTime(1, releaseStart);
    master.gain.linearRampToValueAtTime(0, now + duration);

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = cfg.filterType;
    filter.frequency.value = cfg.filterFreq;
    filter.Q.value = cfg.filterQ;

    filter.connect(master);
    master.connect(this.output);

    const oscillators: OscillatorNode[] = [];

    const buildOsc = (freq: number, detuneCents: number, gain: number) => {
      const osc = this.ctx!.createOscillator();
      osc.type = cfg.oscType;
      osc.frequency.value = freq;
      osc.detune.value = detuneCents;

      const g = this.ctx!.createGain();
      g.gain.value = gain;
      osc.connect(g);
      g.connect(filter);

      osc.start(now);
      osc.stop(now + duration + 0.2);
      oscillators.push(osc);
    };

    for (const freq of freqs) {
      for (let l = 0; l < cfg.layers; l++) {
        const detune =
          cfg.layers > 1
            ? (l / (cfg.layers - 1) - 0.5) * cfg.detuneSpread * 2
            : 0;
        buildOsc(freq, detune, cfg.noteGain);
      }

      // Optional sub-octave
      if (cfg.subOctave) {
        buildOsc(freq / 2, 0, cfg.noteGain * 0.6);
      }
    }

    const cleanup = setTimeout(() => {
      this.voices.delete(chordName);
    }, duration * 1000 + 300);

    this.voices.set(chordName, { oscillators, masterGain: master, cleanup });
  }

  stopChord(chordName: string): void {
    const voice = this.voices.get(chordName);
    if (!voice || !this.ctx) return;

    const now = this.ctx.currentTime;
    voice.masterGain.gain.cancelScheduledValues(now);
    voice.masterGain.gain.setValueAtTime(voice.masterGain.gain.value, now);
    voice.masterGain.gain.linearRampToValueAtTime(0, now + 0.08);

    for (const osc of voice.oscillators) {
      try {
        osc.stop(now + 0.1);
      } catch {
        /* already stopped */
      }
    }

    clearTimeout(voice.cleanup);
    this.voices.delete(chordName);
  }

  stopAll(): void {
    for (const name of [...this.voices.keys()]) {
      this.stopChord(name);
    }
  }

  /* ---- Progression sequencer ---- */

  playProgression(
    chain: string[],
    chordMap: Record<string, string>,
    options?: { loop?: boolean; chordDuration?: number }
  ): void {
    this.stopProgression();
    if (chain.length === 0) return;

    this.progChain = [...chain];
    this.progIndex = 0;
    this.progLoop = options?.loop ?? false;
    this.progChordMap = chordMap;
    this.progDuration = options?.chordDuration ?? 3;

    this.advanceProgression();
  }

  private advanceProgression(): void {
    if (this.muted) return;

    if (this.progIndex >= this.progChain.length) {
      if (this.progLoop) {
        this.progIndex = 0;
      } else {
        this.progTimer = null;
        this.onProgressionEnd?.();
        return;
      }
    }

    const blobId = this.progChain[this.progIndex];
    const chord = this.progChordMap[blobId];

    this.onChordStart?.(blobId);
    if (chord) this.playChord(chord, this.progDuration);

    this.progIndex++;

    this.progTimer = setTimeout(() => {
      this.onChordEnd?.(blobId);
      this.advanceProgression();
    }, this.progDuration * 1000);
  }

  stopProgression(): void {
    if (this.progTimer) {
      clearTimeout(this.progTimer);
      this.progTimer = null;
    }
    this.stopAll();
    this.progChain = [];
    this.progIndex = 0;
  }

  /** Append a blob to the current progression without restarting */
  appendToProgression(blobId: string, chordMap?: Record<string, string>): void {
    if (chordMap) {
      Object.assign(this.progChordMap, chordMap);
    }
    this.progChain.push(blobId);
    // If the progression already finished, kick it back off from the new blob
    if (!this.progTimer) {
      this.progIndex = this.progChain.length - 1;
      this.advanceProgression();
    }
  }

  /** Enable looping on the current progression (used when chain closes a cycle) */
  enableLoop(): void {
    this.progLoop = true;
  }

  isProgressionPlaying(): boolean {
    return this.progTimer !== null;
  }
}

// Singleton
export const synthEngine = new SynthEngine();
export { CHORDS };

// Expose on window for easy timbre switching in dev console:
//   synthEngine.setTimbre("glass")  // warm | glass | dark | ethereal | bright
//   synthEngine.getTimbreList()
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).synthEngine = synthEngine;
}
