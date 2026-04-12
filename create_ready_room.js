const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';
const GAME_TYPE = process.argv[2] || 'codenames';
const DUMMY_PLAYERS = parseInt(process.argv[3], 10) || 4;

function createClient(name) {
  const client = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: true,
  });
  client._playerName = name;
  return client;
}

async function connectClient(name) {
  return new Promise((resolve, reject) => {
    const client = createClient(name);

    client.on('connect', () => {
      resolve(client);
    });

    client.on('connect_error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('\n=== Ready Room Creator ===\n');
  console.log(`Game type: ${GAME_TYPE}`);
  console.log(`Preparing ${DUMMY_PLAYERS} hidden players in a waiting room.\n`);

  const host = await connectClient('ReadyHost');

  host.on('roomJoined', (data) => {
    console.log(`Room created: ${data.roomId}`);

    const roomId = data.roomId;
    const clients = [host];
    let joinedCount = 1;

    host.on('roomUpdate', (room) => {
      console.log(`Room players: ${room.players.length}`);
    });

    for (let i = 1; i < DUMMY_PLAYERS; i++) {
      const name = `Dummy${i}`;
      connectClient(name).then((client) => {
        clients.push(client);

        client.on('roomJoined', () => {
          joinedCount += 1;
          console.log(`${name} joined room (${joinedCount}/${DUMMY_PLAYERS})`);
        });

        client.on('error', (error) => {
          console.error(`${name} error:`, error);
        });

        client.emit('joinRoom', { nickname: name, roomId });
      }).catch((err) => {
        console.error(`${name} connection failed:`, err.message || err);
      });
    }

    setTimeout(() => {
      console.log('\nRoom ready!');
      console.log(`Room code: ${roomId}`);
      console.log(`Open the browser, enter the room code, and you will join as the ${DUMMY_PLAYERS + 1}th player.`);
      console.log('Keep this script running while you test.');
      console.log('Press Ctrl+C to exit and disconnect hidden players.\n');
    }, 3000);
  });

  host.on('connect_error', (err) => {
    console.error('Host connection failed:', err.message || err);
  });

  host.emit('createOrJoin', { nickname: 'ReadyHost', gameType: GAME_TYPE });
}

main().catch((err) => {
  console.error('Failed to create room:', err);
  process.exit(1);
});