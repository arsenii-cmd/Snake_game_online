# 📁 Структура проекта

```
Snake_game_online/
│
├── 📄 README.md              # Главная документация
├── 📄 QUICKSTART.md          # Быстрый старт
├── 📄 PROJECT_STRUCTURE.md   # Этот файл
│
├── 🎮 index.html             # Точка входа приложения
├── 🐍 server.py              # WebSocket сервер для мультиплеера
├── 📦 package.json           # Зависимости Node.js
├── 📦 requirements.txt       # Зависимости Python
│
├── ⚙️ tsconfig.json          # Конфигурация TypeScript
├── ⚙️ tsconfig.node.json     # TypeScript для Node.js
├── ⚙️ vite.config.ts         # Конфигурация Vite
├── 📝 .gitignore             # Игнорируемые файлы
│
├── 📂 src/                   # Исходный код
│   ├── 📄 main.tsx           # Точка входа React
│   ├── 📄 App.tsx            # Главный компонент
│   │
│   ├── 📂 components/        # React компоненты
│   │   ├── MainMenu.tsx      # Главное меню
│   │   ├── GameSetup.tsx     # Настройка игры
│   │   ├── GameCanvas.tsx    # Canvas игры
│   │   ├── ScoreBoard.tsx    # Таблица счета
│   │   ├── PauseMenu.tsx     # Меню паузы
│   │   ├── GameOver.tsx      # Экран окончания
│   │   ├── Legend.tsx        # Легенда управления
│   │   ├── ModeIndicator.tsx # Индикатор режима
│   │   ├── EffectIndicator.tsx # Индикатор эффектов
│   │   └── ...               # Другие компоненты
│   │
│   ├── 📂 core/              # Игровая логика
│   │   ├── GameEngine.ts     # Движок игры
│   │   ├── Renderer.ts       # Canvas рендеринг
│   │   └── InputHandler.ts   # Обработка ввода
│   │
│   ├── 📂 types/             # TypeScript типы
│   │   └── game.ts           # Игровые типы
│   │
│   ├── 📂 constants/         # Константы
│   │   └── game.ts           # Игровые константы
│   │
│   └── 📂 styles/            # CSS стили
│       ├── app.css           # Основные стили
│       └── menu.css          # Стили меню
│
├── 📂 docs/                  # Документация
│   ├── 📄 README.md          # Обзор документации
│   ├── 📄 QUICKSTART.md      # Быстрый старт
│   ├── 📄 INSTALL.md         # Установка
│   ├── 📄 ARCHITECTURE.md    # Архитектура
│   ├── 📄 MIGRATION_GUIDE.md # Руководство по миграции
│   ├── 📄 FAQ.md             # Частые вопросы
│   ├── 📄 КАК_ИГРАТЬ.txt     # Правила (русский)
│   ├── 📄 ЗАПУСК СЕРВЕРА!!!.txt # Инструкция (русский)
│   └── 📄 index_old.html     # Старая версия
│
├── 📂 scripts/               # Скрипты запуска
│   ├── 📄 README.md          # Описание скриптов
│   ├── 🔧 START.sh           # Запуск (macOS/Linux)
│   ├── 🔧 START_LOCAL.bat    # Локальный запуск (Windows)
│   ├── 🔧 START_PUBLIC.bat   # Публичный запуск (Windows)
│   ├── 🔧 STOP_ALL_SERVERS.bat # Остановка серверов
│   └── 🔧 CHECK_FIREWALL.bat # Проверка файрвола
│
├── 📂 dist/                  # Продакшн сборка (создается при npm run build)
└── 📂 node_modules/          # Зависимости (создается при npm install)
```

## Основные файлы

### Корневая директория
- **README.md** - главная документация проекта
- **QUICKSTART.md** - инструкция для быстрого старта
- **index.html** - HTML точка входа
- **server.py** - WebSocket сервер для мультиплеера
- **package.json** - npm зависимости и скрипты
- **requirements.txt** - Python зависимости

### Конфигурация
- **tsconfig.json** - настройки TypeScript компилятора
- **vite.config.ts** - настройки Vite сборщика
- **.gitignore** - файлы, игнорируемые Git

### Исходный код (src/)
- **main.tsx** - точка входа React приложения
- **App.tsx** - главный React компонент
- **components/** - UI компоненты
- **core/** - игровая логика (движок, рендеринг, ввод)
- **types/** - TypeScript определения типов
- **constants/** - константы игры
- **styles/** - CSS стили

### Документация (docs/)
Вся документация проекта, включая:
- Руководства по установке и запуску
- Описание архитектуры
- Руководство по миграции
- FAQ
- Старая версия игры

### Скрипты (scripts/)
Автоматические скрипты для запуска игры и серверов

## Команды

```bash
# Разработка
npm install          # Установка зависимостей
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр сборки

# Мультиплеер
pip install -r requirements.txt  # Установка Python зависимостей
python server.py                 # Запуск WebSocket сервера

# Автоматический запуск
./scripts/START.sh              # macOS/Linux
scripts\START_LOCAL.bat         # Windows
```

## Размеры

- **Исходный код**: ~50 файлов
- **Документация**: ~15 файлов
- **Скрипты**: ~7 файлов
- **Общий размер** (без node_modules): ~2 MB
- **С зависимостями**: ~200 MB

## Технологии

- **Frontend**: React 18, TypeScript 5, Vite 5, Canvas API
- **Backend**: Python 3.7+, WebSocket
- **Стили**: CSS3 с градиентами и анимациями
- **Сборка**: Vite (быстрая HMR разработка)
