import React from 'react';
import { Grid, Column } from '@carbon/react';
import { EntityToolbar } from '../EntityToolbar';
import { EntityStatusBar } from '../EntityStatusBar';
import { EntityLayoutProps } from './types';

export function EntityLayout({
  mode = 'view',
  resourceLabel,
  resourceName,
  entityId,
  totalRecords = 0,
  currentRecordIndex = 0,
  isDirty = false,
  isSaving = false,
  isLoading = false,
  isDisabledRecord = false,
  connectionStatus = 'connected',
  lastModified,
  errorMessage,
  errorCount = 0,
  showToolbar = true,
  showStatusBar = true,
  customToolbar,
  customStatusBar,
  customActions = [],
  onAction = () => {},
  contentWidth = 'full',
  children,
  className = '',
}: EntityLayoutProps) {
  // Determine Grid column spans based on content width
  const getColSpan = () => {
    switch (contentWidth) {
      case 'narrow':
        return { sm: 4, md: 6, lg: 8, offsetLg: 4 };
      case 'wide':
        return { sm: 4, md: 8, lg: 16 };
      case 'full':
        return { sm: 4, md: 8, lg: 16 };
      case 'default':
      default:
        return { sm: 4, md: 8, lg: 12 };
    }
  };

  const colProps = getColSpan();

  return (
    <div
      className={`entity-layout-wrapper cds-flex cds-flex-col ${className}`}
      style={{
        minHeight: '100%',
        width: '100%',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        backgroundColor: 'var(--cds-background)',
      }}
    >
      {/* 1. Top Entity Toolbar */}
      {showToolbar && (
        <div className="entity-toolbar-container" style={{ width: '100%', margin: 0 }}>
          {customToolbar ? (
            customToolbar
          ) : (
            <EntityToolbar
              mode={mode}
              isDirty={isDirty}
              isSaving={isSaving}
              isLoading={isLoading}
              isDisabledRecord={isDisabledRecord}
              currentRecordIndex={currentRecordIndex}
              totalRecords={totalRecords}
              hasRecord={!!entityId || mode !== 'create'}
              customActions={customActions}
              onAction={onAction}
            />
          )}
        </div>
      )}

      {/* 2. Middle Entity Form Viewport */}
      <div
        className="entity-content-viewport"
        style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          backgroundColor: 'var(--cds-background)',
          boxSizing: 'border-box',
        }}
      >
        {contentWidth === 'full' ? (
          children
        ) : (
          <Grid style={{ padding: 0, margin: 0, width: '100%' }}>
            <Column
              sm={colProps.sm}
              md={colProps.md}
              lg={colProps.lg}
              {...(colProps.offsetLg ? { lg: { span: colProps.lg, offset: colProps.offsetLg } } : {})}
            >
              {children}
            </Column>
          </Grid>
        )}
      </div>

      {/* 3. Bottom Entity Status Bar */}
      {showStatusBar && (
        <div className="entity-statusbar-container" style={{ width: '100%', margin: 0 }}>
          {customStatusBar ? (
            customStatusBar
          ) : (
            <EntityStatusBar
              status={{
                resourceName,
                resourceLabel,
                mode,
                connectionStatus,
                isDirty,
                isSaving,
                isLoading,
                isDisabledRecord,
                recordIndex: currentRecordIndex,
                totalRecords,
                recordId: entityId,
                lastModified,
                errorMessage,
                errorCount,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
