import type { ListFilters } from './ListFilters.js';
import type { ListResult } from './ListResult.js';

export interface IHistoryRepository {
  list(filters: ListFilters): Promise<ListResult>;
}
