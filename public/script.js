// Global functions for onclick handlers
let nicknameInput; // Global variable for nickname input

function login() {
  if (!nicknameInput) {
    showMessage('Ошибка: поле ввода не найдено.');
    return;
  }
  const name = nicknameInput.value.trim();
  if (!name) {
    showMessage('Введите никнейм.');
    return;
  }
  saveNickname(name);
  showScreen(chooseScreen);
}

function scrollToAuth() {
  const authSection = document.querySelector('.auth-section');
  if (authSection) {
    authSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

window.login = login;
window.scrollToAuth = scrollToAuth;
const landingScreen = document.getElementById('landing-screen');
const mainMenu = document.getElementById('main-menu');
const chooseScreen = document.getElementById('choose-screen');
const roomListScreen = document.getElementById('room-list-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const tableScreen = document.getElementById('table-screen');
const statsModal = document.getElementById('statsModal');
const statsContent = document.getElementById('statsContent');
const messageBox = document.getElementById('messageBox');
const playButton = document.getElementById('playButton');
const statsButton = document.getElementById('statsButton');
const logoutButton = document.getElementById('logoutButton');
const currentUserLabel = document.getElementById('currentUserLabel');
const spyCard = document.getElementById('spy-card');
const codenamesCard = document.getElementById('codenames-card');
const backToMenu = document.getElementById('backToMenu');
const backToChooseFromRooms = document.getElementById('backToChooseFromRooms');
const backToRooms = document.getElementById('backToRooms');
const findRoomButton = document.getElementById('findRoomButton');
const refreshRooms = document.getElementById('refreshRooms');
const joinCodeInput = document.getElementById('joinCodeInput');
const joinByCodeButton = document.getElementById('joinByCodeButton');
const roomList = document.getElementById('roomList');
const roomInfo = document.getElementById('roomInfo');
const roomDetails = document.getElementById('roomDetails');
const roomCodeText = document.getElementById('roomCodeText');
const copyRoomCode = document.getElementById('copyRoomCode');
const playersList = document.getElementById('playersList');
const roomActions = document.getElementById('roomActions');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChat = document.getElementById('sendChat');
const closeStats = document.getElementById('closeStats');
nicknameInput = document.getElementById('nickname-guest');

// Table screen elements
const tableTitle = document.getElementById('tableTitle');
const cardsGrid = document.getElementById('cardsGrid');
const playerRole = document.getElementById('playerRole');
const playersOnTable = document.getElementById('playersOnTable');
const tableChat = document.getElementById('tableChat');
const tableChatInput = document.getElementById('tableChatInput');
const tableSendChat = document.getElementById('tableSendChat');
const votePrompt = document.getElementById('votePrompt');
const votePromptText = document.getElementById('votePromptText');
const voteYes = document.getElementById('voteYes');
const voteNo = document.getElementById('voteNo');
const hintModal = document.getElementById('hintModal');
const hintInput = document.getElementById('hintInput');
const sendHintBtn = document.getElementById('sendHintBtn');
const cancelHintBtn = document.getElementById('cancelHintBtn');

const STORAGE_NICK = 'spyNick';
const STORAGE_STATS = 'spyStats';
const ALL_LOCATIONS = [
  'Космодром', 'Больница', 'Школа', 'Музей', 'Отель', 'Ресторан', 'Станция',
  'Тюрьма', 'Театр', 'Парк', 'Пляж', 'Аэропорт', 'Вокзал', 'Торговый центр',
  'Суд', 'Библиотека', 'Зоопарк', 'Офис', 'Квартира', 'Казино', 'Церковь',
  'Подводная лодка', 'Самолет', 'Поезд', 'Корабль', 'Арена', 'Кабинет', 'Верфь',
  'Кинотеатр', 'Станция метро', 'Пайплайн', 'Фабрика', 'Скайпортик'
];

let currentGame = 'spy';
let currentLocations = [];
let currentPlayers = [];
let currentWords = [];
let currentKeyMap = [];
let currentRevealed = [];
let currentTeams = { red: [], blue: [] };
let currentCaptains = { red: null, blue: null };
let currentTeam = 'red';
let currentPlayerTeam = null;
let currentIsCaptain = false;
let currentPhase = 'hint';
let currentHint = null;
let currentPhaseTimer = 60;
let playerSelections = {};

const LOCATION_THEMES = {
  'Космодром': 'loc-space',
  'Больница': 'loc-medical',
  'Школа': 'loc-school',
  'Музей': 'loc-museum',
  'Отель': 'loc-hotel',
  'Ресторан': 'loc-restaurant',
  'Станция': 'loc-station',
  'Тюрьма': 'loc-prison',
  'Театр': 'loc-theater',
  'Парк': 'loc-park',
  'Пляж': 'loc-beach',
  'Аэропорт': 'loc-airport',
  'Вокзал': 'loc-station',
  'Торговый центр': 'loc-mall',
  'Суд': 'loc-court',
  'Библиотека': 'loc-library',
  'Зоопарк': 'loc-zoo',
  'Офис': 'loc-office',
  'Квартира': 'loc-apartment',
  'Казино': 'loc-casino',
  'Церковь': 'loc-church',
  'Подводная лодка': 'loc-submarine',
  'Самолет': 'loc-plane',
  'Поезд': 'loc-train',
  'Корабль': 'loc-ship',
  'Арена': 'loc-arena',
  'Кабинет': 'loc-cabinet',
  'Верфь': 'loc-shipyard',
  'Кинотеатр': 'loc-cinema',
  'Станция метро': 'loc-metro',
  'Пайплайн': 'loc-pipeline',
  'Фабрика': 'loc-factory',
  'Скайпортик': 'loc-skatepark'
};

function getLocationTheme(location) {
  return LOCATION_THEMES[location] || 'loc-default';
}

let socket = null;
let currentRoom = null;
let currentPlayerId = null;
let currentNickname = null;
let currentRole = null;
let currentLocation = null;
let hasInitiatedVote = false;

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach((section) => {
    section.classList.toggle('active', section === screen);
  });
  document.body.classList.toggle('table-view', screen === tableScreen);
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.style.display = 'block';
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 2500);
}

function selectGame(gameType) {
  currentGame = gameType;
  spyCard.classList.toggle('active', gameType === 'spy');
  codenamesCard.classList.toggle('active', gameType === 'codenames');
  document.body.classList.toggle('spy-theme', gameType === 'spy');
  document.body.classList.toggle('codenames-theme', gameType === 'codenames');
  showScreen(roomListScreen);
  connectSocket();
}

function loadNickname() {
  const saved = localStorage.getItem(STORAGE_NICK);
  if (saved) {
    currentNickname = saved;
    updateUserLabel();
    if (nicknameInput) {
      nicknameInput.value = saved;
    }
    return true;
  }
  return false;
}

function updateUserLabel() {
  if (currentUserLabel) {
    currentUserLabel.textContent = currentNickname || 'Игрок';
  }
}

function logout() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  localStorage.removeItem(STORAGE_NICK);
  currentNickname = null;
  updateUserLabel();
  if (nicknameInput) {
    nicknameInput.value = '';
  }
  showScreen(landingScreen);
  showMessage('Вы вышли. Введите новый ник, чтобы начать.');
}

