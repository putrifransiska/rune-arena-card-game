// Rune Arena — visual effects and animation system
// Particle effects, card animations, screen transitions, and polish.

// Particle system for combat effects
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Spawn particles at position
  spawn(x, y, count, color, speed = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.5 + Math.random());
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        decay: 0.02 + Math.random() * 0.04,
        size: 2 + Math.random() * 4,
        color,
      });
    }
  }

  // Spawn a burst ring
  burst(x, y, color, count = 20) {
    this.spawn(x, y, count, color, 5);
  }

  // Spawn floating text
  damageText(x, y, text, color = '#ff4444') {
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2,
      vy: -3 - Math.random() * 2,
      life: 1,
      decay: 0.015,
      size: 18,
      color,
      text,
      isText: true,
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay;
      p.x += p.vx;
      p.y += p.vy;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      if (p.isText) {
        ctx.font = `bold ${p.size}px sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
  }
}

// Card hover/pickup animation state
export class CardAnimator {
  constructor() {
    this.cardLift = {};    // { cardKey: { y, targetY, progress } }
    this.cardSlide = {};   // { cardKey: { x, y, targetX, targetY, progress } }
    this.shakeAmount = 0;
    this.shakeDuration = 0;
  }

  liftCard(key, amount) {
    this.cardLift[key] = { y: 0, targetY: amount, progress: 0 };
  }

  lowerCard(key) {
    if (this.cardLift[key]) {
      this.cardLift[key].targetY = 0;
    }
  }

  slideCard(key, fromX, fromY, toX, toY) {
    this.cardSlide[key] = { x: fromX, y: fromY, targetX: toX, targetY: toY, progress: 0 };
  }

  shake(duration, amount) {
    this.shakeDuration = duration;
    this.shakeAmount = amount;
  }

  update() {
    for (const key of Object.keys(this.cardLift)) {
      const a = this.cardLift[key];
      a.progress = Math.min(1, a.progress + 0.15);
      a.y += (a.targetY - a.y) * 0.3;
      if (Math.abs(a.y - a.targetY) < 0.5 && a.targetY === 0) {
        delete this.cardLift[key];
      }
    }
    for (const key of Object.keys(this.cardSlide)) {
      const a = this.cardSlide[key];
      a.progress = Math.min(1, a.progress + 0.1);
      a.x += (a.targetX - a.x) * 0.25;
      a.y += (a.targetY - a.y) * 0.25;
      if (Math.abs(a.x - a.targetX) < 0.5 && Math.abs(a.y - a.targetY) < 0.5) {
        delete this.cardSlide[key];
      }
    }
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
    }
  }

  getOffset(key) {
    const lift = this.cardLift[key];
    return lift ? -lift.y : 0;
  }

  getSlidePos(key) {
    const slide = this.cardSlide[key];
    return slide ? { x: slide.x, y: slide.y } : null;
  }

  getShake() {
    if (this.shakeDuration <= 0) return { x: 0, y: 0 };
    const intensity = this.shakeAmount * (this.shakeDuration / 20);
    return {
      x: (Math.random() - 0.5) * intensity * 2,
      y: (Math.random() - 0.5) * intensity * 2,
    };
  }

  reset() {
    this.cardLift = {};
    this.cardSlide = {};
    this.shakeAmount = 0;
    this.shakeDuration = 0;
  }
}