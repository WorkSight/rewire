import * as React             from 'react';
import {
  isNullOrUndefined,
  isNullOrUndefinedOrEmpty,
}                             from 'rewire-common';
import {
  observable,
  replace,
  defaultEquals,
  computed,
  root,
  observe
}                             from 'rewire-core';
import MailOutlineIcon        from '@material-ui/icons/MailOutline';
import PhoneIcon              from '@material-ui/icons/Phone';
import AccessTimeIcon         from '@material-ui/icons/AccessTime';
import DateRangeIcon          from '@material-ui/icons/DateRange';
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

export type IFieldTypes    = 'string' | 'multistring' | 'static' | 'reference' | 'select' | 'multiselect' | 'number' | 'boolean' | 'switch' | 'date' | 'time' | 'avatar' | 'password' | 'email' | 'phone' | 'color' | 'mask' | 'multiselectautocomplete';
export type FormType<T>    = { field : Record<keyof T, IEditorField> } & Form;

export interface IFieldDefn {
  label            (text: string):                                    IFieldDefn;
  placeholder      (text: string):                                    IFieldDefn;
  align            (text: TextAlignment):                             IFieldDefn;
  variant          (text: TextVariant):                               IFieldDefn;
  autoFocus        ():                                                IFieldDefn;
  disabled         (action: (field: IEditorField) => boolean):        IFieldDefn;
  disableErrors    (disableErrors?: boolean):                         IFieldDefn;
  startAdornment   (adornment?: () => JSX.Element):                   IFieldDefn;
  endAdornment     (adornment?: () => JSX.Element):                   IFieldDefn;
  editor           (editorType: EditorType, editProps?: any):         IFieldDefn;
  updateOnChange   (updateOnChange?: boolean):                        IFieldDefn;
  validateOnUpdate (validateOnUpdate?: boolean):                      IFieldDefn;
  validators       (...v: IFormValidator[]):                          IFieldDefn;
  onValueChange    (handleValueChange: (form: Form, v: any) => void): IFieldDefn;
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
  type             : IFieldTypes;
  editorType?      : EditorType;
  autoFocus?       : boolean;
  editProps?       : any;
  label?           : string;
  placeholder?     : string;
  align?           : TextAlignment;
  variant?         : TextVariant;
  error?           : string;
  value?           : any;
  disabled?        : (field: IEditorField) => boolean;
  disableErrors?   : boolean;
  visible?         : boolean;
  updateOnChange?  : boolean;
  validateOnUpdate?: boolean;
  validators?      : IValidator[];

  onValueChange?(form: Form, v: any): void;
  startAdornment?(): JSX.Element;
  endAdornment?():   JSX.Element;
}

export interface IFormContext {
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

class FormContext implements IFormContext {
  constructor() { }

  field(field: string): any {
    return {field}
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
    this.variant                     = options && options.variant || 'standard';
    // this.updateOnChange              = options && !isNullOrUndefined(options.updateOnChange) ? options.updateOnChange! : true;
    this.updateOnChange              = options && options.updateOnChange || false;
    this.validateOnUpdate            = options && !isNullOrUndefined(options.validateOnUpdate) ? options.validateOnUpdate! : true;
    this.initializeFields(fields);
    this.value    = initial || {};
    this._initial = Object.assign({}, this.value);
  }

