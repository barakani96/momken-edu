import React from 'react';
import { TextInput, TextArea, NumberInput, Checkbox, Select, SelectItem, DatePicker, DatePickerInput } from '@carbon/react';
import { FieldRendererProps } from '../FieldRegistry';
import { registerFieldRenderer } from '../FieldRegistry';

export const TextRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error, onBlur, disabled }) => (
  <TextInput
    id={`field-${field.name}`}
    labelText={field.label}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    invalid={!!error}
    invalidText={error}
    onBlur={onBlur}
    disabled={disabled || field.disabled}
    readOnly={field.readonly}
  />
);

export const TextAreaRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error, onBlur, disabled }) => (
  <TextArea
    id={`field-${field.name}`}
    labelText={field.label}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    invalid={!!error}
    invalidText={error}
    onBlur={onBlur}
    disabled={disabled || field.disabled}
    readOnly={field.readonly}
  />
);

export const NumberRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error, onBlur, disabled }) => (
  <NumberInput
    id={`field-${field.name}`}
    label={field.label}
    value={value !== undefined && value !== null ? Number(value) : ''}
    onChange={(e: any, { value: numValue }: { value: string | number }) => onChange(Number(numValue))}
    invalid={!!error}
    invalidText={error}
    onBlur={onBlur}
    disabled={disabled || field.disabled}
    readOnly={field.readonly}
    min={field.validation?.min}
    max={field.validation?.max}
  />
);

export const CheckboxRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, disabled }) => (
  <Checkbox
    id={`field-${field.name}`}
    labelText={field.label}
    checked={!!value}
    onChange={(e, { checked }) => onChange(checked)}
    disabled={disabled || field.disabled}
  />
);

export const SelectRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error, disabled }) => (
  <Select
    id={`field-${field.name}`}
    labelText={field.label}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    invalid={!!error}
    invalidText={error}
    disabled={disabled || field.disabled}
  >
    <SelectItem value="" text="Choose an option" />
    {field.options?.map((opt) => {
      const Item = SelectItem as any;
      return <Item key={String(opt.value)} value={opt.value} text={opt.label} />;
    })}
  </Select>
);

export const DateRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error, disabled }) => (
  <DatePicker datePickerType="single" value={value} onChange={(dates) => onChange(dates[0])}>
    <DatePickerInput
      id={`field-${field.name}`}
      placeholder="mm/dd/yyyy"
      labelText={field.label}
      invalid={!!error}
      invalidText={error}
      disabled={disabled || field.disabled}
    />
  </DatePicker>
);

// Register them
registerFieldRenderer('text', TextRenderer);
registerFieldRenderer('textarea', TextAreaRenderer);
registerFieldRenderer('number', NumberRenderer);
registerFieldRenderer('checkbox', CheckboxRenderer);
registerFieldRenderer('select', SelectRenderer);
registerFieldRenderer('date', DateRenderer);
