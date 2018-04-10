import observable, { replace, defaultEquals, computed, root, observe } from 'rewire-core/observable';
import Validator, { ValidationResult, IValidateFn }                                        from './Validator';
import is                                               from 'is';
import editor, {
  EditorType,
  IField as IFieldNew
}                                                       from '../components/editors';
import { createElement }                                from 'react';

export type IFieldTypes = 'string' | 'reference' | 'number' | 'boolean' | 'date' | 'time';

export interface IFieldDefn {
  label(text: string): IFieldDefn;
  placeholder(text: string): IFieldDefn;
  autoFocus(): IFieldDefn;
  disabled(action: (field: IFieldNew) => boolean): IFieldDefn;
  editor(editorType: EditorType): IFieldDefn;
  validators(fn: IValidateFn): IFieldDefn;
}

export interface IField extends IFieldNew {
  Editor: React.SFC<any>;
  type:   IFieldTypes;
}

export interface IFieldDefns {
  [index: string]: IFieldDefn;
}

interface IBaseFieldDefn {
  type        : IFieldTypes;
  editorType? : EditorType;
  autoFocus?  : boolean;
  editProps?  : any;
  label?      : string;
  placeholder?: string;
  error?      : string;
  value?      : any;
  disabled?   : (field: IFieldNew) => boolean;
  visible?    : boolean;
  validators? : IValidateFn;
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

  autoFocus(): IFieldDefn {
    this.typeDefn.autoFocus = true;
    return this;
  }

  disabled(action: (field: IFieldNew) => boolean): IFieldDefn {
    this.typeDefn.disabled = action;
    return this;
  }

  editor(editorType: EditorType): IFieldDefn {
    this.typeDefn.editorType = editorType;
    return this;
  }

  validators(text: IValidateFn): IFieldDefn {
    this.typeDefn.validators = text;
    return this;
  }
}

export default class Form {
  private _value     : ObjectType;
  private dispose    : () => void;
  private _hasChanges: () => boolean;
  private _hasErrors : () => boolean;
  fields             : IField[];
  validator         : Validator;
  field              : {[index: string]: IField};

  private constructor(fields: IFieldDefns, initial?: ObjectType) {
    this.field              = observable({});
    this.validator         = new Validator();
    this.initializeFields(fields);
    if (initial) this.value = initial;
  }

  set value(value: ObjectType)  {
    if (this.dispose) this.dispose();

    this._value = value;
    this.fields.forEach(field => {
      field.value = value[field.name];
    });

    root((dispose) => {
      this.dispose = dispose;
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
    'reference': 'auto-complete',
    'boolean'  : 'checked',
    'date'     : 'date',
    'time'     : 'time',
    'number'   : 'number'
  };

  private createEditor(editorType: EditorType | undefined, field: IField, editProps?: any): React.SFC<any> {
    if (!editorType) editorType = Form.editorDefaults[field.type];
    const onValueChange = (v: any) => field.value = v;
    return (props) => createElement(editor(editorType!, editProps), {...props, field: field, onValueChange});
  }

  private createField(name: string, fieldDefn: BaseField): IField {
    this.field[name] = {
      name,
      autoFocus: fieldDefn.typeDefn.autoFocus,
      type: fieldDefn.typeDefn.type,
      placeholder: fieldDefn.typeDefn.placeholder,
      label: fieldDefn.typeDefn.label,
      disabled: fieldDefn.typeDefn.disabled,
      visible: true,
    } as IField;

    this.field[name].Editor = this.createEditor(fieldDefn.typeDefn.editorType, this.field[name], fieldDefn.typeDefn.editProps);
    if (fieldDefn.typeDefn.validators) {
      this.validator.addRule(name, fieldDefn.typeDefn.validators);
    }
    return this.field[name];
  }

  private toObject() {
    return this.fields.reduce((prev: ObjectType, current) => {
      if (current.value) prev[current.name] = current.value;
      return prev;
    }, {});
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

  static create<T>(fields: T, initial?: ObjectType) {
    type FormType = {
      field     : Record<keyof typeof fields, IField>,
      fields    : IField[],
      value     : ObjectType,
      validation: Validator,
      isOpen    : boolean;
      hasChanges: boolean;

      submit(): void;
    };
    return new Form(fields as any, initial) as any as FormType & Form;
  }

  static string(): IFieldDefn {
    return new BaseField('string');
  }

  static reference(searcher: any): IFieldDefn {
    return new BaseField('reference', searcher);
  }
}
