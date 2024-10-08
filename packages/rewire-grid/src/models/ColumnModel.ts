import React from 'react';
import {
  IColumn,
  ICell,
  IColumnOptions,
  EditorType,
  IColumnEditor,
  SortDirection,
  IGrid,
  TextAlignment,
  VerticalAlignment
} from './GridTypes';
import {
  editor,
  compare,
  defaultPhoneFormat,
  defaultPhoneMask,
  IValidator,
  validators,
} from 'rewire-ui';
import {isNullOrUndefined, UTC, createGetter, createSetter} from 'rewire-common';
import {
  freeze,
  createWatcherFn,
  WatcherTypeFn,
  observable,
  DataSignal,
  property
} from 'rewire-core';
import {createMultiSelectAutoCompleteEditor} from '../components/gridEditors';
import is             from 'is';

let id            = 0;
const toLowerCase = (value: string) => String(value).toLowerCase();

export class ColumnModel implements IColumn {
  _enabled             : DataSignal<boolean | undefined>;
  _readOnly            : DataSignal<boolean | undefined>;
  _verticalAlign       : DataSignal<VerticalAlignment | undefined>;
  __validators         : IValidator[];
  __watchColumnVisible : WatcherTypeFn;
  __watchColumnFixed   : WatcherTypeFn;
  __getter             : (obj: any) => any;
  __setter             : (obj: any, value: any) => void;

  id             : number;
  grid           : IGrid;
  name           : string;
  title          : string;
  editable       : boolean;
  fixed          : boolean;
  width?         : string;
  visible        : boolean;
  align?         : TextAlignment;
  colSpan        : number;
  rowSpan        : number;
  position       : number;
  sort?          : SortDirection;
  canSort        : boolean;
  tooltip?       : string | (() => string);
  cls?           : any;
  typeOptions?   : any;
  type           : EditorType;
  headerRenderer?: React.FunctionComponent<any>;
  renderer?      : React.FunctionComponent<any>;
  cellTooltip?   : string | ((value: any) => string);
  editor?        : React.FunctionComponent<any>;
  editorTooltip? : string | ((value: any) => string);

