import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useShell } from '../../shell/ShellContext';
import {
  Form,
  FluidForm,
  Grid,
  Column,
  Modal,
  InlineNotification,
  Section,
  Heading,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getResource, hasResource } from '../registry';
import { DynamicField } from '../DynamicField';
import { FieldSchema, FormSection, ResourceDefinition } from '../types';
import {
  EntityFormProps,
  EntityFormMode,
  FormActionType,
  FormStatusBarInfo,
  ConnectionStatus,
} from './types';
import { EntityToolbar } from '../EntityToolbar';
import { EntityStatusBar } from '../EntityStatusBar';
import { EntityFormLOVModal } from './EntityFormLOVModal';
import { EntityFormDeleteModal } from './EntityFormDeleteModal';

export function EntityForm({
  resource: resourceName,
  resourceDef: customResourceDef,
  mode: initialMode = 'create',
  presentation = 'full-page',
  variant = 'default',
  entityId: initialEntityId,
  entity: initialEntity,
  isOpen = true,
  title: customTitle,
  description: customDescription,
  readOnly = false,
  showToolbar = true,
  showStatusBar = true,
  connectionStatus: propConnectionStatus = 'connected',
  customActions = [],
  onClose,
  onSuccess,
  onModeChange,
  onNavigateRecord,
  onDelete,
  onList,
  onPrint,
  children,
}: EntityFormProps) {
  const { t } = useTranslation();
  const { setActiveContext } = useShell();

  // Resolve Resource Definition
  const resourceDef: ResourceDefinition<any> | null = useMemo(() => {
    if (customResourceDef) return customResourceDef;
    if (resourceName && hasResource(resourceName)) {
      return getResource(resourceName);
    }
    // Fallback schema if no registry match
    if (resourceName) {
      return {
        name: resourceName,
        label: resourceName.charAt(0).toUpperCase() + resourceName.slice(1),
        schema: {
          resource: resourceName,
          label: resourceName,
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
  }, [customResourceDef, resourceName]);

  // Operational State
  const [currentMode, setCurrentMode] = useState<EntityFormMode>(
    readOnly ? 'view' : initialMode
  );
  const [currentEntityId, setCurrentEntityId] = useState<string | undefined>(initialEntityId);
  const [formData, setFormData] = useState<any>(initialEntity || {});
  const [initialSnapshot, setInitialSnapshot] = useState<string>(
    JSON.stringify(initialEntity || {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabledRecord, setIsDisabledRecord] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<Date | undefined>(undefined);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(propConnectionStatus);

  // Record Navigation & LOV State
  const [recordList, setRecordList] = useState<any[]>([]);
  const [currentRecordIndex, setCurrentRecordIndex] = useState<number>(0);
  const [isLOVOpen, setIsLOVOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (initialMode && !readOnly) {
      setCurrentMode(initialMode);
    }
  }, [initialMode, readOnly]);

  useEffect(() => {
    if (initialEntityId !== undefined) {
      setCurrentEntityId(initialEntityId);
    }
  }, [initialEntityId]);

  useEffect(() => {
    if (initialEntity) {
      setFormData(initialEntity);
      setInitialSnapshot(JSON.stringify(initialEntity));
    }
  }, [initialEntity]);

  useEffect(() => {
    setConnectionStatus(propConnectionStatus);
  }, [propConnectionStatus]);

  // Load Record List for Navigation & LOV
  const fetchRecordList = useCallback(async () => {
    if (!resourceDef) return;
    try {
      const res = await resourceDef.dataProvider.list();
      const list = res.data || [];
      setRecordList(list);

      if (currentEntityId) {
        const idx = list.findIndex((item) => String(item.id) === String(currentEntityId));
        if (idx !== -1) {
          setCurrentRecordIndex(idx);
        }
      }
    } catch (err) {
      console.error('Failed to fetch record list:', err);
    }
  }, [resourceDef, currentEntityId]);

  useEffect(() => {
    fetchRecordList();
  }, [fetchRecordList]);

  // Update Shell Context for Status Bar
  useEffect(() => {
    if (presentation === 'full-page') {
      const resolvedLabel = resourceDef?.label || resourceName || 'Entity';
      setActiveContext({
        entity: resolvedLabel,
        component: `EntityForm (${currentMode})`,
      });
    }
  }, [resourceDef?.label, resourceName, currentMode, presentation, setActiveContext]);

  // Load Active Entity Data
  const loadEntityData = useCallback(
    async (id: string, targetMode: EntityFormMode) => {
      if (!resourceDef) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await resourceDef.dataProvider.get(id);
        if (targetMode === 'duplicate') {
          const { id: _, ...rest } = data as any;
          setFormData(rest);
          setInitialSnapshot(JSON.stringify(rest));
          setCurrentEntityId(undefined);
        } else {
          setFormData(data);
          setInitialSnapshot(JSON.stringify(data));
          setCurrentEntityId(id);
          if (data.status === 'disabled' || data.status === 'inactive' || data.disabled) {
            setIsDisabledRecord(true);
          } else {
            setIsDisabledRecord(false);
          }
        }
        setLastModified(new Date());
      } catch (err: any) {
        console.error('Failed to load entity data:', err);
        setErrorMessage(err.message || 'Error loading record data.');
      } finally {
        setIsLoading(false);
      }
    },
    [resourceDef]
  );

  useEffect(() => {
    if (
      (currentMode === 'edit' || currentMode === 'view' || currentMode === 'duplicate') &&
      currentEntityId &&
      !initialEntity
    ) {
      loadEntityData(currentEntityId, currentMode);
    }
  }, [currentMode, currentEntityId, initialEntity, loadEntityData]);

  // Dirty State Calculation
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== initialSnapshot;
  }, [formData, initialSnapshot]);

  // Field Value Change Handler
  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));

    // Clear field-specific validation error on edit
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Field Condition Evaluators
  const checkCondition = (condition?: { field: string; equals?: any; notEquals?: any; in?: any[] }) => {
    if (!condition) return false;
    const { field, equals, notEquals, in: inArray } = condition;
    const val = formData[field];

    if (equals !== undefined && val === equals) return true;
    if (notEquals !== undefined && val !== notEquals) return true;
    if (inArray !== undefined && inArray.includes(val)) return true;
    return false;
  };

  const isFieldVisible = (field: FieldSchema) => {
    if (!field.visibleWhen) return true;
    return checkCondition(field.visibleWhen);
  };

  const isFieldDisabled = (field: FieldSchema) => {
    if (readOnly || currentMode === 'view' || isSubmitting || isDisabledRecord) return true;
    if (field.disabled) return true;
    if (field.disabledWhen) return checkCondition(field.disabledWhen);
    return false;
  };

  const isFieldRequired = (field: FieldSchema) => {
    if (field.required) return true;
    if (field.requiredWhen) return checkCondition(field.requiredWhen);
    return false;
  };

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!resourceDef) return true;
    const { schema } = resourceDef;

    const validateField = (field: FieldSchema) => {
      if (!isFieldVisible(field)) return;

      const val = formData[field.name];
      const required = isFieldRequired(field);

      if (required && (val === undefined || val === null || val === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      if (val !== undefined && val !== null && val !== '') {
        if (field.validation?.min !== undefined && Number(val) < field.validation.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && Number(val) > field.validation.max) {
          newErrors[field.name] = `${field.label} must be no more than ${field.validation.max}`;
        }
        if (field.validation?.minLength !== undefined && String(val).length < field.validation.minLength) {
          newErrors[field.name] = `${field.label} must have at least ${field.validation.minLength} characters`;
        }
        if (field.validation?.maxLength !== undefined && String(val).length > field.validation.maxLength) {
          newErrors[field.name] = `${field.label} must have at most ${field.validation.maxLength} characters`;
        }
        if (field.validation?.pattern && !field.validation.pattern.test(String(val))) {
          newErrors[field.name] = `${field.label} format is invalid`;
        }
      }
    };

    if (schema.fields) {
      schema.fields.forEach(validateField);
    }
    if (schema.sections) {
      schema.sections.forEach((s) => s.fields.forEach(validateField));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save / Submit Handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentMode === 'view') return;

    if (!validateForm()) return;

    if (!resourceDef) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setConnectionStatus('syncing');

    try {
      let result;
      if (currentMode === 'edit' && currentEntityId) {
        result = await resourceDef.dataProvider.update(currentEntityId, formData);
      } else {
        result = await resourceDef.dataProvider.create(formData);
      }

      setInitialSnapshot(JSON.stringify(result || formData));
      setFormData(result || formData);
      if (result && result.id) {
        setCurrentEntityId(String(result.id));
      }
      setLastModified(new Date());
      setConnectionStatus('connected');

      // Refresh records cache
      fetchRecordList();

      // Transition to view mode on successful save
      setCurrentMode('view');
      if (onModeChange) onModeChange('view');
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      console.error('Save failed:', err);
      setErrorMessage(err.message || 'Failed to save record.');
      setConnectionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Record Handler
  const handleDeleteConfirm = async () => {
    if (!resourceDef || !currentEntityId) return;
    setIsDeleting(true);
    setConnectionStatus('syncing');
    try {
      await resourceDef.dataProvider.delete(currentEntityId);
      setIsDeleteModalOpen(false);
      setConnectionStatus('connected');
      if (onDelete) onDelete(currentEntityId);

      // Navigate to next or previous record if available
      const updatedList = recordList.filter((r) => String(r.id) !== String(currentEntityId));
      setRecordList(updatedList);

      if (updatedList.length > 0) {
        const nextIdx = Math.min(currentRecordIndex, updatedList.length - 1);
        const nextRecord = updatedList[nextIdx];
        setCurrentRecordIndex(nextIdx);
        setCurrentEntityId(String(nextRecord.id));
        setFormData(nextRecord);
        setInitialSnapshot(JSON.stringify(nextRecord));
        setCurrentMode('view');
      } else {
        // Reset to empty create form
        setFormData({});
        setInitialSnapshot(JSON.stringify({}));
        setCurrentEntityId(undefined);
        setCurrentMode('create');
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      setErrorMessage(err.message || 'Failed to delete record.');
      setConnectionStatus('error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Record Navigation Engine (first, prev, next, last)
  const navigateToRecordIndex = (index: number, direction: 'first' | 'previous' | 'next' | 'last') => {
    if (index < 0 || index >= recordList.length) return;
    const target = recordList[index];
    if (!target) return;

    setCurrentRecordIndex(index);
    setCurrentEntityId(String(target.id));
    setFormData(target);
    setInitialSnapshot(JSON.stringify(target));
    setCurrentMode('view');
    if (onModeChange) onModeChange('view');
    if (onNavigateRecord) onNavigateRecord(direction, target);
  };

  // Action Bar Dispatcher
  const handleToolbarAction = (actionType: FormActionType) => {
    switch (actionType) {
      case 'new':
        setFormData({});
        setInitialSnapshot(JSON.stringify({}));
        setCurrentEntityId(undefined);
        setErrors({});
        setErrorMessage(null);
        setCurrentMode('create');
        if (onModeChange) onModeChange('create');
        break;

      case 'edit':
        if (currentEntityId) {
          setCurrentMode('edit');
          if (onModeChange) onModeChange('edit');
        }
        break;

      case 'save':
        handleSave();
        break;

      case 'search':
        setIsLOVOpen(true);
        break;

      case 'delete':
        if (currentEntityId) {
          setIsDeleteModalOpen(true);
        }
        break;

      case 'disable':
        setIsDisabledRecord((prev) => !prev);
        break;

      case 'print':
        if (onPrint) {
          onPrint();
        } else {
          window.print();
        }
        break;

      case 'first':
        navigateToRecordIndex(0, 'first');
        break;

      case 'previous':
        navigateToRecordIndex(currentRecordIndex - 1, 'previous');
        break;

      case 'next':
        navigateToRecordIndex(currentRecordIndex + 1, 'next');
        break;

      case 'last':
        navigateToRecordIndex(recordList.length - 1, 'last');
        break;

      case 'list':
        if (onList) onList();
        else if (onClose) onClose();
        break;

      case 'exit':
        if (onClose) onClose();
        break;

      case 'refresh':
        if (currentEntityId) loadEntityData(currentEntityId, currentMode);
        break;
    }
  };

  // LOV Record Selection
  const handleLOVSelect = (selectedRecord: any) => {
    if (!selectedRecord) return;
    const idx = recordList.findIndex((r) => String(r.id) === String(selectedRecord.id));
    if (idx !== -1) setCurrentRecordIndex(idx);
    setCurrentEntityId(String(selectedRecord.id));
    setFormData(selectedRecord);
    setInitialSnapshot(JSON.stringify(selectedRecord));
    setCurrentMode('view');
    if (onModeChange) onModeChange('view');
  };

  // Field Renderer
  const renderField = (field: FieldSchema) => {
    if (!isFieldVisible(field)) return null;

    const span = field.colSpan || 16;
    const disabled = isFieldDisabled(field);
    const required = isFieldRequired(field);

    return (
      <Column sm={4} md={8} lg={span} key={field.name}>
        <DynamicField
          field={{ ...field, required }}
          value={formData[field.name]}
          onChange={(val) => handleChange(field.name, val)}
          error={errors[field.name]}
          disabled={disabled}
        />
      </Column>
    );
  };

  // Form Fields & Sections Layout
  const renderFormFields = () => {
    if (!resourceDef) return null;
    const { schema } = resourceDef;

    return (
      <div className="entity-form-fields-container" style={{ width: '100%' }}>
        {/* Top-level ungrouped fields */}
        {schema.fields && schema.fields.length > 0 && (
          <Grid style={{ padding: 0, margin: 0, width: '100%' }}>
            {schema.fields.map(renderField)}
          </Grid>
        )}

        {/* Sectioned fields */}
        {schema.sections &&
          schema.sections.map((section: FormSection) => (
            <div
              key={section.id}
              className="entity-form-section cds-mb-06"
              style={{
                backgroundColor: 'var(--cds-layer-01)',
                padding: '1.25rem',
                border: '1px solid var(--cds-border-subtle)',
                borderRadius: '2px',
              }}
            >
              <Section>
                <Heading
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    marginBottom: section.description ? '0.25rem' : '1rem',
                  }}
                >
                  {section.title}
                </Heading>
                {section.description && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--cds-text-secondary)',
                      marginBottom: '1rem',
                    }}
                  >
                    {section.description}
                  </p>
                )}
                <Grid style={{ padding: 0, margin: 0, width: '100%' }}>
                  {section.fields.map(renderField)}
                </Grid>
              </Section>
            </div>
          ))}
      </div>
    );
  };

  // Form Wrapper with Fluid vs Default Variant
  const FormContainer = variant === 'fluid' ? FluidForm : Form;

  const formBody = (
    <div
      className={`entity-form-root entity-form-mode-${currentMode} entity-form-variant-${variant} entity-form-presentation-${presentation}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'var(--cds-background)',
        border: presentation === 'full-page' ? '1px solid var(--cds-border-subtle)' : 'none',
        borderRadius: '2px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Toolbar Action Bar */}
      {showToolbar && (
        <EntityToolbar
          mode={currentMode}
          isDirty={isDirty}
          isSaving={isSubmitting}
          isLoading={isLoading}
          isDisabledRecord={isDisabledRecord}
          currentRecordIndex={currentRecordIndex}
          totalRecords={recordList.length}
          hasRecord={!!currentEntityId}
          customActions={customActions}
          onAction={handleToolbarAction}
        />
      )}

      {/* Error / Alert Banner if present */}
      {errorMessage && (
        <div style={{ padding: '0.5rem 1rem' }}>
          <InlineNotification
            kind="error"
            title="Error:"
            subtitle={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        </div>
      )}

      {/* Form Content Area */}
      <div
        className="entity-form-content"
        style={{
          padding: presentation === 'modal' ? '1rem 0' : '1.5rem',
          flex: 1,
          overflowY: 'auto',
          minHeight: '12rem',
        }}
      >
        <FormContainer onSubmit={handleSave}>
          {children ? children : renderFormFields()}
        </FormContainer>
      </div>

      {/* Bottom Status Bar */}
      {showStatusBar && resourceDef && (
        <EntityStatusBar
          status={{
            resourceName: resourceDef.name,
            resourceLabel: resourceDef.label,
            mode: currentMode,
            connectionStatus,
            isDirty,
            isSaving: isSubmitting,
            isLoading,
            isDisabledRecord,
            recordIndex: currentRecordIndex,
            totalRecords: recordList.length,
            recordId: currentEntityId,
            lastModified,
            errorMessage,
            errorCount: Object.keys(errors).length,
          }}
        />
      )}

      {/* List of Values (LOV) Search Dialog */}
      {resourceDef && isLOVOpen && (
        <EntityFormLOVModal
          isOpen={isLOVOpen}
          resourceDef={resourceDef}
          currentId={currentEntityId}
          onSelect={handleLOVSelect}
          onClose={() => setIsLOVOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {resourceDef && isDeleteModalOpen && (
        <EntityFormDeleteModal
          isOpen={isDeleteModalOpen}
          resourceLabel={resourceDef.label}
          recordId={currentEntityId}
          recordTitle={formData?.name || formData?.title || formData?.studentNumber}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );

  // Modal Presentation
  if (presentation === 'modal') {
    const modalHeading =
      customTitle ||
      (currentMode === 'create'
        ? `Create ${resourceDef?.label || 'Record'}`
        : currentMode === 'edit'
        ? `Edit ${resourceDef?.label || 'Record'}`
        : currentMode === 'duplicate'
        ? `Duplicate ${resourceDef?.label || 'Record'}`
        : `${resourceDef?.label || 'Record'} Details`);

    return (
      <Modal
        open={isOpen}
        onRequestClose={onClose}
        onRequestSubmit={handleSave}
        modalHeading={modalHeading}
        modalLabel={customDescription || resourceDef?.labelPlural || 'Form'}
        primaryButtonText={currentMode === 'view' ? t('ui.actions.close', 'Close') : t('ui.actions.save', 'Save')}
        secondaryButtonText={currentMode !== 'view' ? t('ui.actions.cancel', 'Cancel') : undefined}
        primaryButtonDisabled={isSubmitting || isLoading}
        size="lg"
        className="entity-form-modal"
      >
        {formBody}
      </Modal>
    );
  }

  // Full-page, Inline, or Side-panel Presentation
  return formBody;
}
