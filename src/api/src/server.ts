import "reflect-metadata";
import { startServer } from "./startServer.js";

const start = async (): Promise<void> => {
  try {
    await startServer();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
