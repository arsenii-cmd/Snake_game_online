import { GameState, Player, Position, Direction, Food, GameMode, BotStrategy, SpecialEffect } from '../types/game';
import { TILE_COUNT_X, TILE_COUNT_Y, MAX_FOODS, MAX_PARTICLES, MAX_BULLETS, COLOR_PALETTE, GRID_SIZE } from '../constants/game';

export class GameEngine {
  private state: GameState;
  private botMemory: Map<number, any> = new Map();
  private lastGhostActivation: number = 0;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      players: [],
      foods: [],
      particles: [],
      bullets: [],
      gameMode: 'classic',
      running: false,
      paused: false
    };
  }

  getState(): GameState {
    return this.state;
  }

  initGame(humanCount: number, botCount: number, gameMode: GameMode, controls: string[]): void {
    this.state.players = [];
    this.state.foods = [];
    this.state.particles = [];
    this.state.bullets = [];
    this.state.gameMode = gameMode;
    this.state.running = true;
    this.state.paused = false;
    this.botMemory.clear();

    const totalPlayers = humanCount + botCount;

    for (let i = 0; i < totalPlayers; i++) {
      const startPos = this.getStartPos(i);
      const initialDir = this.getInitialDirection(startPos);
      
      const player: Player = {
        snake: {
          segments: [startPos],
          direction: initialDir,
          color: COLOR_PALETTE[i % COLOR_PALETTE.length],
          alive: true
        },
        score: 0,
        type: i < humanCount ? 'human' : 'bot',
        control: i < humanCount ? controls[i] as any : undefined,
        botStrategy: i >= humanCount ? this.getRandomBotStrategy() : undefined,
        isGhost: gameMode === 'all-ghosts' || (gameMode === 'full-ghost' && i < humanCount),
        ghostTimer: undefined,
        specialEffect: null,
        specialEffectTimer: undefined
      };

      this.state.players.push(player);
    }

    this.generateFood();
  }

  private getStartPos(index: number): Position {
    const perimeter: Position[] = [];
    for (let x = 5; x < TILE_COUNT_X - 5; x += 5) perimeter.push({ x, y: 5 });
    for (let y = 5; y < TILE_COUNT_Y - 5; y += 5) perimeter.push({ x: TILE_COUNT_X - 6, y });
    for (let x = TILE_COUNT_X - 6; x >= 5; x -= 5) perimeter.push({ x, y: TILE_COUNT_Y - 6 });
    for (let y = TILE_COUNT_Y - 6; y >= 5; y -= 5) perimeter.push({ x: 5, y });
    return perimeter[index % perimeter.length] || { x: 10 + index * 3, y: 10 };
  }

  private getInitialDirection(pos: Position): Direction {
    if (pos.x < 10) return { x: 1, y: 0 };
    if (pos.x > TILE_COUNT_X - 10) return { x: -1, y: 0 };
    if (pos.y < 10) return { x: 0, y: 1 };
    if (pos.y > TILE_COUNT_Y - 10) return { x: 0, y: -1 };
    return { x: 1, y: 0 };
  }

  private getRandomBotStrategy(): BotStrategy {
    const strategies = [
      BotStrategy.AGGRESSIVE,
      BotStrategy.CAUTIOUS,
      BotStrategy.RANDOM,
      BotStrategy.TERRITORIAL,
      BotStrategy.HUNTER
    ];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  update(): void {
    if (!this.state.running || this.state.paused) return;

    // Обновление ботов
    this.state.players.forEach((player, index) => {
      if (player.type === 'bot' && player.snake.alive) {
        this.botThink(index);
      }
    });

    // Движение змеек
    this.moveSnakes();

    // Обновление эффектов
    this.updateEffects();

    // Обновление частиц
    this.updateParticles();

    // Обновление пуль
    if (this.state.gameMode === 'magic-shooter') {
      this.updateBullets();
    }

    // Проверка окончания игры
    this.checkGameOver();

    // Генерация еды пропорционально количеству змеек
    const aliveSnakes = this.state.players.filter(p => p.snake.alive).length;
    const foodChance = Math.min(0.08, 0.02 + (aliveSnakes * 0.008)); // Базовый 2% + 0.8% за каждую змейку
    
    if (this.state.foods.length < MAX_FOODS && Math.random() < foodChance) {
      this.generateFood();
    }
  }

  private moveSnakes(): void {
    this.state.players.forEach((player, index) => {
      if (!player.snake.alive) return;

      const head = player.snake.segments[0];
      const dir = player.snake.direction;

      const newHead: Position = {
        x: (head.x + dir.x + TILE_COUNT_X) % TILE_COUNT_X,
        y: (head.y + dir.y + TILE_COUNT_Y) % TILE_COUNT_Y
      };

      // Проверка столкновений
      if (this.checkCollision(newHead, index)) {
        this.killPlayer(index);
        return;
      }

      player.snake.segments.unshift(newHead);

      // Проверка еды
      let ate = false;
      for (let i = 0; i < this.state.foods.length; i++) {
        const food = this.state.foods[i];
        if (food.x === newHead.x && food.y === newHead.y) {
          this.state.foods.splice(i, 1);
          ate = true;
          this.createParticles(newHead.x, newHead.y, player.snake.color.particle);
          
          if (this.state.gameMode === 'magic-shooter' && food.isSpecial) {
            this.applySpecialEffect(index, food.x, food.y);
          }
          break;
        }
      }

      if (!ate) {
        player.snake.segments.pop();
      }

      player.score = (player.snake.segments.length - 1) * 10;
    });
  }

  private checkCollision(pos: Position, playerIndex: number): boolean {
    const player = this.state.players[playerIndex];
    const hasInvulnerability = this.state.gameMode === 'magic-shooter' && 
                                player.specialEffect === SpecialEffect.INVULNERABILITY;

    // Проверка столкновения с другими змейками
    for (let i = 0; i < this.state.players.length; i++) {
      const other = this.state.players[i];
      if (!other.snake.alive) continue;

      for (let j = 0; j < other.snake.segments.length; j++) {
        const seg = other.snake.segments[j];
        
        // Пропускаем невидимые сегменты призраков
        if (other.isGhost && j > 0) {
          if (this.state.gameMode === 'half-ghost') {
            continue; // Полностью пропускаем хвост
          } else if (this.state.gameMode === 'family-ghost' || this.state.gameMode === 'all-ghosts') {
            // Хвост невидим но имеет хитбокс
          } else if (this.state.gameMode === 'full-ghost') {
            // Только другие призраки могут столкнуться с хвостом призрака
            if (player.isGhost) {
              if (seg.x === pos.x && seg.y === pos.y) return true;
            } else {
              continue;
            }
          }
        }

        if (seg.x === pos.x && seg.y === pos.y) {
          if (i === playerIndex && j === 0) continue; // Своя голова
          
          // Неуязвимость работает только против ДРУГИХ змеек, не против себя
          if (i === playerIndex && hasInvulnerability) {
            return true; // Умираем от себя даже с неуязвимостью
          }
          
          // Неуязвимость защищает от других змеек
          if (i !== playerIndex && hasInvulnerability) {
            continue; // Не умираем от других
          }
          
          return true;
        }
      }
    }

    return false;
  }

  private botThink(index: number): void {
    const player = this.state.players[index];
    if (!player.botStrategy) return;

    const head = player.snake.segments[0];
    const currentDir = player.snake.direction;
    const isHunter = player.botStrategy === BotStrategy.HUNTER;
    const isHunterActive = isHunter && player.snake.segments.length >= 80;

    // Инициализация памяти бота
    if (!this.botMemory.has(index)) {
      this.botMemory.set(index, {
        lastDirection: currentDir,
        turnCooldown: 0
      });
    }

    const memory = this.botMemory.get(index)!;
    memory.turnCooldown = Math.max(0, memory.turnCooldown - 1);

    // Получаем безопасные ходы
    const { safe, risky } = this.getSafeMoves(head, currentDir, index, isHunterActive);
    const candidates = safe.length > 0 ? safe : risky;

    if (candidates.length === 0) {
      // Если нет безопасных ходов, пробуем любое направление
      const allDirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
      ].filter(dir => !(dir.x === -currentDir.x && dir.y === -currentDir.y));
      
      if (allDirs.length > 0) {
        player.snake.direction = allDirs[0];
      }
      return;
    }

    // Охотник с длиной >= 80
    if (isHunterActive) {
      let target = null;
      let minDist = Infinity;

      // Ищем ближайшего игрока
      for (let i = 0; i < this.state.players.length; i++) {
        const p = this.state.players[i];
        if (p.type === 'human' && p.snake.alive) {
          const dist = this.manhattan(head, p.snake.segments[0]);
          if (dist < minDist) {
            minDist = dist;
            target = p.snake.segments[0];
          }
        }
      }

      if (target) {
        let bestOption = candidates[0];
        let bestScore = -Infinity;

        for (const option of candidates) {
          const nextPos = {
            x: (head.x + option.dir.x + TILE_COUNT_X) % TILE_COUNT_X,
            y: (head.y + option.dir.y + TILE_COUNT_Y) % TILE_COUNT_Y
          };

          const distScore = -this.manhattan(nextPos, target) * 1.5;
          const spaceScore = option.space.free * 0.7 + option.space.turns * 0.8;
          const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                                 option.dir.y !== memory.lastDirection.y) ? 5 : 0;

          const score = distScore + spaceScore + diversityScore;
          if (score > bestScore) {
            bestScore = score;
            bestOption = option;
          }
        }

        memory.lastDirection = bestOption.dir;
        player.snake.direction = bestOption.dir;
        return;
      }
    }

    // Поиск еды
    let targetFood = null;
    if (this.state.foods.length > 0) {
      targetFood = this.state.foods.reduce((closest, food) => {
        const distToFood = this.manhattan(head, food);
        const distToClosest = this.manhattan(head, closest);
        return distToFood < distToClosest ? food : closest;
      });
    }

    // Если еда рядом, берем ее
    if (targetFood && this.manhattan(head, targetFood) === 1) {
      const dx = Math.sign(targetFood.x - head.x);
      const dy = Math.sign(targetFood.y - head.y);
      const immediateDir = { x: dx, y: dy };

      const immediateOption = candidates.find(opt =>
        opt.dir.x === immediateDir.x && opt.dir.y === immediateDir.y
      );

      if (immediateOption) {
        memory.lastDirection = immediateOption.dir;
        player.snake.direction = immediateOption.dir;
        return;
      }
    }

    // Баланс стратегий
    const isAggressive = player.botStrategy !== undefined && 
                         (player.botStrategy as number) === BotStrategy.AGGRESSIVE;
    const useGreedyFood = (isHunter && !isHunterActive) || isAggressive;

    if (targetFood && useGreedyFood) {
      let bestOption = candidates[0];
      let bestScore = -Infinity;

      for (const option of candidates) {
        const nextPos = {
          x: (head.x + option.dir.x + TILE_COUNT_X) % TILE_COUNT_X,
          y: (head.y + option.dir.y + TILE_COUNT_Y) % TILE_COUNT_Y
        };

        const distScore = -this.manhattan(nextPos, targetFood) * 2;
        const spaceScore = option.space.free * 0.5;
        const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                               option.dir.y !== memory.lastDirection.y) ? 3 : 0;

        const score = distScore + spaceScore + diversityScore;
        if (score > bestScore) {
          bestScore = score;
          bestOption = option;
        }
      }

      memory.lastDirection = bestOption.dir;
      player.snake.direction = bestOption.dir;
    } else if (targetFood) {
      // Остальные боты: баланс между едой и пространством
      let bestOption = candidates[0];
      let bestScore = -Infinity;

      for (const option of candidates) {
        const nextPos = {
          x: (head.x + option.dir.x + TILE_COUNT_X) % TILE_COUNT_X,
          y: (head.y + option.dir.y + TILE_COUNT_Y) % TILE_COUNT_Y
        };

        const foodScore = -this.manhattan(nextPos, targetFood) * 0.8;
        const spaceScore = option.space.free * 1.2 + option.space.turns * 0.7;
        const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                               option.dir.y !== memory.lastDirection.y) ? 5 : 0;

        const score = foodScore + spaceScore + diversityScore;
        if (score > bestScore) {
          bestScore = score;
          bestOption = option;
        }
      }

      memory.lastDirection = bestOption.dir;
      player.snake.direction = bestOption.dir;
    } else {
      // Нет еды - движение с оценкой пространства
      let bestOption = candidates[0];
      let bestScore = -Infinity;

      for (const option of candidates) {
        const spaceScore = option.space.free * 1.2 + option.space.turns * 0.7;
        const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                               option.dir.y !== memory.lastDirection.y) ? 5 : 0;
        const randomFactor = Math.random() * 2;

        const score = spaceScore + diversityScore + randomFactor;
        if (score > bestScore) {
          bestScore = score;
          bestOption = option;
        }
      }

      memory.lastDirection = bestOption.dir;
      player.snake.direction = bestOption.dir;
    }

    // Отложенный поворот
    if (Math.random() < 0.15 && safe.length > 1 && memory.turnCooldown === 0) {
      const otherOptions = candidates.filter(opt =>
        !(opt.dir.x === currentDir.x && opt.dir.y === currentDir.y)
      );

      if (otherOptions.length > 0) {
        const randomOption = otherOptions[Math.floor(Math.random() * otherOptions.length)];
        memory.lastDirection = randomOption.dir;
        memory.turnCooldown = 3;
        player.snake.direction = randomOption.dir;
      }
    }
  }

  private manhattan(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getSafeMoves(head: Position, currentDir: Direction, playerIndex: number, isHunterActive: boolean) {
    const allDirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    const candidates = allDirs.filter(dir =>
      !(dir.x === -currentDir.x && dir.y === -currentDir.y)
    );

    const safe: Array<{ dir: Direction; space: { free: number; turns: number } }> = [];
    const risky: Array<{ dir: Direction; space: { free: number; turns: number } }> = [];

    for (const dir of candidates) {
      const nx = (head.x + dir.x + TILE_COUNT_X) % TILE_COUNT_X;
      const ny = (head.y + dir.y + TILE_COUNT_Y) % TILE_COUNT_Y;

      // Если есть столкновение, все равно добавляем как risky (последний шанс)
      if (this.checkCollision({ x: nx, y: ny }, playerIndex)) {
        risky.push({ dir, space: { free: 0, turns: 0 } });
        continue;
      }

      const space = this.getFreeSpace({ x: nx, y: ny }, dir, playerIndex);
      const minSpace = isHunterActive ? 1 : 2;

      if (space.free >= minSpace && space.turns > 0) {
        safe.push({ dir, space });
      } else {
        risky.push({ dir, space });
      }
    }

    return { safe, risky };
  }

  private getFreeSpace(pos: Position, dir: Direction, playerIndex: number, maxSteps: number = 5): { free: number; turns: number } {
    let currentPos = { ...pos };
    let free = 0;
    let turns = 0;

    for (let i = 0; i < maxSteps; i++) {
      currentPos = {
        x: (currentPos.x + dir.x + TILE_COUNT_X) % TILE_COUNT_X,
        y: (currentPos.y + dir.y + TILE_COUNT_Y) % TILE_COUNT_Y
      };

      if (this.checkCollision(currentPos, playerIndex)) break;
      free++;

      // Оцениваем повороты после 2 шагов
      if (i >= 2) {
        const nextDirs = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 }
        ].filter(d => !(d.x === -dir.x && d.y === -dir.y));

        for (const nextDir of nextDirs) {
          const nx = (currentPos.x + nextDir.x + TILE_COUNT_X) % TILE_COUNT_X;
          const ny = (currentPos.y + nextDir.y + TILE_COUNT_Y) % TILE_COUNT_Y;
          if (!this.checkCollision({ x: nx, y: ny }, playerIndex)) turns++;
        }
      }
    }

    return { free, turns };
  }

  private updateEffects(): void {
    const now = Date.now();

    this.state.players.forEach((player) => {
      if (player.specialEffectTimer && now >= player.specialEffectTimer) {
        player.specialEffect = null;
        player.specialEffectTimer = undefined;
      }

      if (player.ghostTimer && now >= player.ghostTimer) {
        player.isGhost = false;
        player.ghostTimer = undefined;
      }
    });

    // Управление режимами призраков
    if (this.state.gameMode === 'half-ghost' || this.state.gameMode === 'family-ghost') {
      if (now - this.lastGhostActivation > 10000 && Math.random() < 0.1) {
        this.activateRandomGhostMode();
        this.lastGhostActivation = now;
      }
    }
  }

  private activateRandomGhostMode(): void {
    const alivePlayers: number[] = [];
    const maxPlayers = this.state.gameMode === 'family-ghost' 
      ? this.state.players.length 
      : this.state.players.filter(p => p.type === 'human').length;

    for (let i = 0; i < maxPlayers; i++) {
      if (this.state.players[i] && this.state.players[i].snake.alive) {
        alivePlayers.push(i);
      }
    }

    if (alivePlayers.length === 0) return;

    const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    this.activateGhostMode(randomPlayer);
  }

  private activateGhostMode(playerIndex: number): void {
    const player = this.state.players[playerIndex];
    if (!player) return;

    player.isGhost = true;
    player.ghostTimer = Date.now() + 5000;

    // Визуальная индикация
    if (player.snake.segments[0]) {
      this.createParticles(
        player.snake.segments[0].x,
        player.snake.segments[0].y,
        player.snake.color.particle
      );
    }
  }

  private applySpecialEffect(playerIndex: number, foodX: number, foodY: number): void {
    console.log('🍎 applySpecialEffect called', { playerIndex, foodX, foodY });
    const player = this.state.players[playerIndex];
    if (!player) {
      console.log('❌ Player not found');
      return;
    }

    // Определяем тип эффекта
    const random = Math.random();
    let effect: SpecialEffect;
    
    if (random < 0.4) {
      effect = SpecialEffect.WEAPON;
    } else if (random < 0.8) {
      effect = SpecialEffect.INVULNERABILITY;
    } else {
      effect = SpecialEffect.DIARRHEA;
    }

    player.specialEffect = effect;
    player.specialEffectTimer = Date.now() + 10000;

    // Создаем визуальную индикацию с цветом эффекта
    const effectColors = {
      [SpecialEffect.WEAPON]: '#FFD700',
      [SpecialEffect.INVULNERABILITY]: '#4CC9F0',
      [SpecialEffect.DIARRHEA]: '#FF6B6B'
    };

    // Создаем больше частиц для эффекта в месте где было яблоко
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 2 + Math.random() * 4;
      
      this.state.particles.push({
        x: (foodX + 0.5) * GRID_SIZE,
        y: (foodY + 0.5) * GRID_SIZE,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Летят вверх
        life: 30,
        maxLife: 30,
        color: effectColors[effect]
      });
    }

    // Добавляем специальную частицу с эмодзи эффекта
    const effectEmojis = {
      [SpecialEffect.WEAPON]: '🔫',
      [SpecialEffect.INVULNERABILITY]: '🛡️',
      [SpecialEffect.DIARRHEA]: '💧'
    };

    // Создаем DOM элемент для эмодзи
    const emojiElement = document.createElement('div');
    emojiElement.textContent = effectEmojis[effect];
    
    // Позиционируем над местом где было яблоко
    const canvas = document.getElementById('game-board') as HTMLCanvasElement;
    const container = document.getElementById('game-container');
    
    if (canvas && container) {
      const rect = canvas.getBoundingClientRect();
      
      // Вычисляем позицию в canvas координатах
      const canvasX = (foodX + 0.5) * GRID_SIZE;
      const canvasY = (foodY + 0.5) * GRID_SIZE;
      
      // Масштабируем к экранным координатам
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      
      // Позиция относительно canvas
      const relativeX = canvasX * scaleX;
      const relativeY = canvasY * scaleY;
      
      console.log('🎯 Effect emoji positioning:', {
        foodX, foodY,
        canvasX, canvasY,
        'canvas.width': canvas.width,
        'canvas.height': canvas.height,
        'rect.width': rect.width,
        'rect.height': rect.height,
        scaleX, scaleY,
        relativeX, relativeY
      });
      
      emojiElement.style.cssText = `
        position: absolute;
        left: ${relativeX - 12}px;
        top: ${relativeY - 12}px;
        font-size: 24px;
        z-index: 1000;
        pointer-events: none;
        animation: effectFloat 2s ease-out forwards;
      `;
      
      container.appendChild(emojiElement);
    } else {
      console.log('❌ Canvas or container not found');
    }

    // Удаляем элемент через 2 секунды
    setTimeout(() => {
      if (emojiElement.parentNode) {
        emojiElement.parentNode.removeChild(emojiElement);
      }
    }, 2000);



    // Если эффект "Оружие", начинаем автоматическую стрельбу
    if (effect === SpecialEffect.WEAPON) {
      this.setupAutoShoot(playerIndex);
    }

    // Если эффект "Диарея", начинаем потерю сегментов
    if (effect === SpecialEffect.DIARRHEA) {
      this.setupDiarrhea(playerIndex);
    }
  }

  private updateParticles(): void {
    this.state.particles = this.state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    if (this.state.particles.length > MAX_PARTICLES) {
      this.state.particles = this.state.particles.slice(-MAX_PARTICLES);
    }
  }

  private updateBullets(): void {
    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const bullet = this.state.bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      bullet.life--;
      bullet.framesAlive++;

      if (bullet.x < 0 || bullet.x >= TILE_COUNT_X || 
          bullet.y < 0 || bullet.y >= TILE_COUNT_Y || 
          bullet.life <= 0) {
        this.state.bullets.splice(i, 1);
        continue;
      }

      // Проверка попадания
      for (let j = 0; j < this.state.players.length; j++) {
        const player = this.state.players[j];
        if (!player.snake.alive) continue;

        for (const seg of player.snake.segments) {
          if (seg.x === Math.floor(bullet.x) && seg.y === Math.floor(bullet.y)) {
            if (bullet.owner !== j && player.snake.segments.length > 1) {
              player.snake.segments.pop();
              this.createParticles(seg.x, seg.y, player.snake.color.particle);
            }
            this.state.bullets.splice(i, 1);
            break;
          }
        }
      }
    }
  }



  private setupAutoShoot(playerIndex: number): void {
    const shootInterval = setInterval(() => {
      const player = this.state.players[playerIndex];
      if (!player || !player.snake.alive || 
          player.specialEffect !== SpecialEffect.WEAPON) {
        clearInterval(shootInterval);
        return;
      }
      this.shoot(playerIndex);
    }, 1500);
    
    // Сохраняем интервал для возможной очистки
    if (!this.state.players[playerIndex]) return;
  }

  private setupDiarrhea(playerIndex: number): void {
    const diarrheaInterval = setInterval(() => {
      const player = this.state.players[playerIndex];
      if (!player || !player.snake.alive || 
          player.specialEffect !== SpecialEffect.DIARRHEA ||
          player.snake.segments.length <= 1) {
        clearInterval(diarrheaInterval);
        return;
      }
      
      const tail = player.snake.segments[player.snake.segments.length - 1];
      player.snake.segments.pop();
      this.createParticles(tail.x, tail.y, '#FF6B6B');
    }, 5000);
    
    // Сохраняем интервал для возможной очистки
    if (!this.state.players[playerIndex]) return;
  }

  changeDirection(playerIndex: number, direction: Direction): void {
    const player = this.state.players[playerIndex];
    if (!player || !player.snake.alive) return;

    const currentDir = player.snake.direction;
    if (direction.x === -currentDir.x && direction.y === -currentDir.y) return;

    player.snake.direction = direction;
  }

  shoot(playerIndex: number): void {
    const player = this.state.players[playerIndex];
    if (!player || !player.snake.alive || 
        player.specialEffect !== SpecialEffect.WEAPON ||
        this.state.bullets.length >= MAX_BULLETS) return;

    const head = player.snake.segments[0];
    const dir = player.snake.direction;

    this.state.bullets.push({
      x: head.x,
      y: head.y,
      vx: dir.x * 3,
      vy: dir.y * 3,
      owner: playerIndex,
      life: 20,
      framesAlive: 0
    });

    this.createParticles(head.x, head.y, '#FFD700');
  }

  private generateFood(): void {
    if (this.state.foods.length >= MAX_FOODS) return;

    let food: Food;
    let attempts = 0;
    
    do {
      food = {
        x: Math.floor(Math.random() * TILE_COUNT_X),
        y: Math.floor(Math.random() * TILE_COUNT_Y),
        isSpecial: this.state.gameMode === 'magic-shooter' && Math.random() < 0.3
      };
      attempts++;
    } while (this.isFoodOverlapping(food) && attempts < 100);

    if (attempts < 100) {
      this.state.foods.push(food);
    }
  }

  private isFoodOverlapping(food: Food): boolean {
    for (const player of this.state.players) {
      if (!player.snake.alive) continue;
      for (const seg of player.snake.segments) {
        if (seg.x === food.x && seg.y === food.y) return true;
      }
    }
    for (const existingFood of this.state.foods) {
      if (existingFood.x === food.x && existingFood.y === food.y) return true;
    }
    return false;
  }

  private createParticles(x: number, y: number, color: string): void {
    // Уменьшено количество частиц для производительности
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1 + Math.random() * 3;

      this.state.particles.push({
        x: (x + 0.5) * 20,
        y: (y + 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20, // Уменьшено время жизни
        maxLife: 20,
        color
      });
    }
  }

  private killPlayer(index: number): void {
    const player = this.state.players[index];
    if (!player.snake.alive) return;

    player.snake.alive = false;
    
    // Превращаем сегменты в еду
    player.snake.segments.forEach(seg => {
      this.state.foods.push({ x: seg.x, y: seg.y });
    });

    this.createParticles(
      player.snake.segments[0].x,
      player.snake.segments[0].y,
      player.snake.color.particle
    );
  }

  private checkGameOver(): void {
    const alivePlayers = this.state.players.filter(p => p.snake.alive);
    
    if (alivePlayers.length === 0 || 
        (this.state.players.length > 1 && alivePlayers.length === 1)) {
      this.state.running = false;
    }
  }

  pause(): void {
    this.state.paused = true;
  }

  resume(): void {
    this.state.paused = false;
  }

  stop(): void {
    this.state.running = false;
  }
}
