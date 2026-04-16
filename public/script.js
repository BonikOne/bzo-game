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
const imaginariumCard = document.getElementById('imaginarium-card');
const chessCard = document.getElementById('chess-card');
const pairsCard = document.getElementById('pairs-card');
const durakCard = document.getElementById('durak-card');
const backToMenu = document.getElementById('backToMenu');
const backToChooseFromRooms = document.getElementById('backToChooseFromRooms');
const backToRooms = document.getElementById('backToRooms');
const findRoomButton = document.getElementById('findRoomButton');
const refreshRooms = document.getElementById('refreshRooms');
const joinCodeInput = document.getElementById('joinCodeInput');
const joinByCodeButton = document.getElementById('joinByCodeButton');
const gameSearchInput = document.getElementById('gameSearchInput');
const gameCards = Array.from(document.querySelectorAll('#choose-screen .game-card'));

function filterGameCards() {
  const query = gameSearchInput?.value.trim().toLowerCase() || '';
  gameCards.forEach((card) => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const matches = !query || title.includes(query);
    card.style.display = matches ? '' : 'none';
  });
}

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

let currentChessBoard = [];
let currentChessColor = null;
let currentChessTurn = 'white';
let selectedChessSource = null;

let currentPairsBoard = [];
let currentPairsTurn = null;
let currentPairsScores = { player1: 0, player2: 0 };
let flippedCards = [];
let canFlip = true;

let currentDurakHand = [];
let currentDurakTrumpSuit = 'H';
let currentDurakTurn = null;
let currentDurakAttackerId = null;
let currentDurakDefenderId = null;
let currentDurakAwaitingDefense = false;
let currentDurakTableCards = [];
let currentDurakDeckCount = 0;

let currentImaginariumHand = [];
let currentImaginariumPhase = null;
let currentAssociation = null;
let currentImaginariumTable = [];
let currentImaginariumScores = {};
let currentLeaderId = null;
let currentRound = 0;
let currentImaginariumVotedIndex = null;
let currentSelectedImaginariumIndex = null;

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

function getGameDisplayName(gameType) {
  if (gameType === 'spy') return 'Шпион';
  if (gameType === 'codenames') return 'Код Неймс';
  if (gameType === 'imaginarium') return 'Имаджинариум';
  if (gameType === 'chess') return 'Шахматы';
  if (gameType === 'pairs') return 'Найди пару';
  if (gameType === 'durak') return 'Дурак';
  return 'Игра';
}

function getSuitName(suit) {
  const suitNames = {
    'D': 'Буби',
    'H': 'Червы',
    'S': 'Пики',
    'C': 'Трефы'
  };
  return suitNames[suit] || suit;
}

function getChessPieceSymbol(piece) {
  const map = {
    wp: '♙', wr: '♖', wn: '♘', wb: '♗', wq: '♕', wk: '♔',
    bp: '♟', br: '♜', bn: '♞', bb: '♝', bq: '♛', bk: '♚'
  };
  return map[piece] || '';
}

let socket = null;
let socketErrorLogged = false;
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
  imaginariumCard.classList.toggle('active', gameType === 'imaginarium');
  chessCard.classList.toggle('active', gameType === 'chess');
  pairsCard.classList.toggle('active', gameType === 'pairs');
  durakCard.classList.toggle('active', gameType === 'durak');
  document.body.classList.toggle('spy-theme', gameType === 'spy');
  document.body.classList.toggle('codenames-theme', gameType === 'codenames');
  document.body.classList.toggle('imaginarium-theme', gameType === 'imaginarium');
  document.body.classList.toggle('chess-theme', gameType === 'chess');
  showScreen(roomListScreen);
  connectSocket();
}

