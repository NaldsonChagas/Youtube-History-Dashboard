import "reflect-metadata";
import { logger } from "./lib/logger.js";
import { startServer } from "./startServer.js";

const start = async (): Promise<void> => {
  try {
    await startServer();
  } catch (err) {
    logger.error(err, "Failed to start server");
    process.exit(1);
  }
};

start();
