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
  getValue,
  IDisposable,
  isGroupRow,
}                              from './GridTypes';
import createCell, {CellModel} from './CellModel';
import {observable,
  observe,
  root
} from 'rewire-core';
import * as nanoid  from 'nanoid';

const EmptyFn = () => {};

export class RowModel implements IRow, IDisposable {
  private _parentRow?  : IGroupRow;

  id                   : string;
  grid                 : IGrid;
  cells                : ICellMap;
  data                 : ICellDataMap;
  cellsByColumnPosition: ICell[];
  selected             : boolean;
  cls                  : string;
  visible              : boolean;
  options              : IRowOptions;
  isFixed              : boolean;
  position             : number;

  dispose: () => void = EmptyFn;

  static positionCompare(a: IRow, b: IRow): number {
    return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
  }

  constructor(grid: IGrid, public data: any, position: number = 0, fixed: boolean = false) {
    this.grid     = grid;
    this.cells    = {};
    this.data     = {};
    this.selected = false;
    this.cls      = '';
    this.visible  = true;
    this.position = position;
    this.options  = data && data.options;
    this.isFixed  = fixed;

    if (data && data.id) {
      this.id = String(data.id);
    } else {
      this.id = nanoid(10);
    }

    if (!data) {
      return;
    }

    for (const column of this.grid.columns) {
      this.createCell(column, data[column.name]);
    }

    this.cellsByColumnPosition = Object.values(this.cells) || [];
    this.cellsByColumnPosition.sort(CellModel.positionCompare);

    root((dispose) => {
      this.dispose = dispose;
      if (fixed || (this.options && this.options.allowMergeColumns)) {
        observe(this.mergeColumns);
      }
    });
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

  createCell(column: IColumn, value: any): ICell {
    return this.cells[column.name] = createCell(this, column, value);
  }

  mergeColumns = () => {
    let previousValue: any;
    let previousCell: ICell | undefined;
    let colSpan = 1;
    for (const column of this.grid.dataColumns) {
      if (!column.visible) {
        continue;
      }

      let cell = this.cells[column.name];
      if (previousCell && cell && (previousValue === cell.value) && ((previousCell.row.isFixed && cell.row.isFixed) || (previousCell.column.type === cell.column.type))) {
        colSpan++;
        cell.colSpan = 0;
        continue;
      }
      if (previousCell) {
        previousCell.colSpan = colSpan;
      }

      colSpan       = 1;
      previousCell  = cell;
      previousValue = cell.value;
    }

    if (previousCell) {
      previousCell.colSpan = colSpan;
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
}

function find(rows: IRows, column: IColumn, row: any): IGroupRow | undefined {
  let value = getValue(row, column);
  for (const r of rows.rows) {
    if (value === getValue(r, column)) {
      return r as IGroupRow;
    }
  }
  return undefined;
}

export default function create(grid: IGrid, rows: IRow[], row: any, fixed: boolean = false): IRow {
  let position = rows.length;

  if (grid.groupBy.length > 0 && !fixed) {
    let root:   IGroupRow;
    let parent: IRows = grid;
    let level = 0;
    for (const column of grid.groupBy) {
      let r = find(parent, column, row);
      if (!r) {
        r = new GroupModel(grid, row, column, level);
        if (isGroupRow(parent)) {
          r.parentRow = parent;
        }
        parent.rows.push(r);
      }

      if (level === 0) root = r;
      level++;
      parent = r;
    }

    let newRow       = new RowModel(grid, row, undefined, fixed);
    newRow.parentRow = parent as IGroupRow;
    parent.rows.push(newRow);
    grid.dataRowsByPosition.push(newRow);
    return root!;
  }

  let r = new RowModel(grid, row, position, fixed);
  rows.push(r);
  if (!fixed) {
    grid.dataRowsByPosition.push(r);
  }
  return r;
}

export class GroupModel extends RowModel implements IGroupRow {
  rows    : IRow[]  = [];
  expanded: boolean = true;

  constructor(grid: IGrid, data: any, public column: IColumn, public level: number) {
    super(grid, data);
  }
}