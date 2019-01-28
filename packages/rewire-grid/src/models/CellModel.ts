import * as React from 'react';
import * as is from 'is';
import {IGrid, IColumn, ICell, IRow, IError, IErrorData, TextAlignment, VerticalAlignment, cloneValue} from './GridTypes';
import { observable, defaultEquals, property, DataSignal } from 'rewire-core';
import * as deepEqual                                      from 'fast-deep-equal';
import mixin                                               from 'mixin-deep';

let id = 0;
export class CellModel implements ICell {
  private _enabled      : DataSignal<boolean | undefined>;
  private _readOnly     : DataSignal<boolean | undefined>;
  private _editable     : DataSignal<boolean | undefined>;
  private _cls          : DataSignal<string | undefined>;
  private _align        : DataSignal<TextAlignment | undefined>;
  private _verticalAlign: DataSignal<VerticalAlignment | undefined>;
  private _renderer     : DataSignal<React.SFC<any> | undefined>;
  private _onValueChange: DataSignal<((cell: ICell, v: any) => void) | undefined>;
  private _element      : DataSignal<HTMLTableDataCellElement | undefined>;
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
    this._enabled       = property(undefined);
    this._readOnly      = property(undefined);
    this._editable      = property(undefined);
    this._cls           = property(undefined);
    this._align         = property(undefined);
    this._verticalAlign = property(undefined);
    this._renderer      = property(undefined);
    this._onValueChange = property(undefined);
    this._element       = property(undefined);
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
    this.error                 = undefined;
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
    return (this._enabled() !== undefined ? this._enabled() : this.column.enabled !== undefined ? this.column.enabled : this.grid.enabled) as boolean;
  }

  set readOnly(value: boolean) {
    this._readOnly(value);
  }
  get readOnly(): boolean {
    return (this._readOnly() !== undefined ? this._readOnly() : this.column.readOnly !== undefined ? this.column.readOnly : this.grid.readOnly) as boolean;
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

  set verticalAlign(value: VerticalAlignment) {
    this._verticalAlign(value);
  }
  get verticalAlign(): VerticalAlignment {
    return this._verticalAlign() || this.column.verticalAlign || this.grid.verticalAlign;
  }

  set renderer(value: React.SFC<any> | undefined) {
    this._renderer(value);
  }
  get renderer(): React.SFC<any> | undefined {
    return this._renderer() || this.column.renderer;
  }

  set onValueChange(value: ((cell: ICell, v: any) => void) | undefined) {
    this._onValueChange(value);
  }
  get onValueChange(): ((cell: ICell, v: any) => void) | undefined {
    return this._onValueChange() || this.column.onValueChange;
  }

  // set element(value: HTMLTableDataCellElement | undefined) {
  //   this._element(value);
  // }
  get element(): HTMLTableDataCellElement | undefined {
    return this._element();
  }

  setElement(element: HTMLTableDataCellElement | undefined) {
    this._element(element);
  }

  // set enabled(value: boolean) {
  //   this._enabled = value;
  // }
  // get enabled(): boolean {
  //   return this._enabled !== undefined ? this._enabled : this.column.enabled !== undefined ? this.column.enabled : this.grid.enabled;
  // }

  // set readOnly(value: boolean) {
  //   this._readOnly = value;
  // }
  // get readOnly(): boolean {
  //   return this._readOnly !== undefined ? this._readOnly : this.column.readOnly !== undefined ? this.column.readOnly : this.grid.readOnly;
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

  _setValue(value: any) {
    if (this.value === value) return;
    if (is.object(this.value) && is.object(value)) {
      mixin(this.value, value);
    } else {
      this.value = value;
    }
    this.onValueChange && this.onValueChange(this, value);
  }

  setValue(value: any) {
    if (this.value === value) return;
    this._setValue(value);
    this.validate();
    this.grid.changed = this.grid.hasChanges();
  }

  clear() {
    if (this.readOnly || !this.enabled) {
      return;
    }

    this.setValue(undefined);
  }

  hasChanges(): boolean {
    let prevVal = this.row.data[this.column.name];
    let currVal = this.value;
    if (prevVal === currVal || (!prevVal && !currVal)) {
      return false;
    } else if (!prevVal || !currVal) {
      return true;
    }
    return !deepEqual(prevVal, currVal);
  }

  hasErrors(): boolean {
    return !!this.error;
  }

  getErrors(): IErrorData[] {
    let errors: IErrorData[] = [];
    if (this.error) {
      let newErrorData: IErrorData = {
        name: this.column.title || this.column.name,
        error: this.error,
      };
      errors.push(newErrorData);
    }
    return errors;
  }

  canFocus(): boolean {
    return (!this.editing && this.element && this.element !== (document.activeElement as HTMLTableDataCellElement)) || false;
  }

  canBlur(): boolean {
    return (!this.editing && this.element && this.element === (document.activeElement as HTMLTableDataCellElement)) || false;
  }

  setFocus(focus: boolean = true) {
    if (focus && this.canFocus()) {
      this.element!.focus();
      this.grid.focusedCell = this;
    } else if (!focus && this.canBlur()) {
      this.element!.blur();
      this.grid.focusedCell = undefined;
    }
  }

  setEditing(isEditing: boolean): void {
    if (this.readOnly || !this.enabled || !this.editable || !this.column.editor) {
      this.editing = false;
      return;
    }

    this.editing = isEditing;
  }

  clone(newRow: IRow): ICell {
    let newValue    = cloneValue(this.value);
    let row         = newRow || this.row;
    let newCell     = create(row, this.column, newValue);
    newCell.rowSpan = this.rowSpan;
    newCell.colSpan = this.colSpan;
    return newCell;
  }

  validate() {
    if (this.column.validator) {
      this.error = this.column.validator.fn(this.row, this.value);
    }
    // validate other cells in the same row if they have a column validator whose linkedColumnNames contains this cells column name
    let cellsToValidate = this.row.cellsByColumnPosition.filter((cell: ICell) => cell.column.validator && cell.column.validator.linkedColumnNames.includes(this.column.name));
    cellsToValidate.forEach((cell: ICell) => {
      let column = cell.column;
      cell.error = column.validator!.fn(cell.row, cell.value);
    });

    this.grid.inError = this.grid.hasErrors();
  }

  // reverts value without validation or grid changed update
  _revert() {
    if (this.hasChanges()) {
      this._setValue(cloneValue(this.row.data[this.column.name]));
    }
  }

  revert() {
    if (this.hasChanges()) {
      this.setValue(cloneValue(this.row.data[this.column.name]));
    }
  }
}

export default function create(row: IRow, column: IColumn, value: any): ICell {
  return observable(new CellModel(row, column, value));
}
