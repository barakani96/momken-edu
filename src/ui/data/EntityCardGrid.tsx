import React from 'react';
import {
  Grid,
  Column,
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

export interface CardActionItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  isDanger?: boolean;
  isDivider?: boolean;
  onClick: (item: any) => void;
}

export interface EntityCardGridProps<T = any> {
  data: T[];
  columns?: ColumnDef<T>[];
  idField?: string;
  titleField?: string;
  subtitleField?: string;
  statusField?: string;
  iconField?: string;
  icon?: React.ComponentType<any>;
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  onCardClick?: (item: T) => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDisable?: (item: T) => void;
  customActions?: CardActionItem[];
  emptyMessage?: string;
  className?: string;
}

export function EntityCardGrid<T extends Record<string, any>>({
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
  onCardClick,
  onView,
  onEdit,
  onDelete,
  onDisable,
  customActions = [],
  emptyMessage,
  className = '',
}: EntityCardGridProps<T>) {
  const { t } = useTranslation();

  // Helper to extract display fields if not explicitly configured
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

  const getStatusTagType = (status: string): 'green' | 'red' | 'teal' | 'purple' | 'gray' | 'warm-gray' => {
    const s = String(status).toLowerCase();
    if (s === 'active' || s === 'completed' || s === 'published' || s === 'approved') return 'green';
    if (s === 'inactive' || s === 'disabled' || s === 'rejected' || s === 'suspended') return 'red';
    if (s === 'pending' || s === 'review' || s === 'draft') return 'purple';
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

  // Loading Skeleton State
  if (isLoading) {
    return (
      <Grid style={{ padding: 0, margin: 0 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Column key={i} sm={4} md={4} lg={4} style={{ marginBottom: '1rem' }}>
            <Tile
              style={{
                height: '12rem',
                backgroundColor: 'var(--cds-layer-01)',
                border: '1px solid var(--cds-border-subtle)',
                borderRadius: '2px',
                padding: '1.25rem',
              }}
            >
              <div className="cds-flex cds-items-center cds-gap-03" style={{ marginBottom: '1rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem' }}>
                  <SkeletonPlaceholder />
                </div>
                <div style={{ flex: 1 }}>
                  <SkeletonText width="60%" heading={false} />
                  <SkeletonText width="40%" />
                </div>
              </div>
              <SkeletonText paragraph lineCount={2} />
            </Tile>
          </Column>
        ))}
      </Grid>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div
        className="entity-card-empty cds-flex cds-flex-col cds-items-center cds-justify-center"
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
    <div className={`entity-card-grid-root ${className}`}>
      <Grid style={{ padding: 0, margin: 0 }}>
        {data.map((item) => {
          const itemId = item[idField] ?? item.id;
          const isSelected = selectedIds.includes(itemId);
          const title = getTitle(item);
          const subtitle = getSubtitle(item);
          const status = getStatus(item);

          // Get 2-3 key attributes from columns to display as tags/details
          const displayAttributes = columns
            .filter((c) => (c.key || c.name) !== idField && (c.key || c.name) !== titleField && (c.key || c.name) !== subtitleField && (c.key || c.name) !== statusField)
            .slice(0, 3);

          return (
            <Column key={itemId} sm={4} md={4} lg={4} style={{ marginBottom: '1rem' }}>
              <div
                className="entity-card-tile"
                style={{
                  height: '100%',
                  backgroundColor: isSelected ? 'var(--cds-layer-selected-01)' : 'var(--cds-layer-01)',
                  border: isSelected
                    ? '1px solid var(--cds-border-interactive)'
                    : '1px solid var(--cds-border-subtle)',
                  borderRadius: '2px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: onCardClick ? 'pointer' : 'default',
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
                  position: 'relative',
                }}
                onClick={() => {
                  if (onCardClick) onCardClick(item);
                  else if (onView) onView(item);
                }}
              >
                {/* Top Row: Checkbox, Icon, Title, Overflow Menu */}
                <div>
                  <div className="cds-flex cds-items-start cds-justify-between cds-gap-02" style={{ marginBottom: '0.75rem' }}>
                    <div className="cds-flex cds-items-start cds-gap-03" style={{ minWidth: 0, flex: 1 }}>
                      {selectable && (
                        <div onClick={(e) => handleToggleSelect(e, itemId)} style={{ marginTop: '0.25rem' }}>
                          <Checkbox
                            id={`card-chk-${itemId}`}
                            labelText=""
                            checked={isSelected}
                            onChange={() => {}}
                          />
                        </div>
                      )}

                      {/* Card Avatar / Icon */}
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--cds-layer-02)',
                          border: '1px solid var(--cds-border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <DefaultIcon size={18} style={{ fill: 'var(--cds-icon-primary)' }} />
                      </div>

                      {/* Title & Subtitle */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--cds-text-primary)',
                            margin: 0,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={title}
                        >
                          {title}
                        </h3>

                        {subtitle && (
                          <p
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--cds-text-secondary)',
                              margin: '0.125rem 0 0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={subtitle}
                          >
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Overflow Menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <OverflowMenu
                        flipped
                        aria-label="Card Actions"
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
                        {customActions.map((act) => (
                          <OverflowMenuItem
                            key={act.id}
                            itemText={act.label}
                            isDelete={act.isDanger}
                            onClick={() => act.onClick(item)}
                          />
                        ))}
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

                  {/* Attributes & Properties preview */}
                  {displayAttributes.length > 0 && (
                    <div
                      style={{
                        margin: '0.75rem 0',
                        fontSize: '0.8125rem',
                        color: 'var(--cds-text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      {displayAttributes.map((col) => {
                        const colKey = (col.key || col.name) as string;
                        const val = item[colKey];
                        if (val === undefined || val === null || val === '') return null;
                        return (
                          <div key={colKey} className="cds-flex cds-justify-between cds-gap-02">
                            <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.75rem' }}>
                              {col.label || col.header || colKey}:
                            </span>
                            <span
                              style={{
                                color: 'var(--cds-text-primary)',
                                fontWeight: 500,
                                textAlign: 'right',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '12rem',
                              }}
                            >
                              {col.renderCell ? col.renderCell(val, item) : col.render ? col.render(item) : String(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Status Tag & Quick Action Buttons */}
                <div
                  className="cds-flex cds-items-center cds-justify-between cds-gap-02"
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--cds-border-subtle)',
                    marginTop: '0.75rem',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    {status && (
                      <Tag type={getStatusTagType(status)} size="sm">
                        {status}
                      </Tag>
                    )}
                  </div>

                  <div className="cds-flex cds-items-center cds-gap-01">
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
                  </div>
                </div>
              </div>
            </Column>
          );
        })}
      </Grid>
    </div>
  );
}
