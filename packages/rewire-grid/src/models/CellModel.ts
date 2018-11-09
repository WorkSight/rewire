import * as React from 'react';
import {IGrid, IColumn, ICell, IRow, IError, TextAlignment, cloneValue} from './GridTypes';
import { observable, defaultEquals, property, DataSignal } from 'rewire-core';

let id = 0;
export class CellModel implements ICell {
  private _enabled    : DataSignal<boolean | undefined>;
  private _readOnly   : DataSignal<boolean | undefined>;
  private _editable   : DataSignal<boolean | undefined>;
  private _cls        : DataSignal<string | undefined>;
  private _align      : DataSignal<TextAlignment | undefined>;
  private _renderer   : DataSignal<React.SFC<any> | undefined>;
  // private _enabled?    : boolean;
  // private _readOnly?   : boolean;
  // private _editable?   : boolean;
  // private _cls?        : string;
  // private _align?      : TextAlignment;
  // private _renderer?   : React.SFC<any>;

  id                   : number;
  row                  : IRow;
  column               : IColumn;
  grid                 : IGrid;
  rowSpan              : number;
  colSpan              : number;
  selected             : boolean;
  value                : any;
  error?               : IError;
  editing              : boolean;
  options              : any;
  isTopMostSelection   : boolean;
  isRightMostSelection : boolean;
  isBottomMostSelection: boolean;
  isLeftMostSelection  : boolean;

  static positionCompare(a: ICell, b: ICell): number {
    return a.rowPosition < b.rowPosition ? -1 : a.rowPosition > b.rowPosition ? 1 : a.columnPosition < b.columnPosition ? -1 : a.columnPosition > b.columnPosition ? 1 : 0;
  }

  constructor(row: IRow, column: IColumn, value: any) {
    this._enabled  = property(undefined);
    this._readOnly = property(undefined);
    this._editable = property(undefined);
    this._cls      = property(undefined);
    this._align    = property(undefined);
    this._renderer = property(undefined);
    // this._enabled  = undefined;
    // this._readOnly = undefined;
    // this._editable = undefined;
    // this._cls      = undefined;
    // this._align    = undefined;
    // this._renderer = undefined;

    this.id                    = id++;
    this.row                   = row;
    this.column                = column;
    this.grid                  = row.grid;
    this.rowSpan               = 1;
    this.colSpan               = 1;
    this.selected              = false;
    this.value                 = value;
    this.error                 = column.validator ? column.validator(this.value) : undefined;
    this.editing               = false;
    this.options               = undefined;
    this.isTopMostSelection    = false;
    this.isRightMostSelection  = false;
    this.isBottomMostSelection = false;
    this.isLeftMostSelection   = false;
  }

  set enabled(value: boolean) {
    this._enabled(value);
  }
  get enabled(): boolean {
    return (this._enabled() !== undefined ? this._enabled() : this.column.enabled) as boolean;
  }

  set readOnly(value: boolean) {
    this._readOnly(value);
  }
  get readOnly(): boolean {
    return (this._readOnly() !== undefined ? this._readOnly() : this.column.readOnly) as boolean;
  }

  set editable(value: boolean) {
    this._editable(value);
  }
  get editable(): boolean {
    return (this._editable() !== undefined ? this._editable() : this.column.editable) as boolean;
  }

  set cls(value: string | undefined) {
    this._cls(value);
  }
  get cls(): string | undefined {
    return this._cls() || this.column.cls;
  }

  set align(value: TextAlignment | undefined) {
    this._align(value);
  }
  get align(): TextAlignment | undefined {
    return this._align() || this.column.align;
  }

  set renderer(value: React.SFC<any> | undefined) {
    this._renderer(value);
  }
  get renderer(): React.SFC<any> | undefined {
    return this._renderer() || this.column.renderer;
  }

  // set enabled(value: boolean) {
  //   this._enabled = value;
  // }
  // get enabled(): boolean {
  //   return this._enabled !== undefined ? this._enabled : this.column.enabled;
  // }

  // set readOnly(value: boolean) {
  //   this._readOnly = value;
  // }
  // get readOnly(): boolean {
  //   return this._readOnly !== undefined ? this._readOnly : this.column.readOnly;
  // }

  // set editable(value: boolean) {
  //   this._editable = value;
  // }
  // get editable(): boolean {
  //   return this._editable !== undefined ? this._editable : this.column.editable;
  // }

  // set cls(value: string | undefined) {
  //   this._cls = value;
  // }
  // get cls(): string | undefined {
  //   return this._cls || this.column.cls;
  // }

  // set align(value: TextAlignment | undefined) {
  //   this._align = value;
  // }
  // get align(): TextAlignment | undefined {
  //   return this._align || this.column.align;
  // }

  // set renderer(value: React.SFC<any> | undefined) {
  //   this._renderer = value;
  // }
  // get renderer(): React.SFC<any> | undefined {
  //   return this._renderer || this.column.renderer;
  // }

  get rowPosition(): number {
    return this.row.position;
  }

  get columnPosition(): number {
    return this.column.position;
  }

  clear() {
    if (this.readOnly || !this.enabled) {
      return;
    }

    this.value = undefined;
  }

  hasChanges(): boolean {
    let changes: boolean;
    if (this.column.compare) {
      changes = this.column.compare(this.value, this.row.data[this.column.name]) !== 0;
    } else {
      changes = !defaultEquals(this.value, this.row.data[this.column.name]);
    }
    return changes;
  }

  setEditing(value: boolean): void {
    if (this.readOnly || !this.enabled || !this.editable || !this.column.editor) {
      this.editing = false;
      return;
    }

    this.editing = value;
  }

  clone(newRow: IRow): any {
    let newValue    = cloneValue(this.value);
    let row         = newRow || this.row;
    let newCell     = new CellModel(row, this.column, newValue);
    newCell.rowSpan = this.rowSpan;
    newCell.colSpan = this.colSpan;
    return newCell;
  }
}

export default function create(row: IRow, column: IColumn, value: any): ICell {
  return observable(new CellModel(row, column, value));
}
