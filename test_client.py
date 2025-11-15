import asyncio
import websockets
import json

async def test_connection():
    uri = "ws://localhost:8765"
    print(f"Подключение к {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Успешно подключено!")
            
            # Отправляем сообщение о подключении
            join_message = {
                "type": "join",
                "player_id": "test_player_123",
                "name": "Test Player from PowerShell"
            }
            
            print(f"Отправка: {join_message}")
            await websocket.send(json.dumps(join_message))
            
            # Получаем ответ от сервера
            response = await websocket.recv()
            print(f"✓ Получен ответ: {response}")
            
            # Отправляем обновление позиции
            update_message = {
                "type": "update",
                "data": {
                    "x": 100,
                    "y": 200,
                    "score": 10
                }
            }
            
            print(f"Отправка обновления: {update_message}")
            await websocket.send(json.dumps(update_message))
            
            # Держим соединение открытым и слушаем сообщения
            print("\nОжидание сообщений от сервера (Ctrl+C для выхода)...")
            async for message in websocket:
                print(f"Получено: {message}")
                
    except Exception as e:
        print(f"✗ Ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
