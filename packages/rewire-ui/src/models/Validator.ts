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
  if (typeof(value) === 'string') return !value;
  return ((value.id !== undefined) && !value.id);
}

export type IValidateFn     = (obj: ObjectType, fieldName: string, label: string | undefined, value: any) => string | undefined;
export type IValidateFnData = {linkedFieldNames: string[], fn: IValidateFn};

export const isRequired: IValidateFnData = {
  linkedFieldNames: [],
  fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
    return (isNull(value) || (is.array(value) && value.length <= 0)) ? `${label || 'field'} is required` : undefined;
  }
};

export const isRegEx = (re: RegExp, text: string): IValidateFnData => {
  return {
    linkedFieldNames: [],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      if (!re.test(String(value !== undefined ? value : ''))) {
        return text;
      }
      return undefined;
    }
  };
};

export const isEmail: IValidateFnData = {
  linkedFieldNames: [],
  fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
    const re = /(^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/;
    if (!re.test(String(value !== undefined ? value : ''))) {
      return 'email is not in a valid format';
    }
    return undefined;
  }
};

export const requiredWhenOtherIsNotNull = (otherFieldName: string): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (isNull(otherValue)) return undefined;
      return isRequired.fn(obj, fieldName, label, value);
    }
  };
};

export const requiredWhenOtherIsValue = (otherFieldName: string, requiredValue: any): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (otherValue !== requiredValue) return undefined;
      return isRequired.fn(obj, fieldName, label, value);
    }
  };
};

export const isGreaterThan = (otherFieldName: string, text?: string): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (!defaultGreaterThan(value, otherValue)) {
        if (text) return text;
        let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
        return `${label || fieldName} must be greather than ${otherLabel}`;
      }
      return undefined;
    }
  };
};

export const isGreaterThanOrEquals = (otherFieldName: string, text?: string): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (!defaultGreaterThan(value, otherValue) && !defaultEquals(value, otherValue)) {
        if (text) return text;
        let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
        return `${label || fieldName} must be greather than or equals to ${otherLabel}`;
      }
      return undefined;
    }
  };
};

export const isLessThan = (otherFieldName: string, text?: string): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (!defaultLessThan(value, otherValue)) {
        if (text) return text;
        let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
        return `${label || fieldName} must be less than ${otherLabel}`;
      }
      return undefined;
    }
  };
};

export const isLessThanOrEquals = (otherFieldName: string, text?: string): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (!defaultLessThan(value, otherValue) && !defaultEquals(value, otherValue)) {
        if (text) return text;
        let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
        return `${label || fieldName} must be less than or equals to ${otherLabel}`;
      }
      return undefined;
    }
  };
};

export const isSameAsOther = (otherFieldName: string, text?: string): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (!defaultEquals(value, otherValue)) {
        if (text) return text;
        let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
        return `${label || fieldName} must be same as ${otherLabel}`;
      }
      return undefined;
    }
  };
};

export const isDifferentFromOther = (otherFieldName: string, text?: string): IValidateFnData => {
  return {
    linkedFieldNames: [otherFieldName],
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValue = obj[otherFieldName] && obj[otherFieldName].value;
      if (defaultEquals(value, otherValue)) {
        if (text) return text;
        let otherLabel = obj[otherFieldName] && obj[otherFieldName].label || otherFieldName;
        return `${label || fieldName} must be different from ${otherLabel}`;
      }
      return undefined;
    }
  };
};

export const isDifferenceOfOthers = (otherFieldNames: string[], text?: string): IValidateFnData => {
  return {
    linkedFieldNames: otherFieldNames,
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValues: any[] = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].value) || [];
      if (otherValues.every(value => value === undefined || value === null || !is.number(value))) {
        return undefined;
      }
      let difference = otherValues.reduce((totalValue: number, currValue: number) => (totalValue || 0) - (currValue || 0));
      if (value !== difference) {
        if (text) return text;
        let otherLabels: string[]   = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].label || otherFieldName) || [];
        let otherLabelsErrorMessage = otherLabels.reduce((message: string, otherLabel: string, idx: number) => {
          return message.concat(` and ${otherLabel}`);
        });
        return `${label || fieldName} must equal difference of ${otherLabelsErrorMessage}`;
      }
      return undefined;
    }
  };
};

export const isSumOfOthers = (otherFieldNames: string[], text?: string): IValidateFnData => {
  return {
    linkedFieldNames: otherFieldNames,
    fn: (obj: ObjectType, fieldName: string, label: string | undefined, value: any): string | undefined => {
      let otherValues: any[] = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].value) || [];
      if (otherValues.every(value => value === undefined || value === null || !is.number(value))) {
        return undefined;
      }
      let sum = otherValues.reduce((totalValue: number, currValue: number) => (totalValue || 0) + (currValue || 0));
      if (value !== sum) {
        if (text) return text;
        let otherLabels: string[]   = otherFieldNames.map((otherFieldName: string) => obj[otherFieldName] && obj[otherFieldName].label || otherFieldName) || [];
        let otherLabelsErrorMessage = otherLabels.reduce((message: string, otherLabel: string, idx: number) => {
          return message.concat(` and ${otherLabel}`);
        });
        return `${label || fieldName} must equal sum of ${otherLabelsErrorMessage}`;
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

  setRule(fieldName: string, fnData: IValidateFnData) {
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
