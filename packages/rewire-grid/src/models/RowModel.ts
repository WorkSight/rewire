import {
  IGrid,
  IColumn,
  ICell,
  IRow,
  IRowOptions,
  ICellMap,
  IErrorData,
  IDisposable,
  cloneValue,
  IRowData
}                                     from './GridTypes';
import {isNullOrUndefined}            from 'rewire-common';
import createCell                     from './CellModel';
import * as nanoid                    from 'nanoid';
import * as deepEqual                 from 'fast-deep-equal';
import { observable }                 from 'rewire-core';
import { IValidationContext, IError } from 'rewire-ui';

const EmptyFn = () => {};

export class RowModel implements IRow, IDisposable, IValidationContext {
  private _allowMergeColumns?: boolean;
  id                    : string;
  grid                  : IGrid;
  cells                 : ICellMap;
  selected              : boolean;
  height                : number;
  cls?                  : string;
  data                  : any;
  visible               : boolean;
  fixed                 : boolean;
  position              : number;
  dispose               : () => void = EmptyFn;
  onClick?(row: IRow): void;

  static positionCompare(a: IRow, b: IRow): number {
    return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
  }

  protected constructor() { }
  protected initialize(grid: IGrid, data?: IRowData, position: number = 0) {
    this.grid               = grid;
    this.height             = 28; // default value
    this.cells              = {};
    this.selected           = false;
    this.position           = position;
    this.data               = data && data.data;

    let options             = data && data.options;
    this._allowMergeColumns = options && options.allowMergeColumns;
    this.cls                = options && options.cls;
    this.visible            = options && !isNullOrUndefined(options.visible) ? options.visible! : true;
    this.fixed              = options && !isNullOrUndefined(options.fixed) ? options.fixed! : false;
    this.onClick            = options && options.onClick;

    if (data && data.id) {
      this.id = String(data.id);
    } else {
      this.id = nanoid(10);
    }

    for (const column of this.grid.columns) {
      this.createCell(column, data && data.data && data.data[column.name]);
    }

    if (!this.grid.loading && !this.fixed) {
      this.validate();
    }

    if (!this.grid.loading) {
      this.mergeAllColumns();
    }

    return this;
  }

  validate() {
    if (!this.fixed && this.grid.isRowCompleteFn(this)) this.grid.validator.validate(this);
  }

  set allowMergeColumns(value: boolean) {
    this._allowMergeColumns = value;
  }
  get allowMergeColumns(): boolean {
    return !isNullOrUndefined(this._allowMergeColumns) ? this._allowMergeColumns! : this.grid.allowMergeColumns;
  }

  get options(): IRowOptions {
    return {
      allowMergeColumns: this.allowMergeColumns,
      cls: this.cls,
      visible: this.visible,
      fixed: this.fixed,
      onClick: this.onClick,
    };
  }

  // IValidationContext
  getField(field: string) {
    const cell = this.cells[field];
    return {label: cell.column.title, value: this.data[field]};
  }

  // IValidationContext
  setError(field: string, error?: IError): void {
    this.cells[field].error = error;
    if (this.grid.onError) this.grid.onError(this, field, error);
  }

  createCell(column: IColumn, value: any): ICell {
    return this.cells[column.name] = createCell(this, column, value);
  }

  mergeAllColumns() {
    this.mergeFixedColumns();
    this.mergeStandardColumns();
  }

  mergeFixedColumns() {
    this.mergeColumns(this.grid.fixedColumns);
  }

  mergeStandardColumns() {
    this.mergeColumns(this.grid.standardColumns);
  }

