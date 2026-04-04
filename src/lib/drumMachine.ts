/**
 * Synthesized house drum machine.
 *
 * All sounds generated via Web Audio API — no samples needed.
 * 5 preset patterns to audition. Runs independently alongside
 * the pad synth progression.
 *
 * Hybrid evolution: kick stays four-on-the-floor, but claps, hats,
 * and open hats evolve every 4 measures via probabilistic ghost hits
 * and occasional removals.
 */

/* ------------------------------------------------------------------ */
/*  Types & presets                                                     */
/* ------------------------------------------------------------------ */

export type DrumPreset = "classic" | "disco" | "funky" | "tech" | "tribal";

/** A rule that adds a ghost hit or removes a base hit each 4-measure cycle */
interface VariationRule {
  step: number;
  /** "add" = ghost hit that may appear; "remove" = base hit that may drop out */
  action: "add" | "remove";
  /** Probability this rule is active in any given 4-measure cycle (0–1) */
  prob: number;
}

interface DrumPattern {
  label: string;
  bpm: number;
  /** Step indices (0-15) that have a hit for each instrument */
  kick: number[];
  clap: number[];
  closedHat: number[];
  openHat: number[];
  /** Probabilistic variations applied every 4 measures (kick excluded) */
  variations?: {
    clap?: VariationRule[];
    closedHat?: VariationRule[];
    openHat?: VariationRule[];
  };
}

