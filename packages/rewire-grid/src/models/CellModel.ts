import {IGrid, IColumn, ICell, IRow, IError, EditorType, TextAlignment} from './GridTypes';
import { observable, defaultEquals } from 'rewire-core';

let id = 0;
class CellModel implements ICell {
  id       : number;
  row      : IRow;
  column   : IColumn;
  grid     : IGrid;
  type     : EditorType;
  editor?  : React.SFC<any>;
  renderer?: React.SFC<any>;
  error?   : IError;
  cls      : string;
  align?   : TextAlignment;
  rowSpan  : number;
  colSpan  : number;
  enabled  : boolean;
  selected : boolean;
  value    : any;
  editing  : boolean;
  readOnly : boolean;
  options  : any;

  constructor(row: IRow, column: IColumn, value: any) {
    this.row      = row;
    this.column   = column;
    this.grid     = row.grid;
    this.id       = id++;
    this.type     = column.type;
    this.editor   = column.editor;
    this.renderer = column.renderer;
    this.error    = undefined;
    this.cls      = column.cls;
    this.align    = column.align;
    this.rowSpan  = 1;
    this.colSpan  = 1;
    this.enabled  = column.enabled;
    this.selected = false;
    this.value    = value;
    this.editing  = false;
    this.readOnly = column.readOnly || (value && value.readOnly);
  }

  clear() {
    if (this.readOnly || !this.enabled) {
      return;
    }

    this.value = undefined;
  }

  hasChanges() {
    return !defaultEquals(this.value, this.row.data[this.column.name]);
  }

  setEditing(value: boolean): void {
    if (this.readOnly || !this.enabled) {
      return;
    }

    this.editing = value;
  }

  clone(newRow: IRow) {
    let row = newRow || this.row;
    return new CellModel(row, this.column, (this.value.clone && this.value.clone() || this.value));
  }
}

export default function create(row: IRow, column: IColumn, value: any): ICell {
  return observable(new CellModel(row, column, value));
}
