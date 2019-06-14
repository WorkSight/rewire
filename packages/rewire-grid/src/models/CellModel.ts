import * as React              from 'react';
import * as is                 from 'is';
import {isNullOrUndefined}     from 'rewire-common';
import {defaultEquals, freeze, DataSignal, property} from 'rewire-core';
import {IGrid,
  IColumn,
  ICell,
  IRow,
  IError,
  IErrorData,
  TextAlignment,
  VerticalAlignment,
  cloneValue
}                              from './GridTypes';
import * as deepEqual          from 'fast-deep-equal';
import { observable }          from 'rewire-core/dist/src';

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
  private _element     : DataSignal<HTMLTableDataCellElement | undefined>;

  id                   : number;
  row                  : IRow;
  column               : IColumn;
  grid                 : IGrid;
  rowSpan              : number;
  colSpan              : number;
  selected             : boolean;
  // _value               : any;
  error?               : IError;
  editing              : boolean;
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
    this._element              = property(undefined);
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
    this._element(element);
  }
  get element(): HTMLTableDataCellElement | undefined {
    return this._element();
  }

  get rowPosition(): number {
    return this.row.position;
  }

  get columnPosition(): number {
    return this.column.position;
  }

  _setValue(value?: any, triggerOnValueChangeHandler: boolean = true): boolean {
    if (is.object(this.value) && is.object(value)) {
      if (deepEqual(this.value, value)) return false;
      freeze(() => {
        Object.keys(this.value).forEach((key: string) => delete this.value[key]);
        Object.keys(value).forEach((key: string) => this.value[key] = undefined);
      });
      Object.assign(this.value, value);
    } else if (is.object(value)) {
      this.value = cloneValue(value);
    } else {
      if (defaultEquals(this.value, value)) return false;
      this.value = value;
    }

    triggerOnValueChangeHandler && this.onValueChange && this.onValueChange(this, value);
    return true;
  }

  setValue(value?: any, triggerOnValueChangeHandler: boolean = true): boolean {
    if (this._setValue(value, triggerOnValueChangeHandler)) {
      this.validate();

      if (this.column.fixed) {
        this.row.mergeFixedColumns();
      } else {
        this.row.mergeStandardColumns();
      }

      this.grid.changed = this.grid.hasChanges();
      return true;
    }
    return false;
  }

  clear() {
    if (this.readOnly || !this.enabled) {
      return;
    }

    this.setValue(undefined);
  }

  get value() {
    return (this.row.data) ? this.row.data && this.row.data[this.column.name] : undefined;
  }

  set value(value: any) {
    if (this.row.data) {
      this.row.data[this.column.name] = value;
      return;
    }
    return;
    // this._value = value;
  }

  hasChanges(): boolean {
    let prevVal = this.row.originalData[this.column.name];
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

  // reverts value without validation, onValueChange handler, or grid changed update
  _revert() {
    if (this.hasChanges()) {
      this._setValue(cloneValue(this.row.originalData[this.column.name]), false);
    }
  }

  revert() {
    if (this.hasChanges()) {
      this.setValue(cloneValue(this.row.originalData[this.column.name]), false);
    }
  }

  unselect() {
    this.selected              = false;
    this.isTopMostSelection    = false;
    this.isRightMostSelection  = false;
    this.isBottomMostSelection = false;
    this.isLeftMostSelection   = false;
  }

  findVerticallyNearestCellWithUnselectedRow(): ICell | undefined {
    let currCell: ICell                    = this;
    let newCellToSelect: ICell | undefined = this;
    do {
      currCell        = newCellToSelect;
      newCellToSelect = this.grid.adjacentBottomCell(currCell, true);
    } while (newCellToSelect && newCellToSelect.row.selected);
    if (!newCellToSelect) {
      currCell        = this;
      newCellToSelect = this;
      do {
        currCell        = newCellToSelect;
        newCellToSelect = this.grid.adjacentTopCell(currCell, true);
      } while (newCellToSelect && newCellToSelect.row.selected);
    }

    return newCellToSelect;
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
