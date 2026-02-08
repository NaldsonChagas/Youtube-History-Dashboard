import { DataSource } from "typeorm";
import { WatchHistory } from "./entities/WatchHistory.entity.js";

export interface DataSourceConfig {
  databasePath: string;
}

export function createDataSource(config: DataSourceConfig): DataSource {
  return new DataSource({
    type: "sqljs",
    location: config.databasePath,
    autoSave: true,
    entities: [WatchHistory],
    synchronize: false,
  });
}
