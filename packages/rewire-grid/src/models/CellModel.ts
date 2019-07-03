import * as React                    from 'react';
import { isNullOrUndefined }         from 'rewire-common';
import { observable, defaultEquals } from 'rewire-core';
import { IError }                    from 'rewire-ui';
import {
  IGrid,
  IColumn,
  ICell,
  IRow,
  IErrorData,
  TextAlignment,
  VerticalAlignment,
  cloneValue
}                    from './GridTypes';
import { RowModel }  from './RowModel';

const _guards = new Map();
function guard<T>(context: any, fn: () => T) {
  if (_guards.has(context)) return;
  _guards.set(context, true);
  const result = fn.call(context);
  _guards.delete(context);
  return result;
}

let id = 0;
export class CellModel implements ICell {
  _enabled?            : boolean;
  _readOnly?           : boolean;
  _editable?           : boolean;
  _cls?                : string;
  _align?              : TextAlignment;
  _verticalAlign?      : VerticalAlignment;
  _renderer?           : React.SFC<any>;
  _onValueChange?      : ((cell: ICell, v: any) => void);
  private __element?   : HTMLTableDataCellElement; // non-observable

  id                   : number;
  row                  : IRow;
  column               : IColumn;
  grid                 : IGrid;
  rowSpan              : number;
  colSpan              : number;
  selected             : boolean;
  error?               : IError;
  editing              : boolean;
  hasChanges           : boolean;
  options              : any;
  isTopMostSelection   : boolean;
  isRightMostSelection : boolean;
  isBottomMostSelection: boolean;
  isLeftMostSelection  : boolean;
  keyForEdit?          : string;

  static positionCompare(a: ICell, b: ICell): number {
    return a.rowPosition < b.rowPosition ? -1 : a.rowPosition > b.rowPosition ? 1 : a.columnPosition < b.columnPosition ? -1 : a.columnPosition > b.columnPosition ? 1 : 0;
  }

  private constructor() { }

  initialize(row: IRow, column: IColumn, value: any) {
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
    this.keyForEdit            = undefined;
    this.hasChanges            = false;
    this.__element             = undefined;
    return this;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }
  get enabled(): boolean {
    return (!isNullOrUndefined(this._enabled) ? this._enabled : this.column.enabled) as boolean;
  }

  set readOnly(value: boolean) {
    this._readOnly = value;
  }
  get readOnly(): boolean {
    return (!isNullOrUndefined(this._readOnly) ? this._readOnly : this.column.readOnly) as boolean;
  }

  set editable(value: boolean) {
    this._editable = value;
  }
  get editable(): boolean {
    return (!isNullOrUndefined(this._editable) ? this._editable : this.column.editable) as boolean;
  }

  set cls(value: string | undefined) {
    this._cls = value;
  }
  get cls(): string | undefined {
    return this._cls || this.column.cls;
  }

  set align(value: TextAlignment | undefined) {
    this._align = value;
  }
  get align(): TextAlignment | undefined {
    return this._align || this.column.align;
  }

  set verticalAlign(value: VerticalAlignment) {
    this._verticalAlign = value;
  }
  get verticalAlign(): VerticalAlignment {
    return this._verticalAlign || this.column.verticalAlign;
  }

  set renderer(value: React.SFC<any> | undefined) {
    this._renderer = value;
  }
  get renderer(): React.SFC<any> | undefined {
    return this._renderer || this.column.renderer;
  }

  set onValueChange(value: ((cell: ICell, v: any) => void) | undefined) {
    this._onValueChange = value;
  }
  get onValueChange(): ((cell: ICell, v: any) => void) | undefined {
    return this._onValueChange || this.column.onValueChange;
  }

  setElement(element: HTMLTableDataCellElement | undefined) {
    this.__element = element;
  }
  get element(): HTMLTableDataCellElement | undefined {
    return this.__element;
  }

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

  private runOnValueChange() {
    this.onValueChange && this.onValueChange(this, this.value);
    if (this.grid.isChangeTracking) { // cell change tracking support!
      const ct: any = (this.grid as any).__changeTracker;
      ct.recalculate(); // queue grid recalculation!
      this.hasChanges = ct.valueHasChanges(this.row, this.column.name);
    }
    this.validate();
  }

  get value() {
    return this.row.data[this.column.name];
  }
  set value(value: any) {
    const oldValue = this.row.data[this.column.name];
    if (defaultEquals(value, oldValue)) return;
    this.row.data[this.column.name] = value;
    if (this.row.fixed) return;
    if (!this.grid.loading) {
      if (this.column.fixed) {
        this.row.mergeFixedColumns();
      } else {
        this.row.mergeStandardColumns();
      }
      guard(this.row.cells[this.column.name], this.runOnValueChange);
    }
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
    return !!(!this.editing && this.element);
  }

  canBlur(): boolean {
    return !!(!this.editing && this.element);
  }

  setFocus(focus: boolean = true) {
    if (focus && this.canFocus()) {
      this.element!.focus();
    } else if (!focus && this.canBlur()) {
      this.element!.blur();
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
    let newValue          = cloneValue(this.value);
    let row               = newRow || this.row;
    let newCell           = CellModel.create(row, this.column, newValue);
    newCell.enabled       = this.enabled;
    newCell.readOnly      = this.readOnly;
    newCell.editable      = this.editable;
    newCell.cls           = this.cls;
    newCell.align         = this.align;
    newCell.verticalAlign = this.verticalAlign;
    newCell.renderer      = this.renderer;
    newCell.onValueChange = this.onValueChange;
    newCell.error         = this.error;
    newCell.rowSpan       = this.rowSpan;
    newCell.colSpan       = this.colSpan;
    return newCell;
  }

  validate() {
    if (this.row.fixed) return;
    this.grid.validator.validateField((this.row as RowModel), this.column.name);
  }

  unselect() {
    this.selected              = false;
    this.isTopMostSelection    = false;
    this.isRightMostSelection  = false;
    this.isBottomMostSelection = false;
    this.isLeftMostSelection   = false;
  }

  performKeybindAction(evt: React.KeyboardEvent<any>): void {
    let action = this.grid.staticKeybinds[evt.key];
    if (!action) {
      action = this.grid.variableKeybinds[evt.key];
    }
    if (action) {
      action(evt, this);
    }
  }

  static create(row: IRow, column: IColumn, value: any): ICell {
    return observable(new CellModel()).initialize(row, column, value);
  }
}

export default CellModel.create;
