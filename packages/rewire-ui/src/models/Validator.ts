import {defaultEquals} from 'rewire-core';

export function isNull(value?: any) {
  if ((value === undefined) || (value === null)) return true;
  if (value === null) return true;
  if (typeof(value) === 'string') return !value;
  return ((value.id !== undefined) && !value.id);
}

export type IValidateFn = (obj: ObjectType, field: string, label: string | undefined, value: any) => string | undefined;

export const isRequired = (obj: ObjectType, field: string, label: string | undefined, value: any) => {
  return (isNull(value)) ? `${label || 'field'} is required` : undefined;
};

export const isRegEx = (re: RegExp, text: string) => (obj: ObjectType, field: string, label: string | undefined, value: any) => {
  if (!re.test(String(value).toLowerCase())) {
    return text;
  }
  return undefined;
};

export const isEmail = (obj: ObjectType, field: string, label: string | undefined, value: any) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(String(value).toLowerCase())) {
    return 'email is not in a valid format';
  }
  return undefined;
};

export const requiredWhenOtherIsNotNull = (field: string) => (obj: ObjectType, otherField: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
  if (isNull(otherValue)) return undefined;
  let label = obj[field] && obj[field].label;
  let value = obj[field] && obj[field].value;
  return isRequired(obj, field, label, value);
};

export const isSameAsOther = (field: string, text?: string) => (obj: ObjectType, otherField: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
  let value = obj[field] && obj[field].value;
  if (!defaultEquals(otherValue, value)) {
    if (text) return text;
    let label = obj[field] && obj[field].label;
    return `${label || field} must be the same as ${otherLabel || otherField}`;
  }
  return undefined;
};

export const isDifferentFromOther = (field: string, text?: string) => (obj: ObjectType, otherField: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
  let value = obj[field] && obj[field].value;
  if (defaultEquals(otherValue, value)) {
    if (text) return text;
    let label = obj[field] && obj[field].label;
    return `${label || field} must be different from ${otherLabel || otherField}`;
  }
  return undefined;
};

export const and = (...args: IValidateFn[]) => (obj: Object, field: string, label: string | undefined, value: any): string | undefined => {
  for (const fn of args) {
    const result = fn(obj, field, label, value);
    if (result) return result;
  }
};

export interface ValidationResult {
  success: boolean;
  errors: {[index: string]: string};
}

export default class Validator {
  private rules: {[index: string]: IValidateFn} = {};
  constructor() { }

  addRule(name: string, fn: IValidateFn) {
    if (this.rules[name]) {
      this.rules[name] = and(this.rules[name], fn);
      return;
    }

    this.rules[name] = fn;
  }

  validate(obj: ObjectType): ValidationResult {
    if (!obj) return {success: true, errors: {}};
    let result: ValidationResult = {
      success: true,
      errors: {}
    };

    for (const field in this.rules) {
      const value = obj[field] && obj[field].value;
      const label = obj[field] && obj[field].label;
      const fn = this.rules[field];
      if (fn) {
        const v = fn(obj, field, label, value);
        if (v) {
          result.success       = false;
          result.errors[field] = v;
        }
      }
    }

    return result;
  }
}
