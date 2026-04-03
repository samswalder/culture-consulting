/**
 * Audio trigger system.
 *
 * Samuel provides all audio assets — this module handles loading,
 * playback, and triggering them at scroll positions or on interactions.
 *
 * Audio files go in /public/audio/ and are referenced by name.
 */

type AudioEvent = "sectionEnter" | "sectionExit" | "interaction";

interface AudioTrigger {
  src: string;
  event: AudioEvent;
  /** Volume 0-1 */
  volume?: number;
  /** If true, loops until explicitly stopped */
  loop?: boolean;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private muted = false;
  private initialized = false;

  /**
   * Must be called from a user gesture (click/tap) to satisfy
   * browser autoplay policies.
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    this.audioContext = new AudioContext();
    this.initialized = true;
  }

  async load(name: string, src: string): Promise<void> {
    if (!this.audioContext || this.buffers.has(name)) return;

    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    } catch {
      console.warn(`Failed to load audio: ${name} (${src})`);
    }
  }

  play(name: string, options?: { volume?: number; loop?: boolean }): void {
    if (!this.audioContext || this.muted) return;

    const buffer = this.buffers.get(name);
    if (!buffer) return;

    // Stop any existing instance of this sound
    this.stop(name);

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = options?.loop ?? false;
    gainNode.gain.value = options?.volume ?? 1;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();

    this.activeSources.set(name, source);
    this.gainNodes.set(name, gainNode);

    source.onended = () => {
      this.activeSources.delete(name);
      this.gainNodes.delete(name);
    };
  }

  stop(name: string): void {
    const source = this.activeSources.get(name);
    if (source) {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
      this.activeSources.delete(name);
      this.gainNodes.delete(name);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      // Stop all active sources
      this.activeSources.forEach((_, name) => this.stop(name));
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton
export const audioManager = new AudioManager();
export type { AudioTrigger, AudioEvent };
