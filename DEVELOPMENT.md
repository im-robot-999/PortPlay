# PortPlay Development Guide

This document provides comprehensive guidance for developers working on PortPlay.

## Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Version 8 or higher
- **Docker**: For local development with databases
- **Git**: For version control

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd portplay
pnpm install
```

### 2. Environment Configuration

```bash
cp env.example .env
# Edit .env with your local configuration
```

### 3. Start Development Environment

```bash
# Start all services (PostgreSQL, Redis, Server, Frontend)
pnpm run start:dev

# Or start individual services
pnpm --filter @portplay/server dev
pnpm --filter @portplay/frontend dev
```

## Development Workflows

### Running Locally

#### Option 1: Docker Compose (Recommended)
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f server

# Stop services
docker-compose down
```

#### Option 2: Local Development
```bash
# Start PostgreSQL and Redis manually
# Then run:
pnpm --filter @portplay/server dev
pnpm --filter @portplay/frontend dev
```

### Available Scripts

```bash
# Root level
pnpm dev              # Start all packages in development mode
pnpm build            # Build all packages
pnpm test             # Run tests across all packages
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier

# Individual packages
pnpm --filter @portplay/shared dev
pnpm --filter @portplay/server dev
pnpm --filter @portplay/frontend dev
```

## Architecture Overview

### Monorepo Structure
```
portplay/
├── shared/           # Shared types and utilities
├── server/           # Game server (Node.js + Socket.io)
├── frontend/         # Game client (React + Three.js)
├── assets/           # Game assets and CDN
└── docs/            # Documentation
```

### Key Components

#### Server
- **GameLoop**: Authoritative game loop (60Hz)
- **RoomManager**: Manages game sessions and rooms
- **GameSocketHandler**: Handles real-time communication
- **Game Functions**: Core game logic and physics

#### Frontend
- **Game Store**: Zustand-based state management
- **3D Scenes**: React Three Fiber scenes
- **Input Handler**: Keyboard and gamepad input
- **Client Prediction**: Client-side prediction system

#### Shared
- **Types**: TypeScript interfaces and enums
- **Utilities**: Math, physics, and game logic helpers
- **Validation**: Zod schemas for data validation

## Development Practices

### Code Quality

#### TypeScript
- Strict mode enabled
- No `any` types without justification
- Comprehensive type definitions
- Interface-first design

#### Testing
- Unit tests for all game logic
- Integration tests for server components
- E2E tests for critical user flows
- Minimum 80% code coverage

#### Linting and Formatting
- ESLint with TypeScript rules
- Prettier for consistent formatting
- Pre-commit hooks via Husky
- Automated CI checks

### Git Workflow

#### Branch Naming
```
feature/mvp-core          # Core MVP features
feature/neon-docks        # Specific chapter implementation
fix/netcode-issue         # Bug fixes
chore/dependency-update   # Maintenance tasks
```

#### Commit Messages
```
feat: add player movement system
fix: resolve physics collision bug
docs: update API documentation
test: add unit tests for combat system
```

### Testing

#### Running Tests
```bash
# All tests
pnpm test

# Specific package
pnpm --filter @portplay/server test

# With coverage
pnpm --filter @portplay/server test --coverage

# Watch mode
pnpm --filter @portplay/server test --watch
```

#### Test Structure
```
src/
├── __tests__/           # Test files
├── __mocks__/           # Mock implementations
└── setupTests.ts        # Test configuration
```

### Debugging

#### Server Debugging
```bash
# Enable debug logging
DEBUG=* pnpm --filter @portplay/server dev

# View server logs
docker-compose logs -f server
```

#### Frontend Debugging
- React DevTools for component debugging
- Three.js Inspector for 3D scene debugging
- Redux DevTools for state management
- Network tab for API calls

#### Game Debugging
- Input debug panel (development mode)
- Physics visualization
- Network latency simulation
- Performance monitoring

## Adding New Features

### 1. New Chapter

#### Server Side
```typescript
// Add chapter data to server/src/index.ts
const chapters = [
  // ... existing chapters
  {
    id: 'new-chapter',
    name: 'New Chapter Name',
    description: 'Chapter description',
    biome: 'new-biome',
    // ... other properties
  }
];
```

#### Frontend Side
```typescript
// Create new scene component
// src/scenes/NewChapterScene.tsx

// Add to GameScreen.tsx
{gameSession.chapterId === 'new-chapter' && <NewChapterScene />}
```

### 2. New Game Mechanic

#### Shared Types
```typescript
// Add to shared/src/types.ts
export interface NewMechanic {
  // Define interface
}
```

#### Server Implementation
```typescript
// Add to server/src/game/functions.ts
export function handleNewMechanic(/* params */) {
  // Implement logic
}
```

#### Client Integration
```typescript
// Add to frontend/src/game/functions.ts
export class NewMechanicHandler {
  // Implement client-side logic
}
```

### 3. New UI Component

```typescript
// Create component in frontend/src/components/
export const NewComponent: React.FC<Props> = ({ /* props */ }) => {
  // Component implementation
};

// Add to appropriate screen or HUD
```

## Performance Optimization

### Server Performance
- **Game Loop**: Optimize tick rate based on load
- **Memory Management**: Implement object pooling
- **Database**: Use connection pooling and indexing
- **Caching**: Redis for frequently accessed data

### Client Performance
- **3D Rendering**: LOD systems and frustum culling
- **Asset Loading**: Progressive loading and compression
- **State Management**: Minimize re-renders
- **Network**: Optimize snapshot sizes

### Asset Optimization
- **Models**: Draco compression for geometry
- **Textures**: KTX2/Basis compression
- **Audio**: OGG Vorbis with appropriate bitrates
- **LODs**: Multiple detail levels for performance

## Deployment

### Staging Environment
```bash
# Deploy to staging
git push origin feature/new-feature
# Create PR to develop branch
# Automated deployment to staging
```

### Production Environment
```bash
# Deploy to production
git push origin develop
# Merge to main branch
# Automated deployment to production
```

### Environment Variables
- Copy `env.example` to `.env.production`
- Set production values
- Never commit `.env` files
- Use secrets management in CI/CD

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Check TypeScript errors
pnpm --filter @portplay/shared build
pnpm --filter @portplay/server build
pnpm --filter @portplay/frontend build
```

#### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build

# Check container logs
docker-compose logs [service-name]
```

#### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up postgres

# Check connection
docker-compose exec postgres psql -U portplay -d portplay
```

### Getting Help

1. **Check Issues**: Search existing GitHub issues
2. **Documentation**: Review this guide and README
3. **Discord**: Join our development community
4. **Code Review**: Request review from team members

## Contributing

### Before Contributing
1. Read this development guide
2. Understand the project architecture
3. Check existing issues and PRs
4. Discuss major changes with the team

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all CI checks pass
4. Request code review
5. Merge after approval

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes without migration
- [ ] Performance impact considered

## Resources

### Documentation
- [Project README](./README.md)
- [API Documentation](./API.md)
- [Architecture Diagrams](./docs/architecture.md)

### Tools
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Community
- [Discord Server](https://discord.gg/portplay)
- [GitHub Discussions](https://github.com/portplay/portplay/discussions)
- [Issue Tracker](https://github.com/portplay/portplay/issues)
