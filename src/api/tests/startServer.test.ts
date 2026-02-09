import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { startServer } from "../src/startServer.js";
import { ensureSchema } from "./setup.js";

describe("startServer", () => {
  let tempDir: string;
  let result: Awaited<ReturnType<typeof startServer>>;

  beforeAll(async () => {
    await ensureSchema();
    tempDir = mkdtempSync(join(tmpdir(), "youtube-history-start-"));
    result = await startServer({ publicPath: tempDir, port: 0 });
  });

  afterAll(async () => {
    if (result?.app) await result.app.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  it("returns app, port and baseUrl", () => {
    expect(result).toHaveProperty("app");
    expect(result.app).toHaveProperty("close");
    expect(typeof result.app.close).toBe("function");
    expect(result).toHaveProperty("port");
    expect(typeof result.port).toBe("number");
    expect(result).toHaveProperty("baseUrl");
    expect(result.baseUrl).toMatch(new RegExp(`:${result.port}$`));
  });
});
