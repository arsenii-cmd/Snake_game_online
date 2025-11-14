# Развертывание проекта

## Локальное развертывание

### Шаг 1: Клонирование
```bash
git clone <repository-url>
cd snake-multiplayer
```

### Шаг 2: Установка зависимостей
```bash
pip install -r requirements.txt
```

### Шаг 3: Запуск
```bash
python server.py
```

### Шаг 4: Открытие игры
Откройте `index.html` в браузере

## Развертывание на сервере

### VPS/Dedicated Server

1. Подключитесь к серверу
2. Установите Python 3.7+
3. Клонируйте проект
4. Установите зависимости
5. Настройте файервол
6. Запустите сервер

### Heroku

Создайте файлы:

**Procfile:**
```
web: python server.py
```

**runtime.txt:**
```
python-3.11.0
```

Деплой:
```bash
heroku create snake-game
git push heroku main
```

### Docker

**Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8765
CMD ["python", "server.py"]
```

Запуск:
```bash
docker build -t snake-server .
docker run -p 8765:8765 snake-server
```

## Настройка для продакшена

1. Измените host на "0.0.0.0"
2. Настройте SSL/TLS
3. Добавьте rate limiting
4. Настройте логирование
5. Добавьте мониторинг

Подробнее в README_MULTIPLAYER.md
