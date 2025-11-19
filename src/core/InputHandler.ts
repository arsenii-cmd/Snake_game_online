import { Direction } from '../types/game';
import { DIRECTIONS } from '../constants/game';

export class InputHandler {
  private touchStart: { x: number; y: number } | null = null;
  private currentTouchPlayer: number = -1;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private onDirectionChange: (playerIndex: number, direction: Direction) => void,
    private onPause: () => void,
    private onShoot: (playerIndex: number) => void
  ) {
    this.keydownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.setupKeyboard();
    this.setupTouch();
  }

  private setupKeyboard(): void {
    document.addEventListener('keydown', this.keydownHandler);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Пауза
    if (e.key === 'Escape' || e.key === 'ё' || e.key === '`') {
      this.onPause();
      return;
    }

    // Полноэкранный режим
    if (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') {
      this.toggleFullscreen();
      return;
    }

    // Игрок 1 (WASD / ЦФЫВ)
    if (e.key === 'w' || e.key === 'W' || e.key === 'ц' || e.key === 'Ц') {
      this.onDirectionChange(0, DIRECTIONS.UP);
    } else if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
      this.onDirectionChange(0, DIRECTIONS.DOWN);
    } else if (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
      this.onDirectionChange(0, DIRECTIONS.LEFT);
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
      this.onDirectionChange(0, DIRECTIONS.RIGHT);
    }
    // Игрок 2 (YGHJ / НПРО)
    else if (e.key === 'y' || e.key === 'Y' || e.key === 'н' || e.key === 'Н') {
      this.onDirectionChange(1, DIRECTIONS.UP);
    } else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
      this.onDirectionChange(1, DIRECTIONS.DOWN);
    } else if (e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П') {
      this.onDirectionChange(1, DIRECTIONS.LEFT);
    } else if (e.key === 'j' || e.key === 'J' || e.key === 'о' || e.key === 'О') {
      this.onDirectionChange(1, DIRECTIONS.RIGHT);
    }
    // Игрок 3 (PL;' / ЗДЖЭ)
    else if (e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З') {
      this.onDirectionChange(2, DIRECTIONS.UP);
    } else if (e.key === ';' || e.key === ':' || e.key === 'ж' || e.key === 'Ж') {
      this.onDirectionChange(2, DIRECTIONS.DOWN);
    } else if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') {
      this.onDirectionChange(2, DIRECTIONS.LEFT);
    } else if (e.key === "'" || e.key === '"' || e.key === 'э' || e.key === 'Э') {
      this.onDirectionChange(2, DIRECTIONS.RIGHT);
    }
    // Игрок 4 (Стрелки)
    else if (e.key === 'ArrowUp') {
      this.onDirectionChange(3, DIRECTIONS.UP);
    } else if (e.key === 'ArrowDown') {
      this.onDirectionChange(3, DIRECTIONS.DOWN);
    } else if (e.key === 'ArrowLeft') {
      this.onDirectionChange(3, DIRECTIONS.LEFT);
    } else if (e.key === 'ArrowRight') {
      this.onDirectionChange(3, DIRECTIONS.RIGHT);
    }
    // Стрельба (пробел для всех игроков в режиме магического шутера)
    else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      // Пытаемся выстрелить для всех игроков (движок сам проверит, кто может стрелять)
      for (let i = 0; i < 4; i++) {
        this.onShoot(i);
      }
    }
  }

  private setupTouch(): void {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Определяем зону для мультитач (4 зоны на экране)
      const zoneX = x < rect.width / 2 ? 0 : 1;
      const zoneY = y < rect.height / 2 ? 0 : 1;
      const zone = zoneY * 2 + zoneX;
      
      this.currentTouchPlayer = zone;
      this.touchStart = { x, y };
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!this.touchStart || this.currentTouchPlayer === -1) return;

      const touch = e.changedTouches[0];
      const rect = this.canvas.getBoundingClientRect();
      const endX = touch.clientX - rect.left;
      const endY = touch.clientY - rect.top;
      
      const dx = endX - this.touchStart.x;
      const dy = endY - this.touchStart.y;

      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        this.currentTouchPlayer = -1;
        this.touchStart = null;
        return;
      }

      let direction: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
      } else {
        direction = dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
      }

      this.onDirectionChange(this.currentTouchPlayer, direction);
      
      // Вибрация для обратной связи
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      
      this.currentTouchPlayer = -1;
      this.touchStart = null;
      e.preventDefault();
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  destroy(): void {
    document.removeEventListener('keydown', this.keydownHandler);
  }
}
