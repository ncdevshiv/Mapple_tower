import { Particle } from '../types';

export class VFXManager {
  private particles: Particle[] = [];

  constructor() { }

  public spawnExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 4 + 2,
        color: color,
        type: 'smoke'
      });
    }
  }

  public spawnHit(x: number, y: number, color: string) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5,
        maxLife: 0.5,
        size: Math.random() * 3 + 1,
        color: color,
        type: 'spark'
      });
    }
  }

  public spawnGold(x: number, y: number) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -2,
      life: 1.5,
      maxLife: 1.5,
      size: 5,
      color: '#fbbf24',
      type: 'gold'
    });
  }

  public update(dt: number) {
    // dt is in ms, convert to seconds approx for physics
    const dtSec = dt / 16.0; // Normalized to roughly 60fps frame

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;

      // Physics
      if (p.type === 'smoke' || p.type === 'spark') {
        p.vx *= 0.95; // Friction
        p.vy *= 0.95;
      }

      if (p.type === 'gold') {
        p.vy *= 0.98; // Slow rise
      }

      p.life -= dt / 1000; // life is in seconds

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Batch drawing could be optimized but minimal loop is fine for < 500 particles
    // Batch drawing could be optimized but minimal loop is fine for < 500 particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;

      // Add Glow
      ctx.shadowBlur = p.size * 2;
      ctx.shadowColor = p.color;

      if (p.type === 'gold') {
        // Draw coin shape
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Draw circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset shadow for performance if needed, but we want everything to glow here
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1.0;
  }
}
