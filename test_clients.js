const io = require('socket.io-client');

// Test multiple clients joining a room
async function testMultipleClients() {
  const clients = [];

  // Create first client to create room
  const client1 = io('http://localhost:3000');
  clients.push(client1);

  client1.on('connect', () => {
    console.log('Client 1 connected, creating room...');
    client1.emit('createOrJoin', { nickname: 'TestPlayer1', gameType: 'spy' });
  });

  client1.on('roomJoined', (data) => {
    console.log('Client 1 joined room:', data.roomId);

    // Now create other clients and join the same room
    for (let i = 1; i < 4; i++) {
      const client = io('http://localhost:3000');
      clients.push(client);

      client.on('connect', () => {
        console.log(`Client ${i + 1} connected, joining room...`);
        client.emit('joinRoom', { nickname: `TestPlayer${i + 1}`, roomId: data.roomId });
      });

      client.on('roomJoined', () => {
        console.log(`Client ${i + 1} joined room`);
      });

      client.on('roomUpdate', (room) => {
        console.log(`Room update: ${room.players.length} players`);
        if (room.players.length >= 4 && client === client1) {
          // Only the first client (creator) starts the game
          setTimeout(() => {
            console.log('Starting game...');
            client.emit('startGame');
          }, 1000);
        }
      });

      client.on('gameStarted', (gameData) => {
        console.log(`Game started for client ${i + 1}:`, gameData.gameType);
        if (gameData.gameType === 'spy') {
          console.log(`Client ${i + 1} is spy:`, gameData.isSpy);
        }
      });

      client.on('error', (error) => {
        console.error(`Client ${i + 1} error:`, error);
      });
    }
  });

  client1.on('roomUpdate', (room) => {
    console.log(`Room update: ${room.players.length} players`);
    if (room.players.length >= 4) {
      // Only the first client (creator) starts the game
      setTimeout(() => {
        console.log('Starting game...');
        client1.emit('startGame');
      }, 1000);
    }
  });

  client1.on('gameStarted', (gameData) => {
    console.log('Game started for client 1:', gameData.gameType);
    if (gameData.gameType === 'spy') {
      console.log('Client 1 is spy:', gameData.isSpy);
    }
  });

  client1.on('error', (error) => {
    console.error('Client 1 error:', error);
  });

  // Wait for all clients to connect and game to start
  setTimeout(() => {
    console.log('Test completed');
    clients.forEach(client => client.disconnect());
    process.exit(0);
  }, 10000);
}

testMultipleClients();