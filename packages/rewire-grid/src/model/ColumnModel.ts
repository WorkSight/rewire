import { IColumn, EditorType, IColumnEditor, SortDirection, IGrid, TextAlignment } from './GridTypes';
import editor, {compare} from 'rewire-ui/components/editors';
import is from 'is';

let id = 0;
const toLowerCase = (value: string) => String(value).toLowerCase();

class ColumnModel implements IColumn {
  name    : string;
  width?  : string;
  fixed   : boolean;
  visible : boolean;
  sort?   : SortDirection;
  id      : number;
  grid    : IGrid;
  tooltip?: string;
  cls     : any;
  enabled : boolean;
  title   : string;
  align?  : TextAlignment;
  type    : EditorType;
  editor? : React.StatelessComponent<any>;
  colSpan?: number;
  rowSpan?: number;

  map?(value: any): string;
  predicate?(value: any, filter: {value: any}): boolean;
  compare?(x: any, y: any): number;

  constructor(name: string, title: string, type?: IColumnEditor, width?: string, align?: TextAlignment) {
    this.id      = id++;
    this.name    = name;
    this.title   = title;
    this.enabled = true;
    this.fixed   = false;
    this.width   = width;
    this.visible = true;
    this.align   = align;
    this.colSpan = 1;
    this.rowSpan = 1;
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

    this.type    = t;
    this.editor  = editor(t, options);

    if (t === 'number') {
      this.map   = (value: any) => (options.decimals && is.number(value)) ? value.toFixed(options.decimals) : value;
      this.align = this.align || 'right';
    }

    if (options && options.map) {
      this.map       = (value: any) => options.map(value);
      this.predicate = (value: any, filter: any) => toLowerCase(options.map(value)).includes(toLowerCase(filter.value));
      this.compare   = (x: any, y: any) => compare(options.map(x), options.map(y));
    }
  }
}

export default function create(name: string, title: string): IColumn;
export default function create(name: string, title: string, type: IColumnEditor): IColumn;
export default function create(name: string, title: string, type: IColumnEditor, width: string): IColumn;
export default function create(name: string, title: string, type?: IColumnEditor, width?: string, align?: 'left' | 'right'): IColumn {
  return new ColumnModel(name, title, type, width, align);
}
