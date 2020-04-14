import * as React            from 'react';
import classNames            from 'classnames';
import {
  DragSource,
  DropTarget,
}                            from 'react-dnd';
import * as lodash           from 'lodash';
import {Observe}             from 'rewire-core';
import {
  WithStyle,
  withStyles,
}                            from 'rewire-ui';
import {
  IRow,
  IGrid,
}                            from '../models/GridTypes';
import DragAndDrop           from './DragAndDrop';
import Icon                  from '@material-ui/core/Icon';
import ReorderIcon           from '@material-ui/icons/Reorder';
import ArrowDownwardIcon     from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon       from '@material-ui/icons/ArrowUpward';
import {Theme}               from '@material-ui/core/styles';

const cellSource = {
  beginDrag(props: any, monitor: any, component: any) {
    const item = {row: props.row as IRow, groupId: props.groupId};
    return item;
  },
  endDrag(props: any, monitor: any, component: any) {
    if (!monitor.didDrop()) {
      return;
    }

    const dropResult                         = monitor.getDropResult();
    const {dropEffect, sourceRow, targetRow} = dropResult;

    if (sourceRow.id === targetRow.id) {
      return;
    }

    const grid = sourceRow.grid as IGrid;
    if (dropEffect === 'move') {
      if (props.canMoveRow && !props.canMoveRow(sourceRow)) {
        return;
      }
      let byRows = targetRow.position - sourceRow.position;
      grid.moveRow(sourceRow.id, byRows);
      props.onMoveRow && props.onMoveRow(sourceRow, byRows);
    } else {
      grid.swapRows(sourceRow.id, targetRow.id);
      props.onSwapRow && props.onSwapRow(sourceRow, targetRow);
    }
  },
};

function sourceCollect(connect: any, monitor: any) {
  return {
    connectDragSource:  connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging:         monitor.isDragging(),
  };
}

const cellTarget = {
  drop(props: any, monitor: any, component: any) {
    const sourceItem = monitor.getItem();
    const sourceRow  = sourceItem.row as IRow;
    const targetRow  = props.row as IRow;
    return ({
      sourceRow,
      targetRow,
    });
  },

  canDrop(props: any, monitor: any) {
    const sourceItem = monitor.getItem();
    const sourceRow  = sourceItem.row as IRow;
    const targetRow  = props.row as IRow;

    if (props.groupId !== sourceItem.groupId) {
      return false;
    }

    return props.canDropRow ? props.canDropRow(sourceRow, targetRow) : true;
  }
};

function targetCollect(connect: any, monitor: any) {
  return {
    connectDropTarget:    connect.dropTarget(),
    highlighted:          monitor.canDrop(),
    hoveredWhileDragging: monitor.canDrop() && monitor.isOver(),
    draggedItem:          monitor.getItem(),
  };
}

