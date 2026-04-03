/**
 * Synthesized house drum machine.
 *
 * All sounds generated via Web Audio API — no samples needed.
 * 5 preset patterns to audition. Runs independently alongside
 * the pad synth progression.
 */

/* ------------------------------------------------------------------ */
/*  Types & presets                                                     */
/* ------------------------------------------------------------------ */

export type DrumPreset = "classic" | "disco" | "funky" | "tech" | "tribal";

interface DrumPattern {
  label: string;
  bpm: number;
  /** Step indices (0-15) that have a hit for each instrument */
  kick: number[];
  clap: number[];
  closedHat: number[];
  openHat: number[];
}

const PRESETS: Record<DrumPreset, DrumPattern> = {
  classic: {
    label: "Classic House",
    bpm: 125,
    kick: [0, 4, 8, 12],
    clap: [4, 12],
    closedHat: [2, 6, 10, 14],
    openHat: [7],
  },
  disco: {
    label: "Disco Bounce",
    bpm: 125,
    kick: [0, 4, 8, 12],
    clap: [4, 12],
    closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
    openHat: [7, 15],
  },
  funky: {
    label: "Funky Groove",
    bpm: 125,
    kick: [0, 3, 8, 11, 12],
    clap: [4, 12],
    closedHat: [1, 3, 5, 7, 9, 11, 13, 15],
    openHat: [10],
  },
  tech: {
    label: "Tech Drive",
    bpm: 125,
    kick: [0, 4, 8, 12],
    clap: [4, 10, 12],
    closedHat: [0, 2, 4, 6, 8, 10, 12, 14],
    openHat: [14],
  },
  tribal: {
    label: "Tribal Bump",
    bpm: 125,
    kick: [0, 4, 8, 10, 12],
    clap: [4, 12, 15],
    closedHat: [2, 6, 10, 14],
    openHat: [7, 13],
  },
};

/* ------------------------------------------------------------------ */
/*  Drum Machine                                                       */
/* ------------------------------------------------------------------ */

class DrumMachine {
  private ctx: AudioContext | null = null;
  private output: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private preset: DrumPreset = "classic";
  private muted = false;
  private running = false;
  private currentStep = 0;
  private nextStepTime = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

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
    // If running, the new pattern takes effect on the next step
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
    this.nextStepTime = this.ctx.currentTime + 0.05; // tiny lead-in
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

  /* ---- Scheduler (lookahead pattern) ---- */

  private schedule(): void {
    if (!this.running || !this.ctx) return;

    const pattern = PRESETS[this.preset];
    const stepDuration = 60 / pattern.bpm / 4; // 16th note duration

    while (this.nextStepTime < this.ctx.currentTime + this.LOOKAHEAD) {
      this.playStep(this.currentStep, this.nextStepTime, pattern);
      this.nextStepTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 16;
    }

    this.timer = setTimeout(() => this.schedule(), this.INTERVAL);
  }

  private playStep(step: number, time: number, pattern: DrumPattern): void {
    if (pattern.kick.includes(step)) this.playKick(time);
    if (pattern.clap.includes(step)) this.playClap(time);
    if (pattern.closedHat.includes(step)) this.playClosedHat(time);
    if (pattern.openHat.includes(step)) this.playOpenHat(time);
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

  private playClap(time: number): void {
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
      gain.gain.linearRampToValueAtTime(0.45, time + offset + 0.002);
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
    tailGain.gain.setValueAtTime(0.2, time + 0.02);
    tailGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    tail.connect(tailFilter);
    tailFilter.connect(tailGain);
    tailGain.connect(out);
    tail.start(time + 0.02, 0, 0.2);
  }

  private playClosedHat(time: number): void {
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
    gain.gain.setValueAtTime(0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(out);
    noise.start(time, 0, 0.06);
  }

  private playOpenHat(time: number): void {
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
    gain.gain.setValueAtTime(0.28, time);
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
