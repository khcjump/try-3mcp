import express, { Request, Response } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { config } from "./config.js";
import { redisTools, handleRedisTool } from "./db/redis.js";
import { mongodbTools, handleMongoDBTool } from "./db/mongodb.js";
import { mysqlTools, handleMySQLTool } from "./db/mysql.js";
import { bookstackTools, handleBookStackTool } from "./db/bookstack.js";

const server = new Server(
  {
    name: "multi-db-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List all available tools from all databases.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...redisTools,
      ...mongodbTools,
      ...mysqlTools,
      ...bookstackTools,
    ],
  };
});

/**
 * Handle tool execution by routing to the appropriate database handler.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name.startsWith("redis_")) {
      return await handleRedisTool(name, args);
    } else if (name.startsWith("mongodb_")) {
      return await handleMongoDBTool(name, args);
    } else if (name.startsWith("mysql_")) {
      return await handleMySQLTool(name, args);
    } else if (name.startsWith("bookstack_")) {
      return await handleBookStackTool(name, args);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Error executing tool ${name}:`, error);
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

const app = express();
let transport: SSEServerTransport | null = null;

app.get("/sse", async (_req: Request, res: Response) => {
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

app.post("/message", async (req: Request, res: Response) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No active SSE connection");
  }
});

const PORT = config.server.port;
app.listen(PORT, "0.0.0.0", () => {
  console.error(`Multi-DB MCP Server running on SSE at http://0.0.0.0:${PORT}/sse`);
});
