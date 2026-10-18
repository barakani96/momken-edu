import React from 'react';
import {
  Tile,
  Tag,
  IconButton,
  OverflowMenu,
  OverflowMenuItem,
  Checkbox,
  SkeletonPlaceholder,
  SkeletonText,
} from '@carbon/react';
import {
  View,
  Edit,
  TrashCan,
  Document,
  Information,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '../../components/dynamic-ui/types';

export interface EntityCompactListProps<T = any> {
  data: T[];
  columns?: ColumnDef<T>[];
  idField?: string;
  titleField?: string;
  subtitleField?: string;
  statusField?: string;
  icon?: React.ComponentType<any>;
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  onItemClick?: (item: T) => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDisable?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function EntityCompactList<T extends Record<string, any>>({
  data = [],
  columns = [],
  idField = 'id',
  titleField,
  subtitleField,
  statusField,
  icon: DefaultIcon = Document,
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onItemClick,
  onView,
  onEdit,
  onDelete,
  onDisable,
  emptyMessage,
  className = '',
}: EntityCompactListProps<T>) {
  const { t } = useTranslation();

  const getTitle = (item: T) => {
    if (titleField && item[titleField]) return String(item[titleField]);
    return item.name || item.title || item.fullName || item.label || item.code || `ID: ${item[idField]}`;
  };

  const getSubtitle = (item: T) => {
    if (subtitleField && item[subtitleField]) return String(item[subtitleField]);
    return item.email || item.code || item.department || item.category || item.description || '';
  };

  const getStatus = (item: T) => {
    if (statusField && item[statusField]) return String(item[statusField]);
    return item.status || (item.active !== undefined ? (item.active ? 'active' : 'inactive') : null);
  };

  const getStatusTagType = (status: string): 'green' | 'red' | 'teal' | 'purple' | 'gray' => {
    const s = String(status).toLowerCase();
    if (s === 'active' || s === 'completed' || s === 'approved') return 'green';
    if (s === 'inactive' || s === 'disabled' || s === 'rejected') return 'red';
    if (s === 'pending' || s === 'review') return 'purple';
    if (s === 'enrolled' || s === 'in_progress') return 'teal';
    return 'gray';
  };

  const handleToggleSelect = (e: React.MouseEvent, itemId: string | number) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter((id) => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="cds-flex cds-flex-col cds-gap-02">
        {[1, 2, 3, 4, 5].map((i) => (
          <Tile
            key={i}
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-subtle)',
            }}
          >
            <div className="cds-flex cds-items-center cds-justify-between">
              <div className="cds-flex cds-items-center cds-gap-03" style={{ flex: 1 }}>
                <div style={{ width: '2rem', height: '2rem' }}>
                  <SkeletonPlaceholder />
                </div>
                <div style={{ flex: 1 }}>
                  <SkeletonText width="40%" />
                  <SkeletonText width="25%" />
                </div>
              </div>
              <div style={{ width: '5rem', height: '1.5rem' }}>
                <SkeletonPlaceholder />
              </div>
            </div>
          </Tile>
        ))}
      </div>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div
        className="entity-list-empty cds-flex cds-flex-col cds-items-center cds-justify-center"
        style={{
          padding: '4rem 1.5rem',
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px dashed var(--cds-border-subtle)',
          borderRadius: '2px',
          textAlign: 'center',
        }}
      >
        <Information size={32} style={{ fill: 'var(--cds-icon-secondary)', marginBottom: '0.75rem' }} />
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: '0 0 0.25rem' }}>
          {emptyMessage || t('ui.table.noData', 'No records found')}
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
          {t('ui.emptyState.hint', 'Try adjusting your filters or search criteria.')}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`entity-compact-list-root cds-flex cds-flex-col ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      {data.map((item, idx) => {
        const itemId = item[idField] ?? item.id;
        const isSelected = selectedIds.includes(itemId);
        const title = getTitle(item);
        const subtitle = getSubtitle(item);
        const status = getStatus(item);

        return (
          <div
            key={itemId}
            className="entity-list-row cds-flex cds-items-center cds-justify-between cds-gap-03"
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: isSelected ? 'var(--cds-layer-selected-01)' : 'var(--cds-layer-01)',
              borderBottom: idx < data.length - 1 ? '1px solid var(--cds-border-subtle)' : 'none',
              cursor: onItemClick ? 'pointer' : 'default',
              transition: 'background-color 0.15s ease',
            }}
            onClick={() => {
              if (onItemClick) onItemClick(item);
              else if (onView) onView(item);
            }}
          >
            {/* Left: Checkbox + Icon + Title + Subtitle */}
            <div className="cds-flex cds-items-center cds-gap-03" style={{ minWidth: 0, flex: 1 }}>
              {selectable && (
                <div onClick={(e) => handleToggleSelect(e, itemId)}>
                  <Checkbox
                    id={`list-chk-${itemId}`}
                    labelText=""
                    checked={isSelected}
                    onChange={() => {}}
                  />
                </div>
              )}

              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '2px',
                  backgroundColor: 'var(--cds-layer-02)',
                  border: '1px solid var(--cds-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <DefaultIcon size={16} style={{ fill: 'var(--cds-icon-primary)' }} />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="cds-flex cds-items-center cds-gap-02">
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--cds-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title}
                  </span>
                  {status && (
                    <Tag type={getStatusTagType(status)} size="sm">
                      {status}
                    </Tag>
                  )}
                </div>

                {subtitle && (
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--cds-text-secondary)',
                      margin: '0.125rem 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Quick Action Buttons & Menu */}
            <div
              className="cds-flex cds-items-center cds-gap-01"
              onClick={(e) => e.stopPropagation()}
            >
              {onView && (
                <IconButton
                  label="View"
                  kind="ghost"
                  size="sm"
                  align="bottom"
                  onClick={() => onView(item)}
                >
                  <View size={16} />
                </IconButton>
              )}

              {onEdit && (
                <IconButton
                  label="Edit"
                  kind="ghost"
                  size="sm"
                  align="bottom"
                  onClick={() => onEdit(item)}
                >
                  <Edit size={16} />
                </IconButton>
              )}

              {onDelete && (
                <IconButton
                  label="Delete"
                  kind="ghost"
                  size="sm"
                  align="bottom"
                  onClick={() => onDelete(item)}
                >
                  <TrashCan size={16} />
                </IconButton>
              )}

              <OverflowMenu
                flipped
                aria-label="Actions"
                iconDescription="Actions"
                size="sm"
              >
                {onView && (
                  <OverflowMenuItem
                    itemText="View Details"
                    onClick={() => onView(item)}
                  />
                )}
                {onEdit && (
                  <OverflowMenuItem
                    itemText="Edit Record"
                    onClick={() => onEdit(item)}
                  />
                )}
                {onDisable && (
                  <OverflowMenuItem
                    itemText={item.status === 'inactive' ? 'Enable' : 'Disable'}
                    onClick={() => onDisable(item)}
                  />
                )}
                {onDelete && (
                  <OverflowMenuItem
                    hasDivider
                    isDelete
                    itemText="Delete"
                    onClick={() => onDelete(item)}
                  />
                )}
              </OverflowMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
