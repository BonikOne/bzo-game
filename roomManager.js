const redisClient = require('./redis');

class RoomManager {
  constructor() {
    this.redis = redisClient;
    this.inMemoryRooms = new Map(); // Fallback for development
    this.phaseIntervals = new Map(); // Store phase timers by roomId
    this.useRedis = process.env.REDIS_HOST !== undefined;
  }

  // Serialize room for Redis storage, excluding timer/circular fields
  serializeRoom(room) {
    if (!room || typeof room !== 'object') return room;
    // No fields to exclude currently
    return room;
  }

  // Generate unique room ID
  generateRoomId() {
    return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create room in Redis
  async createRoom(creator, gameType = 'spy') {
    const roomId = this.generateRoomId();
    const room = {
      id: roomId,
      title: `Комната ${roomId.split('-')[2]}`,
      creatorId: creator.id,
      capacity: gameType === 'chess' || gameType === 'pairs' ? 2 : 6,
      state: 'waiting',
      gameType,
      players: [{
        id: creator.id,
        nickname: creator.nickname,
        isReady: false,
        team: null,
        isCaptain: false
      }],
      spyId: null,
      location: null,
      availableLocations: [],
      gameStartTime: null,
      currentVotingTarget: null,
      votes: {},
      hasVotedThisRound: [],
      hasVotedForGuess: [],
      chat: [],
      // Codenames specific
      words: null,
      keyMap: null,
      revealed: null,
      teams: null,
      captains: null,
      currentTeam: null,
      phase: null,
      hint: null,
      phaseTimer: null,
      playerSelections: {},
      playerPasses: [],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    try {
      if (this.useRedis) {
        try {
          await this.redis.set(`room:${roomId}`, JSON.stringify(this.serializeRoom(room)));
          await this.redis.expire(`room:${roomId}`, 60 * 60); // 1 hour TTL
          console.log('Room saved to Redis:', roomId);
        } catch (redisError) {
          console.error('Redis operation failed, falling back to in-memory:', redisError.message);
          this.inMemoryRooms.set(roomId, room);
        }
      } else {
        this.inMemoryRooms.set(roomId, room);
      }
      console.log('Room created successfully:', roomId);
      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Get room from Redis or in-memory
  async getRoom(roomId) {
    try {
      let room;
      if (this.useRedis) {
        const roomData = await this.redis.get(`room:${roomId}`);
        if (!roomData) return null;
        room = JSON.parse(roomData);
      } else {
        room = this.inMemoryRooms.get(roomId);
        if (!room) return null;
      }

      // Update last activity
      room.lastActivity = Date.now();
      if (this.useRedis) {
        await this.redis.set(`room:${roomId}`, JSON.stringify(this.serializeRoom(room)));
      } else {
        this.inMemoryRooms.set(roomId, room);
      }
      return room;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  // Update room in Redis or in-memory
  async updateRoom(roomId, roomData) {
    try {
      roomData.lastActivity = Date.now();
      if (this.useRedis) {
        await this.redis.set(`room:${roomId}`, JSON.stringify(this.serializeRoom(roomData)));
      } else {
        this.inMemoryRooms.set(roomId, roomData);
      }
      return true;
    } catch (error) {
      console.error('Error updating room:', error);
      return false;
    }
  }

  // Delete room from Redis or in-memory
  async deleteRoom(roomId) {
    try {
      console.log(`Deleting room ${roomId}`);
      // Clear any active timer
      const intervalId = this.phaseIntervals.get(roomId);
      if (intervalId) {
        clearInterval(intervalId);
        this.phaseIntervals.delete(roomId);
      }

      if (this.useRedis) {
        await this.redis.del(`room:${roomId}`);
      } else {
        this.inMemoryRooms.delete(roomId);
      }
      console.log(`Room ${roomId} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  }

  // Find available room for game type
  async findAvailableRoom(gameType) {
    try {
      if (this.useRedis) {
        const keys = await this.redis.keys('room:*');
        for (const key of keys) {
          const roomData = await this.redis.get(key);
          if (roomData) {
            const room = JSON.parse(roomData);
            if (room.gameType === gameType && room.state === 'waiting' && room.players.length < room.capacity) {
              return room;
            }
          }
        }
      } else {
        for (const room of this.inMemoryRooms.values()) {
          if (room.gameType === gameType && room.state === 'waiting' && room.players.length < room.capacity) {
            return room;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding available room:', error);
      return null;
    }
  }

  // Join existing room
  async joinRoom(roomId, nickname, playerId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      // Check if player is already in the room
      const existingPlayer = room.players.find(p => p.id === playerId);
      if (existingPlayer) {
        return true; // Already in room
      }

      room.players.push({
        id: playerId,
        nickname,
        isReady: false,
        team: null,
        isCaptain: false
      });

      await this.updateRoom(roomId, room);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  }

  // Get all active rooms
  async getAllRooms() {
    try {
      const rooms = [];

      if (this.useRedis) {
        const keys = await this.redis.keys('room:*');
        for (const key of keys) {
          const roomData = await this.redis.get(key);
          if (roomData) {
            const room = JSON.parse(roomData);
            rooms.push({
              id: room.id,
              title: room.title,
              players: room.players.length,
              capacity: room.capacity,
              gameType: room.gameType,
              state: room.state
            });
          }
        }
      } else {
        for (const room of this.inMemoryRooms.values()) {
          rooms.push({
            id: room.id,
            title: room.title,
            players: room.players.length,
            capacity: room.capacity,
            gameType: room.gameType,
            state: room.state
          });
        }
      }

      return rooms;
    } catch (error) {
      console.error('Error getting all rooms:', error);
      return [];
    }
  }

  // Find waiting room
  async findWaitingRoom(gameType = 'spy') {
    try {
      const rooms = await this.getAllRooms();
      return rooms.find(room =>
        room.state === 'waiting' &&
        room.players < room.capacity &&
        room.gameType === gameType &&
        (Date.now() - room.lastActivity) < 30 * 60 * 1000 // 30 minutes
      );
    } catch (error) {
      console.error('Error finding waiting room:', error);
      return null;
    }
  }

  // Add player to room
  async addPlayerToRoom(roomId, player) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return null;

      if (room.players.length >= room.capacity) return null;
      if (room.players.some(p => p.nickname === player.nickname)) return null;

      room.players.push(player);
      room.chat.push({ system: true, text: `${player.nickname} присоединился к комнате.` });

      await this.updateRoom(roomId, room);
      return room;
    } catch (error) {
      console.error('Error adding player to room:', error);
      return null;
    }
  }

  // Remove player from room
  async removePlayerFromRoom(roomId, playerId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return null;

      room.players = room.players.filter(p => p.id !== playerId);

      if (room.creatorId === playerId && room.players.length > 0) {
        room.creatorId = room.players[0].id;
      }

      if (room.players.length === 0) {
        await this.deleteRoom(roomId);
        return null;
      }

      await this.updateRoom(roomId, room);
      return room;
    } catch (error) {
      console.error('Error removing player from room:', error);
      return null;
    }
  }

  // Clean up old rooms (call periodically)
  async cleanupOldRooms() {
    try {
      const keys = await this.redis.keys('room:*');
      const now = Date.now();
      const maxAge = 2 * 60 * 60 * 1000; // 2 hours

      for (const key of keys) {
        const roomData = await this.redis.get(key);
        if (roomData) {
          const room = JSON.parse(roomData);
          if ((now - room.lastActivity) > maxAge && room.state === 'waiting') {
            await this.redis.del(key);
            console.log(`Cleaned up old room: ${room.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old rooms:', error);
    }
  }

  async clearAllRooms() {
    try {
      const keys = await this.redis.keys('room:*');
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      for (const intervalId of this.phaseIntervals.values()) {
        clearInterval(intervalId);
      }
      this.phaseIntervals.clear();
      this.inMemoryRooms.clear();
      console.log('All rooms cleared successfully');
    } catch (error) {
      console.error('Error clearing all rooms:', error);
    }
  }
}

module.exports = new RoomManager();