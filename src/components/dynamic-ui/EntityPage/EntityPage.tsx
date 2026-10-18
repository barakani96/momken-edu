import React, { useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getResource, hasResource } from '../registry';
import { ModulePage } from '../ModulePage';
import { EntityForm } from '../EntityForm';
import { ResourceDefinition } from '../types';

export interface EntityPageProps {
  /** Registered resource name (e.g. 'students', 'teachers') */
  resource?: string;
  /** Explicit resource definition */
  resourceDef?: ResourceDefinition<any>;
  /** Explicit layout width */
  contentWidth?: 'narrow' | 'default' | 'wide' | 'full';
}

export function EntityPage({
  resource: propResourceName,
  resourceDef: propResourceDef,
  contentWidth = 'full',
}: EntityPageProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Resolve Resource Definition
  const resourceDef = useMemo(() => {
    if (propResourceDef) return propResourceDef;
    if (propResourceName && hasResource(propResourceName)) {
      return getResource(propResourceName);
    }
    if (propResourceName) {
      return {
        name: propResourceName,
        label: propResourceName.charAt(0).toUpperCase() + propResourceName.slice(1),
        labelPlural: (propResourceName.charAt(0).toUpperCase() + propResourceName.slice(1)) + 's',
        schema: {
          resource: propResourceName,
          label: propResourceName,
          fields: [],
        },
        columns: [],
        dataProvider: {
          list: async () => ({ data: [], total: 0 }),
          get: async (id: string) => ({ id }),
          create: async (data: any) => ({ id: Date.now().toString(), ...data }),
          update: async (id: string, data: any) => ({ id, ...data }),
          delete: async () => {},
        },
      };
    }
    return null;
  }, [propResourceDef, propResourceName]);

  const resourceName = resourceDef?.name || propResourceName || 'entity';

  // Route Analysis
  const path = location.pathname;
  const isNew = path.endsWith('/new');
  const isEdit = path.endsWith('/edit');
  const isSettings = path.endsWith('/settings');
  const isView = !!id && !isNew && !isEdit && !isSettings;

  if (!resourceDef) {
    return (
      <div style={{ color: 'var(--cds-text-secondary)', padding: '2rem' }}>
        Resource configuration could not be resolved for "{resourceName}".
      </div>
    );
  }

  // Create Mode (ToolBar + EntityForm + StatusBar)
  if (isNew) {
    return (
      <EntityForm
        resource={resourceName}
        resourceDef={resourceDef}
        mode="create"
        presentation="full-page"
        showToolbar={true}
        showStatusBar={true}
        onSuccess={(saved) => {
          if (saved?.id) {
            navigate(`/${resourceName}/${saved.id}`);
          } else {
            navigate(`/${resourceName}`);
          }
        }}
        onClose={() => navigate(`/${resourceName}`)}
        onList={() => navigate(`/${resourceName}`)}
        onNavigateRecord={(dir, targetRecord) => {
          if (targetRecord?.id) {
            navigate(`/${resourceName}/${targetRecord.id}`);
          }
        }}
      />
    );
  }

  // Edit Mode (ToolBar + EntityForm + StatusBar)
  if (isEdit && id) {
    return (
      <EntityForm
        resource={resourceName}
        resourceDef={resourceDef}
        mode="edit"
        presentation="full-page"
        entityId={id}
        showToolbar={true}
        showStatusBar={true}
        onSuccess={() => {
          navigate(`/${resourceName}/${id}`);
        }}
        onModeChange={(newMode) => {
          if (newMode === 'view') navigate(`/${resourceName}/${id}`);
          else if (newMode === 'create') navigate(`/${resourceName}/new`);
        }}
        onDelete={() => {
          navigate(`/${resourceName}`);
        }}
        onClose={() => navigate(`/${resourceName}`)}
        onList={() => navigate(`/${resourceName}`)}
        onNavigateRecord={(dir, targetRecord) => {
          if (targetRecord?.id) {
            navigate(`/${resourceName}/${targetRecord.id}/edit`);
          }
        }}
      />
    );
  }

  // View Mode (ToolBar + EntityForm + StatusBar)
  if (isView && id) {
    return (
      <EntityForm
        resource={resourceName}
        resourceDef={resourceDef}
        mode="view"
        presentation="full-page"
        entityId={id}
        showToolbar={true}
        showStatusBar={true}
        onModeChange={(newMode) => {
          if (newMode === 'edit') navigate(`/${resourceName}/${id}/edit`);
          else if (newMode === 'create') navigate(`/${resourceName}/new`);
        }}
        onDelete={() => {
          navigate(`/${resourceName}`);
        }}
        onClose={() => navigate(`/${resourceName}`)}
        onList={() => navigate(`/${resourceName}`)}
        onNavigateRecord={(dir, targetRecord) => {
          if (targetRecord?.id) {
            navigate(`/${resourceName}/${targetRecord.id}`);
          }
        }}
      />
    );
  }

  // Module Master View (Tabs: Records / DataView [Table/Cards/List], Analytics, Reports, Settings)
  return (
    <ModulePage
      resource={resourceName}
      resourceDef={resourceDef}
      defaultTab={isSettings ? 'settings' : 'records'}
      contentWidth={contentWidth === 'narrow' ? 'default' : contentWidth}
    />
  );
}
