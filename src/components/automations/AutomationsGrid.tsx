import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import type { ColDef, RowClickedEvent, CellValueChangedEvent, FilterChangedEvent, ICellRendererParams } from 'ag-grid-community';
import { useAutomationStore } from '@/stores/automationStore';
import { StatusBadge } from './StatusBadge';
import { TYPE_LABELS } from '@/types/automation';
import type { Automation } from '@/types/automation';
import { Trash2, SearchX } from 'lucide-react';
import { toast } from '@/lib/useToast';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Columns are flex-sized, so what decides whether they fit is the width of the
 * grid container, not the viewport: collapsing the sidebar changes the space
 * available without the viewport changing at all. Each threshold is the summed
 * minWidth of the columns in that tier plus a little breathing room.
 */
const ALL_COLUMNS_MIN_WIDTH = 1180; // core columns + Version + Tags
const VERSION_MIN_WIDTH = 980; // core columns + Version

type WidthTier = 'wide' | 'medium' | 'narrow';

function tierForWidth(width: number): WidthTier {
  if (width >= ALL_COLUMNS_MIN_WIDTH) return 'wide';
  if (width >= VERSION_MIN_WIDTH) return 'medium';
  return 'narrow';
}

interface AutomationsGridProps {
  searchText: string;
}

export function AutomationsGrid({ searchText }: AutomationsGridProps) {
  const automations = useAutomationStore((s) => s.automations);
  const updateAutomation = useAutomationStore((s) => s.updateAutomation);
  const deleteAutomation = useAutomationStore((s) => s.deleteAutomation);
  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact<Automation>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const [tier, setTier] = useState<WidthTier>('medium');

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
        cellClass: 'capitalize',
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

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      const count = event.api.getDisplayedRowCount();
      setShowEmpty(count === 0 && searchText.length > 0);
    },
    [searchText]
  );

  return (
    <div className="relative">
      <div ref={containerRef} className="automations-grid" style={{ height: 600 }}>
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
          getRowId={(params) => params.data.id}
          animateRows={true}
        />
      </div>
      {showEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 pointer-events-none">
          <SearchX className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">No automations match your search.</p>
        </div>
      )}
    </div>
  );
}
