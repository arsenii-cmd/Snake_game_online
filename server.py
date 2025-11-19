import asyncio
import websockets
import json
import random
import string
import os
from datetime import datetime
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Конфигурация из .env
SERVER_HOST = os.getenv('SERVER_HOST', 'localhost')
SERVER_PORT = int(os.getenv('SERVER_PORT', '8765'))

# Хранилище комнат
rooms = {}

def generate_room_code():
    """Генерирует уникальный код комнаты из 5 символов"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        if code not in rooms:
            return code

async def broadcast_to_room(room_code, message, exclude=None):
    """Отправка сообщения всем игрокам в комнате"""
    if room_code not in rooms:
        return
    
    room = rooms[room_code]
    message_json = json.dumps(message)
    tasks = []
    
    for pid, player in room["players"].items():
        if pid != exclude:
            tasks.append(player["websocket"].send(message_json))
    
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)

async def handle_client(websocket):
    player_id = None
    room_code = None
    
    try:
        print(f"[{datetime.now()}] Новое подключение")
        
        async for message in websocket:
            data = json.loads(message)
            msg_type = data.get("type")
            
            if msg_type == "create_room":
                # Создание новой комнаты
                room_code = generate_room_code()
                player_id = data.get("player_id", f"player_{random.randint(1000, 9999)}")
                player_name = data.get("name", f"Player_{player_id}")
                game_mode = data.get("game_mode", "classic")
                
                rooms[room_code] = {
                    "host": player_id,
                    "game_mode": game_mode,
                    "players": {
                        player_id: {
                            "websocket": websocket,
                            "name": player_name,
                            "data": {}
                        }
                    },
                    "started": False
                }
                
                await websocket.send(json.dumps({
                    "type": "room_created",
                    "room_code": room_code,
                    "player_id": player_id,
                    "game_mode": game_mode
                }))
                
                print(f"[{datetime.now()}] Комната {room_code} создана игроком {player_name} (режим: {game_mode})")
            
            elif msg_type == "join_room":
                # Присоединение к существующей комнате
                room_code = data.get("room_code", "").upper()
                player_id = data.get("player_id", f"player_{random.randint(1000, 9999)}")
                player_name = data.get("name", f"Player_{player_id}")
                
                if room_code not in rooms:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Комната не найдена"
                    }))
                    continue
                
                room = rooms[room_code]
                
                if room["started"]:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Игра уже началась"
                    }))
                    continue
                
                if len(room["players"]) >= 8:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Комната полна (макс. 8 игроков)"
                    }))
                    continue
                
                room["players"][player_id] = {
                    "websocket": websocket,
                    "name": player_name,
                    "data": {}
                }
                
                await websocket.send(json.dumps({
                    "type": "room_joined",
                    "room_code": room_code,
                    "player_id": player_id,
                    "host_id": room["host"],
                    "game_mode": room.get("game_mode", "classic"),
                    "players": {pid: {"name": p["name"]} for pid, p in room["players"].items()}
                }))
                
                # Уведомляем всех в комнате о новом игроке
                await broadcast_to_room(room_code, {
                    "type": "player_joined",
                    "player_id": player_id,
                    "player_name": player_name
                }, exclude=player_id)
                
                print(f"[{datetime.now()}] Игрок {player_name} присоединился к комнате {room_code}")
            
            elif msg_type == "game_state":
                # Синхронизация состояния игры (от хоста)
                if room_code and room_code in rooms:
                    room = rooms[room_code]
                    if player_id == room["host"]:
                        game_state = data.get("state", {})
                        
                        # Рассылаем состояние всем кроме хоста
                        await broadcast_to_room(room_code, {
                            "type": "game_state_update",
                            "state": game_state
                        }, exclude=player_id)
            
            elif msg_type == "player_input":
                # Ввод игрока (направление)
                if room_code and room_code in rooms:
                    direction = data.get("direction")
                    
                    # Отправляем хосту
                    room = rooms[room_code]
                    host = room["players"].get(room["host"])
                    if host:
                        await host["websocket"].send(json.dumps({
                            "type": "remote_input",
                            "player_id": player_id,
                            "direction": direction
                        }))
            
            elif msg_type == "start_game":
                # Начало игры (только хост)
                if room_code and room_code in rooms:
                    room = rooms[room_code]
                    if player_id == room["host"]:
                        room["started"] = True
                        
                        # Отправляем всем игрокам информацию о начале игры
                        players_list = []
                        for pid, pdata in room["players"].items():
                            players_list.append({
                                "player_id": pid,
                                "name": pdata["name"],
                                "is_host": pid == room["host"]
                            })
                        
                        await broadcast_to_room(room_code, {
                            "type": "game_started",
                            "players": players_list,
                            "game_mode": room.get("game_mode", "classic")
                        })
                        print(f"[{datetime.now()}] Игра началась в комнате {room_code} с {len(players_list)} игроками")
            
            elif msg_type == "game_over":
                # Окончание игры
                if room_code and room_code in rooms:
                    room = rooms[room_code]
                    if player_id == room["host"]:
                        final_scores = data.get("scores", [])
                        
                        await broadcast_to_room(room_code, {
                            "type": "game_over",
                            "scores": final_scores
                        })
                        
                        room["started"] = False
                        print(f"[{datetime.now()}] Игра завершена в комнате {room_code}")
    
    except websockets.exceptions.ConnectionClosed:
        print(f"[{datetime.now()}] Соединение закрыто")
    except Exception as e:
        print(f"[{datetime.now()}] Ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Удаляем игрока при отключении
        if room_code and room_code in rooms and player_id:
            room = rooms[room_code]
            if player_id in room["players"]:
                player_name = room["players"][player_id]["name"]
                del room["players"][player_id]
                
                # Уведомляем всех об отключении
                await broadcast_to_room(room_code, {
                    "type": "player_left",
                    "player_id": player_id
                })
                
                print(f"[{datetime.now()}] Игрок {player_name} ({player_id}) отключился от комнаты {room_code}")
                
                # Удаляем пустую комнату
                if len(room["players"]) == 0:
                    del rooms[room_code]
                    print(f"[{datetime.now()}] Комната {room_code} удалена (пустая)")

async def main():
    print(f"🚀 Запуск сервера на ws://{SERVER_HOST}:{SERVER_PORT}")
    async with websockets.serve(handle_client, SERVER_HOST, SERVER_PORT):
        await asyncio.Future()  # Работает бесконечно

if __name__ == "__main__":
    asyncio.run(main())