const reorderableGridRowsCellStyles = (theme: Theme) => ({
  icon: {
    cursor: 'inherit',
  },
  cell: {
    padding: '0px !important',
    height: 'inherit',
    color: '#0002',
    cursor: 'default',
    '&:focus': {
      outline: 0,
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
  iconContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellScrollAnchorRef: {
    position: 'absolute',
    top: -100,
    left: 0,
  },
  cellHover: {
    cursor: 'grab',
    '&:hover': {
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
  isDragging: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  highlighted: {
  },
  hoveredWhileDragging: {
    background: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
});

export interface IReorderableGridRowsCellProps {
  classes?                 : React.CSSProperties;
  row                      : IRow;
  groupId?                 : string;
  isGridMouseCellSelecting : boolean;
  isDragging?              : boolean;
  highlighted?             : boolean;
  hoveredWhileDragging?    : boolean;
  draggedItem?             : {row: IRow, groupId?: string};
  connectDragSource?       : any;
  connectDragPreview?      : any;
  connectDropTarget?       : any;
  onMoveRow?               : (row: IRow, byRows: number) => void;
  onSwapRow?               : (sourceRow: IRow, targetRow: IRow) => void;
  canMoveRow?              : (row: IRow) => boolean;
  canDropRow?              : (sourceRow: IRow, targetRow: IRow) => boolean;
}

type ReorderableGridRowsCellProps = WithStyle<ReturnType<typeof reorderableGridRowsCellStyles>, IReorderableGridRowsCellProps>;

export const ReorderableGridRowsCell = lodash.flow([DragSource('reorderableGridRowsCell', cellSource, sourceCollect), DropTarget('reorderableGridRowsCell', cellTarget, targetCollect)])(withStyles(reorderableGridRowsCellStyles, class extends React.PureComponent<ReorderableGridRowsCellProps> {
  cellRef: React.RefObject<HTMLTableCellElement>;
  cellScrollAnchorRef: React.RefObject<HTMLDivElement>;

  constructor(props: ReorderableGridRowsCellProps) {
    super(props);

    this.cellRef             = React.createRef();
    this.cellScrollAnchorRef = React.createRef();
  }

  handleFocus = (evt: React.FocusEvent<any>) => {
    evt.stopPropagation();
    this.props.row.grid.clearSelection();
    this.props.row.grid.selectRows([this.props.row]);
  }

  handleBlur = (evt: React.FocusEvent<any>) => {
    evt.stopPropagation();
    if (!this.props.row.grid.selectedCells.length) {
      this.props.row.grid.selectRows([]);
    }
  }

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    evt.stopPropagation();
    this.props.row.grid.isReorderingMouseDown = true;
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    evt.stopPropagation();
    evt.preventDefault();

    if (this.props.canMoveRow && !this.props.canMoveRow(this.props.row)) {
      return;
    }

    switch(evt.key) {
      case 'ArrowUp':
        if (this.props.row.grid.moveRow(this.props.row.id, -1)) {
          this.props.onMoveRow && this.props.onMoveRow(this.props.row, -1);
          this.cellRef.current?.focus();
        }
        break;

      case 'ArrowDown':
        if (this.props.row.grid.moveRow(this.props.row.id, 1)) {
          this.props.onMoveRow && this.props.onMoveRow(this.props.row, 1);
          this.cellScrollAnchorRef.current?.scrollIntoView();
        }
        break;

      case 'Escape':
        this.cellRef.current?.blur();
        this.props.row.grid.clearSelection();
        break;
    }
  }

  render() {
    const {classes, isGridMouseCellSelecting, isDragging, highlighted, hoveredWhileDragging, draggedItem, connectDragSource, connectDragPreview, connectDropTarget} = this.props;
    let cellClasses = [classes.cell];

    if (isDragging) {
      cellClasses.push(classes.isDragging);
    } else if (highlighted) {
      cellClasses.push(classes.highlighted);
      if (hoveredWhileDragging) {
        cellClasses.push(classes.hoveredWhileDragging);
      }
    } else if (!isGridMouseCellSelecting && !draggedItem) {
      cellClasses.push(classes.cellHover);
    }

    let CellIcon = <ReorderIcon />;
    if (hoveredWhileDragging && draggedItem && draggedItem.row.id !== this.props.row.id) {
      if (draggedItem.row.position < this.props.row.position) {
        CellIcon = <ArrowDownwardIcon />;
      } else {
        CellIcon = <ArrowUpwardIcon />;
      }
    }


    return <Observe render={() => (
      connectDropTarget(connectDragSource(
        <td
          tabIndex={-1}
          colSpan={1}
          rowSpan={1}
          className={classNames(...cellClasses)}
          ref={this.cellRef}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onMouseDown={this.handleMouseDown}
          onKeyDown={this.handleKeyDown}
        >
          <div className={classes.iconContainer}>
            <Icon className={classes.icon}>{CellIcon}</Icon>
            <div ref={this.cellScrollAnchorRef} className={classes.cellScrollAnchorRef} />
          </div>
        </td>
      ))
    )} />;
  }
}));

export interface IReorderableGridRowsProps {
}

class ReorderableGridRows extends React.PureComponent<IReorderableGridRowsProps> {
  render() {
    return (
      <DragAndDrop>
        {this.props.children}
      </DragAndDrop>
    );
  }
}

export default ReorderableGridRows;
