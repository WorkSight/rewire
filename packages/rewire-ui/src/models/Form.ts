import * as React from 'react';
import {
  observable,
  replace,
  defaultEquals,
  computed,
  root,
  observe
}                      from 'rewire-core';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PhoneIcon       from '@material-ui/icons/Phone';
import AccessTimeIcon  from '@material-ui/icons/AccessTime';
import DateRangeIcon   from '@material-ui/icons/DateRange';
import Validator, {
  ValidationResult,
  IValidateFnData}     from './Validator';
import editor, {
  EditorType,
  TextAlignment,
  TextVariant,
  IField,
}                                from '../components/editors';
import { and, isEmail, isRegEx } from './Validator';
import { defaultPhoneFormat }    from '../components/PhoneField';

export type IFieldTypes = 'string' | 'multistring' | 'static' | 'reference' | 'select' | 'multiselect' | 'number' | 'boolean' | 'switch' | 'date' | 'time' | 'avatar' | 'password' | 'email' | 'phone' | 'color';

export interface IFieldDefn {
  label(text: string):                                            IFieldDefn;
  placeholder(text: string):                                      IFieldDefn;
  align(text: TextAlignment):                                     IFieldDefn;
  variant(text: TextVariant):                                     IFieldDefn;
  autoFocus():                                                    IFieldDefn;
  disabled(action: (field: IEditorField) => boolean):             IFieldDefn;
  disableErrors(disableErrors?: boolean):                         IFieldDefn;
  startAdornment(adornment?: () => JSX.Element):                  IFieldDefn;
  endAdornment(adornment?: () => JSX.Element):                    IFieldDefn;
  editor(editorType: EditorType, editProps?: any):                IFieldDefn;
  updateOnChange(updateOnChange?: boolean):                       IFieldDefn;
  validateOnUpdate(validateOnUpdate?: boolean):                   IFieldDefn;
  validators(fnData: IValidateFnData):                            IFieldDefn;
  onValueChange(handleValueChange: (form: Form, v: any) => void): IFieldDefn;
}

export interface IEditorField extends IField {
  Editor:           React.FunctionComponent<any>;
  type:             IFieldTypes;
  updateOnChange:   boolean;
  validateOnUpdate: boolean;
  linkedFieldNames: string[];

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
  validators?      : IValidateFnData;

  onValueChange?(form: Form, v: any): void;
  startAdornment?(): JSX.Element;
  endAdornment?():   JSX.Element;
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

