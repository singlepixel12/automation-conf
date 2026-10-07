/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGridDisplayState, hasActiveGridFilters, withStatusParam } from './automationsGridState.ts';
import type { GridDisplayInput } from './automationsGridState.ts';

const ready: GridDisplayInput = {
  dataStatus: 'ready',
  totalCount: 5,
  displayedCount: 5,
  hasActiveFilters: false,
  modelReady: true,
};

test('loading takes precedence over every other state', () => {
  assert.equal(getGridDisplayState({ ...ready, dataStatus: 'loading', totalCount: 0, displayedCount: 0 }), 'loading');
  assert.equal(
    getGridDisplayState({ ...ready, dataStatus: 'loading', displayedCount: 0, hasActiveFilters: true }),
    'loading'
  );
});

test('error takes precedence over empty and filter-empty', () => {
  assert.equal(getGridDisplayState({ ...ready, dataStatus: 'error', totalCount: 0, displayedCount: 0 }), 'error');
  assert.equal(
    getGridDisplayState({ ...ready, dataStatus: 'error', displayedCount: 0, hasActiveFilters: true }),
    'error'
  );
});

test('a ready store with no automations is genuinely empty', () => {
  assert.equal(getGridDisplayState({ ...ready, totalCount: 0, displayedCount: 0 }), 'empty');
});

test('genuine empty wins even when filters are still active', () => {
  assert.equal(getGridDisplayState({ ...ready, totalCount: 0, displayedCount: 0, hasActiveFilters: true }), 'empty');
});

test('genuine empty does not wait for the grid model', () => {
  assert.equal(getGridDisplayState({ ...ready, totalCount: 0, displayedCount: 0, modelReady: false }), 'empty');
});

test('rows hidden by active filters are filter-empty', () => {
  assert.equal(getGridDisplayState({ ...ready, displayedCount: 0, hasActiveFilters: true }), 'filtered-empty');
});

test('filter-empty is not declared before the grid model is ready', () => {
  assert.equal(
    getGridDisplayState({ ...ready, displayedCount: 0, hasActiveFilters: true, modelReady: false }),
    'rows'
  );
});

test('zero displayed rows without active filters falls back to rows', () => {
  assert.equal(getGridDisplayState({ ...ready, displayedCount: 0 }), 'rows');
});

test('displayed rows show the grid', () => {
  assert.equal(getGridDisplayState(ready), 'rows');
  assert.equal(getGridDisplayState({ ...ready, displayedCount: 2, hasActiveFilters: true }), 'rows');
});

test('quick search counts as a filter only when it has non-whitespace text', () => {
  assert.equal(hasActiveGridFilters('', false), false);
  assert.equal(hasActiveGridFilters('   ', false), false);
  assert.equal(hasActiveGridFilters('etl', false), true);
});

test('a column filter counts as a filter without quick search', () => {
  assert.equal(hasActiveGridFilters('', true), true);
  assert.equal(hasActiveGridFilters('etl', true), true);
});

test('clearing the status preset keeps unrelated query parameters', () => {
  const prev = new URLSearchParams('status=error&view=compact&page=2');
  const next = withStatusParam(prev, null);
  assert.equal(next.toString(), 'view=compact&page=2');
  // The current params are not mutated.
  assert.equal(prev.get('status'), 'error');
});

test('clearing the only query parameter leaves an empty query', () => {
  assert.equal(withStatusParam(new URLSearchParams('status=inactive'), null).toString(), '');
});

test('setting a status preset replaces any existing one', () => {
  const next = withStatusParam(new URLSearchParams('status=error&view=compact'), 'inactive');
  assert.equal(next.get('status'), 'inactive');
  assert.equal(next.get('view'), 'compact');
});