  private mergeColumns(columns: IColumn[]) {
    if (!this.fixed && !this.allowMergeColumns) {
      return;
    }

    let previousValue: any;
    let previousCell: ICell | undefined;
    let colSpan                        = 1;
    let isSelected                     = false;
    let isFocused                      = false;
    let focusedCell: ICell | undefined = this.grid.focusedCell;
    let cellToFocus: ICell | undefined = undefined;
    let cellsToSelect: ICell[]         = [];
    for (const column of columns) {
      if (!column.visible) {
        continue;
      }

      let cell = this.cells[column.name];
      if (previousCell && cell && previousCell.enabled === cell.enabled && ((previousCell.row.fixed && cell.row.fixed) || (previousCell.readOnly === cell.readOnly && previousCell.editable === cell.editable &&
          !previousCell.error && !cell.error && previousCell.column.type === cell.column.type)) && deepEqual(previousValue, cell.value)) {
        colSpan++;
        cell.colSpan = 0;
        if (cell.selected) {
          isSelected = true;
        }
        if (focusedCell === cell) {
          isFocused = true;
        }
        continue;
      }
      if (previousCell) {
        previousCell.colSpan = colSpan;
        if (isSelected) {
          cellsToSelect.push(previousCell);
          isSelected = false;
        }
        if (isFocused) {
          cellToFocus = previousCell;
          isFocused   = false;
        }
      }

      colSpan       = 1;
      previousCell  = cell;
      previousValue = cell.value;
    }

    if (previousCell) {
      previousCell.colSpan = colSpan;
      if (isSelected) {
        cellsToSelect.push(previousCell);
      }
      if (isFocused) {
        cellToFocus = previousCell;
      }
    }

    if (cellsToSelect.length <= 0) {
      return;
    }

    cellsToSelect = cellsToSelect.filter(cell => !this.grid.selectedCells.includes(cell));
    if (cellsToSelect.length > 0) {
      setTimeout(() => this.grid.selectCells(cellsToSelect, focusedCell, true, true), 0);
    } else {
      setTimeout(() => {
        this.grid.selectCells(this.grid.selectedCells, cellToFocus);
      }, 0);
    }
  }

  hasErrors(): boolean {
    for (const column of this.grid.columns) {
      let cell = this.cells[column.name];
      if (!cell) continue;
      if (cell.hasErrors()) return true;
    }
    return false;
  }

  getErrors(): IErrorData[] {
    let errors: IErrorData[] = [];

    for (const column of this.grid.columns) {
      let cell = this.cells[column.name];
      if (!cell) continue;
      errors.concat(cell.getErrors());
    }
    return errors;
  }

  clear(columnNames?: string[]) {
    let columnsToClear     = columnNames ? this.grid.columns.filter((column: IColumn) => columnNames.includes(column.name)) : this.grid.columns;
    columnsToClear.forEach(c => this.cells[c.name].clear());
  }

  clone(): IRow {
    let newCellValues: ICellMap = {};
    for (const column of this.grid.columns) {
      let cell = this.cells[column.name];
      if (!cell) continue;
      newCellValues[column.name] = cloneValue(cell.value);
    }
    let options: IRowOptions = {
      cls: this.cls,
      visible: this.visible,
      fixed: this.fixed,
      allowMergeColumns: this._allowMergeColumns,
    };
    let newRow = RowModel.create(this.grid, {data: newCellValues, options: options}, this.position);
    return newRow;
  }

  static create(grid: IGrid, data?: IRowData, position: number = 0) {
    return observable(new RowModel()).initialize(grid, data, position);
  }
}

export default function create(grid: IGrid, rows: IRow[], data?: IRowData, position?: number): IRow {
  let options = data && data.options;
  let fixed   = options && !isNullOrUndefined(options.fixed) ? options.fixed! : false;
  let rowPos  = !isNullOrUndefined(position) ? Math.max(Math.min(position!, grid.rows.length), 0) : (fixed ? rows.length : undefined);
  let r       = RowModel.create(grid, data, !isNullOrUndefined(rowPos) ? rowPos : grid.rows.length);
  rows.splice(r.position, 0, r);
  if (fixed) {
    grid.mergeFixedRows();
  }
  return r;
}