const PRESETS: Record<DrumPreset, DrumPattern> = {
  classic: {
    label: "Classic House",
    bpm: 125,
    kick: [0, 4, 8, 12],
    clap: [4, 12],
    closedHat: [2, 6, 10, 14],
    openHat: [7],
    variations: {
      clap: [
        { step: 8, action: "add", prob: 0.35 },
        { step: 14, action: "add", prob: 0.25 },
        { step: 12, action: "remove", prob: 0.15 },
      ],
      closedHat: [
        { step: 0, action: "add", prob: 0.3 },
        { step: 4, action: "add", prob: 0.3 },
        { step: 8, action: "add", prob: 0.3 },
        { step: 1, action: "add", prob: 0.2 },
        { step: 9, action: "add", prob: 0.2 },
        { step: 14, action: "remove", prob: 0.2 },
      ],
      openHat: [
        { step: 15, action: "add", prob: 0.3 },
        { step: 3, action: "add", prob: 0.2 },
        { step: 7, action: "remove", prob: 0.15 },
      ],
    },
  },
  disco: {
    label: "Disco Bounce",
    bpm: 125,
    kick: [0, 4, 8, 12],
    clap: [4, 12],
    closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
    openHat: [7, 15],
    variations: {
      clap: [
        { step: 8, action: "add", prob: 0.3 },
        { step: 6, action: "add", prob: 0.2 },
        { step: 2, action: "add", prob: 0.15 },
      ],
      closedHat: [
        { step: 1, action: "add", prob: 0.35 },
        { step: 3, action: "add", prob: 0.35 },
        { step: 5, action: "add", prob: 0.35 },
        { step: 9, action: "add", prob: 0.35 },
        { step: 11, action: "add", prob: 0.35 },
        { step: 0, action: "remove", prob: 0.2 },
        { step: 8, action: "remove", prob: 0.2 },
      ],
      openHat: [
        { step: 3, action: "add", prob: 0.25 },
        { step: 11, action: "add", prob: 0.25 },
        { step: 15, action: "remove", prob: 0.2 },
      ],
    },
  },
  funky: {
    label: "Funky Groove",
    bpm: 125,
    kick: [0, 3, 8, 11, 12],
    clap: [4, 12],
    closedHat: [1, 3, 5, 7, 9, 11, 13, 15],
    openHat: [10],
    variations: {
      clap: [
        { step: 7, action: "add", prob: 0.25 },
        { step: 15, action: "add", prob: 0.3 },
        { step: 12, action: "remove", prob: 0.15 },
      ],
      closedHat: [
        { step: 0, action: "add", prob: 0.3 },
        { step: 2, action: "add", prob: 0.25 },
        { step: 8, action: "add", prob: 0.25 },
        { step: 5, action: "remove", prob: 0.2 },
        { step: 13, action: "remove", prob: 0.2 },
      ],
      openHat: [
        { step: 6, action: "add", prob: 0.3 },
        { step: 14, action: "add", prob: 0.25 },
        { step: 10, action: "remove", prob: 0.15 },
      ],
    },
  },
  tech: {
    label: "Tech Drive",
    bpm: 125,
    kick: [0, 4, 8, 12],
    clap: [4, 10, 12],
    closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
    openHat: [14],
    variations: {
      clap: [
        { step: 7, action: "add", prob: 0.2 },
        { step: 2, action: "add", prob: 0.15 },
        { step: 10, action: "remove", prob: 0.25 },
      ],
      closedHat: [
        { step: 1, action: "add", prob: 0.3 },
        { step: 5, action: "add", prob: 0.3 },
        { step: 9, action: "add", prob: 0.3 },
        { step: 13, action: "add", prob: 0.3 },
        { step: 6, action: "remove", prob: 0.2 },
      ],
      openHat: [
        { step: 6, action: "add", prob: 0.25 },
        { step: 10, action: "add", prob: 0.2 },
        { step: 14, action: "remove", prob: 0.15 },
      ],
    },
  },
  tribal: {
    label: "Tribal Bump",
    bpm: 125,
    kick: [0, 4, 8, 10, 12],
    clap: [4, 12, 15],
    closedHat: [2, 6, 10, 14],
    openHat: [7, 13],
    variations: {
      clap: [
        { step: 8, action: "add", prob: 0.25 },
        { step: 2, action: "add", prob: 0.2 },
        { step: 15, action: "remove", prob: 0.2 },
      ],
      closedHat: [
        { step: 0, action: "add", prob: 0.3 },
        { step: 4, action: "add", prob: 0.3 },
        { step: 8, action: "add", prob: 0.25 },
        { step: 1, action: "add", prob: 0.2 },
        { step: 9, action: "add", prob: 0.2 },
        { step: 10, action: "remove", prob: 0.2 },
      ],
      openHat: [
        { step: 3, action: "add", prob: 0.25 },
        { step: 11, action: "add", prob: 0.2 },
        { step: 15, action: "add", prob: 0.25 },
        { step: 13, action: "remove", prob: 0.15 },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Drum Machine                                                       */
/* ------------------------------------------------------------------ */

/** Volume scale for ghost (added) hits — subtle presence */
const GHOST_VOLUME = 0.5;
/** Steps per measure × measures per cycle */
const STEPS_PER_CYCLE = 16 * 4; // 64 steps = 4 measures

class DrumMachine {
  private ctx: AudioContext | null = null;
  private output: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private preset: DrumPreset = "classic";
  private muted = false;
  private running = false;
  private currentStep = 0;
  private globalStep = 0;
  private nextStepTime = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Active variation decisions for the current 4-measure cycle */
  private activeAdds = new Set<string>(); // "clap:8", "closedHat:1", etc.
  private activeRemoves = new Set<string>();

  private readonly LOOKAHEAD = 0.1; // seconds to schedule ahead
  private readonly INTERVAL = 25; // ms between scheduler ticks

  /* ---- Lifecycle ---- */

  async init(): Promise<void> {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.output = this.ctx.createGain();
    this.output.gain.value = 0.4; // master drum volume
    this.output.connect(this.ctx.destination);

    // Pre-generate 1 second of white noise (reused by all noise-based sounds)
    const length = this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  isInitialized(): boolean {
    return this.ctx !== null;
  }

  /* ---- Preset ---- */

  setPreset(name: DrumPreset): void {
    this.preset = name;
    // Reset variations when preset changes
    this.rollVariations();
  }

  getPreset(): DrumPreset {
    return this.preset;
  }

  getPresetList(): { name: DrumPreset; label: string }[] {
    return Object.entries(PRESETS).map(([name, cfg]) => ({
      name: name as DrumPreset,
      label: cfg.label,
    }));
  }

  /* ---- Mute ---- */

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stop();
  }

  isMuted(): boolean {
    return this.muted;
  }

  /* ---- One-shot break/fill ---- */

  /** Play a short drum break for the given duration (seconds) */
  playBreak(duration = 2): void {
    if (!this.ctx || !this.output || this.muted) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const bpm = 125;
    const step = 60 / bpm / 4; // 16th note
    const now = this.ctx.currentTime;

    // Fun house break: building snare roll + kick accents + rapid hats
    // 16 steps at 125 BPM ≈ 1.92s, fits nicely in 2s
    const pattern = {
      kick:      [0, 7, 12],
      clap:      [4, 6, 8, 10, 11, 12, 13, 14, 15],
      closedHat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      openHat:   [3, 15],
    };

    const steps = Math.floor(duration / step);
    for (let i = 0; i < steps; i++) {
      const s = i % 16;
      const t = now + i * step;
      if (pattern.kick.includes(s)) this.playKick(t);
      if (pattern.clap.includes(s)) this.playClap(t);
      if (pattern.closedHat.includes(s)) this.playClosedHat(t);
      if (pattern.openHat.includes(s)) this.playOpenHat(t);
    }
  }

  /* ---- Transport ---- */

  start(): void {
    if (!this.ctx || !this.output || this.muted) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.stop(); // clear any existing playback
    this.running = true;
    this.currentStep = 0;
    this.globalStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05; // tiny lead-in
    this.rollVariations(); // fresh variations for this session
    this.schedule();
  }

  stop(): void {
    this.running = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  /* ---- Variation system ---- */

  /** Re-roll which ghost hits are active for the next 4-measure cycle */
  private rollVariations(): void {
    this.activeAdds.clear();
    this.activeRemoves.clear();

    const pattern = PRESETS[this.preset];
    if (!pattern.variations) return;

    const instruments = ["clap", "closedHat", "openHat"] as const;
    for (const inst of instruments) {
      const rules = pattern.variations[inst];
      if (!rules) continue;

      for (const rule of rules) {
        if (Math.random() < rule.prob) {
          const key = `${inst}:${rule.step}`;
          if (rule.action === "add") {
            this.activeAdds.add(key);
          } else {
            this.activeRemoves.add(key);
          }
        }
      }
    }
  }

  /** Check whether a given instrument should play on this step */
  private shouldPlay(
    instrument: "clap" | "closedHat" | "openHat",
    step: number,
    baseSteps: number[]
  ): { play: boolean; ghost: boolean } {
    const key = `${instrument}:${step}`;
    const inBase = baseSteps.includes(step);

    if (inBase) {
      // Base hit — play unless actively removed
      return { play: !this.activeRemoves.has(key), ghost: false };
    }
    // Not in base — play only if actively added (as a ghost)
    return { play: this.activeAdds.has(key), ghost: true };
  }

  /* ---- Scheduler (lookahead pattern) ---- */

  private schedule(): void {
    if (!this.running || !this.ctx) return;

    const pattern = PRESETS[this.preset];
    const stepDuration = 60 / pattern.bpm / 4; // 16th note duration

    while (this.nextStepTime < this.ctx.currentTime + this.LOOKAHEAD) {
      // Re-roll variations at the start of each 4-measure cycle
      if (this.globalStep > 0 && this.globalStep % STEPS_PER_CYCLE === 0) {
        this.rollVariations();
      }

      this.playStep(this.currentStep, this.nextStepTime, pattern);
      this.nextStepTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 16;
      this.globalStep++;
    }

    this.timer = setTimeout(() => this.schedule(), this.INTERVAL);
  }

  private playStep(step: number, time: number, pattern: DrumPattern): void {
    // Kick: always plays exactly as defined — four-on-the-floor stays locked
    if (pattern.kick.includes(step)) this.playKick(time);

    // Other instruments: base pattern + active variations
    const clap = this.shouldPlay("clap", step, pattern.clap);
    if (clap.play) this.playClap(time, clap.ghost ? GHOST_VOLUME : 1);

    const ch = this.shouldPlay("closedHat", step, pattern.closedHat);
    if (ch.play) this.playClosedHat(time, ch.ghost ? GHOST_VOLUME : 1);

    const oh = this.shouldPlay("openHat", step, pattern.openHat);
    if (oh.play) this.playOpenHat(time, oh.ghost ? GHOST_VOLUME : 1);
  }

  /* ---- Sound synthesis ---- */

  private makeNoise(): AudioBufferSourceNode {
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer!;
    return source;
  }

  private playKick(time: number): void {
    const ctx = this.ctx!;
    const out = this.output!;

    // Body — sine with pitch drop
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.07);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(out);
    osc.start(time);
    osc.stop(time + 0.35);

    // Click transient
    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.setValueAtTime(400, time);
    click.frequency.exponentialRampToValueAtTime(60, time + 0.015);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.3, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

    click.connect(clickGain);
    clickGain.connect(out);
    click.start(time);
    click.stop(time + 0.03);
  }

  private playClap(time: number, volume = 1): void {
    const ctx = this.ctx!;
    const out = this.output!;

    // Layer 3 quick noise bursts for the clap "spread"
    for (let i = 0; i < 3; i++) {
      const offset = i * 0.008; // slight spread
      const noise = this.makeNoise();

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2200;
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time + offset);
      gain.gain.linearRampToValueAtTime(0.45 * volume, time + offset + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      noise.start(time + offset, 0, 0.13);
    }

    // Tail
    const tail = this.makeNoise();
    const tailFilter = ctx.createBiquadFilter();
    tailFilter.type = "highpass";
    tailFilter.frequency.value = 1000;

    const tailGain = ctx.createGain();
    tailGain.gain.setValueAtTime(0.2 * volume, time + 0.02);
    tailGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    tail.connect(tailFilter);
    tailFilter.connect(tailGain);
    tailGain.connect(out);
    tail.start(time + 0.02, 0, 0.2);
  }

  private playClosedHat(time: number, volume = 1): void {
    const ctx = this.ctx!;
    const out = this.output!;

    const noise = this.makeNoise();

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 10000;
    bp.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22 * volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(out);
    noise.start(time, 0, 0.06);
  }

  private playOpenHat(time: number, volume = 1): void {
    const ctx = this.ctx!;
    const out = this.output!;

    const noise = this.makeNoise();

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 6000;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 9000;
    bp.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28 * volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(out);
    noise.start(time, 0, 0.25);
  }
}

// Singleton
export const drumMachine = new DrumMachine();

// Expose on window for easy preset switching in dev console:
//   drumMachine.setPreset("disco")  // classic | disco | funky | tech | tribal
//   drumMachine.getPresetList()
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).drumMachine = drumMachine;
}
