import {defaultEquals} from 'rewire-core';
import * as is from 'is';

export function defaultGreaterThan(v1: any, v2: any) {
  if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
    return true;
  }

  if (is.string(v1) && is.string(v2)) {
    return v1.localeCompare(v2) > 0 ;
  } else if ((is.number(v1) && is.number(v2)) || (is.date(v1) && is.date(v2))) {
    return v1 > v2;
  }

  return true;
}

export function defaultLessThan(v1: any, v2: any) {
  if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
    return true;
  }

  if (is.string(v1) && is.string(v2)) {
    return v1.localeCompare(v2) < 0;
  } else if ((is.number(v1) && is.number(v2)) || (is.date(v1) && is.date(v2))) {
    return v1 < v2;
  }

  return true;
}

export function isNull(value?: any) {
  if ((value === undefined) || (value === null)) return true;
  if (value === null) return true;
  if (typeof(value) === 'string') return !value;
  return ((value.id !== undefined) && !value.id);
}

export type IValidateFn     = (obj: ObjectType, fieldName: string, label: string | undefined, value: any) => string | undefined;
export type IValidateFnData = {linkedFieldNames: string[], fn: IValidateFn};

export const isRequired = {
  linkedFieldNames: [],
  fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any) => {
    return (isNull(value)) ? `${label || 'field'} is required` : undefined;
  }
};

export const isRegEx = (re: RegExp, text: string) => {
  return {
    linkedFieldNames: [],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any) => {
      if (!re.test(String(value !== undefined ? value : '').toLowerCase())) {
        return text;
      }
      return undefined;
    }
  };
};

export const isEmail = {
  linkedFieldNames: [],
  fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any) => {
    const re = /(^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/;
    if (!re.test(String(value !== undefined ? value : '').toLowerCase())) {
      return 'email is not in a valid format';
    }
    return undefined;
  }
};

export const requiredWhenOtherIsNotNull = (fieldName: string) => {
  return {
    linkedFieldNames: [fieldName],
    fn: (obj: ObjectType, otherFieldName: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
      if (isNull(otherValue)) return undefined;
      let label = obj[fieldName] && obj[fieldName].label;
      let value = obj[fieldName] && obj[fieldName].value;
      return isRequired.fn(obj, fieldName, label, value);
    }
  };
};

export const isGreaterThan = (fieldName: string, text?: string) => {
  return {
    linkedFieldNames: [fieldName],
    fn: (obj: ObjectType, otherFieldName: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
      let value = obj[fieldName] && obj[fieldName].value;
      if (!defaultGreaterThan(otherValue, value)) {
        if (text) return text;
        let label = obj[fieldName] && obj[fieldName].label;
        return `${otherLabel || otherFieldName} must be greather than ${label || fieldName}`;
      }
      return undefined;
    }
  };
};

export const isGreaterThanOrEquals = (fieldName: string, text?: string) => {
  return {
    linkedFieldNames: [fieldName],
    fn: (obj: ObjectType, otherFieldName: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
      let value = obj[fieldName] && obj[fieldName].value;
      if (!defaultEquals(otherValue, value) && !defaultGreaterThan(otherValue, value)) {
        if (text) return text;
        let label = obj[fieldName] && obj[fieldName].label;
        return `${otherLabel || otherFieldName} must be greather than or equals to ${label || fieldName}`;
      }
      return undefined;
    }
  };
};

export const isLessThan = (fieldName: string, text?: string) => {
  return {
    linkedFieldNames: [fieldName],
    fn: (obj: ObjectType, otherFieldName: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
      let value = obj[fieldName] && obj[fieldName].value;
      if (!defaultLessThan(otherValue, value)) {
        if (text) return text;
        let label = obj[fieldName] && obj[fieldName].label;
        return `${otherLabel || otherFieldName} must be less than ${label || fieldName}`;
      }
      return undefined;
    }
  };
};

export const isLessThanOrEquals = (fieldName: string, text?: string) => {
  return {
    linkedFieldNames: [fieldName],
    fn: (obj: ObjectType, otherFieldName: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
      let value = obj[fieldName] && obj[fieldName].value;
      if (!defaultEquals(otherValue, value) && !defaultLessThan(otherValue, value)) {
        if (text) return text;
        let label = obj[fieldName] && obj[fieldName].label;
        return `${otherLabel || otherFieldName} must be less than or equals to ${label || fieldName}`;
      }
      return undefined;
    }
  };
};

export const isSameAsOther = (fieldName: string, text?: string) => {
  return {
    linkedFieldNames: [fieldName],
    fn: (obj: ObjectType, otherFieldName: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
      let value = obj[fieldName] && obj[fieldName].value;
      if (!defaultEquals(otherValue, value)) {
        if (text) return text;
        let label = obj[fieldName] && obj[fieldName].label;
        return `${otherLabel || otherFieldName} must be the same as ${label || fieldName}`;
      }
      return undefined;
    }
  };
};

export const isDifferentFromOther = (fieldName: string, text?: string) => {
  return {
    linkedFieldNames: [fieldName],
    fn: (obj: ObjectType, otherFieldName: string, otherLabel: string | undefined, otherValue: any): string | undefined => {
      let value = obj[fieldName] && obj[fieldName].value;
      if (defaultEquals(otherValue, value)) {
        if (text) return text;
        let label = obj[fieldName] && obj[fieldName].label;
        return `${otherLabel || otherFieldName} must be different from ${label || fieldName}`;
      }
      return undefined;
    }
  };
};

export const and = (...args: IValidateFnData[]) => {
  return {
    linkedFieldNames: [...new Set(args.map(arg => arg.linkedFieldNames).reduce((prev, next) => prev.concat(next)))],
    fn: (obj: Object, fieldName: string, label: string | undefined, value: any): string | undefined => {
      for (const func of args) {
        const fn = func.fn;
        const result = fn(obj, fieldName, label, value);
        if (result) return result;
      }
    }
  };
};

export interface ValidationResult {
  success: boolean;
  errors: {[index: string]: string | undefined};
}

export default class Validator {
  private rules: {[index: string]: IValidateFnData} = {};
  constructor() { }

  addRule(fieldName: string, fnData: IValidateFnData) {
    if (this.rules[fieldName]) {
      this.rules[fieldName] = and(this.rules[fieldName], fnData);
      return;
    }

    this.rules[fieldName] = fnData;
  }

  validateFields(fieldNames: string[], obj: ObjectType): ValidationResult {
    let result: ValidationResult = {
      success: true,
      errors: {}
    };
    if (!fieldNames || !obj) {
      return result;
    }

    fieldNames.forEach(fieldName => {
      const value = obj[fieldName] && obj[fieldName].value;
      const label = obj[fieldName] && obj[fieldName].label;
      const fn    = this.rules[fieldName] && this.rules[fieldName].fn;

      if (fn) {
        const v = fn(obj, fieldName, label, value);
        if (v) {
          result.success           = false;
          result.errors[fieldName] = v;
        }
      }
    });

    return result;
  }
}
