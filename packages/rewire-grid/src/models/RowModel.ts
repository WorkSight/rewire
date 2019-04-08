import {
  IGrid,
  IColumn,
  ICell,
  IRow,
  IRowOptions,
  ICellMap,
  ICellDataMap,
  IGroupRow,
  IRows,
  IErrorData,
  getValue,
  IDisposable,
  isGroupRow,
  cloneValue,
  allRows,
  IRowData,
}                              from './GridTypes';
import createCell, {CellModel} from './CellModel';
import * as nanoid             from 'nanoid';
import * as deepEqual          from 'fast-deep-equal';

const EmptyFn = () => {};

export class RowModel implements IRow, IDisposable {
  private _parentRow?        : IGroupRow;
  private _allowMergeColumns?: boolean;

  id                         : string;
  grid                       : IGrid;
  cells                      : ICellMap;
  originalData               : ICellDataMap;
  cellsByColumnPosition      : ICell[];
  selected                   : boolean;
  cls?                       : string;
  visible                    : boolean;
  fixed                      : boolean;
  position                   : number;
  onClick?(row: IRow, v: any): void;

  dispose: () => void = EmptyFn;

  static positionCompare(a: IRow, b: IRow): number {
    return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
  }

  constructor(grid: IGrid, data?: IRowData, position: number = 0) {
    this.grid               = grid;
    this.cells              = {};
    this.originalData       = {};
    this.selected           = false;
    this.position           = position;

    let options             = data && data.options;
    this._allowMergeColumns = options && options.allowMergeColumns;
    this.cls                = options && options.cls;
    this.visible            = options && options.visible !== undefined ? options.visible : true;
    this.fixed              = options && options.fixed !== undefined ? options.fixed : false;
    this.onClick            = options && options.onClick;

    if (data && data.id) {
      this.id = String(data.id);
    } else {
      this.id = nanoid(10);
    }

    for (const column of this.grid.columns) {
      this.createCell(column, data && data.data && data.data[column.name]);
    }

    this.cellsByColumnPosition = Object.values(this.cells) || [];
    this.cellsByColumnPosition.sort(CellModel.positionCompare);

    if (!this.grid.loading && !this.fixed && !isGroupRow(this)) {
      this.validate();
    }

    if (!this.grid.loading) {
      this.mergeAllColumns();
    }
  }

  set parentRow(groupRow: IGroupRow | undefined) {
    this._parentRow = groupRow;
    let visible     = true;
    let pRow        = groupRow;
    while (pRow !== undefined) {
      if (!pRow.expanded) {
        visible = false;
        break;
      }
      pRow = pRow.parentRow;
    }
    this.visible = visible;
  }
  get parentRow(): IGroupRow | undefined {
    return this._parentRow;
  }

