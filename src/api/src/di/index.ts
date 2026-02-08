import type { Injector } from "injection-js";
import { ReflectiveInjector } from "injection-js";
import type { DataSource } from "typeorm";
import { providers } from "./providers.js";
import {
  DATA_SOURCE,
  HISTORY_CONTROLLER,
  IMPORT_CONTROLLER,
  STATS_CONTROLLER,
} from "./tokens.js";

export { providers } from "./providers.js";
export * from "./tokens.js";

export function buildContainer(): Injector {
  return ReflectiveInjector.resolveAndCreate(providers);
}

export async function buildContainerWithDataSource(): Promise<Injector> {
  const container = buildContainer();
  const dataSource = container.get(DATA_SOURCE) as DataSource;
  await dataSource.initialize();
  return container;
}

export function getHistoryController(container: Injector) {
  return container.get(HISTORY_CONTROLLER);
}

export function getStatsController(container: Injector) {
  return container.get(STATS_CONTROLLER);
}

export function getImportController(container: Injector) {
  return container.get(IMPORT_CONTROLLER);
}
