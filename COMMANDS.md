# 🎮 Команды и горячие клавиши

## Запуск проекта

### Сервер
```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
python server.py

# Тестирование сервера
python test_server.py
```

### Клиент
```bash
# Просто откройте в браузере
index.html

# Или используйте локальный сервер
python -m http.server 8000
# Затем откройте: http://localhost:8000
```

## Управление в игре

### Игрок 1
| Клавиша | Действие |
|---------|----------|
| W / Ц | Вверх |
| S / Ы | Вниз |
| A / Ф | Влево |
| D / В | Вправо |

### Игрок 2
| Клавиша | Действие |
|---------|----------|
| Y / Н | Вверх |
| H / Р | Вниз |
| G / П | Влево |
| J / О | Вправо |

### Игрок 3
| Клавиша | Действие |
|---------|----------|
| P / З | Вверх |
| ; / Ж | Вниз |
| L / Д | Влево |
| ' / Э | Вправо |

### Игрок 4
| Клавиша | Действие |
|---------|----------|
| ↑ | Вверх |
| ↓ | Вниз |
| ← | Влево |
| → | Вправо |

## Общие команды

| Клавиша | Действие |
|---------|----------|
| Esc | Пауза / Возобновление |
| ё / ` | Пауза / Возобновление |
| C / С | Полноэкранный режим |
| Enter | Подтверждение в меню |
| Tab | Переключение между элементами |

## Сенсорное управление

| Жест | Действие |
|------|----------|
| Свайп вверх | Движение вверх |
| Свайп вниз | Движение вниз |
| Свайп влево | Движение влево |
| Свайп вправо | Движение вправо |

## Команды сервера

### Запуск
```bash
python server.py
```

### Изменение порта
Отредактируйте `server.py`:
```python
port = 8765  # Измените на нужный порт
```

### Изменение хоста
Отредактируйте `server.py`:
```python
host = "localhost"    # Локальный доступ
host = "0.0.0.0"      # Доступ из сети
```

### Остановка сервера
```bash
Ctrl + C
```

## Команды тестирования

### Python тест
```bash
python test_server.py
```

### HTML тест
Откройте `test_connection.html` в браузере

## Команды разработки

### Проверка синтаксиса Python
```bash
python -m py_compile server.py
python -m py_compile test_server.py
```

### Запуск с отладкой
```bash
python -u server.py
```

### Просмотр логов
Логи выводятся в консоль в реальном времени

## Команды Git

### Клонирование проекта
```bash
git clone <repository-url>
cd snake-multiplayer
```

### Обновление проекта
```bash
git pull origin main
```

## Команды Docker (опционально)

### Создание образа
```bash
docker build -t snake-server .
```

### Запуск контейнера
```bash
docker run -p 8765:8765 snake-server
```

## Команды для Windows

### Установка Python
```powershell
# Скачайте с python.org
# Или используйте winget
winget install Python.Python.3.11
```

### Установка зависимостей
```powershell
pip install -r requirements.txt
```

### Запуск сервера
```powershell
python server.py
```

## Команды для Linux/Mac

### Установка Python
```bash
# Ubuntu/Debian
sudo apt install python3 python3-pip

# macOS
brew install python3
```

### Установка зависимостей
```bash
pip3 install -r requirements.txt
```

### Запуск сервера
```bash
python3 server.py
```

## Команды для настройки файервола

### Windows
```powershell
# Разрешить входящие соединения на порт 8765
netsh advfirewall firewall add rule name="Snake Server" dir=in action=allow protocol=TCP localport=8765
```

### Linux (UFW)
```bash
# Разрешить порт 8765
sudo ufw allow 8765/tcp
```

### Linux (iptables)
```bash
# Разрешить порт 8765
sudo iptables -A INPUT -p tcp --dport 8765 -j ACCEPT
```

### macOS
```bash
# Добавить правило в файервол
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/bin/python3
```

## Команды для проверки сети

### Проверка порта
```bash
# Windows
netstat -an | findstr 8765

# Linux/Mac
netstat -an | grep 8765
```

### Проверка подключения
```bash
# Windows
telnet localhost 8765

# Linux/Mac
nc -zv localhost 8765
```

### Узнать свой IP

#### Локальный IP
```bash
# Windows
ipconfig

# Linux
ip addr show

# macOS
ifconfig
```

#### Внешний IP
```bash
# Любая ОС
curl ifconfig.me
curl icanhazip.com
```

## Команды для отладки

### Проверка версии Python
```bash
python --version
python3 --version
```

### Проверка установленных пакетов
```bash
pip list
pip show websockets
```

### Проверка синтаксиса
```bash
python -m py_compile server.py
```

### Запуск с подробным выводом
```bash
python -v server.py
```

## Команды для производительности

### Мониторинг процессов
```bash
# Windows
tasklist | findstr python

# Linux/Mac
ps aux | grep python
```

### Мониторинг сети
```bash
# Windows
netstat -an | findstr 8765

# Linux/Mac
lsof -i :8765
```

## Быстрые команды

### Полный перезапуск
```bash
# Остановить сервер (Ctrl+C)
# Затем:
python server.py
```

### Очистка и перезапуск
```bash
# Остановить все процессы Python
# Windows
taskkill /F /IM python.exe

# Linux/Mac
pkill python

# Запустить снова
python server.py
```

## Команды для резервного копирования

### Создание бэкапа
```bash
# Создать архив
tar -czf snake-backup-$(date +%Y%m%d).tar.gz *.html *.py *.md *.txt

# Или ZIP
zip -r snake-backup-$(date +%Y%m%d).zip *.html *.py *.md *.txt
```

### Восстановление из бэкапа
```bash
# Из tar.gz
tar -xzf snake-backup-20240101.tar.gz

# Из ZIP
unzip snake-backup-20240101.zip
```

## Полезные алиасы

Добавьте в `.bashrc` или `.zshrc`:

```bash
# Быстрый запуск сервера
alias snake-server='cd /path/to/snake && python server.py'

# Быстрый тест
alias snake-test='cd /path/to/snake && python test_server.py'

# Быстрый запуск игры
alias snake-play='cd /path/to/snake && python -m http.server 8000'
```

## Команды для CI/CD

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python test_server.py
```

## Команды для документации

### Генерация документации
```bash
# Создать PDF из Markdown
pandoc README.md -o README.pdf

# Создать HTML из Markdown
pandoc README.md -o README.html
```

## Экстренные команды

### Убить зависший процесс
```bash
# Windows
taskkill /F /PID <process_id>

# Linux/Mac
kill -9 <process_id>
```

### Освободить порт
```bash
# Windows
netstat -ano | findstr :8765
taskkill /F /PID <process_id>

# Linux/Mac
lsof -ti:8765 | xargs kill -9
```

### Перезапуск сети
```bash
# Windows
ipconfig /release
ipconfig /renew

# Linux
sudo systemctl restart NetworkManager

# macOS
sudo ifconfig en0 down
sudo ifconfig en0 up
```
