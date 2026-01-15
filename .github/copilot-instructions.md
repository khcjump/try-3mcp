# Copilot Instructions for Multi-DB MCP Server

## Project Overview
This is a **Model Context Protocol (MCP) Server** that integrates Redis, MongoDB, MySQL, and BookStack APIs through a unified Express.js interface with SSE (Server-Sent Events) transport. The server exports database operations as callable "tools" that AI agents can invoke.

## Architecture Pattern: Tool Registration & Routing

The codebase follows a **plugin-based tool pattern**:

1. **Tool Definition** ([src/db/redis.ts](src/db/redis.ts#L5), [src/db/mongodb.ts](src/db/mongodb.ts#L13)): Each database module exports a `[dbName]Tools` array containing tool definitions with `name`, `description`, and JSON Schema `inputSchema`.

2. **Tool Execution Routing** ([src/index.ts](src/index.ts#L41-L62)): The main server routes `CallToolRequest` to handlers by prefix matching (e.g., `redis_*`, `mongodb_*`). Each handler validates inputs using the schema and returns `{content: [{type: "text", ...}], isError: boolean}`.

3. **Connection Pattern**: Each database module maintains a singleton client (`getRedisClient()`, `getMongoClient()`) that lazily initializes on first use.

## Key Files & Responsibilities

- [src/index.ts](src/index.ts): MCP server setup, tool listing, and request routing
- [src/config.ts](src/config.ts): Environment variable loading (all `*_URL`, `MYSQL_*` env vars)
- [src/db/](src/db/): Database implementations (redis.ts, mongodb.ts, mysql.ts, bookstack.ts)
- [docker-compose.yml](docker-compose.yml): Local development environment with Redis, MongoDB, MySQL
- [Dockerfile](Dockerfile): Multi-stage build (builder → runner, TypeScript compile + Vite bundle)

## Build & Deployment

- **Build Command**: `npm run build` → runs `vite build` (frontend to `dist/`) then `tsc` (backend to `build/`)
- **Development**: `npm run dev` starts Vite dev server with proxy to MCP endpoint at `http://localhost:3000`
- **Docker**: Multi-stage Dockerfile optimizes production image size by excluding dev dependencies
- **Local Testing**: `docker-compose up --build` spins up MCP server + all three databases

## Development Conventions

1. **Tool Naming**: Use snake_case prefixed by database (e.g., `redis_set`, `mongodb_find`)
2. **Schema Validation**: All tools include `inputSchema` with JSON Schema describing parameters
3. **Error Handling** ([src/index.ts](src/index.ts#L51)): Return `{content: [{type: "text", text: "Error: ..."}], isError: true}` on failure
4. **Configuration**: Load all external URLs/credentials from environment variables in [src/config.ts](src/config.ts)
5. **Frontend**: Vite bundles frontend to serve alongside MCP server; proxies `/sse` and `/message` to port 3000

## Common Tasks

- **Add a new database tool**: Create handler in `src/db/[name].ts`, export `[name]Tools` array and `handle[Name]Tool()` function, then add routing in `src/index.ts`
- **Update environment**: Modify Docker Compose services or add new env vars to `src/config.ts`
- **Test database operations**: Use `docker-compose up`, then curl `/sse` endpoint or invoke tools via MCP client

## Language & Type Safety

Project uses **TypeScript** with strict mode. Frontend uses **Vite** for fast HMR during development. All external dependencies defined in [package.json](package.json) are type-safe (ioredis, mongodb, mysql2 have @types or built-in types).
