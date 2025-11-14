import asyncio
import websockets
import json
from datetime import datetime

# Хранилище подключенных игроков
connected_players = {}
game_state = {
    "players": {},
    "started": False
}

async def handle_client(websocket, path):
    player_id = None
    try:
        print(f"[{datetime.now()}] Новое подключение")
        
        async for message in websocket:
            data = json.loads(message)
            msg_type = data.get("type")
            
            if msg_type == "join":
                # Регистрация нового игрока
                player_id = data.get("player_id", str(len(connected_players)))
                player_name = data.get("name", f"Player_{player_id}")
                
                connected_players[player_id] = websocket
                game_state["players"][player_id] = {
                    "name": player_name,
                    "x": 0,
                    "y": 0,
                    "score": 0
                }
                
                # Отправляем подтверждение подключения
                await websocket.send(json.dumps({
                    "type": "joined",
                    "player_id": player_id,
                    "game_state": game_state
                }))
                
                # Уведомляем всех о новом игроке
                await broadcast({
                    "type": "player_joined",
                    "player_id": player_id,
                    "player": game_state["players"][player_id]
                }, exclude=player_id)
                
                print(f"[{datetime.now()}] Игрок {player_name} ({player_id}) подключился")
            
            elif msg_type == "update":
                # Обновление состояния игрока
                if player_id and player_id in game_state["players"]:
                    player_data = data.get("data", {})
                    game_state["players"][player_id].update(player_data)
                    
                    # Рассылаем обновление всем остальным
                    await broadcast({
                        "type": "player_update",
                        "player_id": player_id,
                        "data": player_data
                    }, exclude=player_id)
            
            elif msg_type == "action":
                # Игровое действие (выстрел, использование предмета и т.д.)
                await broadcast({
                    "type": "player_action",
                    "player_id": player_id,
                    "action": data.get("action"),
                    "data": data.get("data", {})
                }, exclude=player_id)
            
            elif msg_type == "chat":
                # Чат-сообщение
                await broadcast({
                    "type": "chat",
                    "player_id": player_id,
                    "message": data.get("message")
                })
    
    except websockets.exceptions.ConnectionClosed:
        print(f"[{datetime.now()}] Соединение закрыто")
    except Exception as e:
        print(f"[{datetime.now()}] Ошибка: {e}")
    finally:
        # Удаляем игрока при отключении
        if player_id and player_id in connected_players:
            del connected_players[player_id]
            if player_id in game_state["players"]:
                player_name = game_state["players"][player_id]["name"]
                del game_state["players"][player_id]
                
                # Уведомляем всех об отключении
                await broadcast({
                    "type": "player_left",
                    "player_id": player_id
                })
                
                print(f"[{datetime.now()}] Игрок {player_name} ({player_id}) отключился")

async def broadcast(message, exclude=None):
    """Отправка сообщения всем подключенным игрокам"""
    if connected_players:
        message_json = json.dumps(message)
        tasks = []
        for pid, ws in connected_players.items():
            if pid != exclude:
                tasks.append(ws.send(message_json))
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

async def main():
    host = "localhost"
    port = 8765
    
    print(f"Запуск сервера на ws://{host}:{port}")
    async with websockets.serve(handle_client, host, port):
        await asyncio.Future()  # Работает бесконечно

if __name__ == "__main__":
    asyncio.run(main())
