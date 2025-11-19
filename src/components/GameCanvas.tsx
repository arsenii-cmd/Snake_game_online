import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../core/GameEngine';
import { Renderer } from '../core/Renderer';
import { InputHandler } from '../core/InputHandler';
import { GAME_SPEED } from '../constants/game';

interface GameCanvasProps {
  engine: GameEngine;
  onPause: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onPause }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Функция изменения размера canvas
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const maxWidth = Math.min(container.clientWidth, window.innerWidth - 16);
      const isLandscape = window.innerHeight < 500 && window.matchMedia('(orientation: landscape)').matches;
      const maxHeight = isLandscape 
        ? window.innerHeight - 40 
        : window.innerHeight - 120;

      const aspectRatio = 1200 / 600; // 2:1
      let width = maxWidth;
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    // Инициализация рендерера
    rendererRef.current = new Renderer(canvas);

    // Изменяем размер при монтировании
    resizeCanvas();

    // Debounce для resize
    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeCanvas, 100);
    };

    // Слушаем изменения размера окна
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', resizeCanvas);

    // Инициализация обработчика ввода
    inputHandlerRef.current = new InputHandler(
      canvas,
      (playerIndex, direction) => engine.changeDirection(playerIndex, direction),
      onPause,
      (playerIndex) => engine.shoot(playerIndex)
    );

    // Игровой цикл
    let lastUpdateTime = 0;
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastUpdateTime >= GAME_SPEED) {
        engine.update();
        lastUpdateTime = timestamp;
      }

      if (rendererRef.current) {
        rendererRef.current.render(engine.getState());
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (inputHandlerRef.current) {
        inputHandlerRef.current.destroy();
      }
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [engine, onPause]);

  return (
    <canvas
      id="game-board"
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        maxWidth: '1200px',
        maxHeight: '600px',
        backgroundColor: '#0d1b2a',
        borderRadius: '12px'
      }}
    />
  );
};
