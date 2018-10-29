import * as React      from 'react';
import AutoComplete    from './AutoComplete';
import Select          from './Select';
import {Observe}       from 'rewire-core';
import TextField       from './TextField';
import PasswordField   from './PasswordField';
import StaticField     from './StaticField';
import NumberField     from './NumberField';
import CheckField      from './CheckField';
import SwitchField     from './SwitchField';
import TimeInputField  from './TimeInputField';
import AvatarField     from './AvatarField';
import {utc}           from 'rewire-common';
import * as is         from 'is';

export interface IField {
  name           : string;
  label?         : string;
  placeholder?   : string;
  align?         : TextAlignment;
  autoFocus?     : boolean;
  error?         : string;
  value?         : any;
  disabled?      : (field: IField) => boolean;
  visible?       : boolean;
  disableErrors? : boolean;

  startAdornment?(): JSX.Element;
  endAdornment?(): JSX.Element;
}

export type EditorType = 'text' | 'static' | 'auto-complete' | 'select' | 'date' | 'time' | 'number' | 'checked' | 'switch' | 'password' | 'email' | 'avatar' | 'none';

export type TextAlignment = 'left' | 'right' | 'center';

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
  className?: string,
  classes?: React.CSSProperties,
  selectOnFocus?   : boolean,
  endOfTextOnFocus?: boolean,
  onValueChange: (v: any) => void,
};

export default function editor(type: EditorType, propsForEdit?: any): React.SFC<TextEditorProps> {
  switch (type) {
    case 'select':
      return ({field, className, classes, onValueChange}: TextEditorProps) => (
        <Observe render={() => (
          <Select
            label={field.label}
            onValueChange={onValueChange}
            placeholder={field.placeholder}
            autoFocus={field.autoFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            style={{width: '100%', minWidth: '120px', textAlign: field.align || 'left'}}
            align={field.align || 'left'}
            selectedItem={field.value}
            onSelectItem={onValueChange}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'date':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
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
            disableErrors={field.disableErrors}
            align={field.align || 'left'}
            value={field.value && utc(field.value).toDateString()}
            type='date'
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'text':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
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
            disableErrors={field.disableErrors}
            align={field.align || 'left'}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'static':
    return ({field, className, classes, onValueChange}: TextEditorProps) => (
      <Observe render={() => (
        <StaticField
          label={field.label}
          value={field.value}
          onValueChange={onValueChange}
          visible={field.visible}
          align={field.align || 'left'}
          className={className}
          classes={classes}
          {...propsForEdit}
        />
      )} />
    );

    case 'email':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
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
            disableErrors={field.disableErrors}
            align={field.align || 'left'}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'password':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <PasswordField
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
            disableErrors={field.disableErrors}
            align={field.align || 'left'}
            className={className}
            classes={classes}
            hasAdornment={field.endAdornment}
            {...propsForEdit}
          />
        )} />
      );

    case 'number':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
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
            disableErrors={field.disableErrors}
            align={field.align || 'left'}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'time':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
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
            disableErrors={field.disableErrors}
            align={field.align || 'left'}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'checked':
    return ({field, className, classes, onValueChange}: TextEditorProps) => (
      <Observe render={() => (
        <CheckField
          label={field.label}
          value={field.value}
          onValueChange={onValueChange}
          autoFocus={field.autoFocus}
          disabled={field.disabled && field.disabled(field)}
          visible={field.visible}
          className={className}
          classes={classes}
          {...propsForEdit}
        />
      )} />
    );

    case 'switch':
    return ({field, className, classes, onValueChange}: TextEditorProps) => (
      <Observe render={() => (
        <SwitchField
          label={field.label}
          value={field.value}
          onValueChange={onValueChange}
          autoFocus={field.autoFocus}
          disabled={field.disabled && field.disabled(field)}
          visible={field.visible}
          className={className}
          classes={classes}
          {...propsForEdit}
        />
      )} />
    );

    case 'auto-complete':
      return ({field, className, classes, onValueChange}: TextEditorProps) => (
        <Observe render={() => (
          <AutoComplete
            placeholder={field.placeholder}
            label={field.label}
            onValueChange={onValueChange}
            error={field.error}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            align={field.align || 'left'}
            selectedItem={field.value}
            onSelectItem={onValueChange}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );
    case 'avatar':
      return ({field, className, classes, onValueChange}: TextEditorProps) => (
        <Observe render={() => (
          <AvatarField
            label={field.label}
            onValueChange={onValueChange}
            value={field.value}
            visible={field.visible}
            className={className}
            classes={classes}
            {...propsForEdit}
          />
        )} />
      );
    case 'none':
      return () => undefined;
  }
  throw new Error(`unknown editor for type:${type}`);
}
