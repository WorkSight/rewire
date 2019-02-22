import { IColumn, ICell, IColumnOptions, EditorType, IColumnEditor, SortDirection, IGrid, TextAlignment, VerticalAlignment, IError} from './GridTypes';
import {IValidateFnData} from './Validator';
import {editor, compare, defaultPhoneFormat, defaultPhoneMask} from 'rewire-ui';
import {freeze, DataSignal, property} from 'rewire-core';
import * as is from 'is';

let id = 0;
const toLowerCase = (value: string) => String(value).toLowerCase();

export class ColumnModel implements IColumn {
  private _enabled      : DataSignal<boolean | undefined>;
  private _readOnly     : DataSignal<boolean | undefined>;
  private _verticalAlign: DataSignal<VerticalAlignment | undefined>;

  id            : number;
  grid          : IGrid;
  name          : string;
  title         : string;
  editable      : boolean;
  fixed         : boolean;
  width?        : string;
  visible       : boolean;
  align?        : TextAlignment;
  colSpan       : number;
  rowSpan       : number;
  position      : number;
  sort?         : SortDirection;
  canSort       : boolean;
  tooltip?      : string;
  cls?          : any;
  typeOptions?  : any;
  type          : EditorType;
  renderer?     : React.SFC<any>;
  editor?       : React.SFC<any>;
  validator?    : IValidateFnData;

