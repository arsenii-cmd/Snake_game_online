export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export interface Snake {
  segments: Position[];
  direction: Direction;
  color: ColorScheme;
  alive: boolean;
}

export interface ColorScheme {
  head: string;
  body: string;
  particle: string;
}

export interface Food {
  x: number;
  y: number;
  isSpecial?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: number;
  life: number;
  framesAlive: number;
}

export type PlayerType = 'human' | 'bot';
export type ControlType = 'keyboard1' | 'keyboard2' | 'keyboard3' | 'keyboard4' | 'swipe';
export type GameMode = 'classic' | 'half-ghost' | 'family-ghost' | 'full-ghost' | 'all-ghosts' | 'magic-shooter';

export enum BotStrategy {
  AGGRESSIVE = 0,
  CAUTIOUS = 1,
  RANDOM = 2,
  TERRITORIAL = 3,
  HUNTER = 4
}

export enum SpecialEffect {
  WEAPON = 0,
  INVULNERABILITY = 1,
  DIARRHEA = 2
}

export interface Player {
  snake: Snake;
  score: number;
  type: PlayerType;
  control?: ControlType;
  botStrategy?: BotStrategy;
  isGhost?: boolean;
  ghostTimer?: number;
  specialEffect?: SpecialEffect | null;
  specialEffectTimer?: number;
}

export interface GameState {
  players: Player[];
  foods: Food[];
  particles: Particle[];
  bullets: Bullet[];
  gameMode: GameMode;
  running: boolean;
  paused: boolean;
}

export interface MultiplayerState {
  isMultiplayer: boolean;
  playerId: string | null;
  roomCode: string | null;
  ws: WebSocket | null;
  remotePlayers: Map<string, any>;
}
