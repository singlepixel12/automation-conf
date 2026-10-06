import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import type {
  ColDef,
  RowClickedEvent,
  CellValueChangedEvent,
  FilterChangedEvent,
  GridApi,
  GridState,
  ICellRendererParams,
  ModelUpdatedEvent,
  OverlayType,
  TextFilterModel,
} from 'ag-grid-community';
import { useAutomationStore } from '@/stores/automationStore';
import { StatusBadge } from './StatusBadge';
import { EnvironmentBadge } from './EnvironmentBadge';
import { Button } from '@/components/ui/button';
import { ERROR_PRESENTATION, TYPE_LABELS, parseStatusFilterPreset } from '@/types/automation';
import type { Automation, Environment, StatusFilterPreset } from '@/types/automation';
import { Trash2, SearchX, Inbox, Plus, AlertTriangle, RotateCw } from 'lucide-react';
import { toast } from '@/lib/useToast';
import { getGridDisplayState, hasActiveGridFilters } from './automationsGridState';
import type { GridDataStatus } from './automationsGridState';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Columns are flex-sized, so what decides whether they fit is the width of the
 * grid container, not the viewport: collapsing the sidebar changes the space
 * available without the viewport changing at all. Each threshold is the summed
 * minWidth of the columns in that tier plus a little breathing room.
 */
const ALL_COLUMNS_MIN_WIDTH = 1180; // core columns + Version + Tags
const VERSION_MIN_WIDTH = 980; // core columns + Version

/**
 * The empty and no-match states rendered alongside the grid replace AG Grid's
 * generic overlays. noMatchingRows is shown automatically whenever filters
 * leave zero rows, so it must be suppressed explicitly. Module-level so the
 * grid receives a stable reference.
 */
const SUPPRESSED_OVERLAYS: OverlayType[] = ['noRows', 'noMatchingRows'];

type WidthTier = 'wide' | 'medium' | 'narrow';

function tierForWidth(width: number): WidthTier {
  if (width >= ALL_COLUMNS_MIN_WIDTH) return 'wide';
  if (width >= VERSION_MIN_WIDTH) return 'medium';
  return 'narrow';
}

/**
 * A status preset is applied as the Status column's own filter (exact match),
 * so rowData stays the full list and the user can see and clear it in the grid.
 */
function statusFilterModel(status: StatusFilterPreset): TextFilterModel {
  return { filterType: 'text', type: 'equals', filter: status };
}

/** The preset the Status column filter currently expresses, if any. */
function presetFromGrid(api: GridApi<Automation>): StatusFilterPreset | null {
  const model = api.getColumnFilterModel<TextFilterModel>('status');
  if (!model || model.type !== 'equals') return null;
  // The text filter matches case-insensitively, so "Inactive" is still a preset.
  return parseStatusFilterPreset(model.filter?.toLowerCase());
}

function EnvironmentCell(params: ICellRendererParams<Automation>) {
  return <EnvironmentBadge environment={params.value as Environment} />;
}

interface AutomationsGridProps {
  searchText: string;
  statusFilter: StatusFilterPreset | null;
  onStatusFilterChange: (status: StatusFilterPreset | null) => void;
  /** Clears the page-owned filters: quick search and the URL status preset. */
  onClearFilters: () => void;
  onAddAutomation: () => void;
  /** Always 'ready' for the in-memory store; see GridDataStatus. */
  dataStatus?: GridDataStatus;
  onRetry?: () => void;
}

/** What AG Grid last reported about its row model. */
interface GridModelSnapshot {
  ready: boolean;
  displayedCount: number;
  columnFilterPresent: boolean;
}

