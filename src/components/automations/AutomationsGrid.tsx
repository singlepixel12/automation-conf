import { useState, useMemo, useCallback, useRef } from 'react';
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

interface AutomationsGridProps {
  searchText: string;
}

export function AutomationsGrid({ searchText }: AutomationsGridProps) {
  const automations = useAutomationStore((s) => s.automations);
  const updateAutomation = useAutomationStore((s) => s.updateAutomation);
  const deleteAutomation = useAutomationStore((s) => s.deleteAutomation);
  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact<Automation>>(null);
  const [showEmpty, setShowEmpty] = useState(false);

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
        field: 'name',
        headerName: 'Name',
        flex: 2,
        minWidth: 200,
        editable: true,
        filter: true,
      },
      {
        field: 'type',
        headerName: 'Type',
        flex: 1,
        minWidth: 140,
        valueFormatter: (params) => TYPE_LABELS[params.value as keyof typeof TYPE_LABELS] ?? params.value,
        filter: true,
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 100,
        cellRenderer: StatusBadge,
        filter: true,
      },
      {
        field: 'environment',
        headerName: 'Environment',
        flex: 1,
        minWidth: 120,
        filter: true,
        cellClass: 'capitalize',
      },
      {
        field: 'owner',
        headerName: 'Owner',
        flex: 1,
        minWidth: 130,
        editable: true,
        filter: true,
      },
      {
        field: 'cronExpression',
        headerName: 'CRON Schedule',
        flex: 1,
        minWidth: 140,
        editable: true,
        cellClass: 'font-mono',
        valueFormatter: (params) => params.value ?? '\u2014',
      },
      {
        field: 'lastModified',
        headerName: 'Last Modified',
        flex: 1,
        minWidth: 140,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
        sort: 'desc',
      },
      {
        field: 'version',
        headerName: 'Version',
        width: 100,
      },
      {
        field: 'tags',
        headerName: 'Tags',
        flex: 1,
        minWidth: 150,
        valueFormatter: (params) => (params.value as string[])?.join(', ') ?? '',
        filter: true,
      },
      {
        headerName: '',
        width: 50,
        cellRenderer: DeleteButton,
        sortable: false,
        resizable: false,
        suppressHeaderMenuButton: true,
      },
    ],
    [DeleteButton]
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
      <div className="ag-theme-quartz" style={{ height: 600 }}>
        <AgGridReact<Automation>
          ref={gridRef}
          theme={themeQuartz}
          rowData={automations}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={searchText}
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
