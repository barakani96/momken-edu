import React from 'react';
import { FieldSchema } from '../types';
import { fieldRegistry } from './FieldRegistry';
import './renderers'; // Ensure default renderers are registered

export interface DynamicFieldProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onBlur?: () => void;
  disabled?: boolean;
}

export function DynamicField({ field, value, onChange, error, onBlur, disabled }: DynamicFieldProps) {
  const Renderer = fieldRegistry.get(field.component || field.type);

  if (!Renderer) {
    return (
      <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>
        Unsupported field type: {field.component || field.type} for field {field.name}
      </div>
    );
  }

  return (
    <div className={`dynamic-field dynamic-field-${field.name}`} style={{ marginBottom: '1.5rem' }}>
      <Renderer
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        onBlur={onBlur}
        disabled={disabled}
      />
    </div>
  );
}
