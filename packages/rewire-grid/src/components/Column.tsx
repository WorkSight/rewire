import {IColumn, ICell}                   from '../models/GridTypes';
import * as React                         from 'react';
import {Observe, disposeOnUnmount, watch} from 'rewire-core';

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

    disposeOnUnmount(this, () => {
      watch(() => this.column.visible, () => {
        this.column.grid.setColumnPositions();
        this.column.grid.mergeColumns();
      });
    });
  }

  handleMouseUp = (evt: MouseEvent) => {
    if (!this.node) return;
    this.isResizing = false;
    document.removeEventListener('mouseup', this.handleMouseUp, true);
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
  }

  handleMouseMove = (evt: MouseEvent) => {
    // Known bug with resizing columns when the set widths of the columns is less than the width of the grid (due to it stretching to fill the screen) i.e. no horizontal scrollbar.
    // In this case, the resize will cause the column to initially grow larger. No known fix at this point.
    if (this.isResizing) {
      if (this.node.colSpan > 1) {
        let currColumn = this.column;
        let widthToSet = Math.max((this.startOffset + evt.pageX) / this.node.colSpan, 5);
        for (let i = 1; i <= this.node.colSpan; i++) {
          // let cellWidth    = currColumn.grid.dataRowsByPosition[0].cells[currColumn.name].element.offsetWidth;
          // widthToSet       = currColumn.width ? widthToSet - (cellWidth - currColumn.width.slice().replace(new RegExp(/px/, 'g'), '')) : widthToSet;
          // widthToSet       = currColumn.width ? cellWidth + (widthToSet - currColumn.width.slice().replace(new RegExp(/px/, 'g'), '')) : widthToSet;
          currColumn.width = `${widthToSet}px`;
          currColumn       = (currColumn.grid as any).adjacentRightColumn(currColumn)!;
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
