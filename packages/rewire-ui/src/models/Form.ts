import * as React             from 'react';
import {
  isNullOrUndefined,
  isNullOrUndefinedOrEmpty,
  createGetter,
  createSetter,
  defaultGetter,
  defaultSetter,
  utc,
}                             from 'rewire-common';
import {
  observable,
  replace,
  defaultEquals,
  computed,
  root,
  observe,
  version
}                             from 'rewire-core';
import MailOutlineIcon        from '@material-ui/icons/MailOutline';
import PhoneIcon              from '@material-ui/icons/Phone';
import AccessTimeIcon         from '@material-ui/icons/AccessTime';
import CalendarIcon           from 'mdi-material-ui/Calendar';
import Validator, {
  validator,
  IValidator,
  IFormValidator,
  eValidationResult,
  IValidationContext,
  IError,
  validators,
}                             from './Validator';
import editor, {
  EditorType,
  TextAlignment,
  TextVariant,
  IField,
}                             from '../components/editors';
import { defaultPhoneFormat } from '../components/PhoneField';
import { freeze }             from 'rewire-core';

export type IFieldTypes    = 'string' | 'multistring' | 'static' | 'reference' | 'select' | 'multiselect' | 'number' | 'boolean' | 'switch' | 'date' | 'time' | 'avatar' | 'password' | 'email' | 'phone' | 'color' | 'mask' | 'multiselectautocomplete' | 'custom';
export type FormType<T>    = { field : Record<keyof T, IEditorField> } & Form;
export type TGetter        = (obj: any) => any;
export type TSetter        = (obj: any, value: any) => void;

export interface IFieldDefn {
  label               (text: string):                                    IFieldDefn;
  accessor            (getter: TGetter, setter: TSetter):                IFieldDefn;
  accessor            (path: string[]):                                  IFieldDefn;
  placeholder         (text: string):                                    IFieldDefn;
  align               (text: TextAlignment):                             IFieldDefn;
  variant             (text: TextVariant):                               IFieldDefn;
  autoFocus           ():                                                IFieldDefn;
  disabled            (action: (field: IEditorField) => boolean):        IFieldDefn;
  disableErrors       (disableErrors?: boolean):                         IFieldDefn;
  useTooltipForErrors (useTooltipForErrors?: boolean):                   IFieldDefn;
  startAdornment      (adornment?: () => JSX.Element):                   IFieldDefn;
  endAdornment        (adornment?: () => JSX.Element):                   IFieldDefn;
  editor              (editorType: EditorType, editProps?: any):         IFieldDefn;
  updateOnChange      (updateOnChange?: boolean):                        IFieldDefn;
  validateOnUpdate    (validateOnUpdate?: boolean):                      IFieldDefn;
  validators          (...v: IFormValidator[]):                          IFieldDefn;
  onValueChange       (handleValueChange: (form: Form, v: any) => void): IFieldDefn;
}

export interface IEditorField extends IField {
  Editor:           React.FunctionComponent<any>;
  type:             IFieldTypes;
  updateOnChange:   boolean;
  validateOnUpdate: boolean;

  onValueChange?(form: Form, v: any): void;
}

export interface IFieldDefns {
  [index: string]: IFieldDefn;
}

interface IBaseFieldDefn {
  type                : IFieldTypes;
  accessor?           : {getter: TGetter, setter: TSetter};
  editorType?         : EditorType;
  autoFocus?          : boolean;
  editProps?          : any;
  label?              : string;
  placeholder?        : string;
  align?              : TextAlignment;
  variant?            : TextVariant;
  error?              : string;
  value?              : any;
  disabled?           : (field: IEditorField) => boolean;
  disableErrors?      : boolean;
  useTooltipForErrors?: boolean;
  visible?            : boolean;
  updateOnChange?     : boolean;
  validateOnUpdate?   : boolean;
  validators?         : IValidator[];

  onValueChange?(form: Form, v: any): void;
  startAdornment?(): JSX.Element;
  endAdornment?():   JSX.Element;
}

