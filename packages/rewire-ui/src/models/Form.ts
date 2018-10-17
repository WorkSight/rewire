import * as React from 'react';
import {
  observable,
  replace,
  defaultEquals,
  computed,
  root,
  observe
} from 'rewire-core';
import MailOutlineIcon                              from '@material-ui/icons/MailOutline';
import AccessTimeIcon                               from '@material-ui/icons/AccessTime';
import DateRangeIcon                                from '@material-ui/icons/DateRange';
import Validator, { ValidationResult, IValidateFn } from './Validator';
import editor, {
  EditorType,
  TextAlignment,
  IField,
} from '../components/editors';
import {and, isEmail}    from './Validator';
import { createElement } from 'react';

export type IFieldTypes = 'string' | 'static' | 'reference' | 'select' | 'number' | 'boolean' | 'date' | 'time' | 'avatar' | 'password' | 'email';

export interface IFieldDefn {
  label(text: string): IFieldDefn;
  placeholder(text: string): IFieldDefn;
  align(text: TextAlignment): IFieldDefn;
  autoFocus(): IFieldDefn;
  disabled(action: (field: IEditorField) => boolean): IFieldDefn;
  startAdornment(adornment?: () => JSX.Element): IFieldDefn;
  endAdornment(adornment?: () => JSX.Element): IFieldDefn;
  editor(editorType: EditorType, editProps?: any): IFieldDefn;
  validators(fn: IValidateFn): IFieldDefn;
}

export interface IEditorField extends IField {
  Editor: React.SFC<any>;
  type:   IFieldTypes;
}

export interface IFieldDefns {
  [index: string]: IFieldDefn;
}

interface IBaseFieldDefn {
  type           : IFieldTypes;
  editorType?    : EditorType;
  autoFocus?     : boolean;
  editProps?     : any;
  label?         : string;
  placeholder?   : string;
  align?         : TextAlignment;
  error?         : string;
  value?         : any;
  disabled?      : (field: IEditorField) => boolean;
  visible?       : boolean;
  validators?    : IValidateFn;

  startAdornment?(): JSX.Element;
  endAdornment?(): JSX.Element;
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

  autoFocus(): IFieldDefn {
    this.typeDefn.autoFocus = true;
    return this;
  }

  disabled(action: (field: IEditorField) => boolean): IFieldDefn {
    this.typeDefn.disabled = action;
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

  editor(editorType: EditorType, editProps?: any): IFieldDefn {
    this.typeDefn.editorType = editorType;
    if (editProps) {
      this.typeDefn.editProps = editProps;
    }
    return this;
  }

  validators(text: IValidateFn): IFieldDefn {
    if (this.typeDefn.validators) {
      this.typeDefn.validators = and(text, this.typeDefn.validators);
    } else {
      this.typeDefn.validators = text;
    }
    return this;
  }
}

export interface IFormOptions {
  defaultAdornmentsEnabled?: boolean;
  updateOnChange?: boolean;
}

export default class Form {
  private _value          : ObjectType;
  private dispose         : () => void;
  private _hasChanges     : () => boolean;
  private _hasErrors      : () => boolean;
  defaultAdornmentsEnabled: boolean;
  updateOnChange          : boolean;
  fields                  : IEditorField[];
  validator               : Validator;
  field                   : {[index: string]: IEditorField};

  private constructor(fields: IFieldDefns, initial?: ObjectType, options?: IFormOptions) {
    this.field                    = observable({});
    this.validator                = new Validator();
    this.defaultAdornmentsEnabled = options && options.defaultAdornmentsEnabled !== undefined ? options.defaultAdornmentsEnabled : true;
    this.updateOnChange           = options && options.updateOnChange !== undefined ? options.updateOnChange : true;
    this.initializeFields(fields);
    this.value = initial || {};
  }

