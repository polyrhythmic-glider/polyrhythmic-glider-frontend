import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

type Particle = {
  x: number;
  y: number;
  baseVx: number;
  baseVy: number;
  vx: number;
  vy: number;
};

@Component({
  selector: 'app-background',
  templateUrl: './background.html',
  styleUrl: './background.css',
})
export class Background implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private readonly maxParticleCount = 80;
  private readonly minParticleCount = 28;
  private readonly referenceViewportArea = 1440 * 900;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId = 0;
  private resizeHandler = () => {
    this.resizeCanvas();
    this.syncParticleDensity();
  };

  private audio?: HTMLAudioElement;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private source?: MediaElementAudioSourceNode;
  private frequencyData?: Uint8Array<ArrayBuffer>;
  private gainNode?: GainNode;

  volume = 0.03;
  isPlaying = false;

  private energy = 0;
  private lowEnergy = 0;
  private midEnergy = 0;
  private highEnergy = 0;

  async ngAfterViewInit(): Promise<void> {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.ctx = ctx;

    this.resizeCanvas();
    this.syncParticleDensity();
    window.addEventListener('resize', this.resizeHandler);

    await this.setupAudio();
    this.animate();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    cancelAnimationFrame(this.animationId);

    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }

    this.audioContext?.close();
  }

  setVolume(value: number | string): void {
    this.volume = Number(value);

    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  playAudio(): void {
    if (!this.audio) return;

    this.audioContext?.resume();
    this.isPlaying = true;

    this.audio.play().catch((error) => {
      this.isPlaying = false;
      console.error('Errore play audio:', error);
    });
  }

  pauseAudio(): void {
    if (!this.audio) return;

    this.audio.pause();
    this.isPlaying = false;
  }

  toggleAudio(): void {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.pauseAudio();
    } else {
      this.playAudio();
    }
  }

  private resizeCanvas(): void {
    const canvas = this.canvas.nativeElement;
    const dpr = window.devicePixelRatio || 1;

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.ctx?.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx?.scale(dpr, dpr);
  }

  private createParticles(count: number): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.particles = [];

    for (let i = 0; i < count; i++) {
      const baseVx = (Math.random() - 0.5) * 0.4;
      const baseVy = (Math.random() - 0.5) * 0.4;

      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseVx,
        baseVy,
        vx: baseVx,
        vy: baseVy,
      });
    }
  }

  private getTargetParticleCount(): number {
    const areaRatio = (window.innerWidth * window.innerHeight) / this.referenceViewportArea;

    return Math.round(
      Math.min(
        this.maxParticleCount,
        Math.max(this.minParticleCount, this.maxParticleCount * areaRatio),
      ),
    );
  }

  private syncParticleDensity(): void {
    const targetCount = this.getTargetParticleCount();

    if (this.particles.length !== targetCount) {
      this.createParticles(targetCount);
      return;
    }

    for (const particle of this.particles) {
      particle.x = Math.min(window.innerWidth, Math.max(0, particle.x));
      particle.y = Math.min(window.innerHeight, Math.max(0, particle.y));
    }
  }

  private async setupAudio(): Promise<void> {
    try {
      this.audio = new Audio('assets/audio/protoclusta.mp3');
      this.audio.loop = true;
      this.audio.crossOrigin = 'anonymous';

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

      this.source = this.audioContext.createMediaElementSource(this.audio);

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;

      this.source.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  }

  private updateAudioData(): void {
    if (!this.analyser || !this.frequencyData) return;

    this.analyser.getByteFrequencyData(this.frequencyData);

    const bassRange = this.frequencyData.slice(0, 10);
    const midRange = this.frequencyData.slice(10, 40);
    const highRange = this.frequencyData.slice(40, 80);

    this.lowEnergy = this.average(bassRange) / 255;
    this.midEnergy = this.average(midRange) / 255;
    this.highEnergy = this.average(highRange) / 255;
    this.energy = (this.lowEnergy + this.midEnergy + this.highEnergy) / 3;
  }

  private average(values: ArrayLike<number>): number {
    if (!values.length) return 0;

    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
    }

    return sum / values.length;
  }

  private animate = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.updateAudioData();

    // Keep the page color uniform with Safari's toolbar areas.
    this.ctx.clearRect(0, 0, width, height);

    const viewportScale = Math.min(1, Math.max(0.7, width / 1024));
    const speedBoost = 1 + this.lowEnergy * 3;
    const pointRadius = 0.9 + this.lowEnergy * 1.5;
    const lineDistance = 100 * viewportScale + this.midEnergy * 160 * viewportScale;
    const lineOpacityBoost = 0.2 * viewportScale + this.midEnergy * 0.5 * viewportScale;

    for (const p of this.particles) {
      p.vx = p.baseVx * speedBoost + (Math.random() - 0.5) * this.highEnergy * 0.5;
      p.vy = p.baseVy * speedBoost + (Math.random() - 0.5) * this.highEnergy * 0.5;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= 0 || p.x >= width) p.baseVx *= -1;
      if (p.y <= 0 || p.y >= height) p.baseVy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255,255,255,${0.5 + this.energy * 0.5})`;
      this.ctx.fill();
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];

        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist < lineDistance) {
          const alpha = Math.max(0, lineOpacityBoost - dist / (lineDistance * 2));

          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          this.ctx.lineWidth = 1 + this.lowEnergy;
          this.ctx.stroke();
        }
      }
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