export interface IFormContext {
  custom                  (Editor: any, editProps?: any): IFieldDefn;
  email                   (editProps?: any): IFieldDefn;
  string                  (editProps?: any): IFieldDefn;
  multistring             (editProps?: any): IFieldDefn;
  static                  (): IFieldDefn;
  number                  (editProps?: any): IFieldDefn;
  boolean                 (editProps?: any): IFieldDefn;
  switch                  (editProps?: any): IFieldDefn;
  date                    (editProps?: any): IFieldDefn;
  time                    (editProps?: any): IFieldDefn;
  password                (editProps?: any): IFieldDefn;
  phone                   (editProps?: any): IFieldDefn;
  select                  (searcher: any, editProps?: any): IFieldDefn;
  multiselect             (searcher: any, editProps?: any): IFieldDefn;
  multiselectautocomplete (searcher: any, editProps?: any): IFieldDefn;
  reference               (searcher: any, editProps?: any): IFieldDefn;
  avatar                  (editProps?: any): IFieldDefn;
  color                   (editProps?: any): IFieldDefn;
  mask                    (editProps?: any): IFieldDefn;
}

function utcEquals(date1: any, date2: any) {
  if (date1 === date2)  return true;
  if (!date1 || !date2) return false;
  return utc(date1).equals(utc(date2));
}

class FormContext implements IFormContext {
  constructor() { }

  field(field: string): any {
    return {field};
  }

  custom(Editor: any, editProps?: any): any {
    editProps = editProps || {};
    editProps.__Editor = Editor;
    return new BaseField('custom', editProps);
  }

  error(error: string): any {
    return {error};
  }

  string(editProps?: any): IFieldDefn {
    return new BaseField('string', editProps);
  }

  multistring(editProps?: any): IFieldDefn {
    return new BaseField('multistring', editProps);
  }

  static(): IFieldDefn {
    return new BaseField('static');
  }

  number(editProps?: any): IFieldDefn {
    return new BaseField('number', editProps);
  }

  boolean(editProps?: any): IFieldDefn {
    return new BaseField('boolean', editProps);
  }

  switch(editProps?: any): IFieldDefn {
    return new BaseField('switch', editProps);
  }

  date(editProps?: any): IFieldDefn {
    return new BaseField('date', editProps);
  }

  time(editProps?: any): IFieldDefn {
    return new BaseField('time', editProps);
  }

  password(editProps?: any): IFieldDefn {
    return new BaseField('password', editProps);
  }

  email(editProps?: any): IFieldDefn {
    return new BaseField('email', editProps).validators('email');
  }

  phone(editProps?: any): IFieldDefn {
    let field       = new BaseField('phone', editProps);
    let phoneLength = ((editProps && editProps.format) || defaultPhoneFormat).replace(new RegExp('[^#]', 'g'), '').length;
    let phoneRegEx  = new RegExp('^$|^[0-9]{' + phoneLength + '}$');
    field.validators(validator('regex', phoneRegEx));
    return field;
  }

  select(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('select', eProps);
  }

  multiselect(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('multiselect', eProps);
  }

  multiselectautocomplete(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('multiselectautocomplete', eProps);
  }

  reference(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('reference', eProps);
  }

  avatar(editProps?: any): IFieldDefn {
    return new BaseField('avatar', editProps);
  }

  color(editProps?: any): IFieldDefn {
    return new BaseField('color', editProps);
  }

  mask(editProps?: any): IFieldDefn {
    return new BaseField('mask', editProps);
  }
}

class BaseField implements IFieldDefn {
  typeDefn: IBaseFieldDefn;
  constructor(type: IFieldTypes, editProps?: any) {
    this.typeDefn = {type: type, editProps: editProps};
  }

  label(text: string): IFieldDefn {
    this.typeDefn.label = text;
    return this;
  }

  accessor(getter: TGetter, setter: TSetter): IFieldDefn;
  accessor(path: string[]): IFieldDefn;
  accessor(porg: string[] | TGetter, setter?: TSetter): IFieldDefn {
    if (setter) {
      const getter           = porg as TGetter;
      this.typeDefn.accessor = {getter, setter};
      return this;
    }

    const path = porg as string[];
    this.typeDefn.accessor = {getter: createGetter(path), setter: createSetter(path)};
    return this;
  }

