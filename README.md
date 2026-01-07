# Multi-DB MCP Server (Redis, MongoDB, MySQL)

這是一個基於 **Model Context Protocol (MCP)** 實做的整合型伺服器，支援 **Redis**、**MongoDB** 與 **MySQL**。本專案已針對 **Docker 容器化** 進行優化，並支援 **SSE (Server-Sent Events) HTTP** 傳輸模式。

## 🚀 核心功能

### 1. Redis Tools
- `redis_get`, `redis_set`, `redis_del` (基本字串操作)
- `redis_hset`, `redis_hget`, `redis_hgetall`, `redis_hdel` (Hash 操作)

### 2. MongoDB Tools
- `mongodb_find`: 支援過濾與數量限制。
- `mongodb_insert`: 單筆文件插入。
- `mongodb_update`: 支援 `updateOne` 與 `updateMany`。
- `mongodb_delete`: 支援 `deleteOne` 與 `deleteMany`。

### 3. MySQL Tools
- `mysql_query`: 執行 SELECT 查詢。
- `mysql_execute`: 執行 INSERT, UPDATE, DELETE (支援受影響行數回傳)。
- `mysql_list_tables`: 列出資料庫中所有表。
- `mysql_show_columns`: 查看特定表的 Schema 結構。

### 4. Vite Dashboard
- 提供現代化的 Web 介面監控 Server 狀態。
- 透過 SSE 即時接收伺服器日誌與工具列表。
- 採用 Glassmorphism 設計，視覺體驗優化。

---

## 🛠 快速開始

### 方式 A：使用 Docker Compose (推薦)

這會自動啟動 MCP Server 以及三個資料庫容器。

1. **啟動服務**:
   ```bash
   docker-compose up --build
   ```
2. **存取位址**:
   - MCP SSE 端點: `http://localhost:3000/sse`
   - Redis: `localhost:6379`
   - MongoDB: `localhost:27017`
   - MySQL: `localhost:3306` (User: root, Password: rootpassword)

### 方式 B：本地開發

1. **安裝依賴**:
   ```bash
   npm install
   ```
2. **設定環境變數**:
   複製 `.env.example` 為 `.env` 並填入您的資料庫資訊。
3. **啟動**:
   ```bash
   npm run dev
   ```

---

## 🔌 MCP Client 配置說明

根據您使用的客戶端不同，配置方式如下：

### 1. Claude Desktop (使用 Stdio 模式)
如果您想直接以 `node` 執行此 Server (不透過 Docker 的網路埠)，請在 `claude_desktop_config.json` 加入：

```json
{
  "mcpServers": {
    "multi-db-server": {
      "command": "node",
      "args": ["/絕對路徑/到/try-3mcp/build/index.js"],
      "env": {
        "REDIS_URL": "redis://localhost:6379",
        "MONGODB_URL": "mongodb://localhost:27017",
        "MYSQL_HOST": "localhost",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "mcp_test"
      }
    }
  }
}
```

### 2. 使用 Docker 容器 (SSE 模式)
如果您的客戶端支援 **SSE** (例如使用 MCP Inspector 或其他 Web 型 Client)，請配置 URI 為：
- **URL**: `http://localhost:3000/sse`

### 3. Claude Desktop (透過 Docker 執行)
若您希望透過 Docker 容器來運行 Server (避免在宿主機安裝 Node 環境)，可以使用以下配置。這會讓 Claude 啟動一個臨時容器並透過 `stdio` 通訊：

```json
{
  "mcpServers": {
    "mcp-docker-server": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--network", "try-3mcp_default",
        "-e", "REDIS_URL=redis://redis:6379",
        "-e", "MONGODB_URL=mongodb://mongodb:27017",
        "-e", "MYSQL_HOST=mysql",
        "-e", "MYSQL_USER=root",
        "-e", "MYSQL_PASSWORD=rootpassword",
        "-e", "MYSQL_DATABASE=mcp_test",
        "try-3mcp-mcp-server"
      ]
    }
  }
}
```
*注意：請確保 `try-3mcp-mcp-server` 是您的 Docker 鏡像名稱，且網路名稱 `try-3mcp_default` 與 docker-compose 建立的一致。*

### 4. 使用 npx 遠端執行 (Stdio)
若您已將此專案發佈或想直接測試：
```bash
npx -y @modelcontextprotocol/inspector node build/index.js
```

---

## 🐳 Docker 配置說明

- **Dockerfile**: 採用多階段構建，確保生產環境鏡像精簡。
- **SSE 支援**: Server 預設監聽 `0.0.0.0:3000`，適合容器對外提供服務。
- **連線資訊**: 在 Docker 網路中，資料庫的主機名分別為 `redis`, `mongodb`, `mysql`。
