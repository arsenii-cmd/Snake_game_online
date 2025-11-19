#!/bin/bash

echo "🐍 Змейка - Запуск новой версии"
echo "================================"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "Установите Node.js с https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"
echo ""

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен!"
    exit 1
fi

echo "✅ npm версия: $(npm -v)"
echo ""

# Переход в корневую директорию проекта
cd "$(dirname "$0")/.."

# Установка зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    echo ""
fi

# Запуск
echo "🚀 Запуск игры..."
echo "Откройте http://localhost:3000 в браузере"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

npm run dev