  set value(value: ObjectType)  {
    if (this.dispose) this.dispose();

    replace(this._value, value);
    this.fields.forEach(field => {
      field.value = field.type === 'boolean' || field.type === 'switch' ? value[field.name] || false : value[field.name];
      field.error = undefined;
    });

    let validationResult: eValidationResult;
    if (this.initialValuesValidationMode === 'all') {
      validationResult = this.validateForm();
    } else if (this.initialValuesValidationMode === 'withValues') {
      let fieldsToValidate = this.fields.filter(field => !isNullOrUndefined(field.value));
      validationResult     = this.validateFields(fieldsToValidate);
    }

    root((dispose) => {
      this.dispose        = dispose;
      const fieldsChanged = observe(() => { Object.keys(this._value).map(k => this._value[k]); this.fields.map(f => f.value); });
      this._hasChanges    = computed(fieldsChanged, () => {
        if (!this._value) return false;
        for (const field of this.fields) {
          if (!defaultEquals(field.value, this._value[field.name]))
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

  getChanges(): {[s: string]: any} {
    let changesObj = {};
    for (const field of this.fields) {
      if (!defaultEquals(field.value, this._value[field.name]))
        changesObj[field.name] = field.value;
    }
    return changesObj;
  }

  private initializeFields(fields: IFieldDefns) {
    this.fields = [];
    for (let fieldName in fields) {
      const field = fields[fieldName];
      this.fields.push(this.createField(fieldName, field as BaseField));
    }
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
    this.field[name] = {
      name,
      autoFocus:        fieldDefn.typeDefn.autoFocus,
      type:             fieldDefn.typeDefn.type,
      placeholder:      fieldDefn.typeDefn.placeholder,
      align:            fieldDefn.typeDefn.align,
      label:            fieldDefn.typeDefn.label,
      disabled:         fieldDefn.typeDefn.disabled,
      disableErrors:    !isNullOrUndefined(fieldDefn.typeDefn.disableErrors) ? fieldDefn.typeDefn.disableErrors : this.disableErrors,
      variant:          fieldDefn.typeDefn.variant || this.variant,
      updateOnChange:   !isNullOrUndefined(fieldDefn.typeDefn.updateOnChange) ? fieldDefn.typeDefn.updateOnChange : this.updateOnChange,
      validateOnUpdate: !isNullOrUndefined(fieldDefn.typeDefn.validateOnUpdate) ? fieldDefn.typeDefn.validateOnUpdate : this.validateOnUpdate,
      visible:          true,
      startAdornment:   fieldDefn.typeDefn.startAdornment,
      endAdornment:     fieldDefn.typeDefn.endAdornment,
      onValueChange:    fieldDefn.typeDefn.onValueChange,
    } as IEditorField;

    if (this.defaultAdornmentsEnabled && !Object.prototype.hasOwnProperty.call(fieldDefn.typeDefn, 'endAdornment')) {
      // add default end adornment to field depending on field type if using defaults, and it wasn't explicitly set to something (including undefined)
      switch (this.field[name].type) {
        case 'date':
          this.field[name].endAdornment = () => React.createElement(DateRangeIcon, undefined, undefined);
          break;
        case 'time':
          this.field[name].endAdornment = () => React.createElement(AccessTimeIcon, undefined, undefined);
          break;
        case 'email':
          this.field[name].endAdornment = () => React.createElement(MailOutlineIcon, undefined, undefined);
          break;
        case 'phone':
          this.field[name].endAdornment = () => React.createElement(PhoneIcon, {style: {transform: 'scaleX(-1)'}}, undefined);
          break;
        case 'password':
          this.field[name].endAdornment = () => React.createElement('span', undefined, undefined);
          break;
      }
    }

    this.field[name].Editor = this.createEditor(fieldDefn.typeDefn.editorType, this.field[name], fieldDefn.typeDefn.editProps);
    if (fieldDefn.typeDefn.validators) {
      this.validator.addRule(name, fieldDefn.typeDefn.validators);
    }
    return this.field[name];
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

  private toObjectValues(): ObjectType {
    return this.fields.reduce((prev: ObjectType, current) => {
      if (!isNullOrUndefined(current.value)) prev[current.name] = current.value;
      return prev;
    }, {});
  }

  public toObject(): ObjectType {
    return this.fields.reduce((prev: ObjectType, current) => {
      prev[current.name] = current;
      return prev;
    }, {});
  }

  public reset() {
    this.value = Object.assign({}, this.initial);
  }

  public revert() {
    this.value = this.value;
  }

  public clear() {
    this.fields.forEach(field => {
      field.value = undefined;
      field.error = undefined;
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

  public validateField(field: IEditorField): eValidationResult {
    return this.validator.validateField(this, field.name);
  }

  public validateFields(fields: IEditorField[]): eValidationResult {
    let result = eValidationResult.Success
    for (const f of fields) {
      if (f.disableErrors) continue;
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
