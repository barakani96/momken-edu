import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { getResource, hasResource } from '../registry';
import { InteractiveGrid as UiInteractiveGrid, InteractiveGridColumn } from '../../../ui/data/InteractiveGrid';
import { EntityForm } from '../EntityForm';
import { useNotification } from '../../../core/notifications/NotificationContext';

export interface InteractiveGridProps {
  resource: string;
  onRowClick?: (row: any) => void;
  readOnly?: boolean;
}

export function InteractiveGrid({ resource: resourceName, onRowClick, readOnly = false }: InteractiveGridProps) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  
  const resourceDef = useMemo(() => {
    if (hasResource(resourceName)) {
      return getResource(resourceName);
    }
    return null;
  }, [resourceName]);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    if (!resourceDef?.dataProvider) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await resourceDef.dataProvider.list({ pagination: { page: 1, perPage: 100 } });
      setData(response.data || []);
    } catch (err) {
      console.error(`[InteractiveGrid] Failed loading ${resourceName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [resourceDef, resourceName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedId(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (id: string) => {
    setModalMode('edit');
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadData(); // Refresh data
  };

  // Batch Save Transaction Handler
  const handleSaveBatch = async (modifiedRows: any[]) => {
    if (!resourceDef?.dataProvider) return;

    for (const row of modifiedRows) {
      const id = String(row.id);
      await resourceDef.dataProvider.update(id, row);
    }

    await loadData();
  };

  // Convert Dynamic UI column definitions into InteractiveGrid columns with schema awareness
  const gridColumns: InteractiveGridColumn<any>[] = useMemo(() => {
    if (!resourceDef) return [];

    const fieldMap = new Map<string, any>();
    resourceDef.schema?.fields?.forEach((f) => {
      fieldMap.set(f.name, f);
    });

    const mapped: InteractiveGridColumn<any>[] = resourceDef.columns.map((col) => {
      const field = fieldMap.get(col.key || col.name);
      let editType: 'text' | 'number' | 'select' | 'checkbox' | 'date' = 'text';

      if (field) {
        if (field.type === 'number' || field.type === 'currency') editType = 'number';
        else if (field.type === 'checkbox' || field.type === 'switch') editType = 'checkbox';
        else if (field.type === 'select' || field.type === 'radio') editType = 'select';
        else if (field.type === 'date') editType = 'date';
      }

      return {
        key: (col.key || col.name) as string,
        header: col.label || col.header || String(col.key || col.name),
        width: col.width,
        editable: col.key !== 'id' && col.key !== '_actions' && !field?.readonly && !field?.disabled,
        editType,
        options: field?.options,
        validate: (val: any) => {
          if (field?.required && (val === null || val === undefined || val === '')) {
            return `${col.label || col.header} is required.`;
          }
          if (field?.validation?.min !== undefined && Number(val) < field.validation.min) {
            return `Minimum value is ${field.validation.min}.`;
          }
          if (field?.validation?.max !== undefined && Number(val) > field.validation.max) {
            return `Maximum value is ${field.validation.max}.`;
          }
          return null;
        },
        render: col.renderCell
          ? (row: any) => col.renderCell!(row[(col.key || col.name) as string], row)
          : col.render
          ? (row: any) => col.render!(row)
          : undefined,
      };
    });

    // Add Actions column if actions exist
    if (resourceDef.actions && resourceDef.actions.length > 0) {
      mapped.push({
        key: '_actions',
        header: 'Actions',
        width: '120px',
        editable: false,
        render: (row: any) => (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {resourceDef.actions?.map((action) => (
              <Button
                key={action.id}
                kind="ghost"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (action.type === 'edit') {
                    openEditModal(row.id);
                  } else if (action.handler) {
                    action.handler(row);
                  }
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ),
      });
    }

    return mapped;
  }, [resourceDef]);

  if (!resourceDef) {
    return (
      <div style={{ padding: '2rem', color: 'var(--cds-text-secondary)' }}>
        Resource definition not found for "{resourceName}".
      </div>
    );
  }

  return (
    <div className="interactive-grid" style={{ width: '100%' }}>
      <div
        className="interactive-grid-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: 'var(--cds-text-primary)' }}>
            {resourceDef.labelPlural || `${resourceDef.label}s`} — Interactive Grid
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
            Inline editing enabled with keyboard navigation (Arrow keys, Tab, Enter) and batch transactions.
          </p>
        </div>

        <Button renderIcon={Add} size="sm" onClick={openCreateModal}>
          {t('ui.actions.create', 'New Record')}
        </Button>
      </div>

      <UiInteractiveGrid
        columns={gridColumns}
        data={data}
        loading={loading}
        readOnly={readOnly}
        onSaveBatch={handleSaveBatch}
        onRowClick={onRowClick}
        pagination={true}
        pageSize={15}
        searchable={true}
        searchPlaceholder={`Search ${resourceDef.labelPlural || resourceDef.label}...`}
      />

      {isModalOpen && (
        <EntityForm
          resource={resourceName}
          mode={modalMode}
          presentation="modal"
          entityId={selectedId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

