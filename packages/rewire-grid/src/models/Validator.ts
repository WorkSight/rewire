import * as is from 'is';
import {isNullOrUndefined}                           from 'rewire-common';
import {defaultEquals}                               from 'rewire-core';
import {isNull, defaultGreaterThan, defaultLessThan} from 'rewire-ui';
import {IRow, IError, ErrorSeverity}                 from './GridTypes';

export type IValidateFn     = (row: IRow, value: any) => IError | undefined;

export const isRequired: IValidateFn = (row: IRow, value: any): IError | undefined => {
  let error: IError | undefined;
  let errorMsg: string             = '';
  let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
  if (isNull(value) || (is.array(value) && value.length <= 0)) {
    errorMsg = 'required';
  }
  error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
  return error;
};

export function compositeValidator(dependencies: string[], validator: IValidateFn) {
  return (function () {
    let isInside = false;
    (row: IRow, value: any): IError | undefined => {
      if (isInside) return undefined;
      isInside = true;
      const result = validator(row, value);
      for (const dependency of dependencies) {
        row.cells[dependency].validate();
      }
      isInside = false;
      return result;
    }
  })();
};

export const isRegEx = (re: RegExp, text: string): IValidateFn => (row: IRow, value: any): IError | undefined => {
  let error: IError | undefined;
  let errorMsg: string             = '';
  let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
  if (!re.test(String(!isNullOrUndefined(value) ? value : ''))) {
    errorMsg = text;
  }
  error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
  return error;
};

export const isEmail: IValidateFn = (row: IRow, value: any) => {
  let error: IError | undefined;
  let errorMsg: string             = '';
  let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
  const re = /(^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/;
  if (!re.test(String(!isNullOrUndefined(value) ? value : ''))) {
    errorMsg = 'email is not in a valid format';
  }
  error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
  return error;
};

export const requiredWhenOtherIsNotNull = (otherColumnName: string): IValidateFn => (row: IRow, value: any): IError | undefined => {
  let otherValue = row.cells[otherColumnName] && row.cells[otherColumnName].value;
  if (isNull(otherValue)) return undefined;
  return isRequired(row, value);
}

export const requiredWhenOtherIsValue = (otherColumnName: string, requiredValue: any): IValidateFn => (row: IRow, value: any): IError | undefined => {
  let otherValue = row.cells[otherColumnName] && row.cells[otherColumnName].value;
  if (otherValue !== requiredValue) return undefined;
  return isRequired(row, value);
};

function createComparisonValidator(comparer: <T>(value: T, otherValue: T) => boolean, defaultText: string) {
  return (otherColumnName: string, text?: string) => (row: IRow, value: any) => {
    let error: IError | undefined;
    let errorMsg: string             = '';
    let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
    let otherValue                   = row.cells[otherColumnName] && row.cells[otherColumnName].value;
    text                             = text || defaultText;
    if (!comparer(value, otherValue)) {
      let otherTitle = row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName;
      errorMsg       = `${text} ${otherTitle}`;
    }
    error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
    return error;
  }
}

function createValueComparisonValidator(comparer: <T>(value: T, otherValue: T) => boolean, defaultText: string) {
  return <T>(otherValue: T, text?: string) => (row: IRow, value: any) => {
    let error: IError | undefined;
    let errorMsg: string             = '';
    let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
    text                             = text || defaultText;
    if (!comparer(value, otherValue)) {
      errorMsg       = `${text} ${otherValue}`;
    }
    error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
    return error;
  }
}
export const isGreaterThan             = createComparisonValidator(defaultGreaterThan, 'must be greater than');
export const isGreaterThanOrEqual      = createComparisonValidator((value, otherValue) => defaultGreaterThan(value, otherValue) && defaultEquals(value, otherValue), 'must be greater than or equal to');
export const isLessThan                = createComparisonValidator(defaultLessThan, 'must be less than ');
export const isLessThanOrEqual         = createComparisonValidator((value, otherValue) => defaultLessThan(value, otherValue) && defaultEquals(value, otherValue), 'must be less than or equal to');
export const isEqual                   = createComparisonValidator(defaultEquals, 'must be equal to');
export const isNotEqual                = createComparisonValidator((value, otherValue) => !defaultEquals(value, otherValue), 'must not be equal to');

export const isGreaterThanValue        = createValueComparisonValidator(defaultGreaterThan, 'must be greater than');
export const isGreaterThanOrEqualValue = createValueComparisonValidator((value, otherValue) => defaultGreaterThan(value, otherValue) && defaultEquals(value, otherValue), 'must be greater than or equal to');
export const isLessThanValue           = createValueComparisonValidator(defaultLessThan, 'must be less than ');
export const isLessThanOrEqualValue    = createValueComparisonValidator((value, otherValue) => defaultLessThan(value, otherValue) && defaultEquals(value, otherValue), 'must be less than or equal to');
export const isEqualValue              = createValueComparisonValidator(defaultEquals, 'must be equal to');
export const isNotEqualValue           = createValueComparisonValidator((value, otherValue) => !defaultEquals(value, otherValue), 'must not be equal to');

export const isDifferenceOfOthers = (otherColumnNames: string[], text?: string): IValidateFn => (row: IRow, value: any): IError | undefined => {
  let error: IError | undefined;
  let errorMsg: string             = '';
  let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
  let otherValues: any[]           = otherColumnNames.map((otherColumnName: string) => row.cells[otherColumnName] && row.cells[otherColumnName].value) || [];
  if (otherValues.findIndex(value => isNullOrUndefined(value) || !is.number(value)) >= 0) {
    return undefined;
  }
  let difference = otherValues.reduce((totalValue: number, currValue: number) => {
    let value = totalValue - currValue;
    return value;
  });
  if (value !== difference) {
    if (text) {
      errorMsg = text;
    } else {
      let otherTitles: string[]   = otherColumnNames.map((otherColumnName: string) => row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName) || [];
      let otherTitlesErrorMessage = otherTitles.reduce((message: string, otherTitle: string, idx: number) => {
        return message.concat(` and ${otherTitle}`);
      });
      errorMsg = `must equal difference of ${otherTitlesErrorMessage}`;
    }
  }
  error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
  return error;
};

export const isSumOfOthers = (otherColumnNames: string[], text?: string): IValidateFn => (row: IRow, value: any): IError | undefined => {
  let error: IError | undefined;
  let errorMsg: string             = '';
  let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
  let otherValues: any[]           = otherColumnNames.map((otherColumnName: string) => row.cells[otherColumnName] && row.cells[otherColumnName].value) || [];
  if (otherValues.findIndex(value => isNullOrUndefined(value) || !is.number(value)) >= 0) {
    return undefined;
  }
  let sum = otherValues.reduce((totalValue: number, currValue: number) => {
    let value = totalValue + currValue;
    return value;
  });
  if (value !== sum) {
    if (text) {
      errorMsg = text;
    } else {
      let otherTitles: string[]   = otherColumnNames.map((otherColumnName: string) => row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName) || [];
      let otherTitlesErrorMessage = otherTitles.reduce((message: string, otherTitle: string, idx: number) => {
        return message.concat(` and ${otherTitle}`);
      });
      errorMsg = `must equal sum of ${otherTitlesErrorMessage}`;
    }
  }
  error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
  return error;
}

export const and = (...args: IValidateFn[]) => {
  (row: IRow, value: any): IError | undefined => {
    for (const func of args) {
      const result = func(row, value);
      if (result) return result;
    }
  }
};