  set allowMergeColumns(value: boolean) {
    this._allowMergeColumns = value;
  }
  get allowMergeColumns(): boolean {
    return this._allowMergeColumns !== undefined ? this._allowMergeColumns : this.grid.allowMergeColumns;
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
    if ((!this.fixed && !this.allowMergeColumns) || isGroupRow(this)) {
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

  hasChanges(): boolean {
    for (const column of this.grid.columns) {
      let cell = this.cells[column.name];
      if (!cell) continue;
      if (cell.hasChanges()) return true;
    }
    return false;
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
    let columnNamesToClear = columnsToClear.map((column: IColumn) => column.name);
    let rowData: {[columnName: string]: any} = {};
    columnNamesToClear.forEach((columnName: string) => {
      rowData[columnName] = undefined;
    });
    this.setValue(rowData);
  }

  _setValue(data: ICellDataMap, triggerOnValueChangeHandler: boolean = true): boolean {
    if (!data) return false;
    let success = false;
    Object.keys(data).forEach((columnName: string) => {
      let cell = this.cells[columnName];
      if (cell) {
        success = cell._setValue(data[columnName], triggerOnValueChangeHandler) || success;
      }
    });
    return success;
  }

  setValue(data: ICellDataMap, triggerOnValueChangeHandler: boolean = true): boolean {
    if (this._setValue(data, triggerOnValueChangeHandler)) {
      let columnNamesToSet = Object.keys(data).filter((columnName: string) => this.cells[columnName]);
      this.validate(columnNamesToSet);
      this.mergeAllColumns();
      this.grid.changed = this.grid.hasChanges();
      return true;
    }
    return false;
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
    let newRow = new RowModel(this.grid, {data: newCellValues, options: options}, this.position);
    return newRow;
  }

  validate(columnNames?: string[]): void {
    if (this.fixed) return;

    // only need to validate cells once, so filter accordingly. (Does not call cell.validate because of validation overlap with linked cells).
    let columnsToValidate = columnNames ? this.grid.columns.filter((column: IColumn) => !!column.validator && columnNames.includes(column.name)) : this.grid.columns.filter((column: IColumn) => !!column.validator);
    if (columnNames) {
      let linkedColumnNames   = [...new Set(columnsToValidate.reduce((columnNames: string[], column: IColumn) => columnNames.concat(column.validator!.linkedColumnNames), []))];
      let combinedColumnNames = [...new Set(columnNames.concat(linkedColumnNames))];
      columnsToValidate       = this.grid.columns.filter((column: IColumn) => !!column.validator && combinedColumnNames.includes(column.name));
    }

    columnsToValidate.forEach((column: IColumn) => {
      let cell   = this.cells[column.name];
      cell.error = column.validator!.fn(this, cell.value);
    });

    this.grid.inError = this.grid.hasErrors();
  }

  private _revertHelper(): ICellDataMap {
    let rowValue: ICellDataMap = {};
    for (const column of this.grid.columns) {
      let cell = this.cells[column.name];
      if (cell.hasChanges()) { // maybe don't need
        rowValue[column.name] = cloneValue(this.originalData[column.name]);
      }
    }
    return rowValue;
  }

  // reverts value without validation or grid changed update
  _revert() {
    this._setValue(this._revertHelper(), false);
  }

  revert() {
    this.setValue(this._revertHelper(), false);
  }
}

function find(rows: IRows, column: IColumn, data?: ICellDataMap): IGroupRow | undefined {
  let value = getValue(data, column);
  for (const r of rows.rows) {
    if (value === getValue(r, column)) {
      return r as IGroupRow;
    }
  }
  return undefined;
}

export default function create(grid: IGrid, rows: IRow[], data?: IRowData, position?: number): IRow {
  let options = data && data.options;
  let fixed   = options && options.fixed !== undefined ? options.fixed : false;
  let rowPos  = (position !== undefined) ? Math.max(Math.min(position, grid.dataRowsByPosition.length), 0) : (fixed ? rows.length : undefined);

  if (grid.groupBy.length > 0 && !fixed) {
    let root:   IGroupRow;
    let parent: any = grid;
    let level = 0;
    for (const column of grid.groupBy) {
      let r = find(parent, column, data && data.data);
      if (!r) {
        r = new GroupModel(grid, column, level, data);
        if (isGroupRow(parent)) {
          r.parentRow = parent;
        }
        parent.rows.push(r);
      }

      if (level === 0) root = r;
      level++;
      parent = r;
    }

    if (rowPos === undefined) {
      if (parent.rows.length > 0) {
        rowPos = parent.rows[0].position;
      } else {
        rowPos = 0;
        for (const row of allRows(rows)) {
          if (row.row.id === parent.id) break;
          if (!isGroupRow(row.row)) rowPos++;
        }
      }
    }
    let newRow       = new RowModel(grid, data, rowPos);
    newRow.parentRow = parent as IGroupRow;
    let insertIdx    = parent.rows.findIndex((row: IRow) => row.position === newRow.position - 1) + 1;
    parent.rows.splice(insertIdx, 0, newRow);
    grid.dataRowsByPosition.splice(newRow.position, 0, newRow);
    return newRow;
  }

  let r = new RowModel(grid, data, rowPos);
  rows.splice(r.position, 0, r);
  if (fixed) {
    grid.mergeFixedRows();
  } else {
    grid.dataRowsByPosition.splice(r.position, 0, r);
  }
  return r;
}

export class GroupModel extends RowModel implements IGroupRow {
  rows    : IRow[]  = [];
  expanded: boolean = true;

  constructor(grid: IGrid, public column: IColumn, public level: number, data?: IRowData) {
    super(grid, data);
    this.id = nanoid(10);
  }
}