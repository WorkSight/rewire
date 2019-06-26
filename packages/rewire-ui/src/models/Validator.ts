import {isNullOrUndefined} from 'rewire-common';
import {defaultEquals} from 'rewire-core';
import * as is from 'is';

export function defaultGreaterThan(v1: any, v2: any): boolean {
  if (isNullOrUndefined(v1) || isNullOrUndefined(v2)) {
    return true;
  }

  if (is.string(v1) && is.string(v2)) {
    return v1.localeCompare(v2) > 0 ;
  } else {
    return v1 > v2;
  }
}

export function defaultLessThan(v1: any, v2: any): boolean {
  if (isNullOrUndefined(v1) || isNullOrUndefined(v2)) {
    return true;
  }

  if (is.string(v1) && is.string(v2)) {
    return v1.localeCompare(v2) < 0;
  } else {
    return v1 < v2;
  }
}

export function isNull(value?: any): boolean {
  if (isNullOrUndefined(value)) return true;
  if (typeof(value) === 'string') return value.length === 0;
  return ((value.id !== undefined) && isNull(value.id));
}

export type IValidateFn     = (obj: ObjectType, fieldName: string, label: string | undefined, value: any) => string | undefined;

export const isRequired: IValidateFn = (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  return (isNull(value) || (is.array(value) && value.length <= 0)) ? `${label || 'field'} is required` : undefined;
};

export const isRegEx = (re: RegExp, text: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  if (!re.test(String(!isNullOrUndefined(value) ? value : ''))) {
    return text;
  }
  return undefined;
};


export const isEmail: IValidateFn = (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  const re = /(^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/;
  if (!re.test(String(!isNullOrUndefined(value) ? value : ''))) {
    return 'email is not in a valid format';
  }
  return undefined;
};

export const requiredWhenOtherIsNotNull = (otherFieldName: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (isNull(otherValue)) return undefined;
  return isRequired(obj, fieldName, label, value);
};

export const requiredWhenOtherIsValue = (otherFieldName: string, requiredValue: any): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (otherValue !== requiredValue) return undefined;
  return isRequired(obj, fieldName, label, value);
};

export const isGreaterThan = (otherFieldName: string, text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (!defaultGreaterThan(value, otherValue)) {
    if (text) return text;
    let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
    return `${label || fieldName} must be greather than ${otherLabel}`;
  }
  return undefined;
};

export const isGreaterThanOrEquals = (otherFieldName: string, text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (!defaultGreaterThan(value, otherValue) && !defaultEquals(value, otherValue)) {
    if (text) return text;
    let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
    return `${label || fieldName} must be greather than or equals to ${otherLabel}`;
  }
  return undefined;
};

export const isLessThan = (otherFieldName: string, text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (!defaultLessThan(value, otherValue)) {
    if (text) return text;
    let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
    return `${label || fieldName} must be less than ${otherLabel}`;
  }
  return undefined;
};

export const isLessThanOrEquals = (otherFieldName: string, text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (!defaultLessThan(value, otherValue) && !defaultEquals(value, otherValue)) {
    if (text) return text;
    let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
    return `${label || fieldName} must be less than or equals to ${otherLabel}`;
  }
  return undefined;
};

export const isSameAsOther = (otherFieldName: string, text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (!defaultEquals(value, otherValue)) {
    if (text) return text;
    let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
    return `${label || fieldName} must be same as ${otherLabel}`;
  }
  return undefined;
};

export const isDifferentFromOther = (otherFieldName: string, text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
  if (defaultEquals(value, otherValue)) {
    if (text) return text;
    let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
    return `${label || fieldName} must be different from ${otherLabel}`;
  }
  return undefined;
};

export const isDifferenceOfOthers = (otherFieldNames: string[], text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValues: any[] = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].value) || [];
  if (otherValues.findIndex(value => isNullOrUndefined(value) || !is.number(value)) >= 0) {
    return undefined;
  }
  let difference = otherValues.reduce((totalValue: number, currValue: number) => totalValue - currValue);
  if (value !== difference) {
    if (text) return text;
    let otherLabels: string[]   = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].label || otherFieldName) || [];
    let otherLabelsErrorMessage = otherLabels.reduce((message: string, otherLabel: string, idx: number) => {
      return message.concat(` and ${otherLabel}`);
    });
    return `${label || fieldName} must equal difference of ${otherLabelsErrorMessage}`;
  }
  return undefined;
};

export const isSumOfOthers = (otherFieldNames: string[], text?: string): IValidateFn => (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
  let otherValues: any[] = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].value) || [];
  if (otherValues.findIndex(value => isNullOrUndefined(value) || !is.number(value)) >= 0) {
    return undefined;
  }
  let sum = otherValues.reduce((totalValue: number, currValue: number) => totalValue + currValue);
  if (value !== sum) {
    if (text) return text;
    let otherLabels: string[]   = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].label || otherFieldName) || [];
    let otherLabelsErrorMessage = otherLabels.reduce((message: string, otherLabel: string, idx: number) => {
      return message.concat(` and ${otherLabel}`);
    });
    return `${label || fieldName} must equal sum of ${otherLabelsErrorMessage}`;
  }
  return undefined;
};

export const and = (...args: IValidateFn[]) => (obj: Object, fieldName: string, label: string | undefined, value: any): string | undefined => {
  for (const func of args) {
    const fn = func;
    const result = fn(obj, fieldName, label, value);
    if (result) return result;
  }
};

export interface ValidationResult {
  success: boolean;
  errors: {[index: string]: string | undefined};
}

export default class Validator {
  private rules: {[index: string]: IValidateFn} = {};
  constructor() { }

  addRule(fieldName: string, fnData: IValidateFn) {
    if (this.rules[fieldName]) {
      this.rules[fieldName] = and(this.rules[fieldName], fnData);
      return;
    }

    this.rules[fieldName] = fnData;
  }

  setRule(fieldName: string, fnData: IValidateFn) {
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
      const fn    = this.rules[fieldName] && this.rules[fieldName];

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
