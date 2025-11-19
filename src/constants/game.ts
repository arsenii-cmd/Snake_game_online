import { ColorScheme } from '../types/game';

export const GRID_SIZE = 20;
export const TILE_COUNT_X = 60;
export const TILE_COUNT_Y = 30;
export const CANVAS_WIDTH = TILE_COUNT_X * GRID_SIZE;
export const CANVAS_HEIGHT = TILE_COUNT_Y * GRID_SIZE;

export const MAX_PLAYERS = 8;
export const MAX_PARTICLES = 150; // Уменьшено для производительности
export const MAX_BULLETS = 20;
export const MAX_FOODS = 8;

export const GAME_SPEED = 100; // ms между обновлениями

export const COLOR_PALETTE: ColorScheme[] = [
  { head: '#4CAF50', body: '#388E3C', particle: 'hsla(120, 100%, 50%, 1)' },
  { head: '#2196F3', body: '#0D47A1', particle: 'hsla(200, 100%, 50%, 1)' },
  { head: '#FF9800', body: '#EF6C00', particle: 'hsla(40, 100%, 50%, 1)' },
  { head: '#E91E63', body: '#AD1457', particle: 'hsla(330, 100%, 50%, 1)' },
  { head: '#9C27B0', body: '#6A1B9A', particle: 'hsla(280, 100%, 50%, 1)' },
  { head: '#00BCD4', body: '#00838F', particle: 'hsla(180, 100%, 50%, 1)' },
  { head: '#FF5722', body: '#D84315', particle: 'hsla(15, 100%, 50%, 1)' },
  { head: '#666666', body: '#333333', particle: 'hsla(0, 0%, 50%, 1)' }
];

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};