  validators(validateFnData: IValidateFnData): IFieldDefn {
    if (this.typeDefn.validators) {
      this.typeDefn.validators = and(validateFnData, this.typeDefn.validators);
    } else {
      this.typeDefn.validators = validateFnData;
    }

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

export default class Form {
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
    this.field                       = observable({});
    this.validator                   = new Validator();
    this.defaultAdornmentsEnabled    = options && options.defaultAdornmentsEnabled !== undefined ? options.defaultAdornmentsEnabled : true;
    this.initialValuesValidationMode = options && options.initialValuesValidationMode ? options.initialValuesValidationMode : 'withValues';
    this.disableErrors               = options && options.disableErrors || false;
    this.variant                     = options && options.variant || 'standard';
    // this.updateOnChange              = options && options.updateOnChange !== undefined ? options.updateOnChange : true;
    this.updateOnChange              = options && options.updateOnChange || false;
    this.validateOnUpdate            = options && options.validateOnUpdate !== undefined ? options.validateOnUpdate : true;
    this.initializeFields(fields);
    this.value    = initial || {};
    this._initial = Object.assign({}, this.value);
  }

  set value(value: ObjectType)  {
    if (this.dispose) this.dispose();

    this._value = value;
    this.fields.forEach(field => {
      field.value = field.type === 'boolean' || field.type === 'switch' ? value[field.name] || false : value[field.name];
      field.error = undefined;
    });

    if (this.initialValuesValidationMode === 'all') {
      this.validateForm();
    } else if (this.initialValuesValidationMode === 'withValues') {
      let fieldsToValidate = this.fields.filter(field => field.value !== undefined);
      this.validateFields(fieldsToValidate);
    }

    root((dispose) => {
      this.dispose        = dispose;
      const result        = this.validateForm(false);
      const fieldsChanged = observe(() => this.fields.map(f => f.value));
      this._hasChanges    = computed(fieldsChanged, () => {
        if (!this._value) return false;
        for (const field of this.fields) {
          if (!defaultEquals(field.value, this._value[field.name]))
            return true;
        }
        return false;
      }, false);

      this._hasErrors = computed(fieldsChanged, () => {
        if (!this._value) return false;
        const result = this.validateForm(false);
        return !result.success;
      }, !result.success);
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

  private initializeFields(fields: IFieldDefns) {
    this.fields = [];
    for (let fieldName in fields) {
      const field = fields[fieldName];
      this.fields.push(this.createField(fieldName, field as BaseField));
    }
  }

  private static editorDefaults: {[K in IFieldTypes]: EditorType} = {
    'string'     : 'text',
    'multistring': 'multitext',
    'static'     : 'static',
    'select'     : 'select',
    'multiselect': 'multiselect',
    'reference'  : 'auto-complete',
    'boolean'    : 'checked',
    'switch'     : 'switch',
    'date'       : 'date',
    'time'       : 'time',
    'password'   : 'password',
    'email'      : 'email',
    'phone'      : 'phone',
    'number'     : 'number',
    'avatar'     : 'avatar',
    'color'      : 'color',
  };

  private createEditor(editorType: EditorType | undefined, field: IEditorField, editProps?: any): React.SFC<any> {
    if (!editorType) editorType = Form.editorDefaults[field.type];

    if (!editProps) {
      editProps = {updateOnChange: field.updateOnChange};
    } else {
      editProps['updateOnChange'] = field.updateOnChange;
    }

    const onValueChange = (v: any) => {
      let value = v === undefined || v === null || v === '' ? undefined : v;
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
      disableErrors:    fieldDefn.typeDefn.disableErrors !== undefined ? fieldDefn.typeDefn.disableErrors : this.disableErrors,
      variant:          fieldDefn.typeDefn.variant || this.variant,
      updateOnChange:   fieldDefn.typeDefn.updateOnChange !== undefined ? fieldDefn.typeDefn.updateOnChange : this.updateOnChange,
      validateOnUpdate: fieldDefn.typeDefn.validateOnUpdate !== undefined ? fieldDefn.typeDefn.validateOnUpdate : this.validateOnUpdate,
      visible:          true,
      startAdornment:   fieldDefn.typeDefn.startAdornment,
      endAdornment:     fieldDefn.typeDefn.endAdornment,
      linkedFieldNames: fieldDefn.typeDefn.validators && fieldDefn.typeDefn.validators.linkedFieldNames || [],
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

  public getFieldValue(fieldName: string): any {
    let field = this.field[fieldName];
    if (!field) return;
    return field.value;
  }

  private toObjectValues(): ObjectType {
    return this.fields.reduce((prev: ObjectType, current) => {
      if (current.value !== undefined) prev[current.name] = current.value;
      return prev;
    }, {});
  }

  private toObjectLabelsAndValues(): ObjectType {
    return this.fields.reduce((prev: ObjectType, current) => {
      prev[current.name] = {label: current.label && current.label.toLowerCase(), value: current.value};
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

  public submit = (enforceValidation: boolean = true): boolean => {
    if (!this._value) return false;
    let result = this.validateForm();
    if (!result.success && enforceValidation) return false;
    replace(this._value, this.toObjectValues());
    return true;
  }

  public validateField(field: IEditorField): ValidationResult {
    let fieldNamesToValidate = this.fields.filter(f => !f.disableErrors && f.linkedFieldNames.includes(field.name)).map(f => f.name);
    if (!field.disableErrors) {
      fieldNamesToValidate.push(field.name);
    }
    fieldNamesToValidate = [...new Set(fieldNamesToValidate)];
    let result = this.validator.validateFields(fieldNamesToValidate, this.toObjectLabelsAndValues());
    fieldNamesToValidate.forEach(fieldName => {
      let fld = this.field[fieldName];
      if (fld) {
        fld.error = result.errors[fieldName];
      }
    });
    return result;
  }

  public validateFields(fields: IEditorField[]): ValidationResult {
    let fieldNamesToValidate = this.fields.filter(f => !f.disableErrors && fields.findIndex(field => f.linkedFieldNames.includes(field.name)) >= 0).map(f => f.name);
    fields.forEach((field: IEditorField) => {
      if (!field.disableErrors) {
        fieldNamesToValidate.push(field.name);
      }
    });

    fieldNamesToValidate = [...new Set(fieldNamesToValidate)];
    let result = this.validator.validateFields(fieldNamesToValidate, this.toObjectLabelsAndValues());
    fieldNamesToValidate.forEach(fieldName => {
      let fld = this.field[fieldName];
      if (fld) {
        fld.error = result.errors[fieldName];
      }
    });
    return result;
  }

  public validateForm(produceErrors: boolean = true): ValidationResult {
    let result = this.validator.validateFields(this.fields.filter(field => !field.disableErrors).map(field => field.name), this.toObjectLabelsAndValues());
    if (produceErrors) {
      this.fields.forEach(field => {
        field.error = result.errors[field.name];
      });
    }
    return result;
  }

  static create<T>(fields: T, initial?: ObjectType, options?: IFormOptions) {
    type FormType = {
      field                   : Record<keyof typeof fields, IEditorField>,
      fields                  : IEditorField[],
      value                   : ObjectType,
      validation              : Validator,
      isOpen                  : boolean,
      hasChanges              : boolean,
      defaultAdornmentsEnabled: boolean,
      disableErrors           : boolean,
      updateOnChange          : boolean,
      validateOnUpdate        : boolean,

      submit(): void;
    };
    return new Form(fields as any, initial, options) as any as FormType & Form;
  }

  static string(editProps?: any): IFieldDefn {
    return new BaseField('string', editProps);
  }

  static multistring(editProps?: any): IFieldDefn {
    return new BaseField('multistring', editProps);
  }

  static static(): IFieldDefn {
    return new BaseField('static');
  }

  static number(editProps?: any): IFieldDefn {
    return new BaseField('number', editProps);
  }

  static boolean(editProps?: any): IFieldDefn {
    return new BaseField('boolean', editProps);
  }

  static switch(editProps?: any): IFieldDefn {
    return new BaseField('switch', editProps);
  }

  static date(editProps?: any): IFieldDefn {
    return new BaseField('date', editProps);
  }

  static time(editProps?: any): IFieldDefn {
    return new BaseField('time', editProps);
  }

  static password(editProps?: any): IFieldDefn {
    return new BaseField('password', editProps);
  }

  static email(editProps?: any): IFieldDefn {
    let field                 = new BaseField('email', editProps);
    field.typeDefn.validators = isEmail;
    return field;
  }

  static phone(editProps?: any): IFieldDefn {
    let field                 = new BaseField('phone', editProps);
    let phoneLength           = ((editProps && editProps.format) || defaultPhoneFormat).replace(new RegExp('[^#]', 'g'), '').length;
    let phoneRegEx            = new RegExp('^$|^[0-9]{' + phoneLength + '}$');
    field.typeDefn.validators = isRegEx(phoneRegEx, 'phone number is not in a valid format');
    return field;
  }

  static select(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('select', eProps);
  }

  static multiselect(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('multiselect', eProps);
  }

  static reference(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('reference', eProps);
  }

  static avatar(editProps?: any): IFieldDefn {
    return new BaseField('avatar', editProps);
  }

  static color(editProps?: any): IFieldDefn {
    return new BaseField('color', editProps);
  }
}