function saveNickname(name) {
  currentNickname = name;
  updateUserLabel();
  localStorage.setItem(STORAGE_NICK, name);
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_STATS) || '[]');
  } catch {
    return [];
  }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_STATS, JSON.stringify(stats));
}

function updatePlayerStats(result) {
  const stats = loadStats();
  let entry = stats.find((item) => item.nick === currentNickname && item.игра === 'spy');
  if (!entry) {
    entry = { nick: currentNickname, игра: 'spy', побед: 0, поражений: 0, winsAsSpy: 0, winsAsPlayer: 0 };
    stats.push(entry);
  }
  entry.побед += result.win ? 1 : 0;
  entry.поражений += result.win ? 0 : 1;
  if (result.winner === 'spy') {
    entry.winsAsSpy += result.isSpy ? 1 : 0;
  } else {
    entry.winsAsPlayer += result.isSpy ? 0 : 1;
  }
  saveStats(stats);
}

function openStatsModal() {
  const stats = loadStats();
  const entry = stats.find((item) => item.nick === currentNickname && item.игра === 'spy');
  statsContent.innerHTML = entry
    ? `<ul class="stats-list">
        <li>Ник: <strong>${entry.nick}</strong></li>
        <li>Побед: <strong>${entry.побед}</strong></li>
        <li>Поражений: <strong>${entry.поражений}</strong></li>
        <li>Побед как шпион: <strong>${entry.winsAsSpy || 0}</strong></li>
        <li>Побед как игрок: <strong>${entry.winsAsPlayer || 0}</strong></li>
        <li>Всего партий: <strong>${(entry.побед || 0) + (entry.поражений || 0)}</strong></li>
      </ul>`
    : '<p>Нет статистики. Играйте в «Шпион», чтобы записи появились.</p>';
  statsModal.classList.add('show');
}

