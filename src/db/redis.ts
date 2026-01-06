import { Redis } from "ioredis";
import { config } from "../config.js";

let redis: Redis | null = null;

export function getRedisClient() {
  if (!redis) {
    redis = new Redis(config.redis.url);
    redis.on("error", (err) => console.error("Redis error:", err));
  }
  return redis;
}

export const redisTools = [
  {
    name: "redis_get",
    description: "Get value from Redis by key",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
      },
      required: ["key"],
    },
  },
  {
    name: "redis_set",
    description: "Set value in Redis",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        value: { type: "string" },
        ttl: { type: "number", description: "Time to live in seconds (optional)" },
      },
      required: ["key", "value"],
    },
  },
  {
    name: "redis_del",
    description: "Delete key from Redis",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
      },
      required: ["key"],
    },
  },
  {
    name: "redis_hset",
    description: "Set field in Redis hash",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        field: { type: "string" },
        value: { type: "string" },
      },
      required: ["key", "field", "value"],
    },
  },
  {
    name: "redis_hget",
    description: "Get field from Redis hash",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        field: { type: "string" },
      },
      required: ["key", "field"],
    },
  },
  {
    name: "redis_hgetall",
    description: "Get all fields and values from Redis hash",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
      },
      required: ["key"],
    },
  },
  {
    name: "redis_hdel",
    description: "Delete field from Redis hash",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        field: { type: "string" },
      },
      required: ["key", "field"],
    },
  },
];

export async function handleRedisTool(name: string, args: any) {
  const client = getRedisClient();
  switch (name) {
    case "redis_get":
      const val = await client.get(args.key);
      return { content: [{ type: "text", text: val ?? "Key not found" }] };
    case "redis_set":
      if (args.ttl) {
        await client.set(args.key, args.value, "EX", args.ttl);
      } else {
        await client.set(args.key, args.value);
      }
      return { content: [{ type: "text", text: "OK" }] };
    case "redis_del":
      const count = await client.del(args.key);
      return { content: [{ type: "text", text: `Deleted ${count} key(s)` }] };
    case "redis_hset":
      await client.hset(args.key, args.field, args.value);
      return { content: [{ type: "text", text: "OK" }] };
    case "redis_hget":
      const hval = await client.hget(args.key, args.field);
      return { content: [{ type: "text", text: hval ?? "Field not found" }] };
    case "redis_hgetall":
      const hgetall = await client.hgetall(args.key);
      return { content: [{ type: "text", text: JSON.stringify(hgetall, null, 2) }] };
    case "redis_hdel":
      const hdelCount = await client.hdel(args.key, args.field);
      return { content: [{ type: "text", text: `Deleted ${hdelCount} field(s)` }] };
    default:
      throw new Error(`Unknown Redis tool: ${name}`);
  }
}
