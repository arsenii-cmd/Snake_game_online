# 🚀 Быстрый старт

## Запуск за 30 секунд

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Автоматический запуск

**macOS/Linux:**
```bash
./scripts/START.sh
```

**Windows:**
```cmd
scripts\START_LOCAL.bat
```

## Мультиплеер

```bash
# Установка зависимостей
pip install -r requirements.txt

# Настройка
cp .env.example .env

# Запуск сервера
python server.py

# В другом терминале - запуск клиента
npm run dev
```

Подробнее: [docs/MULTIPLAYER.md](docs/MULTIPLAYER.md)

## Подробнее

- [README.md](README.md) - Полная документация
- [docs/](docs/) - Детальные инструкции
- [scripts/](scripts/) - Скрипты запуска
