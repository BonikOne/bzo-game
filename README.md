# Spy Game (Codenames) - Scalable Multiplayer Server

A real-time multiplayer word game server built with Node.js, Socket.IO, and Redis for horizontal scaling. Supports 1000+ concurrent users with Docker, PostgreSQL, and load balancing.

## Features

- **Real-time multiplayer gameplay** with Socket.IO
- **Horizontal scaling** with PM2 clustering and Docker (up to 5 instances)
- **Distributed data storage** with Redis cluster (2GB memory)
- **Persistent data storage** with PostgreSQL (100 connection pool)
- **Load balancing** with Nginx
- **Rate limiting** and DDoS protection
- **Room-based game management**
- **Cooperative word selection** gameplay
- **Comprehensive monitoring** and health checks
- **Security headers** with Helmet
- **Input validation** with Joi
- **Structured logging** with Winston
- **Unit testing** with Jest
- **Code linting** with ESLint

## Security

This application implements several security measures:

- **Helmet**: Security headers including CSP, HSTS
- **Rate Limiting**: API (100/15min), game actions (30/min), connections (10/min)
- **Input Validation**: Joi schemas for nicknames, room IDs, game types
- **Sanitization**: XSS prevention for user inputs
- **CORS**: Configurable origins
- **HTTPS Ready**: HSTS enabled for production

## Architecture

- **Frontend**: HTML/CSS/JavaScript with Socket.IO client
- **Backend**: Node.js + Express + Socket.IO
- **Database**: PostgreSQL for persistent data, Redis for sessions/cache
- **Scaling**: PM2 clustering + Docker containers + Nginx load balancer
- **Security**: Rate limiting, input validation, CORS, Helmet
- **Monitoring**: Health checks, PM2 monitoring, Redis Commander, Winston logging

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- 4GB+ RAM, 2+ CPU cores

## Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd spy-game-room-app
```

2. Start the entire stack:
```bash
docker-compose up -d
```

3. Access the application:
- **Game**: http://localhost
- **Redis Commander**: http://localhost:8081
- **Health Check**: http://localhost/health

4. Scale the application:
```bash
# Scale to 5 app instances
docker-compose up -d --scale app=5
```

## Testing

Run the test suite:
```bash
npm test
```

Run load testing:
```bash
npm run test:load
```

Lint code:
```bash
npm run lint
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start PostgreSQL and Redis:
```bash
# Using Docker for services
docker run -d --name postgres -p 5432:5432 -e POSTGRES_DB=gamehub -e POSTGRES_USER=gameuser -e POSTGRES_PASSWORD=gamepass postgres:15-alpine
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

3. Set environment variables:
```bash
export DATABASE_URL="postgresql://gameuser:gamepass@localhost:5432/gamehub"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
```

### Running the Application

#### Development Mode
```bash
# Start with 2 workers for development
npm run dev
```

#### Production Mode
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js --env production
```

## Load Testing

Test the application under load to ensure it can handle 1000+ concurrent users:

1. Install Artillery:
```bash
npm install -g artillery
```

2. Run load test:
```bash
npm run test:load
```

3. Generate report:
```bash
npm run test:load:report
```

The test simulates:
- 10 users/sec for 1 minute (warm-up)
- 50 users/sec for 5 minutes (normal load)
- 100 users/sec for 1 minute (peak load)

## Deployment

### Production Deployment

