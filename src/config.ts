import dotenv from "dotenv";

dotenv.config();

export const config = {
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  mongodb: {
    url: process.env.MONGODB_URL || "mongodb://localhost:27017",
    dbName: process.env.MONGODB_DB_NAME || "mcp_test",
  },
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "password",
    database: process.env.MYSQL_DATABASE || "mcp_test",
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
  },
  bookstack: {
    url: process.env.BOOKSTACK_URL || "https://demo.bookstackapp.com",
    tokenID: process.env.BOOKSTACK_TOKEN_ID || "",
    tokenSecret: process.env.BOOKSTACK_TOKEN_SECRET || "",
  },
};
