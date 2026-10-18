import React from 'react';
import { FieldType, FieldSchema } from '../types';

export interface FieldRendererProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onBlur?: () => void;
  disabled?: boolean;
}

export type FieldRenderer = React.ComponentType<FieldRendererProps>;

class FieldRegistry {
  private renderers = new Map<string, FieldRenderer>();

  register(type: FieldType | string, renderer: FieldRenderer) {
    this.renderers.set(type, renderer);
  }

  get(type: FieldType | string): FieldRenderer | undefined {
    return this.renderers.get(type);
  }
}

export const fieldRegistry = new FieldRegistry();

export function registerFieldRenderer(type: FieldType | string, renderer: FieldRenderer) {
  fieldRegistry.register(type, renderer);
}