  placeholder(text: string): IFieldDefn {
    this.typeDefn.placeholder = text;
    return this;
  }

  align(text: TextAlignment): IFieldDefn {
    this.typeDefn.align = text;
    return this;
  }

  variant(text: TextVariant): IFieldDefn {
    this.typeDefn.variant = text;
    return this;
  }

  autoFocus(): IFieldDefn {
    this.typeDefn.autoFocus = true;
    return this;
  }

  disabled(action: (field: IEditorField) => boolean): IFieldDefn {
    this.typeDefn.disabled = action;
    return this;
  }

  disableErrors(disableErrors: boolean = true): IFieldDefn {
    this.typeDefn.disableErrors = disableErrors;
    return this;
  }

  useTooltipForErrors(useTooltipForErrors: boolean = true): IFieldDefn {
    this.typeDefn.useTooltipForErrors = useTooltipForErrors;
    return this;
  }

  startAdornment(adornment?: () => JSX.Element): IFieldDefn {
    this.typeDefn.startAdornment = adornment;
    return this;
  }

  endAdornment(adornment?: () => JSX.Element): IFieldDefn {
    this.typeDefn.endAdornment = adornment;
    return this;
  }

  updateOnChange(updateOnChange: boolean = true): IFieldDefn {
    this.typeDefn.updateOnChange = updateOnChange;
    return this;
  }

  validateOnUpdate(validateOnUpdate: boolean = true): IFieldDefn {
    this.typeDefn.validateOnUpdate = validateOnUpdate;
    return this;
  }

  editor(editorType: EditorType, editProps?: any): IFieldDefn {
    this.typeDefn.editorType = editorType;
    if (editProps) {
      this.typeDefn.editProps = editProps;
    }
    return this;
  }

  validators(...v: IFormValidator[]): IFieldDefn {
    if (!this.typeDefn.validators) this.typeDefn.validators = [];
    this.typeDefn.validators.push(...v.flatMap(vs => validators(vs)));
    return this;
  }

  onValueChange(handleValueChange: (form: Form, v: any) => void): IFieldDefn {
    this.typeDefn.onValueChange = handleValueChange;
    return this;
  }
}

export type IInitialValuesValidationModeType = 'all' | 'withValues' | 'none';

export interface IFormOptions {
  defaultAdornmentsEnabled?:    boolean;
  initialValuesValidationMode?: IInitialValuesValidationModeType;
  disableErrors?:               boolean;
  useTooltipForErrors?:         boolean;
  variant?:                     TextVariant;
  updateOnChange?:              boolean;
  validateOnUpdate?:            boolean;
}

export default class Form implements IValidationContext {
  private _value:              ObjectType;
  private dispose:             () => void;
  private _hasChanges:         () => boolean;
  private _hasErrors:          () => boolean;
  private _initial:            ObjectType;
  defaultAdornmentsEnabled:    boolean;
  initialValuesValidationMode: IInitialValuesValidationModeType;
  disableErrors:               boolean;
  useTooltipForErrors:         boolean;
  variant:                     TextVariant;
  updateOnChange:              boolean;
  validateOnUpdate:            boolean;
  fields:                      IEditorField[];
  validator:                   Validator;
  field:                       { [index: string]: IEditorField };

  private constructor(fields: IFieldDefns, initial?: ObjectType, options?: IFormOptions) {
    this._value                      = observable({});
    this.field                       = observable({});
    this.validator                   = new Validator();
    this.defaultAdornmentsEnabled    = options && !isNullOrUndefined(options.defaultAdornmentsEnabled) ? options.defaultAdornmentsEnabled! : true;
    this.initialValuesValidationMode = options && options.initialValuesValidationMode ? options.initialValuesValidationMode : 'withValues';
    this.disableErrors               = options && options.disableErrors || false;
    this.useTooltipForErrors         = options && options.useTooltipForErrors || false;
    this.variant                     = options && options.variant || 'standard';
    // this.updateOnChange              = options && !isNullOrUndefined(options.updateOnChange) ? options.updateOnChange! : true;
    this.updateOnChange              = options && options.updateOnChange || false;
    this.validateOnUpdate            = options && !isNullOrUndefined(options.validateOnUpdate) ? options.validateOnUpdate! : true;
    this.initializeFields(fields);
    this.value    = initial || {};
    this._initial = Object.assign({}, this.value);
  }

