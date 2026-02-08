import { tmpdir } from "os";
import { join } from "path";

process.env.DATABASE_PATH = join(tmpdir(), "youtube-history-test.db");
