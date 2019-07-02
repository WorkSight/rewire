import {isNullOrUndefined} from 'rewire-common';
import {defaultEquals} from 'rewire-core';
import * as is from 'is';

export function isGreaterThan(v1: any, v2: any): boolean {
  if (isNullOrUndefined(v1) || isNullOrUndefined(v2)) {
    return true;
  }

  if (is.string(v1) && is.string(v2)) {
    return v1.localeCompare(v2) > 0;
  } else {
    return v1 > v2;
  }
}

export function isGreaterThanOrEquals(v1: any, v2: any): boolean {
  return defaultEquals(v1, v2) || isGreaterThan(v1, v2);
}

export function isLessThanOrEquals(v1: any, v2: any): boolean {
  return defaultEquals(v1, v2) || isLessThan(v1, v2);
}

export function isLessThan(v1: any, v2: any): boolean {
  if (isNullOrUndefined(v1) || isNullOrUndefined(v2)) {
    return true;
  }

  if (is.string(v1) && is.string(v2)) {
    return v1.localeCompare(v2) < 0;
  } else {
    return v1 < v2;
  }
}

export function isEqual(v1: any, v2: any): boolean {
  if (isNullOrUndefined(v1) && isNullOrUndefined(v2)) {
    return true;
  }

  return defaultEquals(v1, v2);
}

export function isNotEqual(v1: any, v2: any): boolean {
  if (isNullOrUndefined(v1) && isNullOrUndefined(v2)) {
    return true;
  }

  return !defaultEquals(v1, v2);
}

export function isNull(value?: any): boolean {
  if (isNullOrUndefined(value)) return true;
  if (typeof(value) === 'string') return value.length === 0;
  return ((value.id !== undefined) && isNull(value.id));
}