  onValueChange?(cell: ICell, v: any): void;
  map?(value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?(x: any, y: any): number;

  static positionCompare(a: IColumn, b: IColumn): number {
    return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
  }

  private constructor() {
    // setup properties
    this._enabled       = property(undefined);
    this._readOnly      = property(undefined);
    this._verticalAlign = property(undefined);
  }

  private initialize(name: string | string[], title: string, options?: IColumnOptions) {
    this.id             = id++;
    this.name           = Array.isArray(name) ? name.join('.') : name;
    this.__getter       = (options && options.accessor && options.accessor.getter) || createGetter(name);
    this.__setter       = (options && options.accessor && options.accessor.setter) || createSetter(name);
    this.title          = title;
    this.position       = 0;
    this.sort           = undefined;
    this.typeOptions    = undefined;
    this.enabled        = options && !isNullOrUndefined(options.enabled)        ? options.enabled!        : undefined;
    this.readOnly       = options && !isNullOrUndefined(options.readOnly)       ? options.readOnly!       : undefined;
    this.verticalAlign  = options && !isNullOrUndefined(options.verticalAlign)  ? options.verticalAlign!  : undefined;
    this.editable       = options && !isNullOrUndefined(options.editable)       ? options.editable!       : true;
    this.fixed          = options && !isNullOrUndefined(options.fixed)          ? options.fixed!          : false;
    this.width          = options && !isNullOrUndefined(options.width)          ? options.width!          : undefined;
    this.visible        = options && !isNullOrUndefined(options.visible)        ? options.visible!        : true;
    this.align          = options && !isNullOrUndefined(options.align)          ? options.align!          : undefined;
    this.colSpan        = options && !isNullOrUndefined(options.colSpan)        ? options.colSpan!        : 1;
    this.rowSpan        = options && !isNullOrUndefined(options.rowSpan)        ? options.rowSpan!        : 1;
    this.canSort        = options && !isNullOrUndefined(options.canSort)        ? options.canSort!        : true;
    this.tooltip        = options && !isNullOrUndefined(options.tooltip)        ? options.tooltip!        : undefined;
    this.cls            = options && !isNullOrUndefined(options.cls)            ? options.cls!            : undefined;
    this.headerRenderer = options && !isNullOrUndefined(options.headerRenderer) ? options.headerRenderer! : undefined;
    this.renderer       = options && !isNullOrUndefined(options.renderer)       ? options.renderer!       : undefined;
    this.onValueChange  = options && !isNullOrUndefined(options.onValueChange)  ? options.onValueChange!  : undefined;
    this.map            = options && !isNullOrUndefined(options.map)            ? options.map!            : undefined;
    this.predicate      = options && !isNullOrUndefined(options.predicate)      ? options.predicate!      : undefined;
    this.compare        = options && !isNullOrUndefined(options.compare)        ? options.compare!        : undefined;
    this.cellTooltip    = options && !isNullOrUndefined(options.cellTooltip)    ? options.cellTooltip     : undefined;
    this.editorTooltip  = options && !isNullOrUndefined(options.editorTooltip)  ? options.editorTooltip   : undefined;
    if (options && options.validators) {
      this.__validators = validators(options.validators);
    }
    this.setEditor(options && options.type);

    this.__watchColumnVisible = createWatcherFn();
    this.__watchColumnFixed   = createWatcherFn();

    return this;
  }

  get keyId(): string {
    return String(this.id);
  }

  set readOnly(value: boolean | undefined) {
    this._readOnly(value);
  }
  get readOnly(): boolean {
    const readOnly = this._readOnly();
    return (!isNullOrUndefined(readOnly) ? readOnly : this.grid.readOnly) as boolean;
  }

  set enabled(value: boolean | undefined) {
    this._enabled(value);
  }
  get enabled(): boolean {
    const enabled = this._enabled();
    return (!isNullOrUndefined(enabled) ? enabled : this.grid.enabled) as boolean;
  }

  set verticalAlign(value: VerticalAlignment | undefined) {
    this._verticalAlign(value);
  }
  get verticalAlign(): VerticalAlignment {
    return this._verticalAlign() || this.grid.verticalAlign;
  }

  get isGroupByColumn(): boolean {
    return this.grid.groupBy.findIndex((column: IColumn) => column.id === this.id) >= 0;
  }

  setEditor(type?: IColumnEditor) {
    let typeOptions: any;
    let t: EditorType;
    if (!type) {
      t = 'text';
    } else if (typeof (type) === 'string') {
      t = type;
    } else {
      t           = type.type;
      typeOptions = type.options;
    }

    this.type        = t;
    this.typeOptions = typeOptions = (typeOptions || {});
    freeze(() => {
      if (this.type === 'none') {
        this.editor = undefined;
      } else {
        if (t === 'multiselectautocomplete') {
          if (isNullOrUndefined(typeOptions.chipLimit)) {
            typeOptions.chipLimit = 4;
          }
          this.editor = createMultiSelectAutoCompleteEditor(typeOptions);
        } else {
          this.editor = editor(t, typeOptions);
        }
      }

      this.editable   = !!this.editor;
      let align       = 'left';
      let mapFn       = typeOptions.map;
      let compareFn   = typeOptions.compare;
      let predicateFn = undefined;

      if (t === 'number') {
        mapFn = (v: any) => getNumberString(v, typeOptions.decimals, typeOptions.thousandSeparator, typeOptions.fixed);
        align = 'right';
      } else if (t === 'checked') {
        mapFn = (value: boolean) => value ? 'True' : 'False';
      } else if (t === 'date') {
        mapFn = (value: UTC) => value ? value.toDateString() : '';
      } else if (t === 'phone') {
        if (!typeOptions.format) {
          typeOptions.format = defaultPhoneFormat;
        }
        if (!typeOptions.mask) {
          typeOptions.mask = defaultPhoneMask;
        }
        mapFn = (v: any) => getPhoneString(v, typeOptions.format, typeOptions.mask);
      } else if (t === 'select' || t === 'auto-complete' || (t === 'time' && mapFn)) {
        predicateFn = (value: any, filter: any) => toLowerCase(mapFn(value)).includes(toLowerCase(filter.value));
        if (compareFn) {
          compareFn = (x: any, y: any) => compareFn!(mapFn(x), mapFn(y));
        } else {
          compareFn = (x: any, y: any) => compare(mapFn(x), mapFn(y));
        }
      } else if (t === 'multiselect' || t === 'multiselectautocomplete') {
        compareFn   = arrayCompare(mapFn, compareFn);
        mapFn       = getArrayString(mapFn);
        predicateFn = (value: any, filter: any) => toLowerCase(mapFn!(value)).includes(toLowerCase(filter.value));
      }

      this.align     = (this.align || align) as TextAlignment;
      this.map       = this.map || mapFn;
      this.compare   = this.compare || compareFn;
      this.predicate = this.predicate || predicateFn;
    });
  }

  static create(name: string | string[], title: string, options?: IColumnOptions): IColumn {
    return observable(new ColumnModel()).initialize(name, title, options);
  }
}

const getArrayString = (map?: (v: any) => string) => (value: any): string => {
  if (!value) return '';

  const values = map ? value.map((v: any) => map(v)) : value;
  return values.join(', ');
};

const arrayCompare = (mapFn?: any, compareFn?: any) => (x: any, y: any): number => {
  if (!x && !y) return 0;
  if (!x) return -1;
  if (!y) return 1;

  for (let i = 0; i < x.length && i < y.length; i++) {
    const xVal = mapFn ? mapFn(x[i]) : x[i];
    const yVal = mapFn ? mapFn(y[i]) : y[i];
    const c    = compareFn ? compareFn(xVal, yVal) : compare(xVal, yVal);
    if (c !== 0) {
      return c;
    }
  }

  return (x.length < y.length ? -1 : x.length > y.length ? 1 : 0);
};

export function getNumberString(value: any, decimals?: number, thousandSeparator?: boolean, fixed?: boolean): string | null | undefined {
  if (isNullOrUndefined(value)) return value;

  let numberStr = decimals && is.number(value) ? value.toFixed(decimals) : value.toString();
  if (!fixed) {
    numberStr = parseFloat(numberStr).toString();
  }
  numberStr = thousandSeparator ? getThousandSeparatedNumberString(numberStr) : numberStr;

  return numberStr;
}

function splitDecimal(numStr: string): any {
  const hasNagation = numStr[0] === '-';
  const addNegation = hasNagation;
  numStr            = numStr.replace('-', '');

  const parts         = numStr.split('.');
  const beforeDecimal = parts[0];
  const afterDecimal  = parts[1] || '';

  return {
    beforeDecimal,
    afterDecimal,
    addNegation,
  };
}

function getThousandSeparatedNumberString(numStr: string): string {
  // eslint-disable-next-line prefer-const
  let {beforeDecimal, afterDecimal, addNegation} = splitDecimal(numStr);
  const hasDecimalSeparator = !!afterDecimal && afterDecimal.length > 0;

  beforeDecimal = beforeDecimal.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + ',');

  if (addNegation) beforeDecimal = '-' + beforeDecimal;

  return beforeDecimal + (hasDecimalSeparator ? '.' : '') + afterDecimal;
}

export function getPhoneString(value: any, format: string, mask: string): string | null | undefined {
  if (isNullOrUndefined(value)) return value;

  const phoneStr             = value.toString();
  const phoneFormat          = format;
  const phoneMask            = mask;
  let hashCount            = 0;
  const formattedNumberArr = phoneFormat.split('');
  for (let i = 0; i < phoneFormat.length; i++) {
    if (phoneFormat[i] === '#') {
      formattedNumberArr[i] = phoneStr[hashCount] || phoneMask;
      hashCount++;
    }
  }
  return formattedNumberArr.join('');
}

export default ColumnModel.create;