  onValueChange?(cell: ICell, v: any): void;
  map?(value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?(x: any, y: any): number;

  static positionCompare(a: IColumn, b: IColumn): number {
    return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
  }

  constructor(name: string, title: string, options?: IColumnOptions) {
    this.id             = id++;
    this.name           = name;
    this.title          = title;
    this.position       = 0;
    this.sort           = undefined;
    this.typeOptions    = undefined;
    this._enabled       = property(options && options.enabled !== undefined ? options.enabled : undefined);
    this._readOnly      = property(options && options.readOnly !== undefined ? options.readOnly : undefined);
    this._verticalAlign = property(options && options.verticalAlign !== undefined ? options.verticalAlign : undefined);
    this.editable       = options && options.editable !== undefined ? options.editable : true;
    this.fixed          = options && options.fixed !== undefined ? options.fixed : false;
    this.width          = options && options.width !== undefined ? options.width : undefined;
    this.visible        = options && options.visible !== undefined ? options.visible : true;
    this.align          = options && options.align !== undefined ? options.align : undefined;
    this.colSpan        = options && options.colSpan !== undefined ? options.colSpan : 1;
    this.rowSpan        = options && options.rowSpan !== undefined ? options.rowSpan : 1;
    this.canSort        = options && options.canSort !== undefined ? options.canSort : true;
    this.tooltip        = options && options.tooltip !== undefined ? options.tooltip : undefined;
    this.cls            = options && options.cls !== undefined ? options.cls : undefined;
    this.renderer       = options && options.renderer !== undefined ? options.renderer : undefined;
    this.validator      = options && options.validator !== undefined ? options.validator : undefined;
    this.onValueChange  = options && options.onValueChange !== undefined ? options.onValueChange : undefined;
    this.compare        = options && options.compare !== undefined ? options.compare : undefined;
    this.setEditor(options && options.type);
  }

  set readOnly(value: boolean) {
    this._readOnly(value);
  }
  get readOnly(): boolean {
    return (this._readOnly() !== undefined ? this._readOnly() : this.grid.readOnly) as boolean;
  }

  set enabled(value: boolean) {
    this._enabled(value);
  }
  get enabled(): boolean {
    return (this._enabled() !== undefined ? this._enabled() : this.grid.enabled) as boolean;
  }

  set verticalAlign(value: VerticalAlignment) {
    this._verticalAlign(value);
  }
  get verticalAlign(): VerticalAlignment {
    return this._verticalAlign() || this.grid.verticalAlign;
  }

  setEditor(type?: IColumnEditor) {
    let typeOptions: any;
    let t: EditorType;
    if (type === undefined) {
      t = 'text';
    } else if (typeof (type) === 'string') {
      t = type;
    } else {
      t           = type.type;
      typeOptions = type.options;
    }

    freeze(() => {
      this.type    = t;
      this.typeOptions = typeOptions || {};
      if (this.type === 'none') {
        this.editor = undefined;
      } else {
        this.editor = editor(t, this.typeOptions);
      }

      this.editable  = !!this.editor;
      this.map       = undefined;
      this.predicate = undefined;
      this.compare   = this.typeOptions.compare;

      if (t === 'number') {
        this.map   = getNumberString;
        this.align = this.align || 'right';
      } else if (t === 'checked') {
        this.map = (value: boolean) => value ? 'True' : 'False';
      } else if (t === 'phone') {
        if (this.typeOptions.format === undefined) {
          this.typeOptions.format = defaultPhoneFormat;
        }
        if (this.typeOptions.mask === undefined) {
          this.typeOptions.mask = defaultPhoneMask;
        }
        this.map = getPhoneString;
      } else if (t === 'multiselect') {
        this.map       = getArrayString(this.typeOptions.map);
        this.predicate = (value: any, filter: any) => toLowerCase(this.map!(value)).includes(toLowerCase(filter.value));
        this.compare   = arrayCompare(this.typeOptions);
      }

      if (this.typeOptions.map && t !== 'multiselect') {
        this.map       = (value: any) => this.typeOptions.map(value);
        this.predicate = (value: any, filter: any) => toLowerCase(this.typeOptions.map(value)).includes(toLowerCase(filter.value));
        if (this.compare) {
          this.compare = (x: any, y: any) => this.compare!(this.typeOptions.map(x), this.typeOptions.map(y));
        } else {
          this.compare = (x: any, y: any) => compare(this.typeOptions.map(x), this.typeOptions.map(y));
        }
      }
    });
  }
}

const getArrayString = (map?: (v: any) => string) => (value: any): string => {
  if (!value) return '';

  let values = map ? value.map((v: any) => map(v)) : value;
  return values.join(', ');
};

const arrayCompare = (options?: any) => (x: any, y: any): number => {
  if (!x && !y) return 0;
  if (!x) return -1;
  if (!y) return 1;

  for (let i = 0; i < x.length && i < y.length; i++) {
    let xVal = options && options.map ? options.map(x[i]) : x[i];
    let yVal = options && options.map ? options.map(y[i]) : y[i];
    let c    = options && options.compare ? options.compare(xVal, yVal) : compare(xVal, yVal);
    if (c !== 0) {
      return c;
    }
  }

  return (x.length < y.length ? -1 : x.length > y.length ? 1 : 0);
};

function getNumberString(value: any): string {
  if (value === undefined) return value;

  let numberStr = this.typeOptions && this.typeOptions.decimals && is.number(value) ? value.toFixed(this.typeOptions.decimals) : value.toString();
  if (this.typeOptions && !this.typeOptions.fixed) {
    numberStr = parseFloat(numberStr).toString();
  }
  numberStr = this.typeOptions && this.typeOptions.thousandSeparator ? getThousandSeparatedNumberString(numberStr) : numberStr;

  return numberStr;
}

function splitDecimal(numStr: string): any {
  const hasNagation = numStr[0] === '-';
  const addNegation = hasNagation;
  numStr = numStr.replace('-', '');

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
  let {beforeDecimal, afterDecimal, addNegation} = splitDecimal(numStr);
  let hasDecimalSeparator = !!afterDecimal && afterDecimal.length > 0;

  beforeDecimal = beforeDecimal.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + ',');

  if (addNegation) beforeDecimal = '-' + beforeDecimal;

  return beforeDecimal + (hasDecimalSeparator ? '.' : '') + afterDecimal;
}

function getPhoneString(value: any): string {
  if (value === undefined) return value;

  let phoneStr             = value.toString();
  let phoneFormat          = this.typeOptions.format;
  let phoneMask            = this.typeOptions.mask;
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

export default function create(name: string, title: string, options?: IColumnOptions): IColumn {
  return new ColumnModel(name, title, options);
}
