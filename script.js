
  // Р“Р»РѕР±Р°Р»СЊРЅС‹Рµ РїРµСЂРµРјРµРЅРЅС‹Рµ РґР»СЏ СѓРїСЂР°РІР»РµРЅРёСЏ
  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const canvas = document.getElementById('game-board');
  const ctx = canvas.getContext('2d');
  const setupScreen = document.getElementById('setup-screen');
  const controlsScreen = document.getElementById('controls-screen');
  const gameContainer = document.getElementById('game-container');
  const startControlsBtn = document.getElementById('start-controls-btn');
  const startBtn = document.getElementById('start-btn');
  const backBtn = document.getElementById('back-btn');
  const errorMsg = document.getElementById('error-message');
  const scoresDiv = document.getElementById('scores');
  const legendDiv = document.getElementById('legend');
  const gameOverScreen = document.getElementById('game-over');
  const winnerDisplay = document.getElementById('winner');
  const finalScoresDiv = document.getElementById('final-scores');
  const selectedModeDisplay = document.getElementById('selected-mode-display');
  const modeIndicator = document.getElementById('mode-indicator');

  const gridSize = 20;
  const tileCountX = 60; // 1200 / 20
  const tileCountY = 30; // 600 / 20
  const MAX_PLAYERS = 8;
  const MAX_PARTICLES = 300;
  const MAX_BULLETS = 20;
  const MAX_FOODS = 8;

  // РЎРєРѕСЂРѕСЃС‚СЊ РёРіСЂС‹
  const gameSpeed = {
    updateInterval: 100, // РњРёР»Р»РёСЃРµРєСѓРЅРґ РјРµР¶РґСѓ РѕР±РЅРѕРІР»РµРЅРёСЏРјРё Р»РѕРіРёРєРё (10 СЂР°Р· РІ СЃРµРєСѓРЅРґСѓ)
    lastUpdateTime: 0
  };

  // РџРµСЂРµРјРµРЅРЅС‹Рµ РёРіСЂС‹
  let snakes = [];
  let directions = [];
  let scores = [];
  let colors = [];
  let playerTypes = [];
  let botStrategies = [];
  let foods = [];
  let particles = [];
  let gameRunning = false;
  let foodTimer = null;
  let totalPlayers = 0;
  let humanCount = 0;
  let playerControls = [];
  let botMemory = [];
  let lastGhostActivation = 0;

  // РџРµСЂРµРјРµРЅРЅС‹Рµ РґР»СЏ СЃРїРµС†РёР°Р»СЊРЅС‹С… СЂРµР¶РёРјРѕРІ
  let gameMode = 'classic';
  let isGhostMode = [];
  let ghostTimers = [];

  // РџРµСЂРµРјРµРЅРЅС‹Рµ РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
  const SPECIAL_EFFECTS = {
    WEAPON: 0,
    INVULNERABILITY: 1,
    DIARRHEA: 2
  };

  let specialFoodTimers = [];
  let specialEffectTypes = [];
  let bullets = [];
  let diarrheaTimers = [];
  let autoShootTimers = [];

  // РЎС‚СЂР°С‚РµРіРёРё Р±РѕС‚РѕРІ
  const BOT_STRATEGIES = {
    AGGRESSIVE: 0,
    CAUTIOUS: 1,
    RANDOM: 2,
    TERRITORIAL: 3,
    HUNTER: 4
  };

  const ALL_STRATEGIES = [
    BOT_STRATEGIES.AGGRESSIVE,
    BOT_STRATEGIES.CAUTIOUS,
    BOT_STRATEGIES.RANDOM,
    BOT_STRATEGIES.TERRITORIAL,
    BOT_STRATEGIES.HUNTER
  ];

  // Р¦РІРµС‚Р° РґР»СЏ РёРіСЂРѕРєРѕРІ
  const COLOR_PALETTE = [
    { head: '#4CAF50', body: '#388E3C', particle: 'hsla(120, 100%, 50%, 1)' },
    { head: '#2196F3', body: '#0D47A1', particle: 'hsla(200, 100%, 50%, 1)' },
    { head: '#FF9800', body: '#EF6C00', particle: 'hsla(40, 100%, 50%, 1)' },
    { head: '#E91E63', body: '#AD1457', particle: 'hsla(330, 100%, 50%, 1)' },
    { head: '#9C27B0', body: '#6A1B9A', particle: 'hsla(280, 100%, 50%, 1)' },
    { head: '#00BCD4', body: '#00838F', particle: 'hsla(180, 100%, 50%, 1)' },
    { head: '#FF5722', body: '#D84315', particle: 'hsla(15, 100%, 50%, 1)' },
    { head: '#666666', body: '#333333', particle: 'hsla(0, 0%, 50%, 1)' }
  ];

  // Р¤РЈРќРљР¦РР РРќРР¦РРђР›РР—РђР¦РР Р РЈРџР РђР’Р›Р•РќРРЇ

  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ Р·РІС‘Р·РґРЅРѕРіРѕ С„РѕРЅР°
  function createStarField() {
    const bg = document.getElementById('floating-bg');
    bg.innerHTML = '';
    const starsCount = Math.floor(window.innerWidth * window.innerHeight / 5000);
    for (let i = 0; i < starsCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      // РЎР»СѓС‡Р°Р№РЅС‹Р№ СЂР°Р·РјРµСЂ
      const size = Math.random() * 3;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      // РЎР»СѓС‡Р°Р№РЅРѕРµ РїРѕР»РѕР¶РµРЅРёРµ
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      // РЎР»СѓС‡Р°Р№РЅР°СЏ Р·Р°РґРµСЂР¶РєР° Р°РЅРёРјР°С†РёРё
      star.style.animationDelay = `${Math.random() * 4}s`;
      // РЎР»СѓС‡Р°Р№РЅР°СЏ СЏСЂРєРѕСЃС‚СЊ
      star.style.opacity = Math.random() * 0.8 + 0.2;
      bg.appendChild(star);
    }
  }

  // РР·РјРµРЅРµРЅРёРµ СЂР°Р·РјРµСЂР° canvas
  function resizeCanvas() {
    const container = canvas.parentElement;
    const displayWidth = container.clientWidth;
    const displayHeight = displayWidth * 0.5; // 2:1
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.width = 1200;
    canvas.height = 600;
  }

  // РџРѕР»СѓС‡РµРЅРёРµ РЅР°С‡Р°Р»СЊРЅРѕР№ РїРѕР·РёС†РёРё РґР»СЏ РёРіСЂРѕРєР°
  function getStartPos(index) {
    const perimeter = [];
    for (let x = 5; x < tileCountX - 5; x += 5) perimeter.push({x, y: 5});
    for (let y = 5; y < tileCountY - 5; y += 5) perimeter.push({x: tileCountX - 6, y});
    for (let x = tileCountX - 6; x >= 5; x -= 5) perimeter.push({x, y: tileCountY - 6});
    for (let y = tileCountY - 6; y >= 5; y -= 5) perimeter.push({x: 5, y});
    return perimeter[index % perimeter.length] || {x: 10 + index * 3, y: 10};
  }

  // РџСЂРѕРІРµСЂРєР°, СЏРІР»СЏРµС‚СЃСЏ Р»Рё РёРіСЂРѕРє РїСЂРёР·СЂР°РєРѕРј
  function isPlayerGhost(playerIndex) {
    if (gameMode === 'half-ghost' || gameMode === 'family-ghost') {
      return isGhostMode[playerIndex];
    } else if (gameMode === 'full-ghost') {
      return playerIndex < humanCount;
    } else if (gameMode === 'all-ghosts') {
      return true;
    }
    return false;
  }

  // РџСЂРѕРІРµСЂРєР° Р·Р°РЅСЏС‚РѕР№ РєР»РµС‚РєРё
  function isOccupied(x, y, checkingPlayer = null) {
    for (let i = 0; i < totalPlayers; i++) {
      if (!snakes[i]) continue;
      const isGhost = isPlayerGhost(i);

      for (let j = 0; j < snakes[i].length; j++) {
        const seg = snakes[i][j];

        // РџСЂРѕРІРµСЂРєР° РґР»СЏ СЂРµР¶РёРјРѕРІ РїСЂРёР·СЂР°РєР°
        if (isGhost && j > 0) {
          if (gameMode === 'half-ghost') {
            continue; // РџСЂРѕРїСѓСЃРєР°РµРј РЅРµРІРёРґРёРјС‹Рµ СЃРµРіРјРµРЅС‚С‹ Р±РµР· С…РёС‚Р±РѕРєСЃР°
          } else if (gameMode === 'family-ghost' || gameMode === 'all-ghosts') {
            // Р’ СЌС‚РёС… СЂРµР¶РёРјР°С… РЅРµРІРёРґРёРјС‹Рµ СЃРµРіРјРµРЅС‚С‹ СЃРѕС…СЂР°РЅСЏСЋС‚ С…РёС‚Р±РѕРєСЃ
          } else if (gameMode === 'full-ghost') {
            // Р’ СЌС‚РѕРј СЂРµР¶РёРјРµ С‚РѕР»СЊРєРѕ РґСЂСѓРіРёРµ РїСЂРёР·СЂР°РєРё РјРѕРіСѓС‚ СЃС‚РѕР»РєРЅСѓС‚СЊСЃСЏ СЃ С…РІРѕСЃС‚РѕРј РїСЂРёР·СЂР°РєР°
            if (checkingPlayer !== null && isPlayerGhost(checkingPlayer)) {
              if (seg.x === x && seg.y === y) return true;
            } else {
              continue;
            }
          }
        }

        // РџСЂРѕРІРµСЂРєР° РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
        if (gameMode === 'magic-shooter' && specialEffectTypes[i] === SPECIAL_EFFECTS.INVULNERABILITY && i === checkingPlayer) {
          if (i !== checkingPlayer) {
            continue;
          }
        }

        if (seg.x === x && seg.y === y) return true;
      }
    }
    return false;
  }

  // РћС†РµРЅРєР° СЃРІРѕР±РѕРґРЅРѕРіРѕ РїСЂРѕСЃС‚СЂР°РЅСЃС‚РІР° РІ РЅР°РїСЂР°РІР»РµРЅРёРё
  function getFreeSpace(head, dir, maxSteps = 5) {
    let pos = { x: head.x, y: head.y };
    let free = 0;
    let turns = 0;

    for (let i = 0; i < maxSteps; i++) {
      pos = {
        x: (pos.x + dir.x + tileCountX) % tileCountX,
        y: (pos.y + dir.y + tileCountY) % tileCountY
      };

      if (isOccupied(pos.x, pos.y)) break;
      free++;

      // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ РѕС†РµРЅРёРІР°РµРј РїРѕРІРѕСЂРѕС‚С‹ РїРѕСЃР»Рµ 2 С€Р°РіРѕРІ
      if (i >= 2) {
        const nextDirs = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 }
        ].filter(d => !(d.x === -dir.x && d.y === -dir.y));

        for (let nextDir of nextDirs) {
          const nx = (pos.x + nextDir.x + tileCountX) % tileCountX;
          const ny = (pos.y + nextDir.y + tileCountY) % tileCountY;
          if (!isOccupied(nx, ny)) turns++;
        }
      }
    }
    return { free, turns };
  }

  // РџРѕР»СѓС‡РµРЅРёРµ Р±РµР·РѕРїР°СЃРЅС‹С… С…РѕРґРѕРІ
  function getSafeMoves(head, currentDir, isHunterActive = false) {
    const allDirs = [
      { x: 0, y: -1 }, // РІРІРµСЂС…
      { x: 0, y: 1 },  // РІРЅРёР·
      { x: -1, y: 0 }, // РІР»РµРІРѕ
      { x: 1, y: 0 }   // РІРїСЂР°РІРѕ
    ];

    // РСЃРєР»СЋС‡Р°РµРј РїСЂРѕС‚РёРІРѕРїРѕР»РѕР¶РЅРѕРµ РЅР°РїСЂР°РІР»РµРЅРёРµ
    const candidates = allDirs.filter(dir =>
      !(dir.x === -currentDir.x && dir.y === -currentDir.y)
    );

    const safe = [];
    const risky = [];

    for (let dir of candidates) {
      const nx = (head.x + dir.x + tileCountX) % tileCountX;
      const ny = (head.y + dir.y + tileCountY) % tileCountY;

      if (isOccupied(nx, ny)) continue;

      // РћС†РµРЅРёРІР°РµРј РїСЂРѕСЃС‚СЂР°РЅСЃС‚РІРѕ СЃ РІРѕР·РјРѕР¶РЅС‹РјРё РїРѕРІРѕСЂРѕС‚Р°РјРё
      const space = getFreeSpace({x: nx, y: ny}, dir, 4);
      const minSpace = isHunterActive ? 1 : 2;

      if (space.free >= minSpace && space.turns > 0) {
        safe.push({ dir, space });
      } else {
        risky.push({ dir, space });
      }
    }
    return { safe, risky };
  }

  // Р Р°СЃС‡РµС‚ РјР°РЅС…СЌС‚С‚РµРЅСЃРєРѕРіРѕ СЂР°СЃСЃС‚РѕСЏРЅРёСЏ
  function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  // Р›РѕРіРёРєР° РґРІРёР¶РµРЅРёСЏ Р±РѕС‚РѕРІ
  function botThink(index) {
    if (!gameRunning || snakes[index] === null) return;
    const head = snakes[index][0];
    const currentDir = directions[index];
    const strategy = botStrategies[index];
    const isHunter = strategy === BOT_STRATEGIES.HUNTER;
    const isHunterActive = isHunter && snakes[index].length >= 80;
    const reaction = isHunterActive ? 95 : (isHunter ? 100 : 80);

    // Р’С‹СЃС‚СЂРµР»С‹ РІ СЂРµР¶РёРјРµ "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter' && specialEffectTypes[index] === SPECIAL_EFFECTS.WEAPON && Math.random() < 0.25) {
      const dir = directions[index];
      let distance = 1;
      let targetFound = false;

      while (distance <= 6 && !targetFound) {
        const checkX = (head.x + dir.x * distance + tileCountX) % tileCountX;
        const checkY = (head.y + dir.y * distance + tileCountY) % tileCountY;

        for (let i = 0; i < totalPlayers; i++) {
          if (i === index || snakes[i] === null) continue;

          for (let seg of snakes[i]) {
            if (seg.x === checkX && seg.y === checkY) {
              targetFound = true;
              break;
            }
          }
        }

        if (targetFound) {
          shootBullet(index);
        }
        distance++;
      }
    }

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РїР°РјСЏС‚Рё РґР»СЏ РёСЃС‚РѕСЂРёРё РЅР°РїСЂР°РІР»РµРЅРёР№
    if (!botMemory[index]) {
      botMemory[index] = {
        lastTurn: 0,
        turnCooldown: 0,
        lastDirection: currentDir
      };
    }

    const memory = botMemory[index];
    memory.turnCooldown = Math.max(0, memory.turnCooldown - 1);

    // РџРѕР»СѓС‡Р°РµРј Р±РµР·РѕРїР°СЃРЅС‹Рµ С…РѕРґС‹ СЃ СѓС‡РµС‚РѕРј Р±СѓРґСѓС‰РёС… РїРѕРІРѕСЂРѕС‚РѕРІ
    const { safe, risky } = getSafeMoves(head, currentDir, isHunterActive);
    const candidates = safe.length > 0 ? safe : risky;

    if (candidates.length === 0) return;

    // РћС…РѕС‚РЅРёРє СЃ РґР»РёРЅРѕР№ >= 80
    if (isHunterActive) {
      let target = null;
      let minDist = Infinity;

      // РЎРЅР°С‡Р°Р»Р° РёС‰РµРј РёРіСЂРѕРєРѕРІ
      for (let i = 0; i < humanCount; i++) {
        if (snakes[i] && snakes[i][0]) {
          const dist = manhattan(head, snakes[i][0]);
          if (dist < minDist) {
            minDist = dist;
            target = snakes[i][0];
          }
        }
      }

      // Р•СЃР»Рё РёРіСЂРѕРєРѕРІ РЅРµС‚, РѕС…РѕС‚РёРјСЃСЏ РЅР° Р±РѕС‚РѕРІ СЃ 50% С€Р°РЅСЃРѕРј
      if (!target && Math.random() < 0.5) {
        for (let i = humanCount; i < totalPlayers; i++) {
          if (i !== index && snakes[i] && snakes[i][0]) {
            const dist = manhattan(head, snakes[i][0]);
            if (dist < minDist) {
              minDist = dist;
              target = snakes[i][0];
            }
          }
        }
      }

      // Р”РІРёРіР°РµРјСЃСЏ Рє С†РµР»Рё СЃ РІРѕР·РјРѕР¶РЅС‹РјРё РїРѕРІРѕСЂРѕС‚Р°РјРё
      if (target) {
        let bestOption = candidates[0];
        let bestScore = -Infinity;

        for (const option of candidates) {
          const nextPos = {
            x: (head.x + option.dir.x + tileCountX) % tileCountX,
            y: (head.y + option.dir.y + tileCountY) % tileCountY
          };

          // РћСЃРЅРѕРІРЅРѕР№ РєСЂРёС‚РµСЂРёР№: СЂР°СЃСЃС‚РѕСЏРЅРёРµ РґРѕ С†РµР»Рё
          const distScore = -manhattan(nextPos, target) * 1.5;
          // РљСЂРёС‚РµСЂРёР№: СЃРІРѕР±РѕРґРЅРѕРµ РїСЂРѕСЃС‚СЂР°РЅСЃС‚РІРѕ Рё РІРѕР·РјРѕР¶РЅРѕСЃС‚СЊ РїРѕРІРѕСЂРѕС‚РѕРІ
          const spaceScore = option.space.free * 0.7 + option.space.turns * 0.8;
          // РљСЂРёС‚РµСЂРёР№: СЂР°Р·РЅРѕРѕР±СЂР°Р·РёРµ РґРІРёР¶РµРЅРёСЏ
          const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                                 option.dir.y !== memory.lastDirection.y) ? 5 : 0;

          // РћР±С‰РёР№ Р±Р°Р»Р»
          const score = distScore + spaceScore + diversityScore;
          if (score > bestScore) {
            bestScore = score;
            bestOption = option;
          }
        }

        // РћР±РЅРѕРІР»СЏРµРј РїР°РјСЏС‚СЊ
        memory.lastDirection = bestOption.dir;
        directions[index] = bestOption.dir;
        return;
      }

      // Р•СЃР»Рё РЅРµС‚ С†РµР»Рё вЂ” РґРІРёР¶РµРјСЃСЏ СЃ РјР°РєСЃРёРјР°Р»СЊРЅС‹Рј СЂР°Р·РЅРѕРѕР±СЂР°Р·РёРµРј
      let bestOption = candidates[0];
      let bestScore = -Infinity;

      for (const option of candidates) {
        const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                               option.dir.y !== memory.lastDirection.y) ? 10 : 0;
        const spaceScore = option.space.free * 0.8 + option.space.turns;
        const score = spaceScore + diversityScore;

        if (score > bestScore) {
          bestScore = score;
          bestOption = option;
        }
      }

      memory.lastDirection = bestOption.dir;
      directions[index] = bestOption.dir;
      return;
    }

    // РћСЃС‚Р°Р»СЊРЅС‹Рµ Р±РѕС‚С‹
    let targetFood = null;
    if (foods.length > 0) {
      targetFood = foods.reduce((a, b) => manhattan(head, a) < manhattan(head, b) ? a : b);
    }

    // Р•СЃР»Рё РµРґР° СЂСЏРґРѕРј, Р±РµСЂРµРј РµРµ
    if (targetFood && manhattan(head, targetFood) === 1) {
      const dx = targetFood.x - head.x;
      const dy = targetFood.y - head.y;
      const immediateDir = { x: dx, y: dy };

      const immediateOption = candidates.find(opt =>
        opt.dir.x === immediateDir.x && opt.dir.y === immediateDir.y
      );

      if (immediateOption) {
        memory.lastDirection = immediateOption.dir;
        directions[index] = immediateOption.dir;
        return;
      }
    }

    // Р‘Р°Р»Р°РЅСЃ СЃС‚СЂР°С‚РµРіРёР№
    const isHunterInactive = isHunter && !isHunterActive;
    const isAggressive = strategy === BOT_STRATEGIES.AGGRESSIVE;
    const useGreedyFood = isHunterInactive || isAggressive;

    if (targetFood && useGreedyFood) {
      let bestOption = candidates[0];
      let bestScore = -Infinity;

      for (const option of candidates) {
        const nextPos = {
          x: (head.x + option.dir.x + tileCountX) % tileCountX,
          y: (head.y + option.dir.y + tileCountY) % tileCountY
        };

        const distScore = -manhattan(nextPos, targetFood) * 2;
        const spaceScore = option.space.free * 0.5;
        const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                               option.dir.y !== memory.lastDirection.y) ? 3 : 0;

        const score = distScore + spaceScore + diversityScore;
        if (score > bestScore) {
          bestScore = score;
          bestOption = option;
        }
      }

      memory.lastDirection = bestOption.dir;
      directions[index] = bestOption.dir;
    }
    else if (targetFood) {
      // РћСЃС‚Р°Р»СЊРЅС‹Рµ Р±РѕС‚С‹: РѕС†РµРЅРёРІР°РµРј Рё СЂР°СЃСЃС‚РѕСЏРЅРёРµ РґРѕ РµРґС‹, Рё СЃРІРѕР±РѕРґРЅРѕРµ РїСЂРѕСЃС‚СЂР°РЅСЃС‚РІРѕ
      let bestOption = candidates[0];
      let bestScore = -Infinity;

      for (const option of candidates) {
        const nextPos = {
          x: (head.x + option.dir.x + tileCountX) % tileCountX,
          y: (head.y + option.dir.y + tileCountY) % tileCountY
        };

        const foodScore = -manhattan(nextPos, targetFood) * 0.8;
        const spaceScore = option.space.free * 1.2 + option.space.turns * 0.7;
        const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                               option.dir.y !== memory.lastDirection.y) ? 5 : 0;

        const score = foodScore + spaceScore + diversityScore;
        if (score > bestScore) {
          bestScore = score;
          bestOption = option;
        }
      }

      memory.lastDirection = bestOption.dir;
      directions[index] = bestOption.dir;
    }
    else {
      // РџСЂРё РѕС‚СЃСѓС‚СЃС‚РІРёРё РµРґС‹ Р±РѕС‚С‹ РѕС…РѕС‚СЏС‚СЃСЏ РЅР° РёРіСЂРѕРєРѕРІ РёР»Рё РґРІРёРіР°СЋС‚СЃСЏ РёР·РІРёР»РёСЃС‚Рѕ
      const isHunting = !isHunterInactive && Math.random() < 0.8;

      if (isHunting) {
        let targetPlayer = null;
        let minDist = Infinity;

        for (let i = 0; i < humanCount; i++) {
          if (snakes[i] && snakes[i][0]) {
            const dist = manhattan(head, snakes[i][0]);
            if (dist < minDist) {
              minDist = dist;
              targetPlayer = snakes[i][0];
            }
          }
        }

        if (targetPlayer) {
          let bestOption = candidates[0];
          let bestScore = -Infinity;

          for (const option of candidates) {
            const nextPos = {
              x: (head.x + option.dir.x + tileCountX) % tileCountX,
              y: (head.y + option.dir.y + tileCountY) % tileCountY
            };

            const distScore = -manhattan(nextPos, targetPlayer) * 1.2;
            const spaceScore = option.space.free * 0.6 + option.space.turns * 0.9;
            const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                                   option.dir.y !== memory.lastDirection.y) ? 7 : 0;

            const score = distScore + spaceScore + diversityScore;
            if (score > bestScore) {
              bestScore = score;
              bestOption = option;
            }
          }

          memory.lastDirection = bestOption.dir;
          directions[index] = bestOption.dir;
          return;
        }
      }

      // Р•СЃР»Рё РЅРµ РѕС…РѕС‚РёРјСЃСЏ РёР»Рё РёРіСЂРѕРєРѕРІ РЅРµС‚ вЂ” РґРІРёРіР°РµРјСЃСЏ РёР·РІРёР»РёСЃС‚Рѕ
      let bestOption = candidates[0];
      let bestScore = -Infinity;

      for (const option of candidates) {
        const randomFactor = Math.random() * (reaction / 50);
        const spaceScore = option.space.free * 0.9 + option.space.turns * 1.1;
        const diversityScore = (option.dir.x !== memory.lastDirection.x ||
                               option.dir.y !== memory.lastDirection.y) ? 8 : 0;

        const score = spaceScore + diversityScore + randomFactor;
        if (score > bestScore) {
          bestScore = score;
          bestOption = option;
        }
      }

      memory.lastDirection = bestOption.dir;
      directions[index] = bestOption.dir;
    }

    // РћС‚Р»РѕР¶РµРЅРЅС‹Р№ РїРѕРІРѕСЂРѕС‚: РёРЅРѕРіРґР° РјРµРЅСЏРµРј РЅР°РїСЂР°РІР»РµРЅРёРµ РґР°Р¶Рµ РµСЃР»Рё С‚РµРєСѓС‰РµРµ С…РѕСЂРѕС€РµРµ
    if (Math.random() < 0.15 && safe.length > 1 && memory.turnCooldown === 0) {
      const otherOptions = candidates.filter(opt =>
        !(opt.dir.x === currentDir.x && opt.dir.y === currentDir.y)
      );

      if (otherOptions.length > 0) {
        const randomOption = otherOptions[Math.floor(Math.random() * otherOptions.length)];
        memory.lastDirection = randomOption.dir;
        memory.turnCooldown = 3;
        directions[index] = randomOption.dir;
      }
    }
  }

  // РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РѕС‡РєРѕРІ СЃ РґР»РёРЅРѕР№ С…РІРѕСЃС‚Р°
  function syncScoreWithSnakeLength() {
    for (let i = 0; i < totalPlayers; i++) {
      if (snakes[i] !== null) {
        scores[i] = (snakes[i].length - 1) * 10;
      }
    }
  }

  // Р“РµРЅРµСЂР°С†РёСЏ РµРґС‹
  function generateFood() {
    if (foods.length >= MAX_FOODS || !gameRunning) return;

    let newFood;
    let overlapping;
    do {
      overlapping = false;
      newFood = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY),
        isSpecial: gameMode === 'magic-shooter' && Math.random() < 0.3
      };

      if (isOccupied(newFood.x, newFood.y)) overlapping = true;

      for (let f of foods) {
        if (f.x === newFood.x && f.y === newFood.y) {
          overlapping = true;
          break;
        }
      }
    } while (overlapping);

    foods.push(newFood);
  }

  // РЎРѕР·РґР°РЅРёРµ С‡Р°СЃС‚РёС†
  function createParticles(x, y, color) {
    if (particles.length > MAX_PARTICLES) return;

    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1 + Math.random() * 3;

      particles.push({
        x: (x + 0.5) * gridSize,
        y: (y + 0.5) * gridSize,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 25,
        maxLife: 25,
        color: color
      });
    }
  }

  // РћС‚СЂРёСЃРѕРІРєР° СЃРµС‚РєРё
  function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  // РћС‚СЂРёСЃРѕРІРєР° Р·РјРµР№РєРё
  function drawSnake(snake, headColor, bodyColor, playerIndex) {
    if (!snake) return;
    const isGhost = isPlayerGhost(playerIndex);

    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];

      // РќРµ СЂРёСЃСѓРµРј С…РІРѕСЃС‚ РІ СЂРµР¶РёРјР°С… РїСЂРёР·СЂР°РєР°
      if (isGhost && i > 0) {
        if (gameMode === 'half-ghost' || gameMode === 'family-ghost' ||
            gameMode === 'full-ghost' || gameMode === 'all-ghosts') {
          continue;
        }
      }

      // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј С†РІРµС‚ РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ СЂРµР¶РёРјР°
      let color = i === 0 ? headColor : bodyColor;

      // Р­С„С„РµРєС‚С‹ РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
      if (gameMode === 'magic-shooter' && i === 0) {
        if (specialEffectTypes[playerIndex] === SPECIAL_EFFECTS.WEAPON) {
          color = '#FFD700';
        } else if (specialEffectTypes[playerIndex] === SPECIAL_EFFECTS.INVULNERABILITY) {
          const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 100);
          color = `rgba(76, 201, 240, ${pulse})`;
        } else if (specialEffectTypes[playerIndex] === SPECIAL_EFFECTS.DIARRHEA) {
          color = '#FF6B6B';
        }
      }

      if (isGhost && i === 0) {
        // РџРѕР»СѓРїСЂРѕР·СЂР°С‡РЅР°СЏ РіРѕР»РѕРІР° РІ СЂРµР¶РёРјРµ РїСЂРёР·СЂР°РєР°
        if (color.startsWith('hsl')) {
          color = color.replace(')', ', 0.7)').replace('hsl', 'hsla');
        } else {
          color = 'rgba(255, 255, 255, 0.7)';
        }
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * gridSize + 1.5,
        seg.y * gridSize + 1.5,
        gridSize - 3,
        gridSize - 3,
        4
      );

      // Р“СЂР°РґРёРµРЅС‚ РґР»СЏ С‚РµР»Р° (РєСЂРѕРјРµ СЂРµР¶РёРјР° РїСЂРёР·СЂР°РєР°)
      if (i > 0 && !isGhost) {
        const gradient = ctx.createLinearGradient(
          seg.x * gridSize,
          seg.y * gridSize,
          (seg.x + 1) * gridSize,
          (seg.y + 1) * gridSize
        );
        gradient.addColorStop(0, bodyColor);
        gradient.addColorStop(1, headColor);
        ctx.fillStyle = gradient;
      }

      ctx.fill();

      // Р“Р»Р°Р·Р° РґР»СЏ РіРѕР»РѕРІС‹
      if (i === 0) {
        ctx.fillStyle = 'white';
        ctx.beginPath();

        // РћРїСЂРµРґРµР»СЏРµРј РїРѕР·РёС†РёСЋ РіР»Р°Р· РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ РЅР°РїСЂР°РІР»РµРЅРёСЏ
        const eyeOffset = 5;
        let eyeX1, eyeY1, eyeX2, eyeY2;

        if (directions[playerIndex].x === 1) { // РџСЂР°РІРѕ
          eyeX1 = seg.x * gridSize + gridSize - eyeOffset;
          eyeY1 = seg.y * gridSize + eyeOffset;
          eyeX2 = seg.x * gridSize + gridSize - eyeOffset;
          eyeY2 = seg.y * gridSize + gridSize - eyeOffset;
        } else if (directions[playerIndex].x === -1) { // Р›РµРІРѕ
          eyeX1 = seg.x * gridSize + eyeOffset;
          eyeY1 = seg.y * gridSize + eyeOffset;
          eyeX2 = seg.x * gridSize + eyeOffset;
          eyeY2 = seg.y * gridSize + gridSize - eyeOffset;
        } else if (directions[playerIndex].y === -1) { // Р’РІРµСЂС…
          eyeX1 = seg.x * gridSize + eyeOffset;
          eyeY1 = seg.y * gridSize + eyeOffset;
          eyeX2 = seg.x * gridSize + gridSize - eyeOffset;
          eyeY2 = seg.y * gridSize + eyeOffset;
        } else { // Р’РЅРёР·
          eyeX1 = seg.x * gridSize + eyeOffset;
          eyeY1 = seg.y * gridSize + gridSize - eyeOffset;
          eyeX2 = seg.x * gridSize + gridSize - eyeOffset;
          eyeY2 = seg.y * gridSize + gridSize - eyeOffset;
        }

        // Р РёСЃСѓРµРј РіР»Р°Р·Р°
        ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Р—СЂР°С‡РєРё
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, 0.8, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // РћС‚СЂРёСЃРѕРІРєР° РµРґС‹
  function drawFood() {
    for (let f of foods) {
      const isSpecial = f.isSpecial;
      const pulseSize = isSpecial ? 6 + Math.sin(Date.now() / 150) * 3 : 4 + Math.sin(Date.now() / 200) * 2;

      // Р РёСЃСѓРµРј РѕСЃРЅРѕРІРЅРѕР№ СЃР»РѕР№
      ctx.fillStyle = isSpecial ? '#9c27b0' : '#FF5252';
      ctx.beginPath();
      ctx.arc(
        (f.x + 0.5) * gridSize,
        (f.y + 0.5) * gridSize,
        pulseSize,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ СЌС„С„РµРєС‚С‹ РґР»СЏ Р·Р°С‡Р°СЂРѕРІР°РЅРЅРѕРіРѕ СЏР±Р»РѕРєР°
      if (isSpecial) {
        // РЎРёСЏРЅРёРµ РІРѕРєСЂСѓРі Р·Р°С‡Р°СЂРѕРІР°РЅРЅРѕРіРѕ СЏР±Р»РѕРєР°
        const glowSize = pulseSize * 1.5;
        const gradient = ctx.createRadialGradient(
          (f.x + 0.5) * gridSize, (f.y + 0.5) * gridSize, pulseSize,
          (f.x + 0.5) * gridSize, (f.y + 0.5) * gridSize, glowSize
        );
        gradient.addColorStop(0, 'rgba(156, 39, 176, 0.8)');
        gradient.addColorStop(1, 'rgba(156, 39, 176, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
          (f.x + 0.5) * gridSize,
          (f.y + 0.5) * gridSize,
          glowSize,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // РЎРёРјРІРѕР» РјР°РіРёРё
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('в…', (f.x + 0.5) * gridSize, (f.y + 0.5) * gridSize);
      } else {
        // Р‘Р»РёРє РЅР° РѕР±С‹С‡РЅРѕРј СЏР±Р»РѕРєРµ
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(
          (f.x + 0.5) * gridSize - 1,
          (f.y + 0.5) * gridSize - 1,
          1.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // РћС‚СЂРёСЃРѕРІРєР°
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    // Р РёСЃСѓРµРј С‡Р°СЃС‚РёС†С‹
    for (let p of particles) {
      const alpha = p.life / p.maxLife;
      let color;

      if (p.color.includes('hsla')) {
        color = p.color.replace(/[\d.]+\)$/, `${alpha})`);
      } else if (p.color.includes('hsl')) {
        color = p.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
      } else {
        color = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      }

      // Р“СЂР°РґРёРµРЅС‚ РґР»СЏ С‡Р°СЃС‚РёС†
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Р РёСЃСѓРµРј Р·РјРµРµРє
    for (let i = 0; i < totalPlayers; i++) {
      if (snakes[i] !== null) {
        drawSnake(snakes[i], colors[i].head, colors[i].body, i);
      }
    }

    drawFood();

    // Р РёСЃСѓРµРј РїСѓР»Рё РІ СЂРµР¶РёРјРµ "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter') {
      drawBullets();
    }
  }

  // Р РµР¶РёРј "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
  function shootBullet(playerIndex) {
    if (bullets.length > MAX_BULLETS || !gameRunning ||
        specialEffectTypes[playerIndex] !== SPECIAL_EFFECTS.WEAPON) return;

    const head = snakes[playerIndex][0];
    const direction = directions[playerIndex];

    // РЎРѕР·РґР°РµРј РїСѓР»СЋ
    const bullet = {
      x: head.x,
      y: head.y,
      vx: direction.x * 3,
      vy: direction.y * 3,
      owner: playerIndex,
      life: 20,
      framesAlive: 0
    };

    bullets.push(bullet);

    // Р’РёР·СѓР°Р»СЊРЅР°СЏ РёРЅРґРёРєР°С†РёСЏ РІС‹СЃС‚СЂРµР»Р°
    createParticles(head.x, head.y, '#FFD700');

    // Р—РІСѓРєРѕРІР°СЏ РёРЅРґРёРєР°С†РёСЏ (РІРёР±СЂР°С†РёСЏ)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  function updateBullets() {
    if (bullets.length > MAX_BULLETS) {
      bullets = bullets.slice(-MAX_BULLETS);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      // Р”РІРёР¶РµРЅРёРµ РїСѓР»Рё
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      bullet.life--;
      bullet.framesAlive++;

      // РџСЂРѕРІРµСЂРєР° РІС‹С…РѕРґР° Р·Р° РіСЂР°РЅРёС†С‹
      if (bullet.x < 0 || bullet.x >= tileCountX || bullet.y < 0 || bullet.y >= tileCountY) {
        bullets.splice(i, 1);
        continue;
      }

      // РџСЂРѕРІРµСЂРєР° РїРѕРїР°РґР°РЅРёСЏ РІ Р·РјРµР№РєСѓ
      for (let j = 0; j < totalPlayers; j++) {
        if (snakes[j] === null) continue;

        for (let k = 0; k < snakes[j].length; k++) {
          const seg = snakes[j][k];

          if (seg.x === Math.floor(bullet.x) && seg.y === Math.floor(bullet.y)) {
            // РџРѕРїР°РґР°РЅРёРµ! РЈРєРѕСЂР°С‡РёРІР°РµРј Р·РјРµР№РєСѓ
            if (snakes[j].length > 1 && bullet.owner !== j) {
              snakes[j].pop();
              createParticles(seg.x, seg.y, colors[bullet.owner].particle);
            }

            // Р•СЃР»Рё РїСѓР»СЏ РїРѕРїР°Р»Р° РІ РІР»Р°РґРµР»СЊС†Р°, Рё РѕРЅР° Р»РµС‚РµР»Р° РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РґРѕР»РіРѕ
            if (bullet.owner === j && bullet.framesAlive > 5 && snakes[j].length > 1) {
              snakes[j].pop();
              createParticles(seg.x, seg.y, '#FF6B6B');
            }

            // РЈРґР°Р»СЏРµРј РїСѓР»СЋ
            bullets.splice(i, 1);
            break;
          }
        }
      }

      // РЈРґР°Р»СЏРµРј РїСѓР»СЋ, РµСЃР»Рё РѕРЅР° РїСЂРѕС€Р»Р° РјР°РєСЃРёРјР°Р»СЊРЅРѕРµ СЂР°СЃСЃС‚РѕСЏРЅРёРµ
      if (bullet.life <= 0) {
        bullets.splice(i, 1);
      }
    }
  }

  function drawBullets() {
    for (let bullet of bullets) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(
        (bullet.x + 0.5) * gridSize,
        (bullet.y + 0.5) * gridSize,
        4,
        0,
        Math.PI * 2
      );

      // Р”РѕР±Р°РІР»СЏРµРј СЃР»РµРґ
      const trailGradient = ctx.createRadialGradient(
        (bullet.x + 0.5) * gridSize, (bullet.y + 0.5) * gridSize, 2,
        (bullet.x + 0.5) * gridSize, (bullet.y + 0.5) * gridSize, 8
      );
      trailGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      trailGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = trailGradient;
      ctx.arc(
        (bullet.x + 0.5) * gridSize,
        (bullet.y + 0.5) * gridSize,
        8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  function applySpecialEffect(playerIndex) {
    if (!gameRunning || gameMode !== 'magic-shooter') return;

    // РћРїСЂРµРґРµР»СЏРµРј С‚РёРї СЌС„С„РµРєС‚Р°
    const random = Math.random();
    let effectType;

    if (random < 0.4) {
      effectType = SPECIAL_EFFECTS.WEAPON;
    } else if (random < 0.8) {
      effectType = SPECIAL_EFFECTS.INVULNERABILITY;
    } else {
      effectType = SPECIAL_EFFECTS.DIARRHEA;
    }

    // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј СЌС„С„РµРєС‚
    specialEffectTypes[playerIndex] = effectType;
    specialFoodTimers[playerIndex] = Date.now() + 10000;

    // РЎРѕР·РґР°РµРј РІРёР·СѓР°Р»СЊРЅСѓСЋ РёРЅРґРёРєР°С†РёСЋ
    const effectColors = {
      [SPECIAL_EFFECTS.WEAPON]: '#FFD700',
      [SPECIAL_EFFECTS.INVULNERABILITY]: '#4CC9F0',
      [SPECIAL_EFFECTS.DIARRHEA]: '#FF6B6B'
    };

    createParticles(snakes[playerIndex][0].x, snakes[playerIndex][0].y, effectColors[effectType]);

    // Р•СЃР»Рё СЌС„С„РµРєС‚ "Р”РёР°СЂРµСЏ", РЅР°С‡РёРЅР°РµРј С‚Р°Р№РјРµСЂ РїРѕС‚РµСЂРё РєР»РµС‚РѕРє
    if (effectType === SPECIAL_EFFECTS.DIARRHEA) {
      if (diarrheaTimers[playerIndex]) {
        clearInterval(diarrheaTimers[playerIndex]);
      }

      diarrheaTimers[playerIndex] = setInterval(() => {
        if (snakes[playerIndex] && snakes[playerIndex].length > 1 &&
            specialEffectTypes[playerIndex] === SPECIAL_EFFECTS.DIARRHEA) {
          const tail = snakes[playerIndex][snakes[playerIndex].length - 1];
          snakes[playerIndex].pop();
          createParticles(tail.x, tail.y, '#FF6B6B');
        }
      }, 5000);
    }

    // РџРѕРєР°Р·С‹РІР°РµРј РёРЅРґРёРєР°С‚РѕСЂ СЌС„С„РµРєС‚Р°
    showEffectIndicator(playerIndex, effectType);
  }

  function showEffectIndicator(playerIndex, effectType) {
    let effectNames = {
      [SPECIAL_EFFECTS.WEAPON]: "РћСЂСѓР¶РёРµ",
      [SPECIAL_EFFECTS.INVULNERABILITY]: "РќРµСѓСЏР·РІРёРјРѕСЃС‚СЊ",
      [SPECIAL_EFFECTS.DIARRHEA]: "Р”РёР°СЂРµСЏ"
    };

    let icons = {
      [SPECIAL_EFFECTS.WEAPON]: "рџ”«",
      [SPECIAL_EFFECTS.INVULNERABILITY]: "рџ›ЎпёЏ",
      [SPECIAL_EFFECTS.DIARRHEA]: "рџ’§"
    };

    // РЈРґР°Р»СЏРµРј СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ РёРЅРґРёРєР°С‚РѕСЂ
    const existingIndicator = document.querySelector(`.effect-indicator`);
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // РЎРѕР·РґР°РµРј РЅРѕРІС‹Р№ РёРЅРґРёРєР°С‚РѕСЂ
    let effectIndicator = document.createElement('div');
    effectIndicator.className = 'effect-indicator';
    effectIndicator.innerHTML = `
      <span class="effect-icon">${icons[effectType]}</span>
      <span>${effectNames[effectType]} РґР»СЏ ${playerTypes[playerIndex] === 'bot' ? 'Р‘РѕС‚Р°' : 'РРіСЂРѕРєР°'} ${playerIndex + 1}</span>
      <span class="effect-timer">10 СЃРµРє</span>
    `;

    document.body.appendChild(effectIndicator);

    // РћР±РЅРѕРІР»СЏРµРј С‚Р°Р№РјРµСЂ
    let remainingTime = 10;
    const timerInterval = setInterval(() => {
      remainingTime--;
      const timerElement = effectIndicator.querySelector('.effect-timer');

      if (timerElement) {
        timerElement.textContent = `${remainingTime} СЃРµРє`;
      }

      if (remainingTime <= 0 || specialEffectTypes[playerIndex] !== effectType) {
        clearInterval(timerInterval);
        if (effectIndicator.parentNode) {
          effectIndicator.parentNode.removeChild(effectIndicator);
        }
      }
    }, 1000);

    // РЈРґР°Р»СЏРµРј РёРЅРґРёРєР°С‚РѕСЂ С‡РµСЂРµР· 10 СЃРµРєСѓРЅРґ
    setTimeout(() => {
      if (effectIndicator.parentNode) {
        effectIndicator.parentNode.removeChild(effectIndicator);
      }
      clearInterval(timerInterval);
    }, 10000);
  }

  function checkInvulnerabilityEnd(playerIndex) {
    if (specialEffectTypes[playerIndex] !== SPECIAL_EFFECTS.INVULNERABILITY) return;

    const head = snakes[playerIndex][0];

    // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё СЃС‚РѕР»РєРЅРѕРІРµРЅРёРµ СЃ РґСЂСѓРіРёРјРё Р·РјРµР№РєР°РјРё РёР»Рё СЃ СЃРѕР±РѕР№
    if (isOccupied(head.x, head.y, playerIndex)) {
      // Р•СЃР»Рё РµСЃС‚СЊ СЃС‚РѕР»РєРЅРѕРІРµРЅРёРµ, РѕР±СЂРµР·Р°РµРј Р·РјРµР№РєСѓ РґРѕ РїРµСЂРІРѕРіРѕ РїРµСЂРµСЃРµС‡РµРЅРёСЏ
      let collisionIndex = -1;

      for (let i = 1; i < snakes[playerIndex].length; i++) {
        const seg = snakes[playerIndex][i];

        if (isOccupied(seg.x, seg.y, playerIndex)) {
          collisionIndex = i;
          break;
        }
      }

      if (collisionIndex > 0) {
        // РћР±СЂРµР·Р°РµРј Р·РјРµР№РєСѓ
        const removedSegments = snakes[playerIndex].splice(0, collisionIndex);

        // Р”РѕР±Р°РІР»СЏРµРј РѕС‚СЂРµР·Р°РЅРЅС‹Рµ СЃРµРіРјРµРЅС‚С‹ РєР°Рє СЏР±Р»РѕРєРё
        for (let seg of removedSegments) {
          foods.push({ x: seg.x, y: seg.y });
        }

        createExplosion(snakes[playerIndex][0].x, snakes[playerIndex][0].y, colors[playerIndex].particle);
      }
    }
  }

  // РЈРїСЂР°РІР»РµРЅРёРµ СЂРµР¶РёРјР°РјРё "РџСЂРёР·СЂР°Рє"
  function manageGhostMode() {
    if (!gameRunning) return;

    if (gameMode === 'half-ghost' || gameMode === 'family-ghost') {
      const now = Date.now();

      // РђРєС‚РёРІР°С†РёСЏ СЂРµР¶РёРјР° РїСЂРёР·СЂР°РєР° СЃ СЂР°РЅРґРѕРјРЅС‹Рј РёРЅС‚РµСЂРІР°Р»РѕРј
      if (now - lastGhostActivation > 10000 && Math.random() < 0.1) {
        activateRandomGhostMode();
        lastGhostActivation = now;
      }

      // РџСЂРѕРІРµСЂРєР° С‚Р°Р№РјРµСЂРѕРІ РѕРєРѕРЅС‡Р°РЅРёСЏ СЂРµР¶РёРјР° РїСЂРёР·СЂР°РєР°
      const maxPlayers = gameMode === 'family-ghost' ? totalPlayers : humanCount;

      for (let i = 0; i < maxPlayers; i++) {
        if (isGhostMode[i] && ghostTimers[i] && now >= ghostTimers[i]) {
          deactivateGhostMode(i);
        }
      }
    }
  }

  function activateRandomGhostMode() {
    // Р’С‹Р±РёСЂР°РµРј СЃР»СѓС‡Р°Р№РЅРѕРіРѕ Р¶РёРІРѕРіРѕ РёРіСЂРѕРєР°
    const alivePlayers = [];
    const maxPlayers = gameMode === 'family-ghost' ? totalPlayers : humanCount;

    for (let i = 0; i < maxPlayers; i++) {
      if (snakes[i] !== null) alivePlayers.push(i);
    }

    if (alivePlayers.length === 0) return;

    const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    activateGhostMode(randomPlayer);
  }

  function activateGhostMode(playerIndex) {
    isGhostMode[playerIndex] = true;
    ghostTimers[playerIndex] = Date.now() + 5000;

    // Р’РёР·СѓР°Р»СЊРЅР°СЏ РёРЅРґРёРєР°С†РёСЏ Р°РєС‚РёРІР°С†РёРё
    if (snakes[playerIndex] && snakes[playerIndex][0]) {
      createParticles(snakes[playerIndex][0].x, snakes[playerIndex][0].y, colors[playerIndex].particle);
    }

    // Р—РІСѓРєРѕРІР°СЏ РёРЅРґРёРєР°С†РёСЏ (РІРёР±СЂР°С†РёСЏ)
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    updateScoreDisplay();
    updateModeIndicator();
  }

  function deactivateGhostMode(playerIndex) {
    isGhostMode[playerIndex] = false;
    ghostTimers[playerIndex] = null;

    // Р’РёР·СѓР°Р»СЊРЅР°СЏ РёРЅРґРёРєР°С†РёСЏ РґРµР°РєС‚РёРІР°С†РёРё
    if (snakes[playerIndex] && snakes[playerIndex][0]) {
      createParticles(snakes[playerIndex][0].x, snakes[playerIndex][0].y, colors[playerIndex].particle);
    }

    updateScoreDisplay();
    updateModeIndicator();
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ РёРЅРґРёРєР°С‚РѕСЂР° СЂРµР¶РёРјР°
  function updateModeIndicator() {
    if (!gameRunning) return;

    if (gameMode === 'half-ghost' || gameMode === 'family-ghost') {
      // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё Р°РєС‚РёРІРЅС‹Рµ РїСЂРёР·СЂР°РєРё
      let activeGhost = false;

      for (let i = 0; i < (gameMode === 'family-ghost' ? totalPlayers : humanCount); i++) {
        if (isGhostMode[i]) {
          activeGhost = true;
          break;
        }
      }

      if (activeGhost) {
        modeIndicator.textContent = 'рџ‘» Р РµР¶РёРј РїСЂРёР·СЂР°РєР° Р°РєС‚РёРІРµРЅ!';
        modeIndicator.style.display = 'block';
        modeIndicator.style.backgroundColor = 'rgba(156, 39, 176, 0.9)';
      } else {
        modeIndicator.style.display = 'none';
      }
    } else if (gameMode === 'full-ghost' || gameMode === 'all-ghosts') {
      modeIndicator.textContent = 'рџ‘» Р РµР¶РёРј РїСЂРёР·СЂР°РєР°';
      modeIndicator.style.display = 'block';
      modeIndicator.style.backgroundColor = 'rgba(156, 39, 176, 0.9)';
    } else if (gameMode === 'magic-shooter') {
      modeIndicator.textContent = 'вњЁ РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ';
      modeIndicator.style.display = 'block';
      modeIndicator.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
    } else {
      modeIndicator.style.display = 'none';
    }
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РѕС‡РєРѕРІ
  function updateScoreDisplay() {
    scoresDiv.innerHTML = '';
    legendDiv.innerHTML = '';

    for (let i = 0; i < totalPlayers; i++) {
      if (scores[i] > 0 || (playerTypes[i] === 'human' && i < humanCount)) {
        const name = playerTypes[i] === 'bot' ? `Р‘РѕС‚ ${i - humanCount + 1}` : `РРіСЂРѕРє ${i + 1}`;
        const scoreEl = document.createElement('div');

        // Р”РѕР±Р°РІР»СЏРµРј РёРЅРґРёРєР°С‚РѕСЂ С†РІРµС‚Р° РґР»СЏ РёРіСЂРѕРєР°
        const indicator = document.createElement('span');
        indicator.className = 'player-indicator';
        indicator.style.backgroundColor = colors[i].head;

        // Р”РѕР±Р°РІР»СЏРµРј РёРЅРґРёРєР°С‚РѕСЂ РїСЂРёР·СЂР°РєР°, РµСЃР»Рё РёРіСЂРѕРє РЅР°С…РѕРґРёС‚СЃСЏ РІ СЂРµР¶РёРјРµ РїСЂРёР·СЂР°РєР°
        let ghostIndicator = '';
        if (isPlayerGhost(i)) {
          ghostIndicator = '<span class="ghost-indicator"></span>';
        }

        scoreEl.innerHTML = `${indicator.outerHTML} ${name}: <strong>${scores[i]}</strong>${ghostIndicator}`;

        // Р”РѕР±Р°РІР»СЏРµРј РёРЅРґРёРєР°С‚РѕСЂ СЌС„С„РµРєС‚Р° РІ СЂРµР¶РёРјРµ РјР°РіРёС‡РµСЃРєРѕРіРѕ С€СѓС‚РµСЂР°
        if (gameMode === 'magic-shooter' && specialEffectTypes[i] !== null) {
          const effectIcon = document.createElement('span');
          effectIcon.style.marginLeft = '5px';
          effectIcon.style.fontSize = '16px';

          switch (specialEffectTypes[i]) {
            case SPECIAL_EFFECTS.WEAPON:
              effectIcon.textContent = 'рџ”«';
              effectIcon.title = 'РћСЂСѓР¶РёРµ';
              break;
            case SPECIAL_EFFECTS.INVULNERABILITY:
              effectIcon.textContent = 'рџ›ЎпёЏ';
              effectIcon.title = 'РќРµСѓСЏР·РІРёРјРѕСЃС‚СЊ';
              break;
            case SPECIAL_EFFECTS.DIARRHEA:
              effectIcon.textContent = 'рџ’§';
              effectIcon.title = 'Р”РёР°СЂРµСЏ';
              break;
          }

          scoreEl.appendChild(effectIcon);
        }

        scoresDiv.appendChild(scoreEl);

        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = colors[i].head;

        const label = document.createElement('span');
        label.textContent = name;

        const item = document.createElement('div');
        item.className = 'legend-item';
        item.appendChild(colorBox);
        item.appendChild(label);

        legendDiv.appendChild(item);
      }
    }
  }

  // РЎРѕР·РґР°РЅРёРµ РІР·СЂС‹РІР°
  function createExplosion(x, y, color) {
    if (particles.length > MAX_PARTICLES) return;

    const count = 25;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 2 + Math.random() * 5;

      particles.push({
        x: (x + 0.5) * gridSize,
        y: (y + 0.5) * gridSize,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color: color
      });
    }
  }

  // РЈР±РёР№СЃС‚РІРѕ РёРіСЂРѕРєР°
  function killPlayer(index) {
    if (snakes[index] === null) return;

    for (let seg of snakes[index]) {
      foods.push({ x: seg.x, y: seg.y });
    }

    snakes[index] = null;
    directions[index] = null;
    botMemory[index] = null;

    // РћС‡РёС‰Р°РµРј СЌС„С„РµРєС‚С‹ РґР»СЏ СѓР±РёС‚РѕРіРѕ РёРіСЂРѕРєР°
    if (gameMode === 'magic-shooter') {
      specialEffectTypes[index] = null;
      specialFoodTimers[index] = null;

      if (diarrheaTimers[index]) {
        clearInterval(diarrheaTimers[index]);
        diarrheaTimers[index] = null;
      }

      if (autoShootTimers[index]) {
        clearInterval(autoShootTimers[index]);
        autoShootTimers[index] = null;
      }
    }

    // РћС‡РёС‰Р°РµРј С‚Р°Р№РјРµСЂС‹ РїСЂРёР·СЂР°РєР°
    if (ghostTimers[index]) {
      ghostTimers[index] = null;
    }

    updateScoreDisplay();
    updateModeIndicator();
  }

  // РћРєРѕРЅС‡Р°РЅРёРµ РёРіСЂС‹
  function endGame() {
    gameRunning = false;

    // РћС‡РёС‰Р°РµРј РІСЃРµ С‚Р°Р№РјРµСЂС‹
    if (foodTimer) {
      clearInterval(foodTimer);
      foodTimer = null;
    }

    // РћС‡РёС‰Р°РµРј С‚Р°Р№РјРµСЂС‹ РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter') {
      for (let i = 0; i < MAX_PLAYERS; i++) {
        if (diarrheaTimers[i]) {
          clearInterval(diarrheaTimers[i]);
          diarrheaTimers[i] = null;
        }

        if (autoShootTimers[i]) {
          clearInterval(autoShootTimers[i]);
          autoShootTimers[i] = null;
        }
      }
    }

    // РћС‡РёС‰Р°РµРј С‚Р°Р№РјРµСЂС‹ РїСЂРёР·СЂР°РєРѕРІ
    for (let i = 0; i < MAX_PLAYERS; i++) {
      if (ghostTimers[i]) {
        ghostTimers[i] = null;
      }
    }

    // Р¤РѕСЂРјРёСЂСѓРµРј С‚Р°Р±Р»РёС†Сѓ СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ
    finalScoresDiv.innerHTML = '';
    const entries = [];

    for (let i = 0; i < totalPlayers; i++) {
      if (scores[i] >= 0) {
        const score = scores[i];
        const name = playerTypes[i] === 'bot'
          ? `Р‘РѕС‚ ${i - humanCount + 1}`
          : `РРіСЂРѕРє ${i + 1}`;
        const color = colors[i].head;
        const isAlive = snakes[i] !== null;

        entries.push({ score, name, color, isAlive });
      }
    }

    // РЎРѕСЂС‚РёСЂСѓРµРј РїРѕ РѕС‡РєР°Рј
    entries.sort((a, b) => b.score - a.score);

    entries.forEach(entry => {
      const html = `<div style="color: ${entry.color}">${entry.name}${entry.isAlive ? ' (Р¶РёРІ)' : ''}: ${entry.score}</div>`;
      finalScoresDiv.innerHTML += html;
    });

    // РћРїСЂРµРґРµР»СЏРµРј РїРѕР±РµРґРёС‚РµР»СЏ
    let aliveHumans = [];
    let aliveBots = [];

    for (let i = 0; i < totalPlayers; i++) {
      if (snakes[i] !== null) {
        if (playerTypes[i] === 'human') aliveHumans.push(`РРіСЂРѕРє ${i + 1}`);
        else aliveBots.push(`Р‘РѕС‚ ${i - humanCount + 1}`);
      }
    }

    if (aliveHumans.length > 0) {
      winnerDisplay.textContent = aliveHumans.length === 1 ? aliveHumans[0] : `РРіСЂРѕРєРё: ${aliveHumans.join(', ')}`;
    } else if (aliveBots.length > 0) {
      winnerDisplay.textContent = 'Р‘РѕС‚С‹ РїРѕР±РµРґРёР»Рё!';
    } else {
      winnerDisplay.textContent = 'РќРёС‡СЊСЏ';
    }

    setTimeout(() => gameOverScreen.classList.add('active'), 300);

    // Р—РІСѓРєРѕРІРѕР№ СЌС„С„РµРєС‚ Р·Р°РІРµСЂС€РµРЅРёСЏ РёРіСЂС‹
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // РџСЂРѕРІРµСЂРєР° РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё СЃРјРµРЅС‹ РЅР°РїСЂР°РІР»РµРЅРёСЏ
  function canChangeDirection(currentDir, newDir) {
    return !(currentDir.x === -newDir.x && currentDir.y === -newDir.y);
  }

  // РќР°СЃС‚СЂРѕР№РєР° СѓРїСЂР°РІР»РµРЅРёСЏ
  function setupControls() {
    document.removeEventListener('keydown', handleKeyDown);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchend', handleTouchEnd);

    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  // РћР±СЂР°Р±РѕС‚РєР° РЅР°Р¶Р°С‚РёР№ РєР»Р°РІРёС€
  function handleKeyDown(e) {
    if (!gameRunning) return;

    for (let i = 0; i < humanCount; i++) {
      if (snakes[i] === null) continue;

      const control = playerControls[i];
      let dir = null;

      if (control === 'keyboard1') {
        if (e.key === 'С†' || e.key === 'Р¦') dir = { x: 0, y: -1 };
        else if (e.key === 'С‹' || e.key === 'Р«') dir = { x: 0, y: 1 };
        else if (e.key === 'С„' || e.key === 'Р¤') dir = { x: -1, y: 0 };
        else if (e.key === 'РІ' || e.key === 'Р’') dir = { x: 1, y: 0 };
      } else if (control === 'keyboard2') {
        if (e.key === 'РЅ' || e.key === 'Рќ') dir = { x: 0, y: -1 };
        else if (e.key === 'СЂ' || e.key === 'Р ') dir = { x: 0, y: 1 };
        else if (e.key === 'Рї' || e.key === 'Рџ') dir = { x: -1, y: 0 };
        else if (e.key === 'Рѕ' || e.key === 'Рћ') dir = { x: 1, y: 0 };
      } else if (control === 'keyboard3') {
        if (e.key === 'Р·' || e.key === 'Р—') dir = { x: 0, y: -1 };
        else if (e.key === 'Р¶' || e.key === 'Р–') dir = { x: 0, y: 1 };
        else if (e.key === 'Рґ' || e.key === 'Р”') dir = { x: -1, y: 0 };
        else if (e.key === 'СЌ' || e.key === 'Р­') dir = { x: 1, y: 0 };
      } else if (control === 'keyboard4') {
        if (e.key === 'ArrowUp') dir = { x: 0, y: -1 };
        else if (e.key === 'ArrowDown') dir = { x: 0, y: 1 };
        else if (e.key === 'ArrowLeft') dir = { x: -1, y: 0 };
        else if (e.key === 'ArrowRight') dir = { x: 1, y: 0 };
      }

      if (dir && canChangeDirection(directions[i], dir)) {
        directions[i] = dir;

        // Р’РёР±СЂР°С†РёСЏ РґР»СЏ С‚Р°РєС‚РёР»СЊРЅРѕР№ РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё
        if (navigator.vibrate && isMobile) {
          navigator.vibrate(20);
        }
      }
    }
  }

  // РћР±СЂР°Р±РѕС‚РєР° СЃРµРЅСЃРѕСЂРЅС‹С… СЃРѕР±С‹С‚РёР№
  let touchStart = {};
  let currentTouchPlayer = -1;
  let lastTap = 0;

  function handleTouchStart(e) {
    if (!gameRunning) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const zoneX = x < rect.width / 2 ? 0 : 1;
    const zoneY = y < rect.height / 2 ? 0 : 1;
    const zone = zoneY * 2 + zoneX;

    if (playerControls[zone] === 'swipe' && zone < humanCount) {
      currentTouchPlayer = zone;
      touchStart.x = x;
      touchStart.y = y;
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (!gameRunning || currentTouchPlayer === -1) return;

    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const endX = touch.clientX - rect.left;
    const endY = touch.clientY - rect.top;
    const dx = endX - touchStart.x;
    const dy = endY - touchStart.y;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
      currentTouchPlayer = -1;
      return;
    }

    let dir = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      dir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }

    if (dir && canChangeDirection(directions[currentTouchPlayer], dir)) {
      directions[currentTouchPlayer] = dir;

      // Р’РёР±СЂР°С†РёСЏ РґР»СЏ РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }

    currentTouchPlayer = -1;
    e.preventDefault();
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ Рё Р°РЅРёРјР°С†РёСЏ
  function update() {
    if (!gameRunning) return;

    // РћРіСЂР°РЅРёС‡РµРЅРёСЏ РЅР° РјР°РєСЃРёРјР°Р»СЊРЅРѕРµ РєРѕР»РёС‡РµСЃС‚РІРѕ РѕР±СЉРµРєС‚РѕРІ
    if (particles.length > MAX_PARTICLES) {
      particles = particles.slice(-MAX_PARTICLES);
    }

    if (bullets.length > MAX_BULLETS) {
      bullets = bullets.slice(-MAX_BULLETS);
    }

    if (foods.length > MAX_FOODS) {
      foods = foods.slice(-MAX_FOODS);
    }

    // РћР±РЅРѕРІР»СЏРµРј СЃРѕСЃС‚РѕСЏРЅРёСЏ СЌС„С„РµРєС‚РѕРІ РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter') {
      const now = Date.now();

      for (let i = 0; i < totalPlayers; i++) {
        if (specialFoodTimers[i] && now >= specialFoodTimers[i]) {
          // РџСЂРѕРІРµСЂСЏРµРј РѕРєРѕРЅС‡Р°РЅРёРµ СЌС„С„РµРєС‚Р° РЅРµСѓСЏР·РІРёРјРѕСЃС‚Рё
          if (specialEffectTypes[i] === SPECIAL_EFFECTS.INVULNERABILITY) {
            checkInvulnerabilityEnd(i);
          }

          // РћС‡РёС‰Р°РµРј С‚Р°Р№РјРµСЂ РґРёР°СЂРµРё
          if (specialEffectTypes[i] === SPECIAL_EFFECTS.DIARRHEA && diarrheaTimers[i]) {
            clearInterval(diarrheaTimers[i]);
            diarrheaTimers[i] = null;
          }

          // РЎР±СЂР°СЃС‹РІР°РµРј СЌС„С„РµРєС‚
          specialEffectTypes[i] = null;
          specialFoodTimers[i] = null;
        }
      }

      // РћР±РЅРѕРІР»СЏРµРј РїСѓР»Рё
      updateBullets();
    }

    // РћР±РЅРѕРІР»СЏРµРј СЂРµР¶РёРјС‹ РїСЂРёР·СЂР°РєРѕРІ
    if (gameMode === 'half-ghost' || gameMode === 'family-ghost') {
      manageGhostMode();
    }

    // Р”РІРёР¶РµРЅРёРµ Р±РѕС‚РѕРІ
    for (let i = 0; i < totalPlayers; i++) {
      if (playerTypes[i] === 'bot' && snakes[i] !== null) {
        botThink(i);
      }
    }

    // Р”РІРёР¶РµРЅРёРµ РІСЃРµС… Р·РјРµРµРє
    for (let i = 0; i < totalPlayers; i++) {
      if (snakes[i] === null) continue;

      const head = {
        x: (snakes[i][0].x + directions[i].x + tileCountX) % tileCountX,
        y: (snakes[i][0].y + directions[i].y + tileCountY) % tileCountY
      };

      let shouldKill = true;

      // РњРѕРґРёС„РёС†РёСЂСѓРµРј РїСЂРѕРІРµСЂРєСѓ СЃС‚РѕР»РєРЅРѕРІРµРЅРёР№ РґР»СЏ СЂРµР¶РёРјР° РјР°РіРёС‡РµСЃРєРѕРіРѕ С€СѓС‚РµСЂР°
      if (gameMode === 'magic-shooter' && specialEffectTypes[i] === SPECIAL_EFFECTS.INVULNERABILITY) {
        // РџСЂРѕРІРµСЂСЏРµРј, СЃС‚Р°Р»РєРёРІР°РµС‚СЃСЏ Р»Рё РіРѕР»РѕРІР° СЃ РґСЂСѓРіРёРјРё Р·РјРµР№РєР°РјРё
        for (let j = 0; j < totalPlayers; j++) {
          if (j === i || snakes[j] === null) continue;

          for (let seg of snakes[j]) {
            if (seg.x === head.x && seg.y === head.y) {
              // Р•СЃР»Рё СЃС‚Р°Р»РєРёРІР°РµС‚СЃСЏ СЃ РґСЂСѓРіРѕР№ Р·РјРµР№РєРѕР№, СѓРјРёСЂР°РµС‚ РґСЂСѓРіР°СЏ Р·РјРµР№РєР°
              createExplosion(seg.x, seg.y, colors[i].particle);
              killPlayer(j);
              shouldKill = false;
              break;
            }
          }
        }

        // РџСЂРѕРІРµСЂСЏРµРј СЃС‚РѕР»РєРЅРѕРІРµРЅРёРµ СЃ СЃР°РјРёРј СЃРѕР±РѕР№
        for (let k = 1; k < snakes[i].length; k++) {
          const seg = snakes[i][k];

          if (seg.x === head.x && seg.y === head.y) {
            shouldKill = true;
            break;
          }
        }
      } else {
        // РћР±С‹С‡РЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃС‚РѕР»РєРЅРѕРІРµРЅРёР№
        if (isOccupied(head.x, head.y, i)) {
          createExplosion(head.x, head.y, colors[i].particle);
          killPlayer(i);
          continue;
        }
      }

      if (shouldKill && isOccupied(head.x, head.y, i)) {
        createExplosion(head.x, head.y, colors[i].particle);
        killPlayer(i);
        continue;
      }

      snakes[i].unshift(head);
      let ate = false;

      const isHunter = botStrategies[i] === BOT_STRATEGIES.HUNTER && snakes[i].length >= 80;

      if (!isHunter) {
        for (let j = 0; j < foods.length; j++) {
          if (foods[j].x === head.x && foods[j].y === head.y) {
            if (gameMode === 'magic-shooter' && foods[j].isSpecial) {
              // РЎСЉРµР»Рё Р·Р°С‡Р°СЂРѕРІР°РЅРЅРѕРµ СЏР±Р»РѕРєРѕ
              applySpecialEffect(i);
            } else {
              // РЎСЉРµР»Рё РѕР±С‹С‡РЅРѕРµ СЏР±Р»РѕРєРѕ
            }

            createParticles(foods[j].x, foods[j].y, colors[i].particle);
            foods.splice(j, 1);
            ate = true;
            break;
          }
        }
      }

      if (!ate) snakes[i].pop();
    }

    // РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РѕС‡РєРѕРІ
    syncScoreWithSnakeLength();
    updateScoreDisplay();

    // РџСЂРѕРІРµСЂРєР° РѕРєРѕРЅС‡Р°РЅРёСЏ РёРіСЂС‹
    let aliveHumans = 0;
    let aliveBots = 0;

    for (let i = 0; i < totalPlayers; i++) {
      if (snakes[i] !== null) {
        if (playerTypes[i] === 'human') aliveHumans++;
        else aliveBots++;
      }
    }

    const aliveTotal = aliveHumans + aliveBots;

    if (aliveTotal === 0 || (totalPlayers > 1 && aliveTotal === 1) || (aliveHumans === 0 && aliveBots > 0)) {
      endGame();
      return;
    }

    // РћР±РЅРѕРІР»РµРЅРёРµ С‡Р°СЃС‚РёС†
    particles = particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });
  }

  function gameLoop() {
    update();
    draw();
  }

  // Р¤СѓРЅРєС†РёСЏ РґР»СЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕР№ СЃС‚СЂРµР»СЊР±С‹
  function setupAutoShoot() {
    // РћС‡РёС‰Р°РµРј СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ С‚Р°Р№РјРµСЂС‹
    autoShootTimers.forEach(timer => {
      if (timer) clearInterval(timer);
    });

    autoShootTimers = new Array(MAX_PLAYERS).fill(null);

    // РЎРѕР·РґР°РµРј С‚Р°Р№РјРµСЂ РґР»СЏ РєР°Р¶РґРѕРіРѕ РёРіСЂРѕРєР°
    for (let i = 0; i < totalPlayers; i++) {
      autoShootTimers[i] = setInterval(() => {
        if (gameRunning && snakes[i] !== null &&
            specialEffectTypes[i] === SPECIAL_EFFECTS.WEAPON) {
          shootBullet(i);
        }
      }, 1500);
    }
  }

  // Р—Р°РїСѓСЃРє РёРіСЂС‹
  function startGame(humans, bots) {
    // РџРѕР»РЅС‹Р№ СЃР±СЂРѕСЃ РїСЂРµРґС‹РґСѓС‰РµР№ РёРіСЂС‹
    resetGame();

    totalPlayers = humans + bots;
    setupScreen.style.display = 'none';
    controlsScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    resizeCanvas();

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РІСЃРµС… РјР°СЃСЃРёРІРѕРІ
    snakes = [];
    directions = [];
    scores = [];
    colors = [];
    playerTypes = [];
    botStrategies = [];
    foods = [];
    particles = [];
    bullets = [];
    botMemory = [];

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ СЂРµР¶РёРјР° "РџСЂРёР·СЂР°Рє"
    isGhostMode = new Array(MAX_PLAYERS).fill(false);
    ghostTimers = new Array(MAX_PLAYERS).fill(null);

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter') {
      specialFoodTimers = new Array(MAX_PLAYERS).fill(null);
      specialEffectTypes = new Array(MAX_PLAYERS).fill(null);
      diarrheaTimers = new Array(MAX_PLAYERS).fill(null);
      autoShootTimers = new Array(MAX_PLAYERS).fill(null);
      bullets = [];
    }

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РёРіСЂРѕРєРѕРІ
    for (let i = 0; i < totalPlayers; i++) {
      const startPos = getStartPos(i);
      let initialDir;

      if (startPos.x < 10) initialDir = { x: 1, y: 0 };
      else if (startPos.x > tileCountX - 10) initialDir = { x: -1, y: 0 };
      else if (startPos.y < 10) initialDir = { x: 0, y: 1 };
      else if (startPos.y > tileCountY - 10) initialDir = { x: 0, y: -1 };
      else initialDir = { x: 1, y: 0 };

      snakes.push([startPos]);
      directions.push(initialDir);
      colors.push(COLOR_PALETTE[i % COLOR_PALETTE.length]);

      if (i < humans) {
        playerTypes.push('human');
        botStrategies.push(null);
        botMemory.push(null);
      } else {
        playerTypes.push('bot');
        const randomStrategy = ALL_STRATEGIES[Math.floor(Math.random() * ALL_STRATEGIES.length)];
        botStrategies.push(randomStrategy);
        botMemory.push(null);
      }

      scores.push(0);
    }

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ СЂРµР¶РёРјРѕРІ "РџСЂРёР·СЂР°Рє"
    if (gameMode === 'full-ghost' || gameMode === 'all-ghosts') {
      for (let i = 0; i < totalPlayers; i++) {
        if (gameMode === 'full-ghost' && i < humanCount) {
          isGhostMode[i] = true;
        } else if (gameMode === 'all-ghosts') {
          isGhostMode[i] = true;
        }
      }
      lastGhostActivation = Date.now();
    }

    // РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РѕС‡РєРѕРІ
    syncScoreWithSnakeLength();
    updateScoreDisplay();
    updateModeIndicator();

    // Р“РµРЅРµСЂР°С†РёСЏ РїРµСЂРІРѕРіРѕ СЏР±Р»РѕРєР°
    generateFood();

    // РўР°Р№РјРµСЂ РґР»СЏ РіРµРЅРµСЂР°С†РёРё РµРґС‹
    foodTimer = setInterval(() => {
      if (gameRunning) generateFood();
    }, 4000);

    gameRunning = true;
    setupControls();

    // Р—Р°РїСѓСЃРє Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕР№ СЃС‚СЂРµР»СЊР±С‹ РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter') {
      setTimeout(setupAutoShoot, 1000);
    }

    // Р—Р°РїСѓСЃРє РёРіСЂРѕРІРѕРіРѕ С†РёРєР»Р° СЃ СѓРїСЂР°РІР»РµРЅРёРµРј СЃРєРѕСЂРѕСЃС‚СЊСЋ
    requestAnimationFrame(gameFrame);
  }

  // РРіСЂРѕРІРѕР№ С†РёРєР» СЃ СѓРїСЂР°РІР»РµРЅРёРµРј СЃРєРѕСЂРѕСЃС‚СЊСЋ
  function gameFrame(timestamp) {
    if (!gameRunning) return;

    if (!gameSpeed.lastUpdateTime) gameSpeed.lastUpdateTime = timestamp;

    const elapsed = timestamp - gameSpeed.lastUpdateTime;

    if (elapsed >= gameSpeed.updateInterval) {
      gameLoop();
      gameSpeed.lastUpdateTime = timestamp;
    }

    requestAnimationFrame(gameFrame);
  }

  // РЎР±СЂРѕСЃ РёРіСЂС‹
  function resetGame() {
    gameRunning = false;

    // РћС‡РёСЃС‚РєР° РІСЃРµС… С‚Р°Р№РјРµСЂРѕРІ
    if (foodTimer) {
      clearInterval(foodTimer);
      foodTimer = null;
    }

    // РћС‡РёСЃС‚РєР° С‚Р°Р№РјРµСЂРѕРІ РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter') {
      for (let i = 0; i < MAX_PLAYERS; i++) {
        if (diarrheaTimers[i]) {
          clearInterval(diarrheaTimers[i]);
          diarrheaTimers[i] = null;
        }

        if (autoShootTimers[i]) {
          clearInterval(autoShootTimers[i]);
          autoShootTimers[i] = null;
        }
      }
    }

    // РћС‡РёСЃС‚РєР° С‚Р°Р№РјРµСЂРѕРІ РїСЂРёР·СЂР°РєРѕРІ
    for (let i = 0; i < MAX_PLAYERS; i++) {
      if (ghostTimers[i]) {
        ghostTimers[i] = null;
      }
    }

    // РћС‡РёСЃС‚РєР° РѕР±СЂР°Р±РѕС‚С‡РёРєРѕРІ СЃРѕР±С‹С‚РёР№
    document.removeEventListener('keydown', handleKeyDown);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchend', handleTouchEnd);

    // РЈРґР°Р»РµРЅРёРµ РёРЅРґРёРєР°С‚РѕСЂРѕРІ СЌС„С„РµРєС‚РѕРІ
    const existingIndicators = document.querySelectorAll('.effect-indicator');
    existingIndicators.forEach(indicator => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    });

    // РЎР±СЂРѕСЃ РёРЅС‚РµСЂС„РµР№СЃР°
    scoresDiv.innerHTML = '';
    legendDiv.innerHTML = '';
    finalScoresDiv.innerHTML = '';
    gameOverScreen.classList.remove('active');
    modeIndicator.style.display = 'none';

    setupScreen.style.display = 'flex';
    setupScreen.classList.add('active');
    controlsScreen.style.display = 'none';
    gameContainer.style.display = 'none';
  }

  // Р’РђР›РР”РђР¦РРЇ Р РЈРџР РђР’Р›Р•РќРР• РРќРўР•Р Р¤Р•Р™РЎРћРњ

  // РћР±РЅРѕРІР»РµРЅРёРµ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РІС‹Р±СЂР°РЅРЅРѕРіРѕ СЂРµР¶РёРјР°
  function updateSelectedModeDisplay() {
    let modeName = 'РљР»Р°СЃСЃРёРєР°';

    switch(gameMode) {
      case 'half-ghost':
        modeName = 'РџРѕР»СѓРїСЂРёР·СЂР°Рє';
        break;
      case 'family-ghost':
        modeName = 'РЎРµРјРµР№РєР° РЅРµРґРѕРїСЂРёР·СЂР°РєРѕРІ';
        break;
      case 'full-ghost':
        modeName = 'РџРѕР»РЅРѕС†РµРЅРЅС‹Р№ РїСЂРёР·СЂР°Рє';
        break;
      case 'all-ghosts':
        modeName = 'РљРѕРјРїР°С€РєР° РїСЂРёР·СЂР°РєРѕРІ';
        break;
      case 'magic-shooter':
        modeName = 'РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ';
        break;
    }

    selectedModeDisplay.textContent = modeName;
  }

  // Р’Р°Р»РёРґР°С†РёСЏ РїРµСЂРµРґ РЅР°С‡Р°Р»РѕРј РёРіСЂС‹
  function validateAndStart() {
    const humans = parseInt(document.querySelector('#human-players-container .custom-select-button').dataset.value);
    const bots = parseInt(document.querySelector('#bot-count-container .custom-select-button').dataset.value);
    const total = humans + bots;

    if (humans < 1 || humans > 4) {
      errorMsg.textContent = 'РРіСЂРѕРєРѕРІ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ РѕС‚ 1 РґРѕ 4';
      errorMsg.style.animation = 'pulseError 0.5s';
      setTimeout(() => { errorMsg.style.animation = ''; }, 500);
      return false;
    }

    if (bots < 0 || bots > 7) {
      errorMsg.textContent = 'Р‘РѕС‚РѕРІ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ РѕС‚ 0 РґРѕ 7';
      errorMsg.style.animation = 'pulseError 0.5s';
      setTimeout(() => { errorMsg.style.animation = ''; }, 500);
      return false;
    }

    if (total > MAX_PLAYERS) {
      errorMsg.textContent = `РњР°РєСЃРёРјСѓРј ${MAX_PLAYERS} СѓС‡Р°СЃС‚РЅРёРєРѕРІ!`;
      errorMsg.style.animation = 'pulseError 0.5s';
      setTimeout(() => { errorMsg.style.animation = ''; }, 500);
      return false;
    }

    // РџСЂРѕРІРµСЂРєР° РґР»СЏ СЂРµР¶РёРјРѕРІ "РџСЂРёР·СЂР°Рє"
    if ((gameMode === 'half-ghost' || gameMode === 'full-ghost') && humans === 0) {
      errorMsg.textContent = 'Р’ СЌС‚РѕРј СЂРµР¶РёРјРµ РЅРµРѕР±С…РѕРґРёРј С…РѕС‚СЏ Р±С‹ РѕРґРёРЅ РёРіСЂРѕРє';
      errorMsg.style.animation = 'pulseError 0.5s';
      setTimeout(() => { errorMsg.style.animation = ''; }, 500);
      return false;
    }

    // РџСЂРѕРІРµСЂРєР° РґР»СЏ СЂРµР¶РёРјР° "РњР°РіРёС‡РµСЃРєРёР№ С€СѓС‚РµСЂ"
    if (gameMode === 'magic-shooter' && humans === 0) {
      errorMsg.textContent = 'Р’ СЌС‚РѕРј СЂРµР¶РёРјРµ РЅРµРѕР±С…РѕРґРёРј С…РѕС‚СЏ Р±С‹ РѕРґРёРЅ РёРіСЂРѕРє';
      errorMsg.style.animation = 'pulseError 0.5s';
      setTimeout(() => { errorMsg.style.animation = ''; }, 500);
      return false;
    }

    errorMsg.textContent = '';
    return true;
  }

  // РћР±РЅРѕРІР»РµРЅРёРµ РІРёРґРёРјРѕСЃС‚Рё СЌР»РµРјРµРЅС‚РѕРІ СѓРїСЂР°РІР»РµРЅРёСЏ
  function updatePlayerControlsVisibility() {
    const humanCount = parseInt(document.querySelector('#human-players-container .custom-select-button').dataset.value);
    const controlsList = document.getElementById('controls-list');

    if (!controlsList) return;

    for (let i = 0; i < 4; i++) {
      const row = controlsList.children[i];
      if (row) {
        row.style.display = (i < humanCount) ? 'flex' : 'none';
      }
    }
  }

  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РѕР±СЂР°Р±РѕС‚С‡РёРєРѕРІ СЃРѕР±С‹С‚РёР№ РґР»СЏ РєР°СЃС‚РѕРјРЅС‹С… РІС‹РїР°РґР°СЋС‰РёС… СЃРїРёСЃРєРѕРІ
  function initCustomSelects() {
    // РћР±СЂР°Р±РѕС‚РєР° СЃРѕР±С‹С‚РёР№ РґР»СЏ РІС‹Р±РѕСЂР° РєРѕР»РёС‡РµСЃС‚РІР° РёРіСЂРѕРєРѕРІ
    const humanPlayersContainer = document.getElementById('human-players-container');
    const humanPlayersOptions = humanPlayersContainer.querySelectorAll('.custom-select-option');

    humanPlayersOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = humanPlayersContainer.querySelector('.custom-select-button');
        button.textContent = option.textContent;
        button.dataset.value = option.dataset.value;
        updatePlayerControlsVisibility();
      });
    });

    // РћР±СЂР°Р±РѕС‚РєР° СЃРѕР±С‹С‚РёР№ РґР»СЏ РІС‹Р±РѕСЂР° РєРѕР»РёС‡РµСЃС‚РІР° Р±РѕС‚РѕРІ
    const botCountContainer = document.getElementById('bot-count-container');
    const botCountOptions = botCountContainer.querySelectorAll('.custom-select-option');

    botCountOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = botCountContainer.querySelector('.custom-select-button');
        button.textContent = option.textContent;
        button.dataset.value = option.dataset.value;
      });
    });

    // РћР±СЂР°Р±РѕС‚РєР° СЃРѕР±С‹С‚РёР№ РґР»СЏ РІС‹Р±РѕСЂР° СѓРїСЂР°РІР»РµРЅРёСЏ РёРіСЂРѕРєРѕРІ
    for (let i = 0; i < 4; i++) {
      const container = document.getElementById(`control-${i}-container`);
      if (!container) continue;

      const options = container.querySelectorAll('.custom-select-option');

      options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const button = container.querySelector('.custom-select-button');
          button.textContent = option.textContent;
          button.dataset.value = option.dataset.value;
        });
      });
    }

    // Р”РѕР±Р°РІР»СЏРµРј РѕР±СЂР°Р±РѕС‚С‡РёРє РєР»РёРєР° РїРѕ РґРѕРєСѓРјРµРЅС‚Сѓ РґР»СЏ Р·Р°РєСЂС‹С‚РёСЏ РІСЃРµС… СЃРїРёСЃРєРѕРІ
    document.addEventListener('click', (e) => {
      const isClickInside = e.target.closest('.custom-select-container');
      if (!isClickInside) {
        // РќРµ РЅСѓР¶РЅРѕ РЅРёС‡РµРіРѕ РґРµР»Р°С‚СЊ, С‚Р°Рє РєР°Рє РјС‹ РёСЃРїРѕР»СЊР·СѓРµРј :hover РґР»СЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ
      }
    });
  }

  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РѕР±СЂР°Р±РѕС‚С‡РёРєРѕРІ СЃРѕР±С‹С‚РёР№
  function initEventListeners() {
    // РћР±СЂР°Р±РѕС‚РєР° РєРЅРѕРїРѕРє СЂРµР¶РёРјРѕРІ РёРіСЂС‹
    document.querySelectorAll('.mode-btn').forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.mode === 'ghost-main') return;

        // РЎРЅРёРјР°РµРј Р°РєС‚РёРІРЅРѕСЃС‚СЊ СЃРѕ РІСЃРµС… РєРЅРѕРїРѕРє
        document.querySelectorAll('.mode-btn, .submode-btn').forEach(btn => {
          btn.classList.remove('active');
        });

        // РђРєС‚РёРІРёСЂСѓРµРј РІС‹Р±СЂР°РЅРЅСѓСЋ РєРЅРѕРїРєСѓ
        button.classList.add('active');

        // РћР±РЅРѕРІР»СЏРµРј РІС‹Р±СЂР°РЅРЅС‹Р№ СЂРµР¶РёРј
        gameMode = button.dataset.mode;
        updateSelectedModeDisplay();
        updateModeIndicator();
      });

      // РџРѕРєР°Р· РѕРїРёСЃР°РЅРёСЏ РїСЂРё РЅР°РІРµРґРµРЅРёРё
      button.addEventListener('mouseover', () => {
        if (button.dataset.mode !== 'ghost-main') {
          showDescription(button.dataset.mode);
        }
      });
    });

    // РћР±СЂР°Р±РѕС‚РєР° РЅР°РІРµРґРµРЅРёСЏ РЅР° "РџСЂРёР·СЂР°Рє" РґР»СЏ РїРѕРєР°Р·Р° РїРѕРґРјРµРЅСЋ
    document.querySelector('[data-mode="ghost-main"]').addEventListener('mouseover', () => {
      showDescription('ghost-main');
      document.querySelector('.mode-description').style.display = 'block';
    });

    // РћР±СЂР°Р±РѕС‚РєР° РєРЅРѕРїРѕРє РїРѕРґСЂРµР¶РёРјРѕРІ
    document.querySelectorAll('.submode-btn').forEach(button => {
      button.addEventListener('click', () => {
        // РЎРЅРёРјР°РµРј Р°РєС‚РёРІРЅРѕСЃС‚СЊ СЃРѕ РІСЃРµС… РєРЅРѕРїРѕРє
        document.querySelectorAll('.mode-btn, .submode-btn').forEach(btn => {
          btn.classList.remove('active');
        });

        // РђРєС‚РёРІРёСЂСѓРµРј РІС‹Р±СЂР°РЅРЅСѓСЋ РїРѕРґРєРЅРѕРїРєСѓ
        button.classList.add('active');

        // РћР±РЅРѕРІР»СЏРµРј РІС‹Р±СЂР°РЅРЅС‹Р№ СЂРµР¶РёРј
        gameMode = button.dataset.mode;
        updateSelectedModeDisplay();
        updateModeIndicator();
      });

      // РџРѕРєР°Р· РѕРїРёСЃР°РЅРёСЏ РїСЂРё РЅР°РІРµРґРµРЅРёРё
      button.addEventListener('mouseover', () => {
        showDescription(button.dataset.mode);
      });
    });

    // РџРѕРєР°Р· РѕРїРёСЃР°РЅРёСЏ РїСЂРё РЅР°РІРµРґРµРЅРёРё РЅР° РѕРїРёСЃР°РЅРёРµ
    const modeDescription = document.querySelector('.mode-description');
    modeDescription.addEventListener('mouseover', () => {
      modeDescription.style.display = 'block';
    });

    modeDescription.addEventListener('mouseout', () => {
      modeDescription.style.display = 'none';
    });

    // РћР±СЂР°Р±РѕС‚С‡РёРєРё РєРЅРѕРїРѕРє РЅР°РІРёРіР°С†РёРё
    startControlsBtn.addEventListener('click', () => {
      if (!validateAndStart()) return;

      setupScreen.classList.remove('active');
      setTimeout(() => {
        setupScreen.style.display = 'none';
        controlsScreen.style.display = 'flex';
        controlsScreen.classList.add('active');
      }, 300);
    });

    backBtn.addEventListener('click', () => {
      controlsScreen.classList.remove('active');
      setTimeout(() => {
        controlsScreen.style.display = 'none';
        setupScreen.style.display = 'flex';
        setupScreen.classList.add('active');
      }, 300);
    });

    startBtn.addEventListener('click', () => {
      humanCount = parseInt(document.querySelector('#human-players-container .custom-select-button').dataset.value);
      const botCount = parseInt(document.querySelector('#bot-count-container .custom-select-button').dataset.value);

      if (!validateAndStart()) return;

      playerControls = [];
      for (let i = 0; i < humanCount; i++) {
        playerControls.push(document.querySelector(`#control-${i}-container .custom-select-button`).dataset.value);
      }

      if (!isMobile) {
        for (let i = 0; i < playerControls.length; i++) {
          if (playerControls[i] === 'swipe') {
            errorMsg.textContent = `РРіСЂРѕРє ${i + 1} РІС‹Р±СЂР°Р» СЃРІР°Р№РїС‹, РЅРѕ СѓСЃС‚СЂРѕР№СЃС‚РІРѕ РЅРµ СЃРµРЅСЃРѕСЂРЅРѕРµ. Р’С‹Р±РµСЂРёС‚Рµ РєР»Р°РІРёР°С‚СѓСЂСѓ.`;
            errorMsg.style.animation = 'pulseError 0.5s';
            setTimeout(() => { errorMsg.style.animation = ''; }, 500);
            return;
          }
        }
      }

      startGame(humanCount, botCount);
    });

    // РћР±СЂР°Р±РѕС‚С‡РёРє РёР·РјРµРЅРµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° РёРіСЂРѕРєРѕРІ
    const humanPlayersContainer = document.getElementById('human-players-container');
    if (humanPlayersContainer) {
      humanPlayersContainer.addEventListener('click', updatePlayerControlsVisibility);
    }
  }

  // РћС‚РѕР±СЂР°Р¶РµРЅРёРµ РѕРїРёСЃР°РЅРёСЏ СЂРµР¶РёРјР°
  function showDescription(mode) {
    // РЎРєСЂС‹РІР°РµРј РІСЃРµ РѕРїРёСЃР°РЅРёСЏ
    document.querySelectorAll('.description-content').forEach(content => {
      content.classList.remove('active');
    });

    // РџРѕРєР°Р·С‹РІР°РµРј РЅСѓР¶РЅРѕРµ РѕРїРёСЃР°РЅРёРµ
    const targetDescription = document.querySelector(`.description-content[data-mode="${mode}"]`);
    if (targetDescription) {
      targetDescription.classList.add('active');
      document.querySelector('.mode-description').style.display = 'block';
    }
  }

  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РїСЂРё Р·Р°РіСЂСѓР·РєРµ
  window.addEventListener('load', () => {
    // РЎРѕР·РґР°РЅРёРµ Р·РІРµР·РґРЅРѕРіРѕ С„РѕРЅР°
    createStarField();

    // РќР°СЃС‚СЂРѕР№РєР° canvas
    resizeCanvas();

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РєР°СЃС‚РѕРјРЅС‹С… РІС‹РїР°РґР°СЋС‰РёС… СЃРїРёСЃРєРѕРІ
    initCustomSelects();

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РѕР±СЂР°Р±РѕС‚С‡РёРєРѕРІ СЃРѕР±С‹С‚РёР№
    initEventListeners();

    // РћР±РЅРѕРІР»РµРЅРёРµ РІРёРґРёРјРѕСЃС‚Рё СЌР»РµРјРµРЅС‚РѕРІ СѓРїСЂР°РІР»РµРЅРёСЏ
    updatePlayerControlsVisibility();

    // РђРЅРёРјР°С†РёСЏ РїРѕСЏРІР»РµРЅРёСЏ РЅР°С‡Р°Р»СЊРЅРѕРіРѕ СЌРєСЂР°РЅР°
    setTimeout(() => {
      setupScreen.classList.add('active');
    }, 300);

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ СЃРєСЂСѓРіР»РµРЅРЅС‹С… РїСЂСЏРјРѕСѓРіРѕР»СЊРЅРёРєРѕРІ
    if (!ctx.roundRect) {
      ctx.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;

        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
      };
    }
  });

  // РћР±СЂР°Р±РѕС‚С‡РёРє РёР·РјРµРЅРµРЅРёСЏ СЂР°Р·РјРµСЂР° РѕРєРЅР°
  window.addEventListener('resize', () => {
    resizeCanvas();
    createStarField();
  });

  // РџСЂРµРґРѕС‚РІСЂР°С‰РµРЅРёРµ РЅРµР¶РµР»Р°С‚РµР»СЊРЅС‹С… РґРµР№СЃС‚РІРёР№ РїСЂРё СЃРІР°Р№РїР°С… РІ РјРѕР±РёР»СЊРЅРѕР№ РІРµСЂСЃРёРё
  document.addEventListener('touchmove', function(e) {
    if (gameRunning && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, { passive: false });
  
