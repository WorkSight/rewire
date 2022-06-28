import React                 from 'react';
import is                    from 'is';
import classNames                 from 'classnames';
import {IColumn, ICell}           from '../models/GridTypes';
import { Theme }                  from '@material-ui/core/styles';
import {isNullOrUndefinedOrEmpty} from 'rewire-common';
import {Observe}                  from 'rewire-core';
import {
  withStyles,
  WithStyle,
}                                 from 'rewire-ui';

const styles = (theme: Theme) => ({
  root: {
    position: 'relative',
  },
  hidden: {
    display: 'none',
    visibility: 'collapse',
  },
  disabled: {
    color: '#bbb',
    fontStyle: 'italic',
  },
  rendererContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mouseDownContainer: {
    top: 0,
    right: 0,
    bottom: 0,
    width: '5px',
    position: 'absolute',
    cursor: 'col-resize',
  },
});

export type ColumnCellStyles = ReturnType<typeof styles>;

export interface IColumnCellProps {
  cell: ICell;
}

export type ColumnCellProps = WithStyle<ColumnCellStyles, IColumnCellProps>;

class ColumnCell extends React.PureComponent<ColumnCellProps> {
  startOffset : number;
  isResizing  : boolean;
  column      : IColumn;
  node        : HTMLTableHeaderCellElement;

  constructor(props: ColumnCellProps) {
    super(props);
    this.startOffset = 0;
    this.isResizing  = false;
    this.column      = this.props.cell.column;
  }

  handleMouseUp = (evt: MouseEvent) => {
    if (!this.node) return;
    this.isResizing = false;
    document.removeEventListener('mouseup', this.handleMouseUp, true);
    document.removeEventListener('mousemove', this.handleMouseMove, true);
    evt.stopPropagation();
    evt.preventDefault();
  }

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    if (!this.node) return;
    this.isResizing  = true;
    this.startOffset = this.node.offsetWidth - evt.pageX;
    document.addEventListener('mouseup', this.handleMouseUp, true);
    document.addEventListener('mousemove', this.handleMouseMove, true);
    evt.stopPropagation();
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
    const { classes } = this.props;

    return <Observe render={() => {
      let cls = '';
      let columnCellClasses = classes.root;
      if (!this.column.visible) {
        columnCellClasses = classNames(columnCellClasses, classes.hidden);
      }

      if (!this.column.enabled) {
        columnCellClasses = classNames(columnCellClasses, classes.disabled);
      }

      if (this.column.canSort && this.column.sort) {
        cls = 'sort ' + this.column.sort;
      }

      const value          = !isNullOrUndefinedOrEmpty(this.value) ? this.value : <span>&nbsp;</span>;
      const ColumnRenderer = this.column.headerRenderer;
      const tooltip        = !this.column.tooltip ? this.value : is.function(this.column.tooltip) ? (this.column.tooltip as CallableFunction)() : this.column.tooltip;

      return (
        <th
          onMouseDown={this.column.canSort ? this.handleSort : undefined}
          colSpan={this.props.cell.colSpan}
          ref={this.setColumnRef}
          rowSpan={this.props.cell.rowSpan}
          className={columnCellClasses}
          title={tooltip}>
          <div className={classNames(classes.rendererContainer, cls)}>
            {ColumnRenderer
              ? <ColumnRenderer cell={this.props.cell} />
              : value
            }
            <div className={classes.mouseDownContainer} onMouseDown={this.handleMouseDown}>
              &nbsp;
            </div>
          </div>
        </th>
      );
    }} />;
  }
}

export default withStyles(styles, ColumnCell);
