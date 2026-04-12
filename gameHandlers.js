const roomManager = require('./roomManager');
const { LOCATIONS, shuffle, createCodenamesSetup, assignTeams } = require('./gameUtils');
const fs = require('fs');
const path = require('path');

function loadImaginariumCards() {
  const cardsDir = path.join(__dirname, 'public', 'imaginarium', 'cards');
  try {
    if (!fs.existsSync(cardsDir)) return [];
    return fs.readdirSync(cardsDir)
      .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
      .map((file) => ({ label: path.parse(file).name, image: `/imaginarium/cards/${encodeURIComponent(file)}` }));
  } catch (error) {
    console.error('Ошибка загрузки карточек Имаджинариум:', error);
    return [];
  }
}

function createImaginariumDeck() {
  const cards = loadImaginariumCards();
  if (cards.length > 0) {
    return shuffle(cards);
  }
  return Array.from({ length: 85 }, (_, i) => `Карта ${i + 1}`);
}

// Game event handlers
function setupGameHandlers(io) {
  console.log('Setting up Socket.IO event handlers...');

  // Helper function to get room and validate
  async function getValidatedRoom(socket, gameType = null, phase = null) {
    const roomId = socket.data.roomId;
    const room = await roomManager.getRoom(roomId);
    if (!room) return null;

    if (gameType && room.gameType !== gameType) return null;
    if (phase && room.phase !== phase) return null;
    if (room.state !== 'playing') return null;

    return room;
  }

  // Send hint handler
  io.on('connection', (socket) => {
    console.log('New Socket.IO connection:', socket.id);

    // Create or join room handler
    socket.on('createOrJoin', async ({ nickname, gameType }) => {
      try {
        // If player is already in a room, don't create/join another
        if (socket.data.roomId) {
          const currentRoom = await roomManager.getRoom(socket.data.roomId);
          if (currentRoom) {
            socket.emit('roomJoined', {
              roomId: currentRoom.id,
              title: currentRoom.title,
              creatorId: currentRoom.creatorId,
              gameType: currentRoom.gameType
            });
            const updatedRoom = await roomManager.getRoom(socket.data.roomId);
            io.to(socket.data.roomId).emit('roomUpdate', updatedRoom);
            return;
          }
        }

        if (!nickname || !gameType) return;

        console.log(`Creating room for ${nickname}, gameType: ${gameType}`);
        socket.data.nickname = nickname;
        socket.data.gameType = gameType;

        // Always create a new room
        let room = await roomManager.createRoom({ id: socket.id, nickname }, gameType);

        socket.data.roomId = room.id;
        socket.join(room.id);

        // Send room info to client
        socket.emit('roomJoined', {
          roomId: room.id,
          title: room.title,
          creatorId: room.creatorId,
          gameType: room.gameType
        });

        // Send current room state
        const updatedRoom = await roomManager.getRoom(room.id);
        io.to(room.id).emit('roomUpdate', updatedRoom);

      } catch (error) {
        console.error('Error in createOrJoin:', error);
      }
    });

    // Request rooms list handler
    socket.on('requestRooms', async () => {
      try {
        const rooms = await roomManager.getAllRooms();
        socket.emit('roomList', rooms);
      } catch (error) {
        console.error('Error requesting rooms:', error);
      }
    });

    // Join specific room handler
    socket.on('joinRoom', async ({ nickname, roomId }) => {
      try {
        const room = await roomManager.getRoom(roomId);
        if (!room || room.state !== 'waiting' || room.players.length >= room.capacity) {
          socket.emit('error', 'Cannot join this room');
          return;
        }

        // Check if player is already in the room
        const existingPlayer = room.players.find(p => p.id === socket.id);
        if (existingPlayer) {
          // Player already in room, just update socket data
          socket.data.roomId = roomId;
          socket.data.nickname = nickname;
          socket.join(roomId);
          socket.emit('roomJoined', {
            roomId: room.id,
            title: room.title,
            creatorId: room.creatorId,
            gameType: room.gameType
          });
          const updatedRoom = await roomManager.getRoom(roomId);
          io.to(roomId).emit('roomUpdate', updatedRoom);
          return;
        }

        await roomManager.joinRoom(roomId, nickname, socket.id);
        socket.data.roomId = roomId;
        socket.data.nickname = nickname;
        socket.join(roomId);

        socket.emit('roomJoined', {
          roomId: room.id,
          title: room.title,
          creatorId: room.creatorId,
          gameType: room.gameType
        });

        const updatedRoom = await roomManager.getRoom(roomId);
        io.to(roomId).emit('roomUpdate', updatedRoom);

      } catch (error) {
        console.error('Error in joinRoom:', error);
        socket.emit('error', 'Failed to join room');
      }
    });

    // Join room by code handler
    socket.on('joinRoomByCode', async ({ code, nickname }) => {
      try {
        const room = await roomManager.getRoom(code);
        if (!room) {
          socket.emit('error', 'Комната с таким кодом не найдена');
          return;
        }
        if (room.state !== 'waiting' || room.players.length >= room.capacity) {
          socket.emit('error', 'Невозможно присоединиться к этой комнате');
          return;
        }

        // Check if player is already in the room
        const existingPlayer = room.players.find(p => p.id === socket.id);
        if (existingPlayer) {
          socket.data.roomId = code;
          socket.data.nickname = existingPlayer.nickname;
          socket.join(code);
          socket.emit('roomJoined', {
            roomId: room.id,
            title: room.title,
            creatorId: room.creatorId,
            gameType: room.gameType
          });
          const updatedRoom = await roomManager.getRoom(code);
          io.to(code).emit('roomUpdate', updatedRoom);
          return;
        }

        // If not in room, need nickname - but since it's by code, assume user is logged in
        const finalNickname = nickname || socket.data.nickname || 'Player';
        await roomManager.joinRoom(code, finalNickname, socket.id);
        socket.data.roomId = code;
        socket.data.nickname = finalNickname;
        socket.join(code);

        socket.emit('roomJoined', {
          roomId: room.id,
          title: room.title,
          creatorId: room.creatorId,
          gameType: room.gameType
        });

        const updatedRoom = await roomManager.getRoom(code);
        io.to(code).emit('roomUpdate', updatedRoom);

      } catch (error) {
        console.error('Error in joinRoomByCode:', error);
        socket.emit('error', 'Не удалось присоединиться к комнате');
      }
    });

    // Leave room handler
    socket.on('leaveRoom', async () => {
      try {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        socket.leave(roomId);
        const room = await roomManager.removePlayerFromRoom(roomId, socket.id);
        delete socket.data.roomId;

        if (room) {
          io.to(roomId).emit('roomUpdate', {
            id: room.id,
            title: room.title,
            creatorId: room.creatorId,
            players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
            capacity: room.capacity,
            state: room.state,
            gameType: room.gameType,
            location: room.state === 'playing' ? room.location : null,
            spyId: room.state === 'playing' ? room.spyId : null,
            availableLocations: room.state === 'playing' && room.gameType === 'spy' ? room.availableLocations : null,
            currentVotingTarget: room.currentVotingTarget,
            chat: room.chat
          });
        }

        const allRooms = await roomManager.getAllRooms();
        io.emit('roomList', allRooms);
      } catch (error) {
        console.error('Error in leaveRoom:', error);
      }
    });

    // Start game handler
    socket.on('startGame', async () => {
      try {
        const roomId = socket.data.roomId;
        const room = await roomManager.getRoom(roomId);
        if (!room || room.state !== 'waiting') return;

        if (room.creatorId !== socket.id) {
          socket.emit('error', 'Только создатель может начать игру.');
          return;
        }

        if (room.players.length < 4) {
          socket.emit('error', 'Нужно минимум 4 игрока для начала игры.');
          return;
        }

        room.state = 'playing';
        room.gameStartTime = Date.now();
        room.votes = {};
        room.hasVotedThisRound = [];
        room.hasVotedForGuess = [];
        room.currentVotingTarget = null;
        room.chat = [];

        if (room.gameType === 'codenames') {
          const setup = createCodenamesSetup();
          room.words = setup.words;
          room.keyMap = setup.keyMap;
          room.currentTeam = setup.startingTeam;
          room.revealed = Array(25).fill(false);
          room.teams = assignTeams(room.players);
          room.captains = {
            red: room.teams.red[0]?.id || room.players[0]?.id,
            blue: room.teams.blue[0]?.id || room.players[1]?.id || room.players[0]?.id
          };
          room.phase = 'hint';
          room.hint = null;
          room.phaseTimer = 60;
          room.playerSelections = {};
          room.playerPasses = [];

          room.players.forEach((player) => {
            const isCaptain = player.id === room.captains.red || player.id === room.captains.blue;
            const playerTeam = room.teams.red.some((p) => p.id === player.id) ? 'red' : 'blue';
            io.to(player.id).emit('gameStarted', {
              gameType: 'codenames',
              players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
              words: room.words,
              currentTeam: room.currentTeam,
              isCaptain,
              playerTeam,
              teamCaptains: room.captains,
              keyMap: isCaptain ? room.keyMap : null,
              revealed: room.revealed,
              teams: {
                red: room.teams.red.map((p) => ({ id: p.id, nickname: p.nickname })),
                blue: room.teams.blue.map((p) => ({ id: p.id, nickname: p.nickname }))
              },
              phase: room.phase,
              hint: room.hint,
              phaseTimer: room.phaseTimer
            });
          });
        } else if (room.gameType === 'imaginarium') {
          if (room.players.length < 3) {
            socket.emit('error', 'Нужно минимум 3 игрока для Имаджинариума.');
            return;
          }

          const deck = createImaginariumDeck();
          const handSize = Math.min(6, Math.floor(deck.length / room.players.length));
          const shuffledDeck = shuffle(deck.slice());
          room.imaginariumHands = {};
          room.players.forEach((player) => {
            room.imaginariumHands[player.id] = shuffledDeck.splice(0, handSize);
          });
          room.imaginariumDeck = shuffledDeck;

          room.currentLeaderIndex = room.currentLeaderIndex || 0;
          room.leaderId = room.players[room.currentLeaderIndex].id;
          room.association = null;
          room.chosenCard = null;
          room.submissions = {};
          room.tableCards = [];
          room.scores = room.scores || {};
          room.players.forEach((player) => {
            if (room.scores[player.id] == null) {
              room.scores[player.id] = 0;
            }
          });
          room.round = room.round || 1;
          room.phase = 'choose';
          room.phaseTimer = 0;

          room.players.forEach((player) => {
            const isLeader = player.id === room.leaderId;
            io.to(player.id).emit('gameStarted', {
              gameType: 'imaginarium',
              players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
              hand: room.imaginariumHands[player.id],
              leaderId: room.leaderId,
              association: room.association,
              scores: room.scores,
              round: room.round,
              phase: room.phase,
              phaseTimer: room.phaseTimer,
              isLeader
            });
          });
        } else {
          // Spy game
          room.availableLocations = shuffle(LOCATIONS).slice(0, 25);
          room.location = room.availableLocations[Math.floor(Math.random() * room.availableLocations.length)];
          const spyIndex = Math.floor(Math.random() * room.players.length);
          room.spyId = room.players[spyIndex].id;

          room.players.forEach((player) => {
            const isSpy = player.id === room.spyId;
            io.to(player.id).emit('gameStarted', {
              gameType: 'spy',
              isSpy,
              location: isSpy ? null : room.location,
              players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
              availableLocations: room.availableLocations
            });
          });
        }

        await roomManager.updateRoom(roomId, room);
        io.to(room.id).emit('roomUpdate', {
          id: room.id,
          title: room.title,
          creatorId: room.creatorId,
          players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
          capacity: room.capacity,
          state: room.state,
          gameType: room.gameType,
          gameStartTime: room.gameStartTime
        });

      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', 'Failed to start game');
      }
    });

    socket.on('sendHint', async ({ hint }) => {
      try {
        const room = await getValidatedRoom(socket, 'codenames', 'hint');
        if (!room) return;

        const isCaptain = socket.id === room.captains.red || socket.id === room.captains.blue;
        if (!isCaptain) return;

        if (!hint || typeof hint !== 'string' || hint.trim().length === 0) return;

        room.hint = hint.trim();
        room.phase = 'guessing';
        room.phaseTimer = 90;
        clearInterval(roomManager.phaseIntervals.get(room.id));
        roomManager.phaseIntervals.delete(room.id);
        startPhaseTimer(room, io);
        io.to(room.id).emit('gameMessage', { system: true, text: `Капитан ${socket.data.nickname} дал подсказку: "${room.hint}"` });
        io.to(room.id).emit('phaseChanged', { phase: room.phase, hint: room.hint, phaseTimer: room.phaseTimer });

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error sending hint:', error);
      }
    });

    // Imaginarium association handler
    socket.on('submitAssociation', async ({ index, association }) => {
      try {
        const room = await getValidatedRoom(socket, 'imaginarium');
        if (!room || room.phase !== 'choose') return;
        if (socket.id !== room.leaderId) return;
        const hand = room.imaginariumHands?.[socket.id] || [];
        if (index < 0 || index >= hand.length) return;
        if (!association || typeof association !== 'string' || !association.trim()) return;

        room.chosenCard = { playerId: socket.id, nickname: socket.data.nickname, card: hand[index] };
        room.imaginariumHands[socket.id] = hand.filter((_, i) => i !== index);
        room.association = association.trim();
        room.phase = 'submit';
        room.phaseTimer = 0;
        room.votes = {};
        room.submissions = {};

        io.to(room.id).emit('gameMessage', { system: true, text: `Ведущий выбрал карту и дал ассоциацию: «${room.association}»` });
        io.to(room.id).emit('imaginariumPhaseChanged', {
          phase: room.phase,
          association: room.association,
          phaseTimer: room.phaseTimer,
          leaderId: room.leaderId,
          round: room.round
        });

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error submitting association:', error);
      }
    });

    socket.on('submitCard', async ({ index }) => {
      try {
        const room = await getValidatedRoom(socket, 'imaginarium', 'submit');
        if (!room) return;
        if (socket.id === room.leaderId) return;
        const hand = room.imaginariumHands?.[socket.id] || [];
        if (index < 0 || index >= hand.length) return;

        const card = hand[index];
        room.imaginariumHands[socket.id] = hand.filter((_, i) => i !== index);
        room.submissions[socket.id] = { playerId: socket.id, nickname: socket.data.nickname, card };

        const expected = room.players.length - 1;
        if (Object.keys(room.submissions).length >= expected && room.chosenCard) {
          const tableCards = shuffle([
            ...Object.values(room.submissions),
            { ...room.chosenCard, isLeader: true }
          ]).map((item, tableIndex) => ({ ...item, tableIndex }));

          room.tableCards = tableCards;
          room.phase = 'reveal';
          room.phaseTimer = 0;
          room.votes = {};

          io.to(room.id).emit('gameMessage', { system: true, text: 'Все карты собраны. Начинается голосование.' });
          io.to(room.id).emit('imaginariumReveal', {
            tableCards: room.tableCards,
            association: room.association,
            phaseTimer: room.phaseTimer,
            leaderId: room.leaderId,
            scores: room.scores,
            round: room.round
          });
        }

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error submitting card:', error);
      }
    });

    socket.on('voteForCard', async ({ tableIndex }) => {
      try {
        const room = await getValidatedRoom(socket, 'imaginarium', 'reveal');
        if (!room) return;
        if (socket.id === room.leaderId) return;
        if (room.votes?.[socket.id] != null) return;

        const tableCard = room.tableCards?.[tableIndex];
        if (!tableCard) return;

        room.votes[socket.id] = tableIndex;

        const voters = room.players.filter((p) => p.id !== room.leaderId);
        const allVoted = voters.every((p) => room.votes?.[p.id] != null);

        if (allVoted) {
          const correctVotes = voters.filter((p) => {
            const voted = room.votes[p.id];
            return room.tableCards[voted]?.playerId === room.leaderId;
          }).length;

          const totalVotes = voters.length;
          const leaderScore = correctVotes === 0 || correctVotes === totalVotes ? 0 : 3 + correctVotes;
          room.scores[room.leaderId] = (room.scores[room.leaderId] || 0) + leaderScore;

          voters.forEach((player) => {
            const voted = room.votes[player.id];
            if (room.tableCards[voted]?.playerId === room.leaderId) {
              room.scores[player.id] = (room.scores[player.id] || 0) + 3;
            }
          });

          room.tableCards.forEach((card) => {
            if (card.playerId !== room.leaderId) {
              const votesForCard = Object.values(room.votes).filter((voteIndex) => room.tableCards[voteIndex]?.playerId === card.playerId).length;
              room.scores[card.playerId] = (room.scores[card.playerId] || 0) + votesForCard;
            }
          });

          const winner = room.players.find((p) => (room.scores[p.id] || 0) >= 39);
          if (winner) {
            room.state = 'ended';
            io.to(room.id).emit('gameMessage', { system: true, text: `Игра окончена! Победитель: ${winner.nickname}` });
            io.to(room.id).emit('gameEnded', {
              winner: winner.id,
              reason: 'score',
              players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
            });
            scheduleRoomReset(room, io, `Победил ${winner.nickname}. Можно начать новую игру.`);
          } else {
            // Обновить руки: удалить отправленную карту, добавить новую
            room.players.forEach((player) => {
              const submitted = room.tableCards.find((t) => t.playerId === player.id);
              if (submitted) {
                const hand = room.imaginariumHands[player.id];
                const index = hand.findIndex((c) => c.label === submitted.card.label && c.image === submitted.card.image);
                if (index !== -1) {
                  hand.splice(index, 1);
                }
              }
              // Добрать до 6 карт
              while (room.imaginariumHands[player.id].length < 6 && room.imaginariumDeck.length > 0) {
                room.imaginariumHands[player.id].push(room.imaginariumDeck.pop());
              }
            });

            room.tableCards = [];
            room.round += 1;
            room.currentLeaderIndex = (room.currentLeaderIndex + 1) % room.players.length;
            room.leaderId = room.players[room.currentLeaderIndex].id;
            room.association = null;
            room.chosenCard = null;
            room.submissions = {};
            room.votes = {};
            room.phase = 'choose';
            room.phaseTimer = 0;

            io.to(room.id).emit('gameMessage', { system: true, text: `Раунд ${room.round}. Ведущий: ${room.players[room.currentLeaderIndex].nickname}` });
            room.players.forEach((player) => {
              io.to(player.id).emit('gameStarted', {
                gameType: 'imaginarium',
                players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
                hand: room.imaginariumHands[player.id],
                leaderId: room.leaderId,
                association: room.association,
                scores: room.scores,
                round: room.round,
                phase: room.phase,
                phaseTimer: room.phaseTimer,
                isLeader: player.id === room.leaderId
              });
            });
          }
        }

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error voting in imaginarium:', error);
      }
    });

    // Select word handler
    socket.on('selectWord', async ({ index }) => {
      try {
        const room = await getValidatedRoom(socket, 'codenames', 'guessing');
        if (!room) return;

        const player = room.players.find((p) => p.id === socket.id);
        if (!player) return;

        const playerTeam = room.teams.red.some((p) => p.id === player.id) ? 'red' : 'blue';
        const isCaptain = socket.id === room.captains.red || socket.id === room.captains.blue;

        if (isCaptain || playerTeam !== room.currentTeam) return;
        if (index < 0 || index >= room.words.length || room.revealed[index]) return;

        room.playerSelections[socket.id] = index;
        room.playerPasses = room.playerPasses.filter(id => id !== socket.id);
        io.to(room.id).emit('playerSelectionsUpdate', room.playerSelections);

        // Check if all non-captain players selected
        const currentTeamPlayers = playerTeam === 'red' ? room.teams.red : room.teams.blue;
        const nonCaptainPlayers = currentTeamPlayers.filter((p) => p.id !== room.captains[playerTeam]);
        const allSelected = nonCaptainPlayers.every((p) => room.playerSelections.hasOwnProperty(p.id) || room.playerPasses.includes(p.id));

        if (allSelected) {
          const selections = nonCaptainPlayers.map((p) => room.playerSelections[p.id]).filter((s) => s !== undefined);
          const passes = nonCaptainPlayers.filter((p) => room.playerPasses.includes(p.id)).length;

          if (passes === nonCaptainPlayers.length) {
            // All passed
            room.currentTeam = room.currentTeam === 'red' ? 'blue' : 'red';
            room.phase = 'hint';
            room.hint = null;
            room.phaseTimer = 60;
            room.playerSelections = {};
            room.playerPasses = [];
            clearInterval(roomManager.phaseIntervals.get(room.id));
            roomManager.phaseIntervals.delete(room.id);
            startPhaseTimer(room, io);
            io.to(room.id).emit('gameMessage', { system: true, text: `Команда ${playerTeam === 'red' ? 'Красная' : 'Синяя'} передала ход. Теперь ход у команды ${room.currentTeam === 'red' ? 'Красной' : 'Синей'}.` });
            io.to(room.id).emit('turnChanged', { currentTeam: room.currentTeam, phase: room.phase, hint: room.hint, phaseTimer: room.phaseTimer });
            io.to(room.id).emit('playerSelectionsUpdate', room.playerSelections);
          } else if (selections.length > 0 && selections.every((s) => s === selections[0])) {
            // All non-passing players selected the same word
            const wordIndex = selections[0];
            room.revealed[wordIndex] = true;
            const cardType = room.keyMap[wordIndex];
            const word = room.words[wordIndex];
            io.to(room.id).emit('wordRevealed', {
              index: wordIndex,
              cardType,
              word,
              currentTeam: room.currentTeam,
              revealed: room.revealed
            });

            const checkWin = (team) => {
              const needed = room.keyMap.filter((item) => item === team).length;
              const found = room.keyMap.filter((item, idx) => item === team && room.revealed[idx]).length;
              return found >= needed;
            };

            const assassinFound = cardType === 'assassin';
            const ownTeamFound = cardType === room.currentTeam;

            if (assassinFound) {
              const winner = room.currentTeam === 'red' ? 'blue' : 'red';
              room.state = 'ended';
              io.to(room.id).emit('gameMessage', { system: true, text: `Убийца открыт. Победила команда ${winner.toUpperCase()}.` });
              io.to(room.id).emit('gameEnded', {
                winner,
                reason: 'assassin',
                players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
              });
              scheduleRoomReset(room, io, 'Раунд завершён. Можно начать новую игру.');
              io.to(room.id).emit('playerSelectionsUpdate', {});
              return;
            }

            if (checkWin(room.currentTeam)) {
              room.state = 'ended';
              io.to(room.id).emit('gameMessage', { system: true, text: `Команда ${room.currentTeam.toUpperCase()} нашла всех своих агентов и выиграла!` });
              io.to(room.id).emit('gameEnded', {
                winner: room.currentTeam,
                reason: 'team_won',
                players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
              });
              scheduleRoomReset(room, io, 'Раунд завершён. Можно начать новую игру.');
              io.to(room.id).emit('playerSelectionsUpdate', {});
              return;
            }

            if (!ownTeamFound) {
              room.currentTeam = room.currentTeam === 'red' ? 'blue' : 'red';
              room.phase = 'hint';
              room.hint = null;
              room.phaseTimer = 60;
              room.playerSelections = {};
              room.playerPasses = [];
              clearInterval(roomManager.phaseIntervals.get(room.id));
              roomManager.phaseIntervals.delete(room.id);
              startPhaseTimer(room, io);
              io.to(room.id).emit('turnChanged', { currentTeam: room.currentTeam, phase: room.phase, hint: room.hint, phaseTimer: room.phaseTimer });
              io.to(room.id).emit('playerSelectionsUpdate', room.playerSelections);
            } else {
              room.phaseTimer += 15;
              room.playerSelections = {};
              room.playerPasses = [];
              io.to(room.id).emit('playerSelectionsUpdate', room.playerSelections);
              io.to(room.id).emit('phaseTimerUpdate', room.phaseTimer);
            }
          }
        }

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error selecting word:', error);
      }
    });

    // Pass turn handler
    socket.on('passTurn', async () => {
      try {
        const room = await getValidatedRoom(socket, 'codenames', 'guessing');
        if (!room) return;

        const player = room.players.find((p) => p.id === socket.id);
        if (!player) return;

        const playerTeam = room.teams.red.some((p) => p.id === player.id) ? 'red' : 'blue';
        const isCaptain = socket.id === room.captains.red || socket.id === room.captains.blue;

        if (isCaptain || playerTeam !== room.currentTeam) return;

        room.playerPasses.push(socket.id);
        delete room.playerSelections[socket.id];
        io.to(room.id).emit('playerSelectionsUpdate', room.playerSelections);

        // Check if all non-captain players either selected or passed
        const currentTeamPlayers = playerTeam === 'red' ? room.teams.red : room.teams.blue;
        const nonCaptainPlayers = currentTeamPlayers.filter((p) => p.id !== room.captains[playerTeam]);
        const allSelected = nonCaptainPlayers.every((p) => room.playerSelections.hasOwnProperty(p.id) || room.playerPasses.includes(p.id));

        if (allSelected) {
          const passes = nonCaptainPlayers.filter((p) => room.playerPasses.includes(p.id)).length;
          if (passes === nonCaptainPlayers.length) {
            // All passed
            room.currentTeam = room.currentTeam === 'red' ? 'blue' : 'red';
            room.phase = 'hint';
            room.hint = null;
            room.phaseTimer = 60;
            room.playerSelections = {};
            room.playerPasses = [];
            clearInterval(roomManager.phaseIntervals.get(room.id));
            roomManager.phaseIntervals.delete(room.id);
            startPhaseTimer(room, io);
            io.to(room.id).emit('gameMessage', { system: true, text: `Команда ${playerTeam === 'red' ? 'Красная' : 'Синяя'} передала ход. Теперь ход у команды ${room.currentTeam === 'red' ? 'Красной' : 'Синей'}.` });
            io.to(room.id).emit('turnChanged', { currentTeam: room.currentTeam, phase: room.phase, hint: room.hint, phaseTimer: room.phaseTimer });
            io.to(room.id).emit('playerSelectionsUpdate', room.playerSelections);
          }
        }

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error passing turn:', error);
      }
    });

    // Spy game handlers
    socket.on('initiateVote', async ({ targetId }) => {
      try {
        const room = await getValidatedRoom(socket);
        if (!room) return;

        if (room.hasVotedThisRound.includes(socket.id)) {
          return socket.emit('errorMessage', 'Вы уже начали голосование в этом раунде.');
        }

        if (!room.players.find((player) => player.id === targetId)) {
          return socket.emit('errorMessage', 'Игрок не найден в комнате.');
        }

        room.currentVotingTarget = targetId;
        room.hasVotedThisRound.push(socket.id);
        room.hasVotedForGuess = [];
        room.votes = {};

        // Send voting prompt to all except target
        room.players.forEach((player) => {
          if (player.id !== targetId) {
            io.to(player.id).emit('votePrompt', {
              accusedName: room.players.find((p) => p.id === targetId)?.nickname,
              accusedId: targetId
            });
          }
        });

        io.to(room.id).emit('voteStarted', { targetId });
        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error initiating vote:', error);
      }
    });

    socket.on('castVote', async ({ vote }) => {
      try {
        const room = await getValidatedRoom(socket);
        if (!room || !room.currentVotingTarget) return;

        room.votes[socket.id] = vote;
        room.hasVotedForGuess.push(socket.id);

        // Check if all non-target players have voted
        const nonTargetPlayers = room.players.filter((p) => p.id !== room.currentVotingTarget);
        const allVoted = nonTargetPlayers.every((p) => room.hasVotedForGuess.includes(p.id));

        if (allVoted) {
          const forVotes = Object.values(room.votes).filter((v) => v === 'yes').length;
          const totalVotes = Object.values(room.votes).length;
          const allAgree = forVotes === totalVotes;

          if (allAgree) {
            // All voted yes - target is expelled
            const targetPlayer = room.players.find((p) => p.id === room.currentVotingTarget);
            const isSpy = room.currentVotingTarget === room.spyId;

            if (isSpy) {
              // Players win
              room.state = 'ended';
              io.to(room.id).emit('gameMessage', { system: true, text: `${targetPlayer?.nickname} был исключен и оказался шпионом! Победа команды!` });
              io.to(room.id).emit('gameEnded', {
                winner: 'players',
                reason: 'spy_found',
                spyId: room.spyId,
                location: room.location,
                players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
              });
              scheduleRoomReset(room, io, 'Раунд завершён. Можно начать новую игру.');
            } else {
              // Spy wins (wrong player expelled)
              room.state = 'ended';
              io.to(room.id).emit('gameMessage', { system: true, text: `${targetPlayer?.nickname} был исключен, но это был не шпион! Шпион победил!` });
              io.to(room.id).emit('gameEnded', {
                winner: 'spy',
                reason: 'wrong_player',
                spyId: room.spyId,
                location: room.location,
                players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
              });
              scheduleRoomReset(room, io, 'Раунд завершён. Можно начать новую игру.');
            }
          } else {
            // Not all agreed - spy wins
            room.state = 'ended';
            io.to(room.id).emit('gameMessage', { system: true, text: 'Не все проголосовали за исключение. Шпион победил!' });
            io.to(room.id).emit('gameEnded', {
              winner: 'spy',
              reason: 'vote_failed',
              spyId: room.spyId,
              location: room.location,
              players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
            });
            scheduleRoomReset(room, io, 'Раунд завершён. Можно начать новую игру.');
          }

          room.currentVotingTarget = null;
          room.hasVotedThisRound = [];
          room.hasVotedForGuess = [];
          room.votes = {};

          await roomManager.updateRoom(room.id, room);
        }
      } catch (error) {
        console.error('Error casting vote:', error);
      }
    });

    socket.on('guessLocation', async ({ guess }) => {
      try {
        const room = await getValidatedRoom(socket);
        if (!room) return;

        if (socket.id !== room.spyId) {
          return socket.emit('errorMessage', 'Только шпион может угадывать локацию.');
        }

        if (!guess || typeof guess !== 'string') return;

        if (guess.trim().toLowerCase() === room.location.trim().toLowerCase()) {
          room.state = 'ended';
          io.to(room.id).emit('gameMessage', { system: true, text: 'Шпион угадал локацию и победил!' });
          io.to(room.id).emit('gameEnded', {
            winner: 'spy',
            reason: 'spy_guessed',
            spyId: room.spyId,
            location: room.location,
            players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
          });
          scheduleRoomReset(room, io, 'Раунд завершён. Можно начать новую игру.');
        } else {
          io.to(room.id).emit('gameMessage', { system: true, text: `Шпион предположил: «${guess}», но это неверно. Шпион проиграл!` });
          room.state = 'ended';
          io.to(room.id).emit('gameEnded', {
            winner: 'players',
            reason: 'spy_wrong_guess',
            spyId: room.spyId,
            location: room.location,
            players: room.players.map((p) => ({ id: p.id, nickname: p.nickname }))
          });
          scheduleRoomReset(room, io, 'Раунд завершён. Можно начать новую игру.');
        }

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error guessing location:', error);
      }
    });

    socket.on('sendMessage', async ({ text, nickname }) => {
      console.log('Received sendMessage:', { text, nickname });
      try {
        const roomId = socket.data.roomId;
        const room = await roomManager.getRoom(roomId);
        if (!room) return;

        if (!text || typeof text !== 'string' || text.trim().length === 0) return;

        const message = { user: nickname || socket.data.nickname, text: text.trim() };
        console.log('Message user:', message.user);
        if (room.state === 'playing') {
          io.to(room.id).emit('gameMessage', message);
        } else {
          room.chat.push(message);
          io.to(room.id).emit('roomUpdate', {
            id: room.id,
            title: room.title,
            creatorId: room.creatorId,
            players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
            capacity: room.capacity,
            state: room.state,
            gameType: room.gameType,
            chat: room.chat
          });
        }

        await roomManager.updateRoom(room.id, room);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', async () => {
      try {
        const roomId = socket.data.roomId;
        console.log(`Player ${socket.id} disconnected from room ${roomId}`);
        if (!roomId) return;

        const room = await roomManager.getRoom(roomId);
        if (!room) return;

        room.players = room.players.filter((player) => player.id !== socket.id);
        if (room.creatorId === socket.id && room.players.length > 0) {
          room.creatorId = room.players[0].id;
        }

        if (room.players.length === 0) {
          console.log(`Deleting empty room ${roomId}`);
          await roomManager.deleteRoom(roomId);
        } else {
          if (room.state === 'playing') {
            if (room.gameType === 'spy' && !room.players.find((player) => player.id === room.spyId)) {
              room.state = 'ended';
              io.to(room.id).emit('gameMessage', { system: true, text: 'Игра закончилась, потому что шпион покинул комнату.' });
            }
            if (room.gameType === 'imaginarium') {
              room.state = 'ended';
              io.to(room.id).emit('gameMessage', { system: true, text: 'Игра закончилась, потому что игрок покинул комнату.' });
            }
          }

          io.to(room.id).emit('roomUpdate', {
            id: room.id,
            title: room.title,
            creatorId: room.creatorId,
            players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
            capacity: room.capacity,
            state: room.state,
            gameType: room.gameType,
            location: room.state === 'playing' ? room.location : null,
            spyId: room.state === 'playing' ? room.spyId : null,
            availableLocations: room.state === 'playing' && room.gameType === 'spy' ? room.availableLocations : null,
            currentVotingTarget: room.currentVotingTarget,
            chat: room.chat
          });

          await roomManager.updateRoom(room.id, room);
        }

        // Broadcast updated room list
        const allRooms = await roomManager.getAllRooms();
        io.emit('roomList', allRooms);

        delete socket.data.roomId;
      } catch (error) {
        console.error('Error on disconnect:', error);
      }
    });
  });
}

// Helper functions
function startPhaseTimer(room, io) {
  // Clear any existing timer for this room
  const existingInterval = roomManager.phaseIntervals.get(room.id);
  if (existingInterval) {
    clearInterval(existingInterval);
    roomManager.phaseIntervals.delete(room.id);
  }

  const intervalId = setInterval(async () => {
    room.phaseTimer--;
    io.to(room.id).emit('phaseTimerUpdate', room.phaseTimer);
    if (room.phaseTimer <= 0) {
      clearInterval(intervalId);
      roomManager.phaseIntervals.delete(room.id);
      if (room.phase === 'hint') {
        // Time out for hint, proceed to guessing without hint
        room.phase = 'guessing';
        room.hint = 'Время вышло, подсказки нет';
        room.phaseTimer = 90;
        startPhaseTimer(room, io);
        io.to(room.id).emit('gameMessage', { system: true, text: 'Время на подсказку вышло. Подсказки нет.' });
        io.to(room.id).emit('phaseChanged', { phase: room.phase, hint: room.hint, phaseTimer: room.phaseTimer });
      } else if (room.phase === 'guessing') {
        // Time out for guessing, switch turn
        room.currentTeam = room.currentTeam === 'red' ? 'blue' : 'red';
        room.phase = 'hint';
        room.hint = null;
        room.phaseTimer = 60;
        startPhaseTimer(room, io);
        io.to(room.id).emit('gameMessage', { system: true, text: `Время на отгадывание вышло. Ход переходит команде ${room.currentTeam === 'red' ? 'красной' : 'синей'}.` });
        io.to(room.id).emit('turnChanged', { currentTeam: room.currentTeam, phase: room.phase, hint: room.hint, phaseTimer: room.phaseTimer });
      }
      await roomManager.updateRoom(room.id, room);
    }
  }, 1000);

  roomManager.phaseIntervals.set(room.id, intervalId);
}

async function scheduleRoomReset(room, io, message) {
  setTimeout(async () => {
    room.state = 'waiting';
    room.location = null;
    room.spyId = null;
    room.availableLocations = [];
    room.words = null;
    room.keyMap = null;
    room.revealed = null;
    room.teams = null;
    room.captains = null;
    room.currentTeam = null;
    room.phase = null;
    room.hint = null;
    room.phaseTimer = null;
    room.currentVotingTarget = null;
    room.votes = {};
    room.hasVotedThisRound = [];
    room.hasVotedForGuess = [];
    room.playerSelections = {};
    room.playerPasses = [];
    room.imaginariumHands = null;
    room.leaderId = null;
    room.association = null;
    room.chosenCard = null;
    room.submissions = {};
    room.tableCards = [];
    room.scores = {};
    room.round = 1;
    room.currentLeaderIndex = 0;

    if (message) {
      room.chat.push({ system: true, text: message });
    }

    io.to(room.id).emit('roomUpdate', {
      id: room.id,
      title: room.title,
      creatorId: room.creatorId,
      players: room.players.map((p) => ({ id: p.id, nickname: p.nickname })),
      capacity: room.capacity,
      state: room.state,
      gameType: room.gameType,
      chat: room.chat
    });

    // Broadcast updated room list
    const allRooms = await roomManager.getAllRooms();
    io.emit('roomList', allRooms);

    await roomManager.updateRoom(room.id, room);
  }, 3000);
}

module.exports = { setupGameHandlers };