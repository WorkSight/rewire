import * as React      from 'react';
import AutoComplete    from './AutoComplete';
import Select          from './Select';
import {Observe}       from 'rewire-core';
import TextField       from './TextField';
import StaticField     from './StaticField';
import NumberField     from './NumberField';
import CheckField      from './CheckField';
import SwitchField     from './SwitchField';
import TimeInputField  from './TimeInputField';
import AvatarField     from './AvatarField';
import {utc}           from 'rewire-common';
import InputAdornment  from '@material-ui/core/InputAdornment';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import LockOpenIcon    from '@material-ui/icons/LockOpen';
import DateRangeIcon   from '@material-ui/icons/DateRange';
import * as is         from 'is';

export interface IField {
  name         : string;
  label?       : string;
  placeholder? : string;
  align?       : TextAlignment;
  autoFocus?   : boolean;
  error?       : string;
  value?       : any;
  disabled?    : (field: IField) => boolean;
  visible?     : boolean;
}

export type EditorType = 'text' | 'static' | 'auto-complete' | 'select' | 'date' | 'time' | 'number' | 'checked' | 'switch' | 'password' | 'email' | 'avatar';

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
  className: string,
  selectOnFocus?   : boolean;
  endOfTextOnFocus?: boolean;
  onValueChange: (v: any) => void
};

export default function editor(type: EditorType, propsForEdit?: any): React.SFC<any> {
  switch (type) {
    case 'select':
      return ({field, className, classes, onValueChange}: {field: IField, className: string, classes: React.CSSProperties, onValueChange: (v: any) => void}) => (
        <Observe render={() => (
          <Select
            label={field.label}
            onValueChange={onValueChange}
            autoFocus={field.autoFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            style={{width: '100%', minWidth: '120px', textAlign: field.align || 'left'}}
            align={field.align || 'left'}
            selectedItem={field.value}
            onSelectItem={onValueChange}
            className={className}
            classes={classes}
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
            align={field.align || 'left'}
            value={utc(field.value).toDateString()}
            type='date'
            className={className}
            endAdornment={propsForEdit && propsForEdit.hasAdornment ? <InputAdornment position='end'><DateRangeIcon /></InputAdornment> : ''}
            {...propsForEdit}
          />
        )} />
      );

    case 'text':
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
            align={field.align || 'left'}
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'static':
    return ({field, className, onValueChange}: {field: IField, className: string, onValueChange: (v: any) => void}) => (
      <Observe render={() => (
        <StaticField
          label={field.label}
          value={field.value}
          onValueChange={onValueChange}
          visible={field.visible}
          align={field.align || 'left'}
          className={className}
          {...propsForEdit}
        />
      )} />
    );

    case 'email':
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
            align={field.align || 'left'}
            className={className}
            endAdornment={propsForEdit && propsForEdit.hasAdornment ? <InputAdornment position='end'><MailOutlineIcon /></InputAdornment> : ''}
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
            align={field.align || 'left'}
            type='password'
            className={className}
            endAdornment={propsForEdit && propsForEdit.hasAdornment ? <InputAdornment position='end'><LockOpenIcon /></InputAdornment> : ''}
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
            align={field.align || 'right'}
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
            align={field.align || 'left'}
            className={className}
            {...propsForEdit}
          />
        )} />
      );

    case 'checked':
    return ({field, className, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
      <Observe render={() => (
        <CheckField
          label={field.label}
          value={field.value}
          onValueChange={onValueChange}
          autoFocus={field.autoFocus}
          disabled={field.disabled && field.disabled(field)}
          visible={field.visible}
          className={className}
          {...propsForEdit}
        />
      )} />
    );

    case 'switch':
    return ({field, className, onValueChange, endOfTextOnFocus, selectOnFocus}: TextEditorProps) => (
      <Observe render={() => (
        <SwitchField
          label={field.label}
          value={field.value}
          onValueChange={onValueChange}
          autoFocus={field.autoFocus}
          disabled={field.disabled && field.disabled(field)}
          visible={field.visible}
          className={className}
          {...propsForEdit}
        />
      )} />
    );

    case 'auto-complete':
      return ({field, className, onValueChange, classes}: {field: IField, className: string, onValueChange: (v: any) => void, classes: React.CSSProperties}) => (
        <Observe render={() => (
          <AutoComplete
            placeholder={field.placeholder}
            label={field.label}
            onValueChange={onValueChange}
            error={field.error}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            align={field.align || 'left'}
            selectedItem={field.value}
            onSelectItem={onValueChange}
            className={className}
            classes={classes}
            {...propsForEdit}
          />
        )} />
      );
    case 'avatar':
      return ({field, classes, onValueChange}: {field: IField, classes: React.CSSProperties, onValueChange: (v: any) => void}) => (
        <Observe render={() => (
          <AvatarField
            label={field.label}
            onValueChange={onValueChange}
            value={field.value}
            visible={field.visible}
            classes={classes}
            {...propsForEdit}
          />
        )} />
      );
  }
  throw new Error(`unknown editor for type:${type}`);
}
