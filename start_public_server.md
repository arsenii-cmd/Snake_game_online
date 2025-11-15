# Запуск публичного сервера

## Шаг 1: Установите ngrok

1. Скачайте ngrok: https://ngrok.com/download
2. Распакуйте в папку проекта
3. Зарегистрируйтесь на ngrok.com и получите authtoken
4. Выполните: `ngrok authtoken YOUR_TOKEN`

## Шаг 2: Запустите серверы

Откройте 3 окна PowerShell:

### Окно 1 - WebSocket сервер
```powershell
python server.py
```

### Окно 2 - HTTP сервер
```powershell
python -m http.server 8000
```

### Окно 3 - ngrok для WebSocket
```powershell
ngrok http 8765
```

### Окно 4 - ngrok для HTTP (опционально)
```powershell
ngrok http 8000
```

## Шаг 3: Обновите адрес WebSocket в коде

После запуска ngrok вы получите URL типа: `https://abc123.ngrok.io`

Нужно изменить в index.html строку подключения:
```javascript
ws = new WebSocket('wss://abc123.ngrok.io'); // вместо ws://localhost:8765
```

## Альтернатива: Cloudflare Tunnel (рекомендуется)

```powershell
# Установка
winget install --id Cloudflare.cloudflared

# Запуск для HTTP
cloudflared tunnel --url http://localhost:8000

# Запуск для WebSocket (в другом окне)
cloudflared tunnel --url http://localhost:8765
```

Cloudflare автоматически поддерживает WebSocket!

## Важно!

- WebSocket URL должен начинаться с `wss://` (не `ws://`) для HTTPS туннелей
- Не забудьте обновить адрес в коде перед публикацией
- Бесплатные туннели могут иметь ограничения по времени работы
