/**
 * Where the automations data is in its lifecycle. The store is synchronous mock
 * data today, so it is always 'ready'; 'loading' and 'error' exist so a remote
 * source can be wired in without the grid ever claiming "no automations" while
 * a request is still in flight or has failed.
 */
export type GridDataStatus = 'loading' | 'error' | 'ready';

export type GridDisplayState = 'loading' | 'error' | 'empty' | 'filtered-empty' | 'rows';

export interface GridDisplayInput {
  dataStatus: GridDataStatus;
  /** Automations in the store, before any filtering. */
  totalCount: number;
  /** Rows AG Grid is displaying after quick search and column filters. */
  displayedCount: number;
  hasActiveFilters: boolean;
  /** AG Grid has built its row model at least once, so displayedCount is real. */
  modelReady: boolean;
}

export function hasActiveGridFilters(searchText: string, columnFilterPresent: boolean): boolean {
  return columnFilterPresent || searchText.trim().length > 0;
}

export function getGridDisplayState({
  dataStatus,
  totalCount,
  displayedCount,
  hasActiveFilters,
  modelReady,
}: GridDisplayInput): GridDisplayState {
  if (dataStatus === 'loading') return 'loading';
  if (dataStatus === 'error') return 'error';
  // Nothing to filter, so no filter can be the reason the grid is blank.
  if (totalCount === 0) return 'empty';
  // Before the first model update the displayed count is stale; showing
  // "no matches" then would flash on first paint.
  if (modelReady && displayedCount === 0 && hasActiveFilters) return 'filtered-empty';
  return 'rows';
}

/**
 * The query with its `status` preset set or removed, leaving every other
 * parameter as it was. Returns a copy; `params` is not mutated.
 */
export function withStatusParam(params: URLSearchParams, status: string | null): URLSearchParams {
  const next = new URLSearchParams(params);
  if (status) next.set('status', status);
  else next.delete('status');
  return next;
}
