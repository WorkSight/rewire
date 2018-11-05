import { IColumn, EditorType, IColumnEditor, SortDirection, IGrid, TextAlignment, IError } from './GridTypes';
import {editor, compare, defaultPhoneFormat, defaultPhoneMask} from 'rewire-ui';
import {freeze} from 'rewire-core';
import * as is from 'is';

let id = 0;
const toLowerCase = (value: string) => String(value).toLowerCase();

export class ColumnModel implements IColumn {
  id       : number;
  grid     : IGrid;
  name     : string;
  title    : string;
  enabled  : boolean;
  readOnly : boolean;
  editable : boolean;
  fixed    : boolean;
  width?   : string;
  visible  : boolean;
  align?   : TextAlignment;
  colSpan? : number;
  rowSpan? : number;
  position : number;
  sort?    : SortDirection;
  canSort? : boolean;
  tooltip? : string;
  cls?     : any;
  options? : any;
  type     : EditorType;
  renderer?: React.SFC<any>;
  editor?  : React.SFC<any>;

  validator?: (value: any) => IError | undefined;
  map?(value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?(x: any, y: any): number;

  static positionCompare(a: IColumn, b: IColumn): number {
    return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
  }

  constructor(name: string, title: string, type?: IColumnEditor, width?: string, align?: TextAlignment) {
    this.id       = id++;
    this.name     = name;
    this.title    = title;
    this.enabled  = true;
    this.readOnly = false;
    this.editable = true;
    this.fixed    = false;
    this.width    = width;
    this.visible  = true;
    this.align    = align;
    this.colSpan  = 1;
    this.rowSpan  = 1;
    this.position = 0;
    this.sort     = undefined;
    this.canSort  = true;
    this.tooltip  = undefined;
    this.cls      = undefined;
    this.options  = undefined;
    this.renderer = undefined;
    this.setEditor(type);
  }

  setEditor(type?: IColumnEditor) {
    let options: any;
    let t: EditorType;
    if (type === undefined) {
      t = 'text';
    }
    else if (typeof (type) === 'string') {
      t       = type;
    } else {
      t       = type.type;
      options = type.options;
    }

    freeze(() => {
      this.type    = t;
      this.options = options || {};
      if (this.type === 'none') {
        this.editor = undefined;
      } else {
        this.editor = editor(t, options);
      }

      this.editable  = !!this.editor;
      this.map       = undefined;
      this.predicate = undefined;
      this.compare   = undefined;

      if (t === 'number') {
        this.map   = getNumberString;
        this.align = this.align || 'right';
      } else if (t === 'checked') {
        this.map = (value: boolean) => value ? 'True' : 'False';
      } else if (t === 'phone') {
        this.options.format = options && options.format !== undefined ? options.format : defaultPhoneFormat;
        this.options.mask   = options && options.mask !== undefined ? options.mask : defaultPhoneMask;
        this.map            = getPhoneString;
      }

      if (options && options.map) {
        this.map       = (value: any) => options.map(value);
        this.predicate = (value: any, filter: any) => toLowerCase(options.map(value)).includes(toLowerCase(filter.value));
        this.compare   = (x: any, y: any) => compare(options.map(x), options.map(y));
      }
    });
  }
}

function getNumberString(value: any): string {
  if (value === undefined) return value;

  let numberStr = this.options && this.options.decimals && is.number(value) ? value.toFixed(this.options.decimals) : value;
  numberStr     = this.options && this.options.thousandSeparator ? getThousandSeparatedNumberString(numberStr) : numberStr;

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
  let phoneFormat          = this.options.format;
  let phoneMask            = this.options.mask;
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

export default function create(name: string, title: string): IColumn;
export default function create(name: string, title: string, type:  IColumnEditor): IColumn;
export default function create(name: string, title: string, type:  IColumnEditor, width:  string): IColumn;
export default function create(name: string, title: string, type:  IColumnEditor, width:  string, align: TextAlignment): IColumn;
export default function create(name: string, title: string, type?: IColumnEditor, width?: string, align?: TextAlignment): IColumn {
  return new ColumnModel(name, title, type, width, align);
}