function loadNickname() {
  const saved = localStorage.getItem(STORAGE_NICK);
  if (saved && saved !== 'undefined') {
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
  socket = io({
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 20000
  });
  socket.on('connect', () => {
    console.log('Socket.IO connected');
    socketErrorLogged = false;
    currentPlayerId = socket.id;
    socket.emit('requestRooms');
  });
  socket.on('connect_error', (error) => {
    if (!socketErrorLogged) {
      console.log('Socket.IO connection error:', error);
      showMessage('Не удалось подключиться к серверу. Проверьте, что сервер запущен на http://localhost:3000');
      socketErrorLogged = true;
    }
  });
  socket.on('reconnect_failed', () => {
    console.log('Socket.IO reconnection failed');
    showMessage('Сервер недоступен. Обновите страницу или запустите сервер.');
    socket = null;
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
  socket.on('gameStarted', ({ gameType, isSpy, location, players, availableLocations, words, currentTeam: team, isCaptain, playerTeam, teamCaptains, keyMap, revealed, teams, phase, hint, phaseTimer, hand, leaderId, association, tableCards, scores, round, isLeader, playerColor, currentTurn, chessBoard, pairsBoard, trumpSuit, deckCount, attackerId, defenderId, isAwaitingDefense }) => {
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
    } else if (currentGame === 'imaginarium') {
      currentPlayers = players;
      currentImaginariumHand = hand || [];
      currentLeaderId = leaderId;
      currentImaginariumPhase = phase || 'choose';
      currentAssociation = association || null;
      currentImaginariumTable = tableCards || [];
      currentImaginariumScores = scores || {};
      currentRound = round || 1;
      currentPhaseTimer = phaseTimer || 0;
      currentRole = isLeader ? 'leader' : 'player';
      currentLocation = null;
      currentLocations = [];
    } else if (currentGame === 'chess') {
      currentPlayers = players;
      currentChessBoard = chessBoard || [];
      currentChessColor = playerColor || null;
      currentChessTurn = currentTurn || 'white';
      selectedChessSource = null;
      currentLocation = null;
      currentLocations = [];
    } else if (currentGame === 'pairs') {
      currentPlayers = players;
      currentPairsBoard = pairsBoard || [];
      currentPairsTurn = currentTurn || null;
      currentPairsScores = scores || {};
      flippedCards = [];
      canFlip = true;
      currentLocation = null;
      currentLocations = [];
    } else if (currentGame === 'durak') {
      currentPlayers = players;
      currentDurakHand = hand || [];
      currentDurakTrumpSuit = trumpSuit || 'H';
      currentDurakTurn = currentTurn || null;
      currentDurakAttackerId = attackerId || null;
      currentDurakDefenderId = defenderId || null;
      currentDurakAwaitingDefense = typeof isAwaitingDefense === 'boolean' ? isAwaitingDefense : false;
      currentDurakTableCards = tableCards || [];
      currentDurakDeckCount = deckCount || 0;
      currentLocation = null;
      currentLocations = [];
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
  socket.on('chessBoardUpdate', ({ chessBoard, currentTurn, lastMove, winnerColor }) => {
    currentChessBoard = chessBoard || currentChessBoard;
    currentChessTurn = currentTurn || currentChessTurn;
    if (lastMove) {
      showMessage(`Ход ${lastMove.playerColor}: ${lastMove.from} → ${lastMove.to}`);
    }
    if (winnerColor) {
      showMessage(`Победил ${winnerColor === 'white' ? 'Белый' : 'Чёрный'}!`);
      setTimeout(() => {
        showScreen(lobbyScreen);
        if (socket) socket.emit('requestRooms');
      }, 3000);
    }
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('pairsBoardUpdate', ({ pairsBoard, currentTurn, scores, winner, flippedCards: newFlippedCards }) => {
    currentPairsBoard = pairsBoard || currentPairsBoard;
    currentPairsTurn = currentTurn || currentPairsTurn;
    currentPairsScores = scores || currentPairsScores;
    flippedCards = newFlippedCards || [];
    canFlip = true;
    if (winner) {
      showMessage(`Победил ${winner.nickname}!`);
      setTimeout(() => {
        showScreen(lobbyScreen);
        if (socket) socket.emit('requestRooms');
      }, 3000);
    }
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('durakUpdate', ({ hand, tableCards, currentTurn, deckCount, trumpSuit, attackerId, defenderId, isAwaitingDefense }) => {
    currentDurakHand = hand || currentDurakHand;
    currentDurakTableCards = tableCards || currentDurakTableCards;
    currentDurakTurn = currentTurn || currentDurakTurn;
    currentDurakDeckCount = deckCount || currentDurakDeckCount;
    currentDurakTrumpSuit = trumpSuit || currentDurakTrumpSuit;
    currentDurakAttackerId = attackerId || currentDurakAttackerId;
    currentDurakDefenderId = defenderId || currentDurakDefenderId;
    currentDurakAwaitingDefense = typeof isAwaitingDefense === 'boolean' ? isAwaitingDefense : currentDurakAwaitingDefense;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('imaginariumPhaseChanged', ({ phase, association, phaseTimer, leaderId, round }) => {
    currentImaginariumPhase = phase;
    currentAssociation = association || null;
    currentLeaderId = leaderId || currentLeaderId;
    currentRound = round || currentRound;
    currentPhaseTimer = phaseTimer || 0;
    currentImaginariumVotedIndex = null;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('imaginariumReveal', ({ tableCards, association, phaseTimer, leaderId, scores, round }) => {
    currentImaginariumTable = tableCards || [];
    currentAssociation = association || currentAssociation;
    currentLeaderId = leaderId || currentLeaderId;
    currentImaginariumPhase = 'reveal';
    currentPhaseTimer = phaseTimer || 0;
    currentImaginariumScores = scores || currentImaginariumScores;
    currentRound = round || currentRound;
    currentImaginariumVotedIndex = null;
    renderGameTable(currentPlayers, false, null);
  });
  socket.on('imaginariumScoreUpdate', ({ scores }) => {
    currentImaginariumScores = scores || currentImaginariumScores;
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
    } else if (currentGame === 'imaginarium') {
      const winnerPlayer = players.find((p) => p.id === winner);
      resultText = winnerPlayer ? `Победитель: ${winnerPlayer.nickname}` : 'Игра окончена';
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
            <p>Игра: <strong>${getGameDisplayName(room.gameType)}</strong></p>
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
       <p>Игра: <strong>${getGameDisplayName(room.gameType)}</strong></p>
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
  const minPlayers = room.gameType === 'imaginarium' ? 3 : room.gameType === 'chess' || room.gameType === 'pairs' || room.gameType === 'durak' ? 2 : 4;
  const canStart = room.state === 'waiting' && room.players.length >= minPlayers && isCreator;
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
  cardsGrid.classList.remove('chess-board');
  cardsGrid.classList.remove('pairs-board');

  if (currentGame === 'imaginarium') {
    tableTitle.textContent = 'Имаджинариум';
    const leader = currentPlayers.find((p) => p.id === currentLeaderId);
    const isLeader = socket?.id === currentLeaderId;
    const heading = currentImaginariumPhase === 'choose'
      ? isLeader ? 'Вы ведущий – выберите карту и напишите ассоциацию' : `Ожидайте, ведущий ${leader?.nickname || 'игрок'} выбирает карту` 
      : currentImaginariumPhase === 'submit'
        ? isLeader ? 'Ожидайте, ведущий выбрал карту' : 'Выберите карту из своей руки, которая лучше всего подходит к ассоциации'
        : currentImaginariumPhase === 'reveal'
          ? 'Голосуйте, какую карту выбрал ведущий'
          : 'Ожидайте результатов';

    playerRole.innerHTML = `
      <h3>${heading}</h3>
      <p>Раунд: ${currentRound}</p>
      <p>Ведущий: ${leader?.nickname || '—'}</p>
      <p>Ассоциация: ${currentAssociation ? `«${currentAssociation}»` : 'не задана'}</p>
      <p>Очки: ${currentImaginariumScores[socket?.id] || 0}</p>
    `;

    if (currentImaginariumPhase === 'choose' && isLeader) {
      cardsGrid.innerHTML = currentImaginariumHand
        .map((card, index) => `
          <div class="location-card imaginarium-card${currentSelectedImaginariumIndex === index ? ' selected' : ''}" data-index="${index}">
            <img src="${card.image}" alt="${card.label}" class="card-image">
          </div>
        `)
        .join('');
      cardsGrid.querySelectorAll('.location-card').forEach((card) => {
        card.addEventListener('click', () => {
          const index = Number(card.dataset.index);
          currentSelectedImaginariumIndex = index;
          hintModal.querySelector('h3').textContent = 'Напишите ассоциацию для выбранной карты';
          hintInput.placeholder = 'Ассоциация...';
          hintModal.style.display = 'flex';
        });
      });
    } else if (currentImaginariumPhase === 'submit') {
      cardsGrid.innerHTML = currentImaginariumHand
        .map((card, index) => `
          <div class="location-card imaginarium-card" data-index="${index}">
            <img src="${card.image}" alt="${card.label}" class="card-image">
          </div>
        `)
        .join('');
      cardsGrid.querySelectorAll('.location-card').forEach((card) => {
        card.addEventListener('click', () => {
          const index = Number(card.dataset.index);
          socket.emit('submitCard', { index });
          showMessage('Карта отправлена ведущему. Ожидайте следующего этапа.');
        });
      });
    } else if (currentImaginariumPhase === 'reveal') {
      cardsGrid.innerHTML = currentImaginariumTable
        .map((card, index) => `
          <div class="location-card imaginarium-card${currentImaginariumVotedIndex === index ? ' selected' : ''}${card.playerId === socket?.id ? ' my-submitted-card' : ''}" data-index="${index}">
            <img src="${card.card.image}" alt="${card.card.label}" class="card-image">
          </div>
        `)
        .join('');
      cardsGrid.querySelectorAll('.location-card').forEach((card) => {
        const index = Number(card.dataset.index);
        const tableCard = currentImaginariumTable[index];
        if (!isLeader && tableCard?.playerId !== socket?.id) {
          card.addEventListener('click', () => {
            currentImaginariumVotedIndex = index;
            socket.emit('voteForCard', { tableIndex: index });
            showMessage('Ваш голос отправлен. Ожидайте окончания голосования.');
            renderGameTable(currentPlayers, false, null);
          });
        }
      });
    } else {
      cardsGrid.innerHTML = `<div class="info-card"><p>Ожидайте, игра начинается.</p></div>`;
    }

    playersOnTable.innerHTML = `<h3>Счёт</h3><ul>${currentPlayers.map((p) => `
      <li>${p.nickname}${p.id === currentLeaderId ? ' (ведущий)' : ''} — ${currentImaginariumScores[p.id] || 0}</li>
    `).join('')}</ul>`;

    return;
  }
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

    const passTurnBtn = document.getElementById('passTurnBtn');
    passTurnBtn?.addEventListener('click', () => {
      socket.emit('passTurn');
    });
  } else if (currentGame === 'chess') {
    tableTitle.textContent = 'Шахматы';
    cardsGrid.classList.add('chess-board');
    const board = currentChessBoard.length ? currentChessBoard : [
      ['br','bn','bb','bq','bk','bb','bn','br'],
      ['bp','bp','bp','bp','bp','bp','bp','bp'],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['wp','wp','wp','wp','wp','wp','wp','wp'],
      ['wr','wn','wb','wq','wk','wb','wn','wr']
    ];
    const isMyTurn = currentChessColor === currentChessTurn;
    const selected = selectedChessSource;
    const columns = ['A','B','C','D','E','F','G','H'];
    const isBlack = currentChessColor === 'black';
    const displayBoard = isBlack ? board.map(row => row.slice().reverse()).reverse() : board;
    const displayColumns = isBlack ? columns.slice().reverse() : columns;

    cardsGrid.innerHTML = `
      <div class="chess-label corner-label"></div>
      ${displayColumns.map((col) => `<div class="chess-label top-label">${col}</div>`).join('')}
      ${displayBoard.map((row, rowIndex) => `
        <div class="chess-label left-label">${8 - rowIndex}</div>
        ${row.map((cell, colIndex) => {
          const isWhiteSquare = (rowIndex + colIndex) % 2 === 0;
          const isSelected = selected && selected.row === rowIndex && selected.col === colIndex;
          return `<div class="chess-square ${isWhiteSquare ? 'white' : 'black'}${isSelected ? ' selected' : ''}" data-row="${rowIndex}" data-col="${colIndex}">
            <span class="chess-piece ${cell.startsWith('w') ? 'white-piece' : cell.startsWith('b') ? 'black-piece' : ''}">${getChessPieceSymbol(cell)}</span>
          </div>`;
        }).join('')}
      `).join('')}
    `;

    cardsGrid.querySelectorAll('.chess-square').forEach((square) => {
      square.addEventListener('click', () => {
        const displayRow = Number(square.dataset.row);
        const displayCol = Number(square.dataset.col);
        const originalRow = isBlack ? 7 - displayRow : displayRow;
        const originalCol = isBlack ? 7 - displayCol : displayCol;
        const piece = board[originalRow][originalCol] || '';
        const pieceColor = piece.startsWith('w') ? 'white' : piece.startsWith('b') ? 'black' : null;

        if (!selected) {
          if (!pieceColor || pieceColor !== currentChessColor) return;
          selectedChessSource = { row: displayRow, col: displayCol };
          renderGameTable(currentPlayers, false, null);
          return;
        }

        if (selected.row === displayRow && selected.col === displayCol) {
          selectedChessSource = null;
          renderGameTable(currentPlayers, false, null);
          return;
        }

        if (!isMyTurn) {
          showMessage('Сейчас ходит другой игрок.');
          return;
        }

        socket.emit('moveChessPiece', {
          from: { row: isBlack ? 7 - selected.row : selected.row, col: isBlack ? 7 - selected.col : selected.col },
          to: { row: originalRow, col: originalCol }
        });
        selectedChessSource = null;
      });
    });

    const currentSide = currentChessTurn === 'white' ? 'Белые' : 'Чёрные';
    const roleText = currentChessColor
      ? `Вы играете за ${currentChessColor === 'white' ? 'Белых' : 'Чёрных'}`
      : 'Ожидайте соперника';
    playerRole.innerHTML = `
      <div class="chess-info">
        <h3>${roleText}</h3>
        <p>Сейчас ход: ${currentSide}</p>
        <p>${isMyTurn ? 'Ваш ход. Выберите фигуру, затем клетку.' : 'Ожидайте хода соперника.'}</p>
      </div>
    `;

    playersOnTable.innerHTML = `<h3>Игроки</h3><ul>${currentPlayers.map((p) => {
      const color = p.id === socket?.id ? currentChessColor : (currentChessColor === 'white' ? 'black' : 'white');
      return `<li>${p.nickname}${p.id === socket?.id ? ' (вы)' : ''} — ${color === 'white' ? 'Белые' : 'Чёрные'}</li>`;
    }).join('')}</ul>`;
    return;
  } else if (currentGame === 'pairs') {
    tableTitle.textContent = 'Найди пару';
    cardsGrid.classList.add('pairs-board');
    const board = currentPairsBoard.length ? currentPairsBoard : Array(16).fill(null).map((_, i) => ({ id: i, value: Math.floor(i / 2) + 1, flipped: false, matched: false }));
    const isMyTurn = currentPairsTurn === socket?.id;
    const currentPlayer = currentPlayers.find(p => p.id === currentPairsTurn);
    const myScore = currentPairsScores[socket?.id] || 0;
    const opponentScore = Object.values(currentPairsScores).reduce((sum, score) => sum + score, 0) - myScore;

    cardsGrid.innerHTML = board.map((card, index) => `
      <div class="pairs-card-flip${card.flipped ? ' flipped' : ''}${card.matched ? ' matched' : ''}" data-index="${index}">
        <div class="pairs-card-inner">
          <div class="pairs-card-front"></div>
          <div class="pairs-card-back">${card.value}</div>
        </div>
      </div>
    `).join('');

    cardsGrid.querySelectorAll('.pairs-card-flip').forEach((cardElement) => {
      cardElement.addEventListener('click', () => {
        const index = Number(cardElement.dataset.index);
        const card = board[index];
        if (card.flipped || card.matched || !canFlip || !isMyTurn) return;

        socket.emit('flipCard', { index });
      });
    });

    playerRole.innerHTML = `
      <div class="pairs-info">
        <h3>${isMyTurn ? 'Ваш ход' : `Ход: ${currentPlayer?.nickname || 'игрок'}`}</h3>
        <p>Ваши пары: ${myScore}</p>
        <p>Пары соперника: ${opponentScore}</p>
      </div>
    `;

    playersOnTable.innerHTML = `<h3>Игроки</h3><ul>${currentPlayers.map((p) => {
      const score = currentPairsScores[p.id] || 0;
      return `<li>${p.nickname}${p.id === socket?.id ? ' (вы)' : ''} — ${score} пар</li>`;
    }).join('')}</ul>`;
    return;
  } else if (currentGame === 'durak') {
    tableTitle.textContent = 'Дурак';
    cardsGrid.classList.add('durak-board');
    const isMyTurn = currentDurakTurn === socket?.id;
    const currentPlayer = currentPlayers.find(p => p.id === currentDurakTurn);
    const isAttacker = socket?.id === currentDurakAttackerId;
    const isDefender = socket?.id === currentDurakDefenderId;

    // Render player's hand
    const handHtml = currentDurakHand.map((card, index) => `
      <div class="durak-card" data-card-id="${card.id}" data-index="${index}">
        <img src="durak-cards/${card.id}.png" alt="${card.rank} ${card.suit}" class="card-image">
      </div>
    `).join('');

    // Render table cards
    const tableHtml = currentDurakTableCards.map((card, index) => `
      <div class="durak-table-card" data-index="${index}">
        <img src="durak-cards/${card.id}.png" alt="${card.rank} ${card.suit}" class="card-image">
      </div>
    `).join('');

    const showAttackButton = isMyTurn && isAttacker && !currentDurakAwaitingDefense;
    const showDefendTakeButtons = isMyTurn && isDefender && currentDurakAwaitingDefense;
    const showPassButton = isMyTurn && isAttacker && !currentDurakAwaitingDefense && currentDurakTableCards.length > 0;

    cardsGrid.innerHTML = `
      <div class="durak-game">
        <div class="durak-hand">
          <h4>Ваши карты</h4>
          <div class="durak-cards-container">${handHtml}</div>
        </div>
        <div class="durak-table">
          <h4>Стол</h4>
          <div class="durak-table-container">${tableHtml}</div>
          <div class="durak-deck-info">
            <p>Карт в колоде: ${currentDurakDeckCount}</p>
            <p>Козырь: ${getSuitName(currentDurakTrumpSuit)}</p>
            <p>Роль: ${isAttacker ? 'Атакующий' : isDefender ? 'Защитник' : 'Ожидайте'}</p>
            <p>${currentDurakAwaitingDefense ? 'Ожидание защиты' : 'Ход открытия'}</p>
          </div>
        </div>
        <div class="durak-actions">
          ${showAttackButton ? '<button class="btn primary durak-attack-btn">Атаковать</button>' : ''}
          ${showDefendTakeButtons ? '<button class="btn secondary durak-defend-btn">Защититься</button><button class="btn danger durak-take-btn">Взять</button>' : ''}
          ${showPassButton ? '<button class="btn success durak-pass-btn">Бито</button>' : ''}
        </div>
      </div>
    `;

    // Add click handlers for cards
    cardsGrid.querySelectorAll('.durak-card').forEach((cardElement) => {
      cardElement.addEventListener('click', () => {
        if (!isMyTurn) return;
        const cardId = cardElement.dataset.cardId;
        if (isDefender && currentDurakAwaitingDefense) {
          socket.emit('playDurakCard', { cardId, action: 'defend' });
        } else if (isAttacker && !currentDurakAwaitingDefense) {
          socket.emit('playDurakCard', { cardId, action: 'attack' });
        }
      });
    });

    const takeBtn = cardsGrid.querySelector('.durak-take-btn');
    if (takeBtn) {
      takeBtn.addEventListener('click', () => {
        socket.emit('playDurakCard', { action: 'take' });
      });
    }

    const passBtn = cardsGrid.querySelector('.durak-pass-btn');
    if (passBtn) {
      passBtn.addEventListener('click', () => {
        socket.emit('playDurakCard', { action: 'pass' });
      });
    }

    playerRole.innerHTML = `
      <div class="durak-info">
        <h3>${isMyTurn ? 'Ваш ход' : `Ход: ${currentPlayer?.nickname || 'игрок'}`}</h3>
        <p>Карт в руке: ${currentDurakHand.length}</p>
      </div>
    `;

    playersOnTable.innerHTML = `<h3>Игроки</h3><ul>${currentPlayers.map((p) => {
      return `<li>${p.nickname}${p.id === socket?.id ? ' (вы)' : ''} — ${p.id === socket?.id ? currentDurakHand.length : '?'} карт</li>`;
    }).join('')}</ul>`;
    return;
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

  gameSearchInput?.addEventListener('input', filterGameCards);

  spyCard.addEventListener('click', () => {
    selectGame('spy');
  });

  codenamesCard.addEventListener('click', () => {
    selectGame('codenames');
  });

  imaginariumCard.addEventListener('click', () => {
    selectGame('imaginarium');
  });

  chessCard?.addEventListener('click', () => {
    selectGame('chess');
  });

  pairsCard?.addEventListener('click', () => {
    selectGame('pairs');
  });

  durakCard?.addEventListener('click', () => {
    selectGame('durak');
  });

  backToMenu.addEventListener('click', () => {
    showScreen(mainMenu);
  });

  backToChooseFromRooms.addEventListener('click', () => {
    showScreen(chooseScreen);
  });

  function leaveCurrentRoom() {
    if (socket && socket.connected && currentRoom) {
      socket.emit('leaveRoom');
    }
    currentRoom = null;
  }

  backToRooms.addEventListener('click', () => {
    leaveCurrentRoom();
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
    if (!currentNickname) {
      showMessage('Сначала введите никнейм.');
      return;
    }
    if (!socket) connectSocket();
    if (socket && socket.connected) {
      socket.emit('joinRoomByCode', { code, nickname: currentNickname });
    } else {
      socket.once('connect', () => {
        socket.emit('joinRoomByCode', { code, nickname: currentNickname });
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

  if (sendHintBtn) {
    sendHintBtn.addEventListener('click', () => {
      const hint = hintInput.value.trim();
      if (!hint || !socket) return;
      if (currentGame === 'imaginarium' && currentImaginariumPhase === 'choose' && currentSelectedImaginariumIndex !== null) {
        socket.emit('submitAssociation', { index: currentSelectedImaginariumIndex, association: hint });
        currentSelectedImaginariumIndex = null;
      } else {
        socket.emit('sendHint', { hint });
      }
      hintInput.value = '';
      hintModal.style.display = 'none';
    });
  }

  if (cancelHintBtn) {
    cancelHintBtn.addEventListener('click', () => {
      currentSelectedImaginariumIndex = null;
      hintModal.style.display = 'none';
    });
  }

  sendChat.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text || !socket) return;
    console.log('Sending lobby message with nickname:', currentNickname);
    socket.emit('sendMessage', { text, nickname: currentNickname });
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
    console.log('Sending table message with nickname:', currentNickname);
    socket.emit('sendMessage', { text, nickname: currentNickname });
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
