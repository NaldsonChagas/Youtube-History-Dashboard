import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { buildApp } from "../src/app.js";

describe("Static files MIME type", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let tempDir: string;

  beforeAll(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "youtube-history-static-"));
    writeFileSync(join(tempDir, "script.ts"), "export {};\n");
    app = await buildApp({ publicPath: tempDir });
  });

  afterAll(async () => {
    if (app) await app.close();
    if (tempDir) rmSync(tempDir, { recursive: true });
  });

  it("serves .ts files with Content-Type application/javascript", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/script.ts",
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/javascript/);
  });
});
