import {IColumn, ICell} from '../models/GridTypes';
import * as React       from 'react';
import {Observe}        from 'rewire-core';

export interface IColumnCellProps {
  cell: ICell;
}

export default class Column extends React.PureComponent<IColumnCellProps> {
  startOffset : number;
  isResizing  : boolean;
  column      : IColumn;
  node        : HTMLTableHeaderCellElement;

  constructor(props: IColumnCellProps) {
    super(props);
    this.startOffset = 0;
    this.isResizing  = false;
    this.column      = this.props.cell.column;
  }

  handleMouseUp = (evt: MouseEvent) => {
    if (!this.node) return;
    this.isResizing = false;
    document.removeEventListener('mouseup', this.handleMouseMove, true);
    document.removeEventListener('mousemove', this.handleMouseMove, true);
    evt.preventDefault();
  }

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    if (!this.node) return;
    this.isResizing  = true;
    this.startOffset = this.node.offsetWidth - evt.pageX;
    document.addEventListener('mouseup', this.handleMouseUp, true);
    document.addEventListener('mousemove', this.handleMouseMove, true);
    evt.preventDefault();
    evt.stopPropagation();
  }

  handleMouseMove = (evt: MouseEvent) => {
    if (this.isResizing) {
      if (this.node.colSpan > 1) {
        let currColumn = this.column;
        let widthToSet = Math.max((this.startOffset + evt.pageX) / this.node.colSpan, 5);
        for (let i = 1; i <= this.node.colSpan; i++) {
          currColumn.width = `${widthToSet}px`;
          currColumn       = currColumn.grid.columnByPos(currColumn.position + 1);
        }
      } else {
        this.column.width = `${Math.max(this.startOffset + evt.pageX, 5)}px`;
      }
    }
    evt.preventDefault();
  }

  handleSort = (evt: React.MouseEvent<any>) => {
    if (evt.ctrlKey) {
      this.column.grid.addSort(this.column, (!this.column.sort || (this.column.sort === 'descending')) ? 'ascending' : 'descending');
    } else {
      this.column.grid.setSort(this.column, (!this.column.sort || (this.column.sort === 'descending')) ? 'ascending' : 'descending');
    }
    evt.preventDefault();
  }

  get value(): string {
    return this.props.cell.value;
  }

  setColumnRef = (element: HTMLTableHeaderCellElement) => {
    this.node = element as HTMLTableHeaderCellElement;
  }

  render() {
    return <Observe render={() => {
      let cls = '';
      let style: React.CSSProperties = {position: 'relative'};
      if (!this.column.visible) {
        style.display    = 'none';
        style.visibility = 'collapse';
      }

      if (!this.column.enabled) {
        style.color     = '#bbb';
        style.fontStyle = 'italic';
      }

      if (this.column.canSort && this.column.sort) {
        cls = 'sort ' + this.column.sort;
      }

      return (
        <th
          onMouseDown={this.column.canSort ? this.handleSort : undefined}
          colSpan={this.props.cell.colSpan}
          ref={this.setColumnRef}
          rowSpan={this.props.cell.rowSpan}
          style={style}
          title={this.column.tooltip || this.value}>
          <div className={cls} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {this.value}
            <div onMouseDown={this.handleMouseDown}
              style={{top: 0, right: 0, bottom: 0, width: '5px', position: 'absolute', cursor: 'col-resize'}}>
                &nbsp;
            </div>
          </div>
        </th>
      );
    }} />;
  }
}
