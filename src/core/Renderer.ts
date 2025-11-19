import { GameState, Player, Food, Particle, Bullet } from '../types/game';
import { GRID_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2D context');
    this.ctx = context;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
  }

  render(state: GameState): void {
    this.clear();
    this.drawGrid();
    this.drawParticles(state.particles);
    this.drawFood(state.foods);
    this.drawSnakes(state.players);
    
    if (state.gameMode === 'magic-shooter') {
      this.drawBullets(state.bullets);
    }
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CANVAS_HEIGHT);
      this.ctx.stroke();
    }

    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(CANVAS_WIDTH, y);
      this.ctx.stroke();
    }
  }

  private drawSnakes(players: Player[]): void {
    players.forEach((player) => {
      if (!player.snake.alive) return;

      player.snake.segments.forEach((seg, i) => {
        // Пропускаем невидимые сегменты призраков
        if (player.isGhost && i > 0) return;

        let color = i === 0 ? player.snake.color.head : player.snake.color.body;
        
        // Эффекты для режима "Магический шутер"
        if (i === 0 && player.specialEffect !== undefined && player.specialEffect !== null) {
          if (player.specialEffect === 0) { // WEAPON
            color = '#FFD700';
          } else if (player.specialEffect === 1) { // INVULNERABILITY
            const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 100);
            color = `rgba(76, 201, 240, ${pulse})`;
          } else if (player.specialEffect === 2) { // DIARRHEA
            color = '#FF6B6B';
          }
        }

        // Полупрозрачная голова призрака
        if (player.isGhost && i === 0) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        } else {
          this.ctx.fillStyle = color;
        }

        this.ctx.beginPath();
        this.ctx.roundRect(
          seg.x * GRID_SIZE + 1.5,
          seg.y * GRID_SIZE + 1.5,
          GRID_SIZE - 3,
          GRID_SIZE - 3,
          4
        );

        // Градиент для тела (кроме режима призрака)
        if (i > 0 && !player.isGhost) {
          const gradient = this.ctx.createLinearGradient(
            seg.x * GRID_SIZE,
            seg.y * GRID_SIZE,
            (seg.x + 1) * GRID_SIZE,
            (seg.y + 1) * GRID_SIZE
          );
          gradient.addColorStop(0, player.snake.color.body);
          gradient.addColorStop(1, player.snake.color.head);
          this.ctx.fillStyle = gradient;
        }

        this.ctx.fill();

        // Рисуем глаза на голове
        if (i === 0) {
          this.drawEyes(seg, player.snake.direction);
        }
      });
    });
  }

  private drawEyes(head: { x: number; y: number }, direction: { x: number; y: number }): void {
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();

    const eyeOffset = 5;
    let eyeX1: number, eyeY1: number, eyeX2: number, eyeY2: number;

    if (direction.x === 1) {
      eyeX1 = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
      eyeY1 = head.y * GRID_SIZE + eyeOffset;
      eyeX2 = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
      eyeY2 = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
    } else if (direction.x === -1) {
      eyeX1 = head.x * GRID_SIZE + eyeOffset;
      eyeY1 = head.y * GRID_SIZE + eyeOffset;
      eyeX2 = head.x * GRID_SIZE + eyeOffset;
      eyeY2 = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
    } else if (direction.y === -1) {
      eyeX1 = head.x * GRID_SIZE + eyeOffset;
      eyeY1 = head.y * GRID_SIZE + eyeOffset;
      eyeX2 = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
      eyeY2 = head.y * GRID_SIZE + eyeOffset;
    } else {
      eyeX1 = head.x * GRID_SIZE + eyeOffset;
      eyeY1 = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
      eyeX2 = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
      eyeY2 = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
    }

    this.ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
    this.ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(eyeX1, eyeY1, 0.8, 0, Math.PI * 2);
    this.ctx.arc(eyeX2, eyeY2, 0.8, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawFood(foods: Food[]): void {
    foods.forEach(food => {
      const isSpecial = food.isSpecial;
      const pulseSize = isSpecial 
        ? 6 + Math.sin(Date.now() / 150) * 3 
        : 4 + Math.sin(Date.now() / 200) * 2;

      this.ctx.fillStyle = isSpecial ? '#9c27b0' : '#FF5252';
      this.ctx.beginPath();
      this.ctx.arc(
        (food.x + 0.5) * GRID_SIZE,
        (food.y + 0.5) * GRID_SIZE,
        pulseSize,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      if (isSpecial) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('★', (food.x + 0.5) * GRID_SIZE, (food.y + 0.5) * GRID_SIZE);
      }
    });
  }

  private drawParticles(particles: Particle[]): void {
    // Оптимизация: рисуем без градиента для производительности
    particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      const color = p.color.replace(/[\d.]+\)$/, `${alpha})`);
      
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private drawBullets(bullets: Bullet[]): void {
    bullets.forEach(bullet => {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.beginPath();
      this.ctx.arc(
        (bullet.x + 0.5) * GRID_SIZE,
        (bullet.y + 0.5) * GRID_SIZE,
        4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
  }
}
