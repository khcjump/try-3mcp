import mysql from "mysql2/promise";
import { config } from "../config.js";

let pool: mysql.Pool | null = null;

function getMySQLPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export const mysqlTools = [
  {
    name: "mysql_query",
    description: "Execute a MySQL SELECT query",
    inputSchema: {
      type: "object",
      properties: {
        sql: { type: "string" },
        values: { type: "array", items: { type: "any" }, description: "Prepared statement values" },
      },
      required: ["sql"],
    },
  },
  {
    name: "mysql_execute",
    description: "Execute a MySQL mutation (INSERT, UPDATE, DELETE)",
    inputSchema: {
      type: "object",
      properties: {
        sql: { type: "string" },
        values: { type: "array", items: { type: "any" }, description: "Prepared statement values" },
      },
      required: ["sql"],
    },
  },
  {
    name: "mysql_show_columns",
    description: "Show columns of a table",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string" },
      },
      required: ["table"],
    },
  },
  {
    name: "mysql_list_tables",
    description: "List all tables in the database",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

export async function handleMySQLTool(name: string, args: any) {
  const db = getMySQLPool();
  switch (name) {
    case "mysql_query":
      const [rows] = await db.execute(args.sql, args.values || []);
      return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
    case "mysql_execute":
      const [exResult]: any = await db.execute(args.sql, args.values || []);
      return { 
        content: [{ 
          type: "text", 
          text: `Success. Affected rows: ${exResult.affectedRows || 0}. Insert ID: ${exResult.insertId || 0}` 
        }] 
      };
    case "mysql_show_columns":
      const [columns]: any = await db.query(`SHOW COLUMNS FROM ??`, [args.table]);
      return { content: [{ type: "text", text: JSON.stringify(columns, null, 2) }] };
    case "mysql_list_tables":
      const [tables]: any = await db.query("SHOW TABLES");
      return { content: [{ type: "text", text: JSON.stringify(tables, null, 2) }] };
    default:
      throw new Error(`Unknown MySQL tool: ${name}`);
  }
}