  set value(value: ObjectType)  {
    if (this.dispose) this.dispose();

    this._value = value;
    this.fields.forEach(field => {
      field.value = field.type === 'boolean' ? value[field.name] || false : value[field.name];
    });

    root((dispose) => {
      this.dispose        = dispose;
      const result        = this.validator.validate(this.toObject);
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
        const result = this.validate();
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
    'string'   : 'text',
    'static'   : 'static',
    'select'   : 'select',
    'reference': 'auto-complete',
    'boolean'  : 'checked',
    'date'     : 'date',
    'time'     : 'time',
    'password' : 'password',
    'email'    : 'email',
    'number'   : 'number',
    'avatar'   : 'avatar'
  };

  private createEditor(editorType: EditorType | undefined, field: IEditorField, editProps?: any): React.SFC<any> {
    if (!editorType) editorType = Form.editorDefaults[field.type];
    const onValueChange = (v: any) => field.value = v;

    if (!editProps) {
      editProps = {updateOnChange: this.updateOnChange};
    } else {
      if (editProps.updateOnChange === undefined) editProps['updateOnChange'] = this.updateOnChange;
    }
    return (props) => createElement(editor(editorType!, editProps), {...props, field: field, onValueChange});
  }

  private createField(name: string, fieldDefn: BaseField): IEditorField {
    this.field[name] = {
      name,
      autoFocus: fieldDefn.typeDefn.autoFocus,
      type: fieldDefn.typeDefn.type,
      placeholder: fieldDefn.typeDefn.placeholder,
      align: fieldDefn.typeDefn.align,
      label: fieldDefn.typeDefn.label,
      disabled: fieldDefn.typeDefn.disabled,
      visible: true,
      startAdornment: fieldDefn.typeDefn.startAdornment,
      endAdornment: fieldDefn.typeDefn.endAdornment,
    } as IEditorField;

    if (this.defaultAdornmentsEnabled && !Object.prototype.hasOwnProperty.call(fieldDefn.typeDefn, 'endAdornment')) {
      // add default end adornment to field depending on field type if using defaults, and it wasn't explicitly set to something (including undefined)
      switch (this.field[name].type) {
        case 'date':
          this.field[name].endAdornment = () => createElement(DateRangeIcon, undefined, undefined);
          break;
        case 'time':
          this.field[name].endAdornment = () => createElement(AccessTimeIcon, undefined, undefined);
          break;
        case 'email':
          this.field[name].endAdornment = () => createElement(MailOutlineIcon, undefined, undefined);
          break;
        case 'password':
          this.field[name].endAdornment = () => createElement('span', undefined, undefined);
          break;
      }
    }

    this.field[name].Editor = this.createEditor(fieldDefn.typeDefn.editorType, this.field[name], fieldDefn.typeDefn.editProps);
    if (fieldDefn.typeDefn.validators) {
      this.validator.addRule(name, fieldDefn.typeDefn.validators);
    }
    return this.field[name];
  }

  private toObject() {
    return this.fields.reduce((prev: ObjectType, current) => {
      if (current.value !== undefined) prev[current.name] = current.value;
      return prev;
    }, {});
  }

  public clear() {
    this.fields.forEach(field => {
      field.value = undefined;
    });
  }

  public submit = (enforceValidation: boolean = true) => {
    if (!this._value) return false;
    if (!this.validate() && enforceValidation) return false;
    replace(this._value, this.toObject());
    return true;
  }

  private validate(): ValidationResult {
    let result  = this.validator.validate(this.toObject());
    this.fields.forEach(element => {
      element.error = result.errors[element.name];
    });
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
      updateOnChange          : boolean,

      submit(): void;
    };
    return new Form(fields as any, initial, options) as any as FormType & Form;
  }

  static string(editProps?: any): IFieldDefn {
    return new BaseField('string', editProps);
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

  static select(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('select', eProps);
  }

  static reference(searcher: any, editProps?: any): IFieldDefn {
    let eProps = Object.assign({}, searcher, editProps);
    return new BaseField('reference', eProps);
  }

  static avatar(editProps?: any): IFieldDefn {
    return new BaseField('avatar', editProps);
  }
}
