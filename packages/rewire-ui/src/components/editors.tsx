import * as React              from 'react';
import * as is                 from 'is';
import {Observe}               from 'rewire-core';
import {utc}                   from 'rewire-common';
import { CSSProperties }       from '@material-ui/styles';
import AutoComplete            from './AutoComplete';
import AvatarField             from './AvatarField';
import CheckField              from './CheckField';
import ColorField              from './ColorField';
import MaskField               from './MaskField';
import MultiSelectAutoComplete from './MultiSelectAutoComplete';
import NumberField             from './NumberField';
import PasswordField           from './PasswordField';
import PhoneField              from './PhoneField';
import Select                  from './Select';
import StaticField             from './StaticField';
import SwitchField             from './SwitchField';
import TextField               from './TextField';
import DateField               from './DateField';
import TimeInputField          from './TimeInputField';

export interface IField {
  name                : string;
  label?              : string;
  placeholder?        : string;
  align?              : TextAlignment;
  variant?            : TextVariant;
  autoFocus?          : boolean;
  error?              : string;
  value?              : any;
  disabled?           : (field: IField) => boolean;
  visible?            : boolean;
  disableErrors?      : boolean;
  useTooltipForErrors?: boolean;

  startAdornment?(): JSX.Element;
  endAdornment?():   JSX.Element;
}

export type EditorType    = 'text' | 'multitext' | 'static' | 'auto-complete' | 'select' | 'multiselect' | 'date' | 'time' | 'number' | 'checked' | 'switch' | 'password' | 'email' | 'phone' | 'avatar' | 'color' | 'mask' | 'none' | 'multiselectautocomplete' | 'custom';
export type TextAlignment = 'left' | 'right' | 'center';
export type TextVariant   = 'standard' | 'outlined';
export type DateVariant   = 'dialog' | 'inline' | 'static';

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
  field                 : IField,
  className?            : string,
  classes?              : CSSProperties,
  initialInputValue?    : any;
  selectOnFocus?        : boolean,
  endOfTextOnFocus?     : boolean,
  cursorPositionOnFocus?: number,
  onValueChange         : (v: any) => void,
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
            useTooltipForErrors={field.useTooltipForErrors}
            style={{width: '100%', minWidth: '120px', textAlign: field.align || 'left'}}
            align={field.align || 'left'}
            variant={field.variant}
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

    case 'multiselectautocomplete':
      return ({ field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus, initialInputValue}: TextEditorProps) => (
        <Observe render={() => (
          <MultiSelectAutoComplete
            placeholder={field.placeholder}
            label={field.label}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            initialInputValue={initialInputValue}
            onValueChange={onValueChange}
            error={field.error}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            selectedItems={field.value || []}
            onSelectItem={onValueChange}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'multiselect':
      return ({field, className, classes, onValueChange}: TextEditorProps) => (
        <Observe render={() => (
          <Select
            multiple={true}
            label={field.label}
            onValueChange={onValueChange}
            placeholder={field.placeholder}
            autoFocus={field.autoFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            style={{width: '100%', minWidth: '120px', textAlign: field.align || 'left'}}
            align={field.align || 'left'}
            variant={field.variant}
            selectedItem={field.value || []}
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
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus, initialInputValue}: TextEditorProps) => (
        <Observe render={() => (
          <DateField
            onValueChange={onValueChange}
            placeholder={field.placeholder}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            inputValue={initialInputValue}
            label={field.label}
            autoFocus={field.autoFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            value={field.value && utc(field.value).toLocalDate()}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'text':
    case 'email':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <TextField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'custom':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <propsForEdit.__Editor
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'multitext':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <TextField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            multiline={true}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'phone':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <PhoneField
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            onValueChange={(v) => onValueChange(v && String(v))}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
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

    case 'password':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <PasswordField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            className={className}
            classes={classes}
            hasAdornment={field.endAdornment}
            {...propsForEdit}
          />
        )} />
      );

    case 'number':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <NumberField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            onValueChange={onValueChange}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            autoFocus={field.autoFocus}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'time':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <TimeInputField
            placeholder={field.placeholder}
            label={field.label}
            value={field.value}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
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
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus, initialInputValue}: TextEditorProps) => (
        <Observe render={() => (
          <AutoComplete
            placeholder={field.placeholder}
            label={field.label}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            initialInputValue={initialInputValue}
            onValueChange={onValueChange}
            error={field.error}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
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

    case 'color':
      return ({field, className, classes, onValueChange}: TextEditorProps) => (
        <Observe render={() => (
          <ColorField
            label={field.label}
            value={field.value}
            onValueChange={onValueChange}
            autoFocus={field.autoFocus}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            variant={field.variant}
            className={className}
            classes={classes}
            {...propsForEdit}
          />
        )} />
      );

    case 'mask':
      return ({field, className, classes, onValueChange, endOfTextOnFocus, selectOnFocus, cursorPositionOnFocus}: TextEditorProps) => (
        <Observe render={() => (
          <MaskField
            label={field.label}
            value={field.value}
            autoFocus={field.autoFocus}
            endOfTextOnFocus={endOfTextOnFocus}
            selectOnFocus={selectOnFocus}
            cursorPositionOnFocus={cursorPositionOnFocus}
            onValueChange={onValueChange}
            error={field.error}
            disabled={field.disabled && field.disabled(field)}
            visible={field.visible}
            disableErrors={field.disableErrors}
            useTooltipForErrors={field.useTooltipForErrors}
            align={field.align || 'left'}
            variant={field.variant}
            className={className}
            classes={classes}
            startAdornment={field.startAdornment && field.startAdornment()}
            endAdornment={field.endAdornment && field.endAdornment()}
            {...propsForEdit}
          />
        )} />
      );

    case 'none':
      return () => null;
  }
}
