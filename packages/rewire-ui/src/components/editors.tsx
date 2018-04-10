import * as React     from 'react';
import AutoComplete   from './AutoComplete';
import Select         from './Select';
import Observe        from 'rewire-core/Observe';
import TextField      from './TextField';
import NumberField    from './NumberField';
import TimeInputField from '../components/TimeInputField';
import utc            from 'rewire-common/utc';
import is             from 'is';

export interface IField {
  name        : string;
  label?      : string;
  placeholder?: string;
  autoFocus?  : boolean;
  error?      : string;
  value?      : any;
  disabled?   : (field: IField) => boolean;
  visible?    : boolean;
}

export type EditorType = 'text' | 'auto-complete' | 'select' | 'date' | 'time' | 'number' | 'checked' | 'password';

export function compare<T>(x?: T, y?: T) {
  if (x && !y) {
    return -1;
  }

  if (!x && y) {
    return 1;
  }

  if (!x && !y) {
    return 0;
  }

  if (x === y) {
    return 0;
  }

  if (is.string(x)) {
    return (x as any as string).localeCompare(y as any as string);
  }

  if (x! < y!) {
    return -1;
  }

  return 1;
}

export type TextEditorProps = {
  field: IField,
  className: string,
  selectOnFocus?   : boolean;
  endOfTextOnFocus?: boolean;
  onValueChange: (v: any) => void
};

export default function editor(type: EditorType, propsForEdit?: any): React.SFC<any> {
  switch (type) {
    case 'select':
      return ({field, className, onValueChange}: {field: IField, className: string, onValueChange: (v: any) => void}) => (
        <Observe render={() => (
          <Select
            placeholder={field.placeholder}
            label={field.label}
            onValueChange={onValueChange}
            autoFocus={field.autoFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            style={{width: '100%', minWidth: '120px'}}
            selectedItem={field.value}
            onSelectItem={onValueChange}
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'date':
      return ({field, className, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <TextField
            onValueChange={onValueChange}
            placeholder={field.placeholder}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            label={field.label}
            autoFocus={field.autoFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            value={utc(field.value).toDateString()}
            type='date'
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'text':
      return ({field, className, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
        <Observe render={(props) => (
          <TextField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'password':
      return ({field, className, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <TextField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            type='password'
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'number':
      return ({field, className, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <NumberField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            onValueChange={onValueChange}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            autoFocus={field.autoFocus}
            visible={field.visible}
            style={{textAlign: 'right'}}
            align={'right'}
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'time':
      return ({field, className, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <TimeInputField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'auto-complete':
      return ({field, className, onValueChange}: {field: IField, className: string, onValueChange: (v: any) => void}) => (
        <Observe render={() => (
          <AutoComplete
            placeholder={field.placeholder}
            label={field.label}
            onValueChange={onValueChange}
            error={field.error}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            selectedItem={field.value}
            onSelectItem={onValueChange}
            className={className}
            {...propsForEdit}
          />
        )} />
      );
  }
  throw new Error(`unknown editor for type:${type}`);
}
