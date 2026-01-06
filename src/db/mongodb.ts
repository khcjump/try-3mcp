import { MongoClient } from "mongodb";
import { config } from "../config.js";

let mongoClient: MongoClient | null = null;

async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(config.mongodb.url);
    await mongoClient.connect();
  }
  return mongoClient;
}

export const mongodbTools = [
  {
    name: "mongodb_find",
    description: "Find documents in MongoDB",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        query: { type: "object", description: "MongoDB query filter" },
        limit: { type: "number", default: 10 },
      },
      required: ["collection", "query"],
    },
  },
  {
    name: "mongodb_insert",
    description: "Insert a document into MongoDB",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        document: { type: "object" },
      },
      required: ["collection", "document"],
    },
  },
  {
    name: "mongodb_update",
    description: "Update documents in MongoDB",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        filter: { type: "object", description: "MongoDB filter" },
        update: { type: "object", description: "MongoDB update operator (e.g. { $set: ... })" },
        multi: { type: "boolean", default: false, description: "Update multiple documents" },
      },
      required: ["collection", "filter", "update"],
    },
  },
  {
    name: "mongodb_delete",
    description: "Delete documents from MongoDB",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        filter: { type: "object", description: "MongoDB filter" },
        multi: { type: "boolean", default: false, description: "Delete multiple documents" },
      },
      required: ["collection", "filter"],
    },
  },
];

export async function handleMongoDBTool(name: string, args: any) {
  const client = await getMongoClient();
  const db = client.db(config.mongodb.dbName);
  const collection = db.collection(args.collection);

  switch (name) {
    case "mongodb_find":
      const results = await collection.find(args.query || {}).limit(args.limit || 10).toArray();
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    case "mongodb_insert":
      const result = await collection.insertOne(args.document);
      return { content: [{ type: "text", text: `Inserted ID: ${result.insertedId}` }] };
    case "mongodb_update":
      if (args.multi) {
        const uRes = await collection.updateMany(args.filter, args.update);
        return { content: [{ type: "text", text: `Updated ${uRes.modifiedCount} documents` }] };
      } else {
        const uRes = await collection.updateOne(args.filter, args.update);
        return { content: [{ type: "text", text: `Updated ${uRes.modifiedCount} document` }] };
      }
    case "mongodb_delete":
      if (args.multi) {
        const dRes = await collection.deleteMany(args.filter);
        return { content: [{ type: "text", text: `Deleted ${dRes.deletedCount} documents` }] };
      } else {
        const dRes = await collection.deleteOne(args.filter);
        return { content: [{ type: "text", text: `Deleted ${dRes.deletedCount} document` }] };
      }
    default:
      throw new Error(`Unknown MongoDB tool: ${name}`);
  }
}