function closeStatsModal() {
  statsModal.classList.remove('show');
}

function connectSocket() {
  if (socket) return;
  console.log('Connecting to Socket.IO...');
  socket = io();
  socket.on('connect', () => {
    console.log('Socket.IO connected');
    currentPlayerId = socket.id;
    socket.emit('requestRooms');
  });
  socket.on('connect_error', (error) => {
    console.log('Socket.IO connection error:', error);
  });
  socket.on('error', (message) => {
    console.log('Server error:', message);
    showMessage(message);
  });
  socket.on('roomList', renderRoomList);
  socket.on('roomJoined', ({ roomId, title, creatorId, gameType }) => {
    currentRoom = roomId;
    currentGame = gameType || 'spy';
    renderRoomInfo({ title, creatorId, gameType });
    showScreen(lobbyScreen);
  });
  socket.on('roomUpdate', (room) => {
    currentRoom = room.id;
    currentGame = room.gameType || 'spy';
    renderRoomInfo(room);
    renderPlayers(room.players, room.creatorId, room.state);
    renderRoomActions(room);
    renderChat(room.chat);
  });
  socket.on('gameStarted', ({ gameType, isSpy, location, players, availableLocations, words, currentTeam: team, isCaptain, playerTeam, teamCaptains, keyMap, revealed, teams, phase, hint, phaseTimer }) => {
    currentGame = gameType || 'spy';
    if (currentGame === 'codenames') {
      currentPlayers = players;
      currentPlayerTeam = playerTeam;
      currentIsCaptain = isCaptain;
      currentWords = words || [];
      currentKeyMap = keyMap ? keyMap.slice() : Array(currentWords.length).fill(null);
      currentRevealed = revealed || [];
      currentTeams = teams || { red: [], blue: [] };
      currentCaptains = teamCaptains || { red: null, blue: null };
      currentTeam = team || 'red';
      currentPhase = phase || 'hint';
      currentHint = hint || null;
      currentPhaseTimer = phaseTimer || 60;
      playerRole.innerHTML = '';
    } else {
      currentPlayers = players;
      currentRole = isSpy ? 'spy' : 'agent';
      currentLocation = location;
      currentLocations = availableLocations && availableLocations.length ? availableLocations : ALL_LOCATIONS;
    }
    showScreen(tableScreen);
    tableChat.innerHTML = '';
    renderGameTable(players, isSpy, location);
    hasInitiatedVote = false;
  });
  socket.on('gameMessage', (message) => {
    appendTableChatMessage(message);
  });
  socket.on('playerSelectionsUpdate', (selections) => {
    playerSelections = selections;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('wordRevealed', ({ index, cardType, word, currentTeam: team, revealed }) => {
    currentRevealed = revealed;
    if (!currentKeyMap[index]) {
      currentKeyMap[index] = cardType;
    }
    currentTeam = team;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('turnChanged', ({ currentTeam: team, phase, hint, phaseTimer }) => {
    currentTeam = team;
    currentPhase = phase || 'hint';
    currentHint = hint || null;
    currentPhaseTimer = phaseTimer || 60;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('phaseChanged', ({ phase, hint, phaseTimer }) => {
    currentPhase = phase;
    currentHint = hint;
    currentPhaseTimer = phaseTimer;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('phaseTimerUpdate', (time) => {
    currentPhaseTimer = time;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('voteStarted', ({ targetId }) => {
    showMessage('Голосование начато');
  });
  socket.on('votePrompt', ({ accusedName, accusedId }) => {
    votePromptText.textContent = `Винить ${accusedName}?`;
    votePrompt.style.display = 'block';
  });
  socket.on('gameEnded', ({ winner, reason, spyId, location, players }) => {
    let resultText = 'Игра окончена';
    if (currentGame === 'codenames') {
      resultText = winner === 'red' ? 'Победила красная команда!' : 'Победила синяя команда!';
    } else {
      const isSpy = socket.id === spyId;
      const resultTexts = {
        spy_found: isSpy ? 'Вы были найдены!' : 'Вы нашли шпиона!',
        spy_guessed: 'Шпион угадал локацию!',
        spy_wrong_guess: 'Шпион неправильно угадал локацию!',
        wrong_player: 'Вы исключили неправильного игрока!',
        vote_failed: 'Голосование не прошло!',
        timeout: 'Время истекло!'
      };
      resultText = resultTexts[reason] || 'Игра окончена';
      const won = winner === 'spy' ? isSpy : !isSpy;
      updatePlayerStats({ win: won, isSpy, winner });
    }
    showMessage(resultText);
    setTimeout(() => {
      showScreen(lobbyScreen);
      if (socket) socket.emit('requestRooms');
    }, 3000);
  });
  socket.on('errorMessage', (text) => {
    showMessage(text);
  });
}

function renderRoomList(rooms) {
  roomList.innerHTML = rooms.length
    ? rooms
      .map(
        (room) => `<div class="room-card">
            <strong>${room.title}</strong>
            <p>${room.players} / ${room.capacity} игроков</p>
            <p>${room.state === 'waiting' ? 'Ожидание игроков' : 'Игра началась'}</p>
            <button class="secondary" data-room="${room.id}" ${room.state !== 'waiting' ? 'disabled' : ''}>Присоединиться</button>
          </div>`
      )
      .join('')
    : '<p>Пока нет доступных комнат. Создайте свою.</p>';
  roomList.querySelectorAll('button[data-room]').forEach((button) => {
    button.addEventListener('click', () => {
      joinRoom(button.dataset.room);
    });
  });
}

function renderRoomInfo(room) {
  if (room) {
    roomCodeText.textContent = room.id;
    roomDetails.innerHTML = `
       <p>Комната: <strong>${room.title}</strong></p>
       <p>Игра: <strong>${room.gameType === 'codenames' ? 'Код Неймс' : 'Шпион'}</strong></p>
       <p>Состояние: <strong>${room.state === 'waiting' ? 'Ожидание игроков' : 'Игра в процессе'}</strong></p>
       <p>Игроков: <strong>${(room.players?.length || 0)}/${room.capacity || 6}</strong></p>`;
  } else {
    roomCodeText.textContent = '';
    roomDetails.innerHTML = '<p>Выберите комнату или создайте новую.</p>';
  }
}

function renderPlayers(players = [], creatorId, state) {
  const list = players
    .map(
      (player) => `<li>${player.nickname}${player.id === creatorId ? ' (создатель)' : ''}${player.id === socket?.id ? ' (вы)' : ''}</li>`
    )
    .join('');
  playersList.innerHTML = `<h3>Игроки</h3><ul>${list}</ul>`;
}

function renderRoomActions(room) {
  const isCreator = socket?.id === room.creatorId;
  const canStart = room.state === 'waiting' && room.players.length >= 4 && isCreator;
  const actionHtml = canStart ? '<button id="startGame" class="primary">Начать игру</button>' : '';
  roomActions.innerHTML = actionHtml;

  const startBtn = document.getElementById('startGame');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      socket.emit('startGame');
    });
  }
}

function renderChat(chat = []) {
  chatMessages.innerHTML = chat
    .map((message) => {
      if (message.system) {
        return `<div class="chat-system">${message.text}</div>`;
      }
      return `<div class="chat-message"><strong>${message.from}:</strong> ${message.text}</div>`;
    })
    .join('');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendTableChatMessage(message) {
  const html = message.system
    ? `<div class="chat-system">${message.text}</div>`
    : `<div class="chat-message"><strong>${message.user}:</strong> ${message.text}</div>`;
  tableChat.insertAdjacentHTML('beforeend', html);
  tableChat.scrollTop = tableChat.scrollHeight;
}

function renderGameTable(players, isSpy, location) {
  if (currentGame === 'codenames') {
    tableTitle.textContent = 'Код Неймс';
    cardsGrid.innerHTML = currentWords
      .map((word, index) => {
        const revealed = currentRevealed[index];
        const keyVisible = currentIsCaptain || revealed;
        const cardType = keyVisible ? currentKeyMap[index] : null;
        const stateClass = revealed ? 'revealed' : currentIsCaptain ? 'dim' : '';
        const selectedByCount = Object.values(playerSelections).filter((i) => typeof i === 'number' && i === index).length;
        const selectedClass = selectedByCount > 0 ? 'card-selected' : '';
        return `
          <div class="location-card codenames-card ${stateClass} ${selectedClass} ${cardType ? 'card-' + cardType : ''}" data-index="${index}">
            <div class="location-label">${word}</div>
            ${selectedByCount > 0 ? `<div class="selection-badge">${selectedByCount}</div>` : ''}
            ${keyVisible ? `<div class="card-tag ${cardType}">${cardType === 'assassin' ? 'УБИЙЦА' : cardType === 'neutral' ? 'МИРНЫЙ' : cardType === 'red' ? 'КРАСНЫЙ' : 'СИНИЙ'}</div>` : ''}
          </div>
        `;
      })
      .join('');

    cardsGrid.querySelectorAll('.location-card').forEach((card) => {
      card.addEventListener('click', () => {
        const index = Number(card.dataset.index);
        if (currentPlayerTeam && !currentIsCaptain && currentTeam === currentPlayerTeam && currentPhase === 'guessing' && !currentRevealed[index]) {
          socket.emit('selectWord', { index });
        }
      });
    });

    const minutes = Math.floor(currentPhaseTimer / 60);
    const seconds = currentPhaseTimer % 60;
    const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    let roleHtml = '';
    if (currentIsCaptain && currentTeam === currentPlayerTeam && currentPhase === 'hint') {
      // Show hint modal
      hintModal.style.display = 'flex';
      roleHtml = `
        <h3>👑 ВЫ КАПИТАН ${currentPlayerTeam === 'red' ? 'КРАСНОЙ' : 'СИНИЙ'} КОМАНДЫ</h3>
        <p>Напишите подсказку для команды</p>
        <p>Осталось времени: ${timerText}</p>
      `;
    } else if (currentPhase === 'guessing') {
      hintModal.style.display = 'none';
      const teamText = `Ход: ${currentTeam === 'red' ? 'Красная' : 'Синяя'} команда`;
      const passByCount = Object.values(playerSelections).filter((i) => i === 'pass').length;
      const passButton = currentPlayerTeam === currentTeam && !currentIsCaptain
        ? `<div class="pass-button-container">
            <button id="passTurnBtn" class="secondary">Пас</button>
            ${passByCount > 0 ? `<div class="pass-badge">${passByCount}</div>` : ''}
          </div>`
        : '';
      roleHtml = `
        <h3>👥 ВЫ ${currentIsCaptain ? 'КАПИТАН' : 'ИГРОК'} ${currentPlayerTeam === 'red' ? 'КРАСНОЙ' : 'СИНИЙ'} КОМАНДЫ</h3>
        <p>${teamText}</p>
        <p>Осталось времени: ${timerText}</p>
        ${passButton}
      `;
    } else {
      hintModal.style.display = 'none';
      const teamText = `Ход: ${currentTeam === 'red' ? 'Красная' : 'Синяя'} команда`;
      roleHtml = `
        <h3>👥 ВЫ ${currentIsCaptain ? 'КАПИТАН' : 'ИГРОК'} ${currentPlayerTeam === 'red' ? 'КРАСНОЙ' : 'СИНИЙ'} КОМАНДЫ</h3>
        <p>${teamText}</p>
        <p>Осталось времени: ${timerText}</p>
      `;
    }
    playerRole.innerHTML = roleHtml;

    // Event listeners for hint modal
    if (sendHintBtn) {
      sendHintBtn.onclick = () => {
        const hint = hintInput.value.trim();
        if (hint) {
          socket.emit('sendHint', { hint });
          hintInput.value = '';
          hintModal.style.display = 'none';
        }
      };
    }
    if (cancelHintBtn) {
      cancelHintBtn.onclick = () => {
        hintModal.style.display = 'none';
      };
    }
    const passTurnBtn = document.getElementById('passTurnBtn');
    passTurnBtn?.addEventListener('click', () => {
      socket.emit('passTurn');
    });
  } else {
    tableTitle.textContent = 'Шпион';
    const locationsToShow = currentLocations.length ? currentLocations : ALL_LOCATIONS;
    cardsGrid.innerHTML = locationsToShow.map((loc) => `
      <div class="location-card ${getLocationTheme(loc)}" data-location="${loc}">
        <div class="location-label">${loc}</div>
      </div>
    `).join('');

    cardsGrid.querySelectorAll('.location-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (isSpy) {
          const guessedLocation = card.dataset.location;
          socket.emit('guessLocation', { guess: guessedLocation });
        }
      });
    });

    if (isSpy) {
      playerRole.innerHTML = '<h3>🕵️ ВЫ ШПИОН</h3><p>Угадайте локацию</p><button id="startVoteBtn" class="primary">Голосовать</button>';
    } else {
      playerRole.innerHTML = `<h3>📍 ЛОКАЦИЯ</h3><p>${location}</p><button id="startVoteBtn" class="primary">Голосовать</button>`;
    }
    const startVoteBtn = document.getElementById('startVoteBtn');
    startVoteBtn?.addEventListener('click', () => {
      if (!hasInitiatedVote) {
        showVoteList(players, isSpy);
      }
    });
  }

  const playersHtml = currentGame === 'codenames' ? (() => {
    const redCaptain = currentCaptains.red ? currentPlayers.find(p => p.id === currentCaptains.red)?.nickname : 'Нет';
    const blueCaptain = currentCaptains.blue ? currentPlayers.find(p => p.id === currentCaptains.blue)?.nickname : 'Нет';
    const redPlayers = currentTeams.red.map(p => p.nickname).join(', ');
    const bluePlayers = currentTeams.blue.map(p => p.nickname).join(', ');
    return `
      <h3>Команды</h3>
      <div class="team-info">
        <div class="team red-team">
          <strong>Красная команда (Капитан: ${redCaptain})</strong><br>
          Игроки: ${redPlayers}
        </div>
        <div class="team blue-team">
          <strong>Синяя команда (Капитан: ${blueCaptain})</strong><br>
          Игроки: ${bluePlayers}
        </div>
      </div>
    `;
  })() : players.map((p) => `<li>${p.nickname}${p.id === socket?.id ? ' (вы)' : ''}</li>`).join('');
  playersOnTable.innerHTML = playersHtml;
}

function showVoteList(players, isSpy) {
  const otherPlayers = players.filter((p) => p.id !== socket.id);
  const listHtml = otherPlayers
    .map((p) => `<option value="${p.id}">${p.nickname}</option>`)
    .join('');

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>Выберите игрока для голосования</h3>
      <select id="voteTargetSelect">${listHtml}</select>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button id="confirmVote" class="primary" style="flex: 1;">Голосовать</button>
        <button id="cancelVote" class="secondary" style="flex: 1;">Отмена</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const select = modal.querySelector('#voteTargetSelect');
  const confirmBtn = modal.querySelector('#confirmVote');
  const cancelBtn = modal.querySelector('#cancelVote');

  confirmBtn.addEventListener('click', () => {
    const targetId = select.value;
    if (targetId) {
      hasInitiatedVote = true;
      socket.emit('initiateVote', { targetId });
      modal.remove();
    }
  });

  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
}

function joinRoom(roomId) {
  if (!socket) {
    connectSocket();
  }
  socket.emit('joinRoom', { nickname: currentNickname, roomId });
}


window.addEventListener('load', () => {
  if (loadNickname()) {
    showScreen(mainMenu);
    connectSocket();
  } else {
    showScreen(landingScreen);
  }

  // Setup event listeners after DOM is loaded

  playButton.addEventListener('click', () => {
    showScreen(chooseScreen);
  });

  statsButton.addEventListener('click', openStatsModal);
  logoutButton?.addEventListener('click', logout);
  closeStats.addEventListener('click', closeStatsModal);
  statsModal.addEventListener('click', (event) => {
    if (event.target === statsModal) {
      closeStatsModal();
    }
  });

  spyCard.querySelector('button').addEventListener('click', () => {
    selectGame('spy');
  });

  codenamesCard.querySelector('button').addEventListener('click', () => {
    selectGame('codenames');
  });

  backToMenu.addEventListener('click', () => {
    showScreen(mainMenu);
  });

  backToChooseFromRooms.addEventListener('click', () => {
    showScreen(chooseScreen);
  });

  backToRooms.addEventListener('click', () => {
    showScreen(roomListScreen);
  });

  findRoomButton.addEventListener('click', () => {
    console.log('findRoomButton clicked');
    if (!currentNickname) {
      showMessage('Сначала введите никнейм.');
      return;
    }
    if (!socket) connectSocket();
    const nickname = currentNickname || 'Игрок';
    if (socket && socket.connected) {
      console.log('emitting createOrJoin');
      socket.emit('createOrJoin', { nickname, gameType: currentGame });
    } else {
      console.log('waiting for connect');
      socket.once('connect', () => {
        console.log('connected, emitting createOrJoin');
        socket.emit('createOrJoin', { nickname, gameType: currentGame });
      });
    }
  });

  refreshRooms.addEventListener('click', () => {
    if (!socket) connectSocket();
    if (socket && socket.connected) {
      socket.emit('requestRooms');
    }
  });

  joinByCodeButton.addEventListener('click', () => {
    const code = joinCodeInput.value.trim();
    if (!code) {
      showMessage('Введите код комнаты.');
      return;
    }
    if (!socket) connectSocket();
    if (socket && socket.connected) {
      socket.emit('joinRoomByCode', { code });
    } else {
      socket.once('connect', () => {
        socket.emit('joinRoomByCode', { code });
      });
    }
    joinCodeInput.value = '';
  });

  joinCodeInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      joinByCodeButton.click();
    }
  });

  copyRoomCode.addEventListener('click', () => {
    const code = roomCodeText.textContent;
    if (!code) {
      showMessage('Код комнаты не доступен.');
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      showMessage('Код скопирован в буфер обмена!');
    }).catch(() => {
      const fallback = document.createElement('textarea');
      fallback.value = code;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
      showMessage('Код скопирован в буфер обмена!');
    });
  });

  sendChat.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text || !socket) return;
    socket.emit('sendMessage', { text });
    chatInput.value = '';
  });

  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendChat.click();
    }
  });

  tableSendChat.addEventListener('click', () => {
    const text = tableChatInput.value.trim();
    if (!text || !socket) return;
    socket.emit('sendMessage', { text });
    tableChatInput.value = '';
  });

  tableChatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      tableSendChat.click();
    }
  });

  voteYes.addEventListener('click', () => {
    socket.emit('castVote', { vote: 'yes' });
    votePrompt.style.display = 'none';
  });

});

// Handle page unload to ensure disconnect
window.addEventListener('beforeunload', () => {
  if (socket) {
    socket.disconnect();
  }
});
