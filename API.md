# PortPlay API Documentation

This document describes the REST API endpoints and Socket.io events for PortPlay.

## Base URLs

- **Development**: `http://localhost:4000`
- **Staging**: `https://api-staging.portplay.game`
- **Production**: `https://api.portplay.game`

## Authentication

PortPlay uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## REST API Endpoints

### Health Check

#### GET /health
Returns server health status and statistics.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 987654321,
    "heapUsed": 123456789
  },
  "rooms": {
    "totalRooms": 5,
    "activeRooms": 3,
    "waitingRooms": 2,
    "playingRooms": 1,
    "totalPlayers": 12
  }
}
```

### Chapters

#### GET /api/chapters
Returns available game chapters.

**Response:**
```json
{
  "success": true,
  "chapters": [
    {
      "id": "neon-docks",
      "name": "Neon Docks: A Slippery Start",
      "description": "A neon-drenched shipping yard where a crate containing a clue to the mystery has been misplaced.",
      "biome": "cyberpunk",
      "assets": [
        "neon_docks_environment.glb",
        "crates.glb",
        "conveyor_belts.glb"
      ],
      "spawnPoints": [
        { "x": 0, "y": 1, "z": 0 },
        { "x": 5, "y": 1, "z": 5 },
        { "x": -5, "y": 1, "z": -5 }
      ],
      "objectives": [
        "Find the misplaced crate",
        "Locate the manifest",
        "Identify the suspicious container"
      ],
      "maxPlayers": 8,
      "estimatedDuration": 15
    }
  ]
}
```

### Rooms

#### GET /api/rooms
Returns active game rooms.

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "id": "room_1234567890_abc123",
      "code": "ABC123",
      "hostId": "player_123",
      "playerCount": 3,
      "maxPlayers": 8,
      "chapterId": "neon-docks",
      "state": "waiting",
      "createdAt": 1704067200000
    }
  ],
  "total": 1
}
```

#### GET /api/rooms/:roomCode
Returns information about a specific room.

**Parameters:**
- `roomCode` (string): 6-character room code

**Response:**
```json
{
  "success": true,
  "room": {
    "id": "room_1234567890_abc123",
    "code": "ABC123",
    "hostId": "player_123",
    "players": [
      {
        "id": "player_123",
        "username": "Player1",
        "level": 1
      }
    ],
    "maxPlayers": 8,
    "chapterId": "neon-docks",
    "state": "waiting",
    "createdAt": 1704067200000
  }
}
```

#### POST /api/rooms
Creates a new game room.

**Request Body:**
```json
{
  "hostId": "player_123",
  "hostUsername": "Player1",
  "chapterId": "neon-docks",
  "maxPlayers": 8
}
```

**Response:**
```json
{
  "success": true,
  "room": {
    "id": "room_1234567890_abc123",
    "code": "ABC123",
    "hostId": "player_123",
    "maxPlayers": 8,
    "chapterId": "neon-docks"
  }
}
```

## Socket.io Events

### Connection Events

#### connect
Emitted when a client connects to the server.

**Data:**
```json
{
  "socketId": "socket_1234567890"
}
```

#### disconnect
Emitted when a client disconnects from the server.

### Room Management

#### create_room
Creates a new game room.

**Emit:**
```json
{
  "username": "Player1",
  "chapterId": "neon-docks"
}
```

**Response (room_created):**
```json
{
  "roomId": "room_1234567890_abc123",
  "roomCode": "ABC123",
  "hostId": "socket_1234567890",
  "players": [
    {
      "id": "socket_1234567890",
      "username": "Player1"
    }
  ]
}
```

#### join_room
Joins an existing game room.

**Emit:**
```json
{
  "roomCode": "ABC123",
  "username": "Player2"
}
```

**Response (room_joined):**
```json
{
  "roomId": "room_1234567890_abc123",
  "roomCode": "ABC123",
  "players": [
    {
      "id": "socket_1234567890",
      "username": "Player1"
    },
    {
      "id": "socket_9876543210",
      "username": "Player2"
    }
  ],
  "state": "waiting"
}
```

**Broadcast (player_joined):**
```json
{
  "playerId": "socket_9876543210",
  "username": "Player2",
  "players": [
    {
      "id": "socket_1234567890",
      "username": "Player1"
    },
    {
      "id": "socket_9876543210",
      "username": "Player2"
    }
  ]
}
```

#### leave_room
Leaves the current game room.

**Emit:** No data required

**Response (room_left):**
```json
{
  "roomId": "room_1234567890_abc123",
  "message": "Successfully left room"
}
```

**Broadcast (player_left):**
```json
{
  "playerId": "socket_9876543210",
  "players": [
    {
      "id": "socket_1234567890",
      "username": "Player1"
    }
  ]
}
```

