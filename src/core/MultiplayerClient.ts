import { Direction, GameMode } from '../types/game';

export type MultiplayerEventType = 
  | 'room_created'
  | 'room_joined'
  | 'player_joined'
  | 'player_left'
  | 'game_started'
  | 'game_state_update'
  | 'remote_input'
  | 'game_over'
  | 'error';

export interface MultiplayerEvent {
  type: MultiplayerEventType;
  [key: string]: any;
}

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<MultiplayerEventType, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor(private serverUrl: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
          console.log('✅ Подключено к серверу');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Ошибка парсинга сообщения:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket ошибка:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ Отключено от сервера');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      
      setTimeout(() => {
        this.connect().catch(() => {
          // Ошибка будет обработана в onclose
        });
      }, this.reconnectDelay);
    }
  }

  private handleMessage(data: MultiplayerEvent): void {
    const handlers = this.eventHandlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  on(eventType: MultiplayerEventType, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: MultiplayerEventType, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket не подключен');
    }
  }

  createRoom(playerName: string, gameMode: GameMode): void {
    const playerId = this.generatePlayerId();
    this.send({
      type: 'create_room',
      player_id: playerId,
      name: playerName,
      game_mode: gameMode
    });
  }

  joinRoom(roomCode: string, playerName: string): void {
    const playerId = this.generatePlayerId();
    this.send({
      type: 'join_room',
      room_code: roomCode,
      player_id: playerId,
      name: playerName
    });
  }

  startGame(): void {
    this.send({
      type: 'start_game'
    });
  }

  sendGameState(state: any): void {
    this.send({
      type: 'game_state',
      state
    });
  }

  sendPlayerInput(direction: Direction): void {
    this.send({
      type: 'player_input',
      direction
    });
  }

  sendGameOver(scores: any[]): void {
    this.send({
      type: 'game_over',
      scores
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