  public addFields(fields: (context: IFormContext) => IFieldDefns, initial?: ObjectType) {
    this.initializeFields(fields(new FormContext()));
    this.value = Object.assign({}, this.value, initial);
  }

  public removeFields(fieldNames: string[]) {
    if (!this.fields) return;
    freeze(() => {
      for (const fieldName of fieldNames) {
        const fieldIdx = this.fields.findIndex(f => f.name === fieldName);
        if (fieldIdx >= 0) {
          this.validator.removeRule(fieldName);
          this.fields.splice(fieldIdx, 1);
          delete this.field[fieldName];
        }
      }
    });
  }

  set value(value: ObjectType)  {
    freeze(() => {
      replace(this._value, value);
      this.fields.forEach(field => {
        field.value = field.type === 'boolean' || field.type === 'switch' ? this._getFieldValue(field, value) || false : this._getFieldValue(field, value);
        field.error = undefined;
      });
    });

    let validationResult: eValidationResult;
    if (this.initialValuesValidationMode === 'all') {
      validationResult = this.validateForm();
    } else if (this.initialValuesValidationMode === 'withValues') {
      let fieldsToValidate = this.fields.filter(field => !isNullOrUndefined(field.value));
      validationResult     = this.validateFields(fieldsToValidate);
    }

    if (!this.dispose) {
      root((dispose) => {
        this.dispose        = dispose;
        const fieldsChanged = observe(() => { version(this._value); this.fields.forEach(v => v.value); });
        this._hasChanges    = computed(fieldsChanged, () => {
          if (!this._value) return false;
          for (const field of this.fields) {
            if (!field.visible) continue;
            const value = this._getFieldValue(field, this._value);
            if (value === field.value) continue; // short circuit easy case!
            if (field.type === 'date' && !utcEquals(field.value, value)) {
              return true;
            }
            if (!defaultEquals(field.value, field.type === 'boolean' || field.type === 'switch' ? value || false : value))
              return true;
          }
          return false;
        }, false);

        const fieldsErrorsChanged = observe(() => this.fields.map(f => f.error));
        this._hasErrors = computed(fieldsErrorsChanged, () => {
          return this.fields.findIndex((field: IEditorField) => !!field.error) >= 0;
        }, validationResult === eValidationResult.Error);
      });
    }
  }

  get hasChanges() {
    return this._hasChanges && this._hasChanges();
  }

  get hasErrors() {
    return this._hasErrors && this._hasErrors();
  }

  get initial() {
    return this._initial;
  }

  get value() {
    return this._value;
  }

  private _getFieldValue(field: IEditorField, obj: any) {
    if (!field) return undefined;
    return (field as any).__getter(obj);
  }

  private _setFieldValue(field: IEditorField, obj: any, value: any) {
    if (!field) return;
    (field as any).__setter(obj, value);
  }

  getChanges(): {[s: string]: any} {
    let changesObj = {};
    for (const field of this.fields) {
      const v = this._getFieldValue(field, this._value);
      if (!defaultEquals(field.value, v)) {
        this._setFieldValue(field, changesObj, field.value);
      }
    }
    return changesObj;
  }

  private initializeFields(fields: IFieldDefns) {
    const flds: any[] = [];
    for (let fieldName in fields) {
      if (!this.field[fieldName]) {
        const field = fields[fieldName];
        flds.push(this.createField(fieldName, field as BaseField));
      }
    }
    this.fields ? this.fields.push(...flds) : this.fields = observable(flds);
  }

