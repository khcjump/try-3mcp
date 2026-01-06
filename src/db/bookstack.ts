import axios from "axios";
import { config } from "../config.js";

const bookstackApi = axios.create({
  baseURL: `${config.bookstack.url}/api`,
  headers: {
    Authorization: `Token ${config.bookstack.tokenID}:${config.bookstack.tokenSecret}`,
  },
});

export const bookstackTools = [
  {
    name: "bookstack_search",
    description: "Search for content (books, chapters, pages) in BookStack",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string" },
        count: { type: "number", description: "Number of results to return", default: 10 },
      },
      required: ["query"],
    },
  },
  {
    name: "bookstack_get_page",
    description: "Get the full content of a specific page by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The ID of the page" },
      },
      required: ["id"],
    },
  },
  {
    name: "bookstack_list_books",
    description: "List all books available in BookStack",
    inputSchema: {
      type: "object",
      properties: {
        count: { type: "number", description: "Number of books to return", default: 10 },
      },
    },
  },
];

export async function handleBookStackTool(name: string, args: any) {
  switch (name) {
    case "bookstack_search":
      const searchRes = await bookstackApi.get("/search", {
        params: { query: args.query, count: args.count || 10 },
      });
      return { content: [{ type: "text", text: JSON.stringify(searchRes.data, null, 2) }] };

    case "bookstack_get_page":
      const pageRes = await bookstackApi.get(`/pages/${args.id}`);
      return { content: [{ type: "text", text: JSON.stringify(pageRes.data, null, 2) }] };

    case "bookstack_list_books":
      const booksRes = await bookstackApi.get("/books", {
        params: { count: args.count || 10 },
      });
      return { content: [{ type: "text", text: JSON.stringify(booksRes.data, null, 2) }] };

    default:
      throw new Error(`Unknown BookStack tool: ${name}`);
  }
}