export function AutomationsGrid({
  searchText,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  onAddAutomation,
  dataStatus = 'ready',
  onRetry,
}: AutomationsGridProps) {
  const automations = useAutomationStore((s) => s.automations);
  const updateAutomation = useAutomationStore((s) => s.updateAutomation);
  const deleteAutomation = useAutomationStore((s) => s.deleteAutomation);
  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact<Automation>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<GridModelSnapshot>({
    ready: false,
    displayedCount: 0,
    columnFilterPresent: false,
  });
  const [tier, setTier] = useState<WidthTier>('medium');

  // Seed the grid with the preset from the URL so the first render is already
  // filtered; later URL changes are pushed in through the grid API below.
  const [initialState] = useState<GridState | undefined>(() =>
    statusFilter ? { filter: { filterModel: { status: statusFilterModel(statusFilter) } } } : undefined
  );

  // Keep the grid in step with the URL, including back/forward navigation.
  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api || api.isDestroyed()) return;
    if (presetFromGrid(api) === statusFilter) return;
    void api
      .setColumnFilterModel('status', statusFilter ? statusFilterModel(statusFilter) : null)
      .then(() => api.onFilterChanged());
  }, [statusFilter]);

  // Storing the tier rather than the raw width means React bails out of
  // re-rendering unless a threshold is actually crossed, so the sidebar's width
  // transition doesn't rebuild the column definitions on every frame.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setTier(tierForWidth(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const DeleteButton = useCallback(
    (params: ICellRendererParams<Automation>) => {
      const row = params.data;
      if (!row) return null;
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${row.name}"? This cannot be undone.`)) {
              deleteAutomation(row.id);
              toast('Automation deleted');
            }
          }}
          className="inline-flex items-center justify-center h-full text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          aria-label={`Delete ${row.name}`}
          title="Delete automation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      );
    },
    [deleteAutomation]
  );

  const columnDefs = useMemo<ColDef<Automation>[]>(
    () => [
      {
        colId: 'name',
        field: 'name',
        headerName: 'Name',
        flex: 2,
        minWidth: 140,
        editable: true,
        filter: true,
        tooltipField: 'name',
      },
      {
        colId: 'type',
        field: 'type',
        headerName: 'Type',
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => TYPE_LABELS[params.value as keyof typeof TYPE_LABELS] ?? params.value,
        filter: true,
      },
      {
        colId: 'status',
        field: 'status',
        headerName: 'Status',
        flex: 0.7,
        minWidth: 96,
        cellRenderer: StatusBadge,
        filter: true,
      },
      {
        colId: 'environment',
        field: 'environment',
        headerName: 'Environment',
        flex: 0.9,
        minWidth: 116,
        filter: true,
        cellRenderer: EnvironmentCell,
      },
      {
        colId: 'owner',
        field: 'owner',
        headerName: 'Owner',
        flex: 0.9,
        minWidth: 112,
        editable: true,
        filter: true,
      },
      {
        colId: 'cronExpression',
        field: 'cronExpression',
        headerName: 'CRON Schedule',
        flex: 1.1,
        minWidth: 132,
        editable: true,
        cellClass: 'font-mono',
        valueFormatter: (params) => params.value ?? '\u2014',
        tooltipValueGetter: (params) => (params.value as string | undefined) ?? '',
      },
      {
        colId: 'lastModified',
        field: 'lastModified',
        headerName: 'Last Modified',
        flex: 0.9,
        minWidth: 136,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
        // initialSort, not sort: columnDefs are rebuilt when the responsive tier
        // changes, and a declared `sort` would stamp this back over whatever the
        // user had sorted by.
        initialSort: 'desc',
      },
      {
        colId: 'version',
        field: 'version',
        headerName: 'Version',
        flex: 0.5,
        minWidth: 80,
        cellClass: 'font-mono',
        hide: tier === 'narrow',
      },
      {
        colId: 'tags',
        field: 'tags',
        headerName: 'Tags',
        flex: 1.2,
        minWidth: 114,
        valueFormatter: (params) => (params.value as string[])?.join(', ') ?? '',
        // Tags are the widest free-text column; only show them where the whole
        // list has room, and expose the full list on hover either way.
        tooltipValueGetter: (params) => (params.value as string[])?.join(', ') ?? '',
        filter: true,
        hide: tier !== 'wide',
      },
      {
        colId: 'actions',
        headerName: '',
        width: 44,
        minWidth: 44,
        maxWidth: 44,
        cellRenderer: DeleteButton,
        sortable: false,
        resizable: false,
        suppressHeaderMenuButton: true,
      },
    ],
    [DeleteButton, tier]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  const onRowClicked = useCallback(
    (event: RowClickedEvent<Automation>) => {
      // Don't navigate if the user is editing a cell or clicked delete
      if (event.event && (event.event.target as HTMLElement)?.closest('.ag-cell-edit-wrapper')) return;
      if (event.event && (event.event.target as HTMLElement)?.closest('button')) return;
      if (event.data) {
        navigate(`/automations/${event.data.id}`);
      }
    },
    [navigate]
  );

  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent<Automation>) => {
      if (event.data && event.colDef.field) {
        updateAutomation(event.data.id, {
          [event.colDef.field]: event.newValue,
        });
      }
    },
    [updateAutomation]
  );

  // Reflect the user's own Status filter edits back into the URL. Changes the
  // grid makes through the API (from the URL) are skipped to avoid a loop.
  const onFilterChanged = useCallback(
    (event: FilterChangedEvent<Automation>) => {
      if (event.source === 'api' || event.source === 'quickFilter') return;
      const preset = presetFromGrid(event.api);
      if (preset !== statusFilter) onStatusFilterChange(preset);
    },
    [statusFilter, onStatusFilterChange]
  );

  // Model updates follow quick search, column filters and row data changes
  // alike, so a column filter left on a status no row has any more (say, after
  // "disable all") is caught here as well as an explicit filter change.
  const onModelUpdated = useCallback((event: ModelUpdatedEvent<Automation>) => {
    const next: GridModelSnapshot = {
      ready: true,
      displayedCount: event.api.getDisplayedRowCount(),
      columnFilterPresent: event.api.isColumnFilterPresent(),
    };
    setModel((prev) =>
      prev.ready === next.ready &&
      prev.displayedCount === next.displayedCount &&
      prev.columnFilterPresent === next.columnFilterPresent
        ? prev
        : next
    );
  }, []);

  const displayState = getGridDisplayState({
    dataStatus,
    totalCount: automations.length,
    displayedCount: model.displayedCount,
    hasActiveFilters: hasActiveGridFilters(searchText, model.columnFilterPresent),
    modelReady: model.ready,
  });

  // The grid's own filter change is an API one, so onFilterChanged won't touch
  // the URL; the page drops the status preset itself, and the URL effect then
  // finds the grid already unfiltered.
  const clearFilters = useCallback(() => {
    gridRef.current?.api?.setFilterModel(null);
    onClearFilters();
  }, [onClearFilters]);

  return (
    <div className="relative">
      {/* While loading or errored the rows are stale or absent, so the grid is
          taken out of focus order and pointer/keyboard interaction entirely. */}
      <div
        ref={containerRef}
        className="automations-grid"
        style={{ height: 600 }}
        inert={displayState === 'loading' || displayState === 'error'}
      >
        <AgGridReact<Automation>
          ref={gridRef}
          theme={themeQuartz}
          rowData={automations}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={searchText}
          // Tags and Version hide at narrower widths; keep searching them.
          includeHiddenColumnsInQuickFilter={true}
          pagination={true}
          paginationPageSize={15}
          paginationPageSizeSelector={[10, 15, 25, 50]}
          rowSelection="single"
          onRowClicked={onRowClicked}
          onCellValueChanged={onCellValueChanged}
          onFilterChanged={onFilterChanged}
          onModelUpdated={onModelUpdated}
          initialState={initialState}
          getRowId={(params) => params.data.id}
          animateRows={true}
          loading={displayState === 'loading'}
          suppressOverlays={SUPPRESSED_OVERLAYS}
        />
      </div>
      {/* The empty overlays let clicks through to the grid (header filter menus
          stay usable); only their action buttons opt back in. */}
      {displayState === 'empty' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 pointer-events-none">
          <Inbox className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground">No automations yet.</p>
          <p className="text-sm text-muted-foreground mb-4">Add an automation to start managing its configuration.</p>
          <Button className="pointer-events-auto" onClick={onAddAutomation}>
            <Plus className="h-4 w-4" />
            Add Automation
          </Button>
        </div>
      )}
      {displayState === 'filtered-empty' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 pointer-events-none">
          <SearchX className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">No automations match your filters.</p>
          <Button variant="outline" className="pointer-events-auto" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
      {/* The error overlay, unlike the empty ones, blocks the grid beneath it. */}
      {displayState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
          <AlertTriangle className={`h-10 w-10 mb-3 ${ERROR_PRESENTATION.statValue}`} />
          <p className={`text-sm text-muted-foreground ${onRetry ? 'mb-4' : ''}`}>Couldn't load automations.</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RotateCw className="h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
