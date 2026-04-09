{
  "name": "spy-game-server",
  "script": "server.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000,
    "REDIS_HOST": "localhost",
    "REDIS_PORT": 6379,
    "DATABASE_URL": "postgresql://gameuser:gamepass@localhost:5432/gamehub",
    "NUM_WORKERS": "auto"
  },
  "env_development": {
    "NODE_ENV": "development",
    "PORT": 3000,
    "REDIS_HOST": "localhost",
    "REDIS_PORT": 6379,
    "DATABASE_URL": "postgresql://gameuser:gamepass@localhost:5432/gamehub",
    "NUM_WORKERS": 2
  },
  "error_log": "./logs/err.log",
  "out_log": "./logs/out.log",
  "log_log": "./logs/combined.log",
  "time": true,
  "max_memory_restart": "1G",
  "restart_delay": 4000,
  "max_restarts": 10,
  "min_uptime": "10s",
  "watch": false,
  "ignore_watch": ["node_modules", "logs", "public"],
  "env_production": {
    "NODE_ENV": "production",
    "PORT": 3000,
    "REDIS_HOST": "localhost",
    "REDIS_PORT": 6379,
    "NUM_WORKERS": "max"
  }
}