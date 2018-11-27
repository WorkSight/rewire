import * as is from 'is';
import {defaultEquals}                               from 'rewire-core';
import {isNull, defaultGreaterThan, defaultLessThan} from 'rewire-ui';
import {IRow, IError, ErrorSeverity}                 from './GridTypes';

export type IValidateFn     = (row: IRow, value: any) => IError | undefined;
export type IValidateFnData = {linkedColumnNames: string[], fn: IValidateFn};

export const isRequired: IValidateFnData = {
  linkedColumnNames: [],
  fn: (row: IRow, value: any): IError | undefined => {
    let error: IError | undefined;
    let errorMsg: string             = '';
    let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
    if (isNull(value) || (is.array(value) && value.length <= 0)) {
      errorMsg = 'required';
    }
    error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
    return error;
  }
};

export const isRegEx = (re: RegExp, text: string): IValidateFnData => {
  return {
    linkedColumnNames: [],
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      if (!re.test(String(value !== undefined ? value : ''))) {
        errorMsg = text;
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
};

export const isEmail: IValidateFnData = {
  linkedColumnNames: [],
  fn: (row: IRow, value: any): IError | undefined => {
    let error: IError | undefined;
    let errorMsg: string             = '';
    let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
    const re = /(^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/;
    if (!re.test(String(value !== undefined ? value : ''))) {
      errorMsg = 'email is not in a valid format';
    }
    error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
    return error;
  }
};

export const requiredWhenOtherIsNotNull = (otherColumnName: string): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let otherValue = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (isNull(otherValue)) return undefined;
      return isRequired.fn(row, value);
    }
  };
};

export const requiredWhenOtherIsValue = (otherColumnName: string, requiredValue: any): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let otherValue = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (otherValue !== requiredValue) return undefined;
      return isRequired.fn(row, value);
    }
  };
};

export const isGreaterThan = (otherColumnName: string, text?: string): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValue                   = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (!defaultGreaterThan(value, otherValue)) {
        if (text) {
          errorMsg = text;
        } else {
          let otherTitle = row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName;
          errorMsg       = `must be greater than ${otherTitle}`;
        }
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
};

export const isGreaterThanOrEquals = (otherColumnName: string, text?: string): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValue                   = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (!defaultGreaterThan(value, otherValue) && !defaultEquals(value, otherValue)) {
        if (text) {
          errorMsg = text;
        } else {
          let otherTitle = row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName;
          errorMsg       = `must be greater than or equals to ${otherTitle}`;
        }
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
};

export const isLessThan = (otherColumnName: string, text?: string): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValue                   = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (!defaultLessThan(value, otherValue)) {
        if (text) {
          errorMsg = text;
        } else {
          let otherTitle = row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName;
          errorMsg       = `must be less than ${otherTitle}`;
        }
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
};

export const isLessThanOrEquals = (otherColumnName: string, text?: string): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValue                   = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (!defaultLessThan(value, otherValue) && !defaultEquals(value, otherValue)) {
        if (text) {
          errorMsg = text;
        } else {
          let otherTitle = row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName;
          errorMsg       = `must be less than or equals to ${otherTitle}`;
        }
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
};

export const isSameAsOther = (otherColumnName: string, text?: string): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValue                   = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (!defaultEquals(value, otherValue)) {
        if (text) {
          errorMsg = text;
        } else {
          let otherTitle = row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName;
          errorMsg       = `must be equals to ${otherTitle}`;
        }
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
};

export const isDifferentFromOther = (otherColumnName: string, text?: string): IValidateFnData => {
  return {
    linkedColumnNames: [otherColumnName],
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValue                   = row.cells[otherColumnName] && row.cells[otherColumnName].value;
      if (defaultEquals(value, otherValue)) {
        if (text) {
          errorMsg = text;
        } else {
          let otherTitle = row.cells[otherColumnName] && row.cells[otherColumnName].column.title || otherColumnName;
          errorMsg       = `must be different from ${otherTitle}`;
        }
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
};

export const isDifferenceOfOthers = (otherColumnNames: string[], text?: string): IValidateFnData => {
  return {
    linkedColumnNames: otherColumnNames,
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValues: any[]           = otherColumnNames.map((otherColumnName: string) => row.cells[otherColumnName] && row.cells[otherColumnName].value) || [];
      let difference                   = otherValues.reduce((totalValue: number, currValue: number) => {
        let value = (totalValue || 0) - (currValue || 0);
        return is.number(value) ? value : 0;
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
    }
  };
};

export const isSumOfOthers = (otherColumnNames: string[], text?: string): IValidateFnData => {
  return {
    linkedColumnNames: otherColumnNames,
    fn: (row: IRow, value: any): IError | undefined => {
      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      let otherValues: any[]           = otherColumnNames.map((otherColumnName: string) => row.cells[otherColumnName] && row.cells[otherColumnName].value) || [];
      let sum                          = otherValues.reduce((totalValue: number, currValue: number) => {
        let value = (totalValue || 0) + (currValue || 0);
        return is.number(value) ? value : 0;
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
  };
};

export const and = (...args: IValidateFnData[]) => {
  return {
    linkedColumnNames: [...new Set(args.map(arg => arg.linkedColumnNames).reduce((prev, next) => prev.concat(next)))],
    fn: (row: IRow, value: any): IError | undefined => {
      for (const func of args) {
        const fn = func.fn;
        const result = fn(row, value);
        if (result) return result;
      }
    }
  };
};