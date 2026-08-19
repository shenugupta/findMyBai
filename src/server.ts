import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectPrisma } from "./config/prisma";
console.log("Server starting...");

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectPrisma();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();