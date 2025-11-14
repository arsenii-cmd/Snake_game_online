# Мультиплеерный игровой сервер

## Установка

```bash
pip install -r requirements.txt
```

## Запуск сервера

```bash
python server.py
```

Сервер запустится на `ws://localhost:8765`

## Протокол обмена сообщениями

### От клиента к серверу:

**Подключение игрока:**
```json
{
  "type": "join",
  "player_id": "unique_id",
  "name": "Player Name"
}
```

**Обновление состояния игрока:**
```json
{
  "type": "update",
  "data": {
    "x": 100,
    "y": 200,
    "score": 50
  }
}
```

**Игровое действие:**
```json
{
  "type": "action",
  "action": "shoot",
  "data": {
    "direction": "up"
  }
}
```

**Чат:**
```json
{
  "type": "chat",
  "message": "Hello!"
}
```

### От сервера к клиенту:

**Подтверждение подключения:**
```json
{
  "type": "joined",
  "player_id": "your_id",
  "game_state": { ... }
}
```

**Новый игрок подключился:**
```json
{
  "type": "player_joined",
  "player_id": "player_id",
  "player": { ... }
}
```

**Обновление игрока:**
```json
{
  "type": "player_update",
  "player_id": "player_id",
  "data": { ... }
}
```

**Игрок отключился:**
```json
{
  "type": "player_left",
  "player_id": "player_id"
}
```

**Действие игрока:**
```json
{
  "type": "player_action",
  "player_id": "player_id",
  "action": "shoot",
  "data": { ... }
}
```

**Чат-сообщение:**
```json
{
  "type": "chat",
  "player_id": "player_id",
  "message": "Hello!"
}
```
