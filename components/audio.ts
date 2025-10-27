class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmIntervalId: number | null = null;
  private currentNoteIndex = 0;
  private _isMuted = false;
  private _isInitialized = false;

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public init(): void {
    if (this._isInitialized || typeof window === 'undefined') return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this._isInitialized = true;
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
    }
  }

  public playClickSound(): void {
    if (!this.audioContext || !this.masterGain || this._isMuted) return;

    const clickOscillator = this.audioContext.createOscillator();
    const clickGain = this.audioContext.createGain();

    clickOscillator.type = 'sine';
    clickOscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
    clickGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    
    clickGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.1);
    clickOscillator.start(this.audioContext.currentTime);
    clickOscillator.stop(this.audioContext.currentTime + 0.1);

    clickOscillator.connect(clickGain);
    clickGain.connect(this.masterGain);
  }

  public playAlertSound(): void {
    if (!this.audioContext || !this.masterGain || this._isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

    oscillator.start(this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.5);
    oscillator.stop(this.audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
  }

  public playMissionCompleteSound(): void {
    if (!this.audioContext || !this.masterGain || this._isMuted) return;
    const now = this.audioContext.currentTime;
    const notes = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5 arpeggio
    notes.forEach((note, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.15);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.15);
    });
  }

  public playBGM(): void {
    if (!this.audioContext || !this.masterGain || this.bgmIntervalId !== null) return;
    
    // Pleasant Cmaj7 arpeggio sequence
    const melody = [261.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63]; // C4-E4-G4-B4-C5-B4-G4-E4
    const bass = [130.81, 130.81, 130.81, 130.81, 196.00, 196.00, 196.00, 196.00]; // C3 for 4 notes, G3 for 4 notes

    const noteLength = 0.18; // seconds
    const interval = 200; // ms

    const scheduler = () => {
        if (!this.audioContext || !this.masterGain) return;
        
        const now = this.audioContext.currentTime;
        const note = melody[this.currentNoteIndex];
        const bassNote = bass[this.currentNoteIndex];

        // Melody note
        const melodyOsc = this.audioContext.createOscillator();
        melodyOsc.type = 'triangle';
        melodyOsc.frequency.setValueAtTime(note, now);
        const melodyGain = this.audioContext.createGain();
        melodyGain.gain.setValueAtTime(0.12, now);
        melodyGain.gain.exponentialRampToValueAtTime(0.0001, now + noteLength);
        melodyOsc.connect(melodyGain);
        melodyGain.connect(this.masterGain);
        melodyOsc.start(now);
        melodyOsc.stop(now + noteLength);

        // Bass note
        const bassOsc = this.audioContext.createOscillator();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassNote, now);
        const bassGain = this.audioContext.createGain();
        bassGain.gain.setValueAtTime(0.15, now);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + noteLength * 1.5);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + noteLength * 1.5);

        this.currentNoteIndex = (this.currentNoteIndex + 1) % melody.length;
    };

    this.bgmIntervalId = window.setInterval(scheduler, interval);
  }

  public stopBGM(): void {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
      this.currentNoteIndex = 0;
    }
  }

  public toggleMute(shouldMute: boolean): void {
    this._isMuted = shouldMute;
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(this._isMuted ? 0 : 1, this.audioContext.currentTime);
    }
  }
}

export const audioManager = new AudioManager();