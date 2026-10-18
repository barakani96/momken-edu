import React, { useState, useEffect } from 'react';
import {
  Modal,
  Search,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  InlineLoading,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ResourceDefinition } from '../types';

export interface EntityFormLOVModalProps {
  isOpen: boolean;
  resourceDef: ResourceDefinition<any>;
  currentId?: string;
  onSelect: (record: any) => void;
  onClose: () => void;
}

export function EntityFormLOVModal({
  isOpen,
  resourceDef,
  currentId,
  onSelect,
  onClose,
}: EntityFormLOVModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      resourceDef.dataProvider
        .list()
        .then((res) => {
          setRecords(res.data || []);
        })
        .catch((err) => {
          console.error('Failed to load LOV records:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, resourceDef]);

  const headers = (resourceDef.columns || []).map((col) => ({
    key: col.key,
    header: col.label,
  }));

  // Fallback if no columns are defined
  const effectiveHeaders =
    headers.length > 0
      ? headers
      : [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
        ];

  const filteredRecords = records.filter((rec) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(rec).some((val) =>
      String(val || '')
        .toLowerCase()
        .includes(term)
    );
  });

  const BodyComponent = TableBody as any;

  return (
    <Modal
      open={isOpen}
      modalHeading={`Search ${resourceDef.labelPlural || resourceDef.label} (LOV)`}
      modalLabel="List of Values"
      primaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={onClose}
      passiveModal
      size="lg"
      className="entity-form-lov-modal"
    >
      <div style={{ padding: '0.5rem 0' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Search
            size="md"
            labelText="Search records"
            placeholder={`Type to filter ${resourceDef.labelPlural || resourceDef.label}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            autoFocus
          />
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <InlineLoading status="active" description="Loading records..." />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div
            style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--cds-text-secondary)',
              backgroundColor: 'var(--cds-layer-01)',
            }}
          >
            <p>No {resourceDef.labelPlural || resourceDef.label} found matching "{searchTerm}".</p>
          </div>
        ) : (
          <TableContainer style={{ maxHeight: '24rem', overflowY: 'auto' }}>
            <Table size="md" useZebraStyles isSortable>
              <TableHead>
                <TableRow>
                  {effectiveHeaders.map((header) => (
                    <TableHeader key={header.key}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <BodyComponent>
                {filteredRecords.map((row) => {
                  const isSelected = row.id === currentId;
                  return (
                    <TableRow
                      key={row.id}
                      isSelected={isSelected}
                      onClick={() => {
                        onSelect(row);
                        onClose();
                      }}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--cds-layer-selected-01)' : undefined,
                      }}
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') {
                          onSelect(row);
                          onClose();
                        }
                      }}
                    >
                      {effectiveHeaders.map((header) => (
                        <TableCell key={header.key}>
                          {String(row[header.key] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </BodyComponent>
            </Table>
          </TableContainer>
        )}
      </div>
    </Modal>
  );
}
