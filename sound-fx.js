/**
 * Pushpa Automation & Robotics Industries
 * Procedural Industrial Audio Synthesizer (Web Audio API)
 */

class IndustrialSoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.motorOsc = null;
    this.motorGain = null;
    this.isMotorRunning = false;
    
    // Check saved state
    const savedMute = localStorage.getItem('pushpa_sound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('pushpa_sound_muted', this.isMuted);
    if (this.isMuted && this.motorGain) {
      this.motorGain.gain.setValueAtTime(0, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.isMuted;
  }

  // Crisp mechanical relay / button click
  click() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch(e) {}
  }

  // High-tech UI hover / sensor scan chirp
  hover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(2200, t + 0.03);

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch(e) {}
  }

  // Optical beam / proximity sensor trigger
  sensorTrigger() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.setValueAtTime(2400, t + 0.03);
      osc.frequency.setValueAtTime(3200, t + 0.06);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch(e) {}
  }

  // Sonar radar sweep ping
  radarPing() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2100, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.25);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    } catch(e) {}
  }

  // Emergency Stop alarm sound
  emergencyStop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, t);
      osc.frequency.linearRampToValueAtTime(400, t + 0.2);
      osc.frequency.linearRampToValueAtTime(950, t + 0.4);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.52);
    } catch(e) {}
  }

  // VFD AC Motor hum simulation
  startMotor(freqHz = 50) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (!this.motorOsc) {
        this.motorOsc = this.ctx.createOscillator();
        this.motorGain = this.ctx.createGain();

        this.motorOsc.type = 'sawtooth';
        const baseFreq = 40 + (freqHz * 3.5);
        this.motorOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

        this.motorGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

        this.motorOsc.connect(this.motorGain);
        this.motorGain.connect(this.ctx.destination);
        this.motorOsc.start();
        this.isMotorRunning = true;
      }
    } catch(e) {}
  }

  updateMotorSpeed(freqHz) {
    if (!this.motorOsc || !this.ctx || this.isMuted) return;
    try {
      const baseFreq = 40 + (freqHz * 3.5);
      this.motorOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
    } catch(e) {}
  }

  stopMotor() {
    if (this.motorOsc && this.ctx) {
      try {
        this.motorGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          if (this.motorOsc) {
            this.motorOsc.stop();
            this.motorOsc.disconnect();
            this.motorOsc = null;
            this.isMotorRunning = false;
          }
        }, 220);
      } catch (e) {
        this.motorOsc = null;
        this.isMotorRunning = false;
      }
    }
  }
}

window.soundFX = new IndustrialSoundFX();