export const isRequired = (value: any): boolean => !(isNull(value) || (is.array(value) && value.length <= 0));
export const isRegEx    = (value: string, re: RegExp): boolean => re.test(String(!isNullOrUndefined(value) ? value : ''));
export const isEmail    = (value: any): boolean  => {
  const re = /(^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/;
  return re.test(String(!isNullOrUndefined(value) ? value : ''));
};
export const requiredWhenOthersAreNotNull = (value: any, ...otherValues: any[]): boolean => {
  if (otherValues.some((v: any) => isNull(v))) return true;
  return isRequired(value);
};

export const requiredWhenOtherIsValue = (value: any, otherValue: any, requiredValue: any): boolean => {
  if (otherValue !== requiredValue) return true;
  return isRequired(value);
};

export const isDifferenceOfOthers = (value: number, ...otherValues: number[]): boolean => {
  if (otherValues.some((v: number | undefined) => isNullOrUndefined(v))) return true;
  let difference = otherValues.reduce((totalValue: number, currValue: number) => totalValue - currValue);
  return value === difference;
};

export const isSumOfOthers = (value: number, ...otherValues: number[]): boolean => {
  if (otherValues.some((v: number | undefined) => isNullOrUndefined(v))) return true;
  let sum = otherValues.reduce((totalValue: number, currValue: number) => totalValue + currValue);
  return value === sum;
};

export type IValidationFn = (...args: any[]) => boolean | (IError | undefined);
export enum ErrorSeverity {
  Info,
  Warning,
  Error,
  Critical
}
type IErrorText = string | ((...values: any[]) => string);
export interface IError     { text: string; severity: ErrorSeverity; }
export interface IErrorDefn { text: string | IErrorText; severity: ErrorSeverity; }
export interface IValidator {
  fn     : IValidationFn;
  error? : IErrorDefn;
  args?  : any[];
}

export type SingleParameterBuiltInValidator = 'required' | 'email' | 'empty';
export type BuiltInValidators = SingleParameterBuiltInValidator |  '<' | '>' | '<=' | '>=' | '==' | '!=' | 'regex' | 'sumOf' | 'differenceOf' | 'requiredWhenOthersAreNotNull' | 'requiredWhenOtherIsValue';
export type IFormValidator = (IValidator | SingleParameterBuiltInValidator | IValidationFn) | (IValidator | SingleParameterBuiltInValidator | IValidationFn)[];

export function validators(v: IFormValidator) {
  if (!Array.isArray(v)) v = [v];
  return v.map((v: any) => {
    if (v.fn) return v as IValidator;
    return validator(v);
  });
}

const createBuiltIn = (builtIn: BuiltInValidators, fn: IValidationFn, error: IErrorText): {[builtIn: string]: IValidator} => ({ [builtIn]: {fn, error: {text: error, severity: ErrorSeverity.Error}}});

export function template(strings: any, ...keys: any[]) {
  return (function(...values: any[]) {
    const dict   = values[values.length - 1] || {};
    const result = [strings[0]];
    let all: string;
    keys.forEach(function(key, i) {
      let value;
      if (key === 'all') {
        if (!all) {
          const [, ...rest] = values;
          all = rest.join(',');
        }
        value = all;
      } else {
        value = (Number.isInteger(key)) ? values[key].toString() : dict[key];
      }
      if (value) result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}

const __builtInValidators: {[type: string]: IValidator} = {
  ...createBuiltIn('regex', isRegEx, 'this field has an invalid value'),
  ...createBuiltIn('email', isEmail, 'must be a valid email address'),
  ...createBuiltIn('>', isGreaterThan, template`must be greater than ${1}`),
  ...createBuiltIn('>=', isGreaterThanOrEquals, template`must be greater than or equal to ${1}`),
  ...createBuiltIn('<=', isLessThanOrEquals, template`must be greater less than or equal to ${1}`),
  ...createBuiltIn('<', isLessThan, template`must be less than ${1}`),
  ...createBuiltIn('==', isEqual, template`must be the same as ${1}`),
  ...createBuiltIn('!=', isNotEqual, template`must be not the same as ${1}`),
  ...createBuiltIn('empty', isNull, 'must be empty'),
  ...createBuiltIn('required', isRequired, 'is required'),
  ...createBuiltIn('requiredWhenOthersAreNotNull', requiredWhenOthersAreNotNull, 'is required'),
  ...createBuiltIn('requiredWhenOtherIsValue', requiredWhenOtherIsValue, 'is required'),
  ...createBuiltIn('sumOf', isSumOfOthers, template`must be the sum of ${'all'}`),
  ...createBuiltIn('differenceOf', isDifferenceOfOthers, template`must be the difference of ${'all'}`),
};

export const field = (field: string) => ({field});
export const error = (text: string, severity?: ErrorSeverity) => ({text, severity: severity || ErrorSeverity.Error});

export function validator(fn: IValidationFn | BuiltInValidators, ...args: any[]): IValidator {
  const validation: IValidator = (typeof fn === 'string') ? Object.assign({}, __builtInValidators[fn]) : {fn};
  if (!validation) throw new Error('invalid validation function or fn is not a built in validator');
  validation.args = [];
  for (const paramOrError of args) {
    if (paramOrError.hasOwnProperty('severity')) {
      validation.error = paramOrError;
      continue;
    }
    validation.args.push(paramOrError);
  }
  return validation;
}

export interface IValidationContext {
  getField(field: string): {label: string, value: any} | undefined;
  setError(field: string, error?: IError): void;
}

export enum eValidationResult {Success = 0, Error = 1}

export default class Validator {
  private rules: {[index: string]: IValidator[]} = {};
  constructor()  {}

  addRule(field: string, validator: IValidator | IValidator[]) {
    if (!Array.isArray(validator)) validator = [validator];
    const existingValidators = this.rules[field] || (this.rules[field] = []);
    existingValidators.push(...validator);
  }

  setRule(field: string, validator: IValidator | IValidator[]) {
    if (!Array.isArray(validator)) validator = [validator];
    const validators = this.rules[field] = [] as IValidator[];
    validators.push(...validator);
  }

  private _get(context: IValidationContext, field: string, validator: IValidator, property: string) {
    const f    = context.getField(field);
    let   args = [f && f[property]];
    for (const f of validator.args!) {
      if (f.hasOwnProperty('field')) {
        const field = context.getField(f.field);
        args.push(field && field[property]);
        continue;
      }
      args.push(f);
    }
    return args;
  }

  private extractArguments(context: IValidationContext, field: string, validator: IValidator) {
    return this._get(context, field, validator, 'value');
  }

  private extractLabels(context: IValidationContext, field: string, validator: IValidator) {
    return this._get(context, field, validator, 'label');
  }

  private isValid(context: IValidationContext, field: string, validator: IValidator, setErrors: boolean): eValidationResult {
    const args        = this.extractArguments(context, field, validator);
    let   errorResult = validator.fn.apply(undefined, args);
    if (typeof errorResult === 'boolean') {
      // if error result is a simple boolean then true means no error otherwise pull the error from the validator!
      errorResult = (errorResult) ? undefined : validator.error;
    }
    if (errorResult !== undefined) {
      if (setErrors) {
        let {text, severity} = errorResult as IErrorDefn;
        text                 = (typeof text === 'function') ? text(...this.extractLabels(context, field, validator)) : text;
        context.setError(field, {text, severity});
      }
      return eValidationResult.Error;
    }
    if (setErrors) context.setError(field);
    return eValidationResult.Success;
  }

  private _validateField(context: IValidationContext, field: string, setErrors: boolean): eValidationResult {
    const validators = this.rules[field];
    if (validators) {
      for (const validator of validators) {
        if (this.isValid(context, field, validator, setErrors) === eValidationResult.Error) {
          return eValidationResult.Error;
        }
      }
    }
    return eValidationResult.Success;
  }

  private shouldValidateField(currentField: string, fieldToValidate: string) {
    if (currentField === fieldToValidate) return true;
    const validators = this.rules[fieldToValidate];
    if (!validators) return false;
    return validators.some((v) => v.args && v.args.some(f => f && f.field === currentField));
  }

  validateField(context: IValidationContext, field: string, setErrors: boolean = true): eValidationResult {
    let result = eValidationResult.Success;
    for (const fieldToValidate of Object.keys(this.rules)) {
      if (!this.shouldValidateField(field, fieldToValidate)) continue;
      result |= this._validateField(context, fieldToValidate, setErrors);
    }
    return result;
  }

  validate(context: IValidationContext, setErrors: boolean = true): eValidationResult {
    let result = eValidationResult.Success;
    for (const fieldToValidate of Object.keys(this.rules)) {
      result |= this._validateField(context, fieldToValidate, setErrors);
    }
    return result;
  }
}