  private static editorDefaults: {[K in IFieldTypes]: EditorType} = {
    'string'                  : 'text',
    'multistring'             : 'multitext',
    'static'                  : 'static',
    'select'                  : 'select',
    'multiselect'             : 'multiselect',
    'reference'               : 'auto-complete',
    'boolean'                 : 'checked',
    'switch'                  : 'switch',
    'date'                    : 'date',
    'time'                    : 'time',
    'password'                : 'password',
    'email'                   : 'email',
    'phone'                   : 'phone',
    'number'                  : 'number',
    'avatar'                  : 'avatar',
    'color'                   : 'color',
    'mask'                    : 'mask',
    'custom'                  : 'custom',
    'multiselectautocomplete' : 'multiselectautocomplete'
  };

  private createEditor(editorType: EditorType | undefined, field: IEditorField, editProps?: any): React.SFC<any> {
    if (!editorType) editorType = Form.editorDefaults[field.type];

    if (!editProps) {
      editProps = {updateOnChange: field.updateOnChange};
    } else {
      editProps['updateOnChange'] = field.updateOnChange;
    }

    const onValueChange = (v: any) => {
      let value = isNullOrUndefinedOrEmpty(v) ? undefined : v;
      this.setFieldValue(field.name, value);
    };

    return (props) => React.createElement(editor(editorType!, editProps), {...props, field: field, onValueChange});
  }

  private createField(name: string, fieldDefn: BaseField): IEditorField {
    const accessor = fieldDefn.typeDefn.accessor;
    const field = observable({
      name,
      autoFocus:           fieldDefn.typeDefn.autoFocus,
      type:                fieldDefn.typeDefn.type,
      placeholder:         fieldDefn.typeDefn.placeholder,
      align:               fieldDefn.typeDefn.align,
      label:               fieldDefn.typeDefn.label,
      disabled:            fieldDefn.typeDefn.disabled,
      disableErrors:       !isNullOrUndefined(fieldDefn.typeDefn.disableErrors) ? fieldDefn.typeDefn.disableErrors : this.disableErrors,
      useTooltipForErrors: !isNullOrUndefined(fieldDefn.typeDefn.useTooltipForErrors) ? fieldDefn.typeDefn.useTooltipForErrors : this.useTooltipForErrors,
      variant:             fieldDefn.typeDefn.variant || this.variant,
      error:               undefined,
      value:               undefined,
      updateOnChange:      !isNullOrUndefined(fieldDefn.typeDefn.updateOnChange) ? fieldDefn.typeDefn.updateOnChange : this.updateOnChange,
      validateOnUpdate:    !isNullOrUndefined(fieldDefn.typeDefn.validateOnUpdate) ? fieldDefn.typeDefn.validateOnUpdate : this.validateOnUpdate,
      visible:             true,
      __getter:            (accessor && accessor.getter) || defaultGetter(name),
      __setter:            (accessor && accessor.setter) || defaultSetter(name),
      startAdornment:      fieldDefn.typeDefn.startAdornment,
      endAdornment:        fieldDefn.typeDefn.endAdornment,
      onValueChange:       fieldDefn.typeDefn.onValueChange,
    }) as IEditorField & {__getter: any, __setter: any};

    if (this.defaultAdornmentsEnabled && !Object.prototype.hasOwnProperty.call(fieldDefn.typeDefn, 'endAdornment')) {
      // add default end adornment to field depending on field type if using defaults, and it wasn't explicitly set to something (including undefined)
      switch (field.type) {
        case 'date':
          field.endAdornment = () => React.createElement(CalendarIcon, undefined, undefined);
          break;
        case 'time':
          field.endAdornment = () => React.createElement(AccessTimeIcon, undefined, undefined);
          break;
        case 'email':
          field.endAdornment = () => React.createElement(MailOutlineIcon, undefined, undefined);
          break;
        case 'phone':
          field.endAdornment = () => React.createElement(PhoneIcon, {style: {transform: 'scaleX(-1)'}}, undefined);
          break;
        case 'password':
          field.endAdornment = () => React.createElement('span', undefined, undefined);
          break;
      }
    }

    field.Editor = this.createEditor(fieldDefn.typeDefn.editorType, field, fieldDefn.typeDefn.editProps);
    if (fieldDefn.typeDefn.validators) {
      this.validator.addRule(name, fieldDefn.typeDefn.validators);
    }

    return (this.field[name] = field);
  }