### Game Events

#### start_game
Starts the game in the current room.

**Emit:** No data required

**Broadcast (game_started):**
```json
{
  "roomId": "room_1234567890_abc123",
  "players": [
    {
      "id": "socket_1234567890",
      "username": "Player1"
    },
    {
      "id": "socket_9876543210",
      "username": "Player2"
    }
  ]
}
```

#### end_game
Ends the current game.

**Emit:** No data required

**Broadcast (game_ended):**
```json
{
  "roomId": "room_1234567890_abc123",
  "results": {
    "players": [
      {
        "id": "socket_1234567890",
        "username": "Player1",
        "xp": 150
      },
      {
        "id": "socket_9876543210",
        "username": "Player2",
        "xp": 120
      }
    ]
  }
}
```

### Player Input

#### player_input
Sends player input to the server.

**Emit:**
```json
{
  "sequence": 1,
  "playerId": "socket_1234567890",
  "input": {
    "forward": true,
    "backward": false,
    "left": false,
    "right": false,
    "jump": false,
    "run": false,
    "dash": false,
    "attack": false,
    "interact": false,
    "useItem": false
  },
  "timestamp": 1704067200000
}
```

**Response (input_received):**
```json
{
  "sequence": 1,
  "timestamp": 1704067200000
}
```

### Game State

#### game_snapshot
Broadcasts the current game state to all players in a room.

**Data:**
```json
{
  "tick": 1234,
  "timestamp": 1704067200000,
  "players": [
    {
      "id": "socket_1234567890",
      "userId": "socket_1234567890",
      "username": "Player1",
      "position": { "x": 0, "y": 1, "z": 0 },
      "velocity": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 },
      "health": 100,
      "maxHealth": 100,
      "animationState": "idle",
      "inventory": [],
      "xp": 0,
      "level": 1,
      "lastInputSequence": 1,
      "lastServerTick": 1234
    }
  ],
  "entities": [],
  "quests": [],
  "worldState": {}
}
```

### Communication

#### chat_message
Sends a chat message to the room.

**Emit:**
```json
{
  "message": "Hello, everyone!"
}
```

**Broadcast (chat_message):**
```json
{
  "playerId": "socket_1234567890",
  "username": "Player1",
  "message": "Hello, everyone!",
  "timestamp": 1704067200000
}
```

### Item Management

#### use_item
Uses an item from the player's inventory.

**Emit:**
```json
{
  "itemType": "health_pack"
}
```

**Response (item_used):**
```json
{
  "itemType": "health_pack",
  "success": true,
  "timestamp": 1704067200000
}
```

### Interactions

#### interact
Interacts with a game object or NPC.

**Emit:**
```json
{
  "targetId": "npc_123",
  "action": "talk"
}
```

**Response (interaction_completed):**
```json
{
  "targetId": "npc_123",
  "action": "talk",
  "success": true,
  "timestamp": 1704067200000
}
```

## Error Handling

All API endpoints and Socket.io events return consistent error responses.

### Error Response Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Socket.io Error Events

Errors in Socket.io are emitted as `error` events:

```json
{
  "message": "Failed to join room",
  "code": "ROOM_NOT_FOUND"
}
```

## Rate Limiting

- **Input Events**: Maximum 60 per second per player
- **Chat Messages**: Maximum 10 per minute per player
- **Room Operations**: Maximum 5 per minute per player
- **API Endpoints**: Maximum 100 per minute per IP

## Data Validation

All incoming data is validated using Zod schemas:

- **Input Validation**: Ensures input data meets requirements
- **Type Safety**: Full TypeScript support
- **Sanitization**: Prevents injection attacks
- **Size Limits**: Prevents oversized payloads

## WebSocket Connection

### Connection URL
```
ws://localhost:4000/socket.io/
```

### Connection Options
```javascript
const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  upgrade: false,
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

### Reconnection
The client automatically handles reconnection with exponential backoff. The server maintains player state for 30 seconds after disconnection.

## Testing

### Test Endpoints
- **Health Check**: `GET /health`
- **Echo Test**: `POST /api/test/echo`

### Test Data
Use the following test room codes for development:
- `TEST01` - Test room 1
- `TEST02` - Test room 2
- `DEBUG` - Debug room with extra logging

## Monitoring

### Health Metrics
- Server uptime
- Memory usage
- Active connections
- Room statistics
- Performance metrics

### Logging
- Request/response logging
- Error logging with stack traces
- Performance timing
- User action logging

## Security

### Input Validation
- All inputs are validated server-side
- SQL injection prevention
- XSS protection
- Rate limiting

### Authentication
- JWT token validation
- Token expiration handling
- Secure token storage

### Network Security
- HTTPS/WSS in production
- CORS configuration
- Helmet.js security headers
- Request size limits
