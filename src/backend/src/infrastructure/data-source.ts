import { DataSource } from "typeorm";
import { WatchHistory } from "./entities/WatchHistory.entity.js";

export interface DataSourceConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function createDataSource(config: DataSourceConfig): DataSource {
  return new DataSource({
    type: "postgres",
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.password,
    database: config.database,
    entities: [WatchHistory],
    synchronize: false,
  });
}