  public setFieldValue(fieldName: string, value: any): boolean {
    let field = this.field[fieldName];
    if (!field || defaultEquals(field.value, value)) return false;
    field.value = value;
    field.onValueChange && field.onValueChange(this, value);
    if (field.validateOnUpdate) {
      this.validateField(field);
    }
    return true;
  }

  public setFieldValues(fieldKVPairs: {[s: string]: any}): boolean {
    if (!fieldKVPairs) return false;

    let success     = false;
    let fieldsToSet = Object.keys(fieldKVPairs).map((fieldName: string) => this.field[fieldName]).filter((field: IEditorField) => field && !defaultEquals(field.value, fieldKVPairs[field.name]));
    fieldsToSet.forEach((field: IEditorField) => {
      field.value = fieldKVPairs[field.name];
      success     = true;
      field.onValueChange && field.onValueChange(this, fieldKVPairs[field.name]);
    });

    this.validateFields(fieldsToSet.filter((field: IEditorField) => field.validateOnUpdate));
    return success;
  }

  public setError(field: string, error?: IError): void {
    this.field[field].error = (error) ? error.text : undefined;
  }

  public getField(fieldName: string): any {
    let field = this.field[fieldName];
    if (!field) return;
    return {label: field.label, value: field.value};
  }

  public shouldValidate(fieldName: string): boolean {
    let field = this.field[fieldName];
    if (!field) return false;
    return !field.disableErrors && !(field.disabled?.(field));
  }

  public toObjectValues(): ObjectType {
    return this.fields.reduce((prev: ObjectType, current) => {
      if (!isNullOrUndefined(current.value) && current.visible) this._setFieldValue(current, prev, current.value);
      return prev;
    }, {});
  }

  public toObject(): ObjectType {
    return this.fields.reduce((prev: ObjectType, current) => {
      if (current.visible) this._setFieldValue(current, prev, current.value);
      return prev;
    }, {});
  }

  public reset() {
    this.value = Object.assign({}, this.initial);
  }

  public revert() {
    this.value = this.value;
  }

  public clear(reinitialize: boolean = false) {
    freeze(() => {
      this.fields.forEach(field => {
        field.value = undefined;
        field.error = undefined;
      });
      if (reinitialize) {
        replace(this._value, {});
      }
    });
    if (this.initialValuesValidationMode === 'all') {
      this.validateForm();
    }
  }

  public submit = (): boolean => {
    if (!this._value) return false;
    let result = this.validateForm();
    if (result === eValidationResult.Error) return false;
    replace(this._value, this.toObjectValues());
    return true;
  }

  public submitAsync = async (cb?: () => Promise<boolean | undefined>): Promise<boolean> => {
    if (!this._value) return false;
    let result = this.validateForm();
    if (result === eValidationResult.Error) return false;
    try {
      const r = cb && (await cb());
      if (r === false) return false;
    } catch (err) {
      return false;
    }
    replace(this._value, this.toObjectValues());
    return true;
  }

  public validateField(field: IEditorField): eValidationResult {
    return this.validator.validateField(this, field.name);
  }

  public validateFields(fields: IEditorField[]): eValidationResult {
    let result = eValidationResult.Success;
    for (const f of fields) {
      result |= this.validator.validateField(this, f.name);
    }
    return result;
  }

  public validateForm(produceErrors: boolean = true): eValidationResult {
    return this.validator.validate(this, produceErrors);
  }

  static create<T>(fields: (context: IFormContext) => T, initial?: ObjectType, options?: IFormOptions) {
    const context = new FormContext();
    return (new Form(fields(context) as any, initial, options) as unknown) as FormType<ReturnType<typeof fields>>;
  }
}
