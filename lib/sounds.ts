// Sound effects manager
// Uses Web Audio API for low-latency playback

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private musicEnabled = false;
  private volume = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Generate a simple tone as a placeholder for actual sound files
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = this.volume * 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }

  playCard() {
    this.playTone(800, 0.1, 'triangle');
  }

  playShuffle() {
    this.playTone(300, 0.2, 'square');
    setTimeout(() => this.playTone(350, 0.15, 'square'), 100);
    setTimeout(() => this.playTone(400, 0.1, 'square'), 200);
  }

  playDeal() {
    this.playTone(600, 0.08, 'triangle');
  }

  playWinHand() {
    this.playTone(523, 0.15, 'sine');
    setTimeout(() => this.playTone(659, 0.15, 'sine'), 150);
    setTimeout(() => this.playTone(784, 0.2, 'sine'), 300);
  }

  playError() {
    this.playTone(200, 0.15, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.2, 'sawtooth'), 100);
  }

  playGameOver() {
    this.playTone(523, 0.2, 'sine');
    setTimeout(() => this.playTone(659, 0.2, 'sine'), 200);
    setTimeout(() => this.playTone(784, 0.2, 'sine'), 400);
    setTimeout(() => this.playTone(1047, 0.4, 'sine'), 600);
  }

  playTrumpSelect() {
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(660, 0.15, 'sine'), 100);
  }
}

export const soundManager = new SoundManager();