1. **Environment Variables**:
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_HOST=redis-cluster-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
CORS_ORIGIN=https://yourdomain.com
NUM_WORKERS=max
```

2. **SSL/TLS**: Configure SSL termination in Nginx or load balancer.

3. **Monitoring**: Set up monitoring with Prometheus + Grafana.

4. **Backup**: Configure automated backups for PostgreSQL and Redis.

### Kubernetes Deployment

Use the provided `k8s/` directory for Kubernetes manifests:
```bash
kubectl apply -f k8s/
```

## API Documentation

### Health Check
```
GET /health
```

### Game Endpoints
- `POST /api/login` - User login
- `POST /api/join-game` - Join/create game room
- `POST /api/start-game` - Start game
- `POST /api/chat` - Send chat message
- `POST /api/leave-game` - Leave game

## Monitoring

- **PM2**: `pm2 monit` for process monitoring
- **Redis Commander**: Web UI at http://localhost:8081
- **Health Checks**: `/health` endpoint
- **Logs**: Check `logs/` directory

## Scaling Guide

### Vertical Scaling
- Increase CPU cores and RAM
- Use larger Redis instances
- Optimize PostgreSQL configuration

### Horizontal Scaling
- Add more app instances: `docker-compose up -d --scale app=10`
- Use Redis cluster for multiple Redis nodes
- Deploy across multiple servers with load balancer

### Database Scaling
- Use PostgreSQL read replicas
- Implement database sharding if needed
- Use connection pooling

## Troubleshooting

### Common Issues

1. **Connection refused**: Check if Redis/PostgreSQL are running
2. **High memory usage**: Monitor with `pm2 monit`, adjust Redis maxmemory
3. **Slow performance**: Check database indexes, add more app instances
4. **Socket.IO disconnections**: Adjust pingTimeout/pingInterval in server.js

### Performance Tuning

- **Redis**: Set maxmemory and eviction policy
- **PostgreSQL**: Tune connection pool size, add indexes
- **Node.js**: Use cluster mode, monitor event loop lag
- **Nginx**: Configure worker_processes and worker_connections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

ISC
```

### Production Mode
```bash
# Start with maximum workers (all CPU cores)
pm2 start ecosystem.config.js --env production
```

### Manual Start (without PM2)
```bash
# Single process (not recommended for production)
node server.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `REDIS_HOST` | localhost | Redis server host |
| `REDIS_PORT` | 6379 | Redis server port |
| `NUM_WORKERS` | auto | Number of worker processes |
| `NODE_ENV` | development | Environment mode |

## Scaling Configuration

The application is designed to handle 1000+ concurrent users:

- **Clustering**: PM2 automatically spawns worker processes across all CPU cores
- **Redis Adapter**: Socket.IO uses Redis adapter for cross-process communication
- **Distributed Storage**: All game state is stored in Redis, not in memory
- **Rate Limiting**: Protects against spam and DDoS attacks

## Monitoring

```bash
# View PM2 process status
pm2 status

# View logs
pm2 logs spy-game-server

# Monitor resource usage
pm2 monit

# Restart application
pm2 restart spy-game-server

# Stop application
pm2 stop spy-game-server
```

## API Endpoints

- `GET /` - Serve game interface
- `GET /health` - Health check endpoint
- `POST /api/rooms` - Create new game room (rate limited)

## Game Mechanics

- Players join rooms and are assigned to teams (Red/Blue)
- One player from each team gives hints
- Team members select words based on hints
- First team to find all their words wins
- Avoid selecting the opponent's words or the assassin word!

## Troubleshooting

### Redis Connection Issues
- Ensure Redis server is running on the specified host/port
- Check firewall settings if running on different machines

### PM2 Issues
- Restart PM2: `pm2 kill && pm2 start ecosystem.config.js`
- Clear PM2 logs: `pm2 flush`

### Performance Issues
- Increase Redis memory if needed
- Add more server instances behind a load balancer
- Monitor CPU/memory usage with `pm2 monit`

## Development

### Project Structure
```
├── server.js          # Main server file with clustering
├── redis.js           # Redis client configuration
├── roomManager.js     # Distributed room management
├── gameHandlers.js    # Socket.IO game event handlers
├── gameUtils.js       # Game logic utilities
├── middleware.js      # Security and rate limiting
├── public/            # Frontend files
│   ├── index.html
│   ├── script.js
│   └── style.css
├── ecosystem.config.js # PM2 configuration
└── logs/              # PM2 log files
```

### Adding New Features
1. Game logic goes in `gameUtils.js`
2. Socket.IO events go in `gameHandlers.js`
3. Room operations go in `roomManager.js`
4. Security middleware goes in `middleware.js`

## License

MIT