"""
Тестовый клиент для проверки работы сервера
"""
import asyncio
import websockets
import json

async def test_client():
    uri = "ws://localhost:8765"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Подключено к серверу")
            
            # Отправляем запрос на присоединение
            join_message = {
                "type": "join",
                "player_id": "test_player_1",
                "name": "Тестовый игрок"
            }
            await websocket.send(json.dumps(join_message))
            print(f"→ Отправлено: {join_message}")
            
            # Получаем ответ
            response = await websocket.recv()
            data = json.loads(response)
            print(f"← Получено: {data}")
            
            if data.get("type") == "joined":
                print("✓ Успешно присоединились к игре")
                print(f"  ID игрока: {data.get('player_id')}")
                
                # Отправляем обновление позиции
                update_message = {
                    "type": "update",
                    "data": {
                        "x": 10,
                        "y": 15,
                        "score": 50
                    }
                }
                await websocket.send(json.dumps(update_message))
                print(f"→ Отправлено обновление: {update_message}")
                
                # Ждем немного
                await asyncio.sleep(1)
                
                print("✓ Тест пройден успешно!")
            else:
                print("✗ Неожиданный ответ от сервера")
                
    except ConnectionRefusedError:
        print("✗ Не удалось подключиться к серверу")
        print("  Убедитесь, что сервер запущен: python server.py")
    except Exception as e:
        print(f"✗ Ошибка: {e}")

if __name__ == "__main__":
    print("Тестирование сервера мультиплеера...")
    print("-" * 50)
    asyncio.run(test_client())
