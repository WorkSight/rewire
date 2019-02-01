import {
  IGrid,
  IRow,
  IColumn,
  ICell,
  ErrorSeverity,
}                                                  from '../models/GridTypes';
import * as React                                  from 'react';
import * as is                                     from 'is';
import cc                                          from 'classcat';
import classNames                                  from 'classnames';
import {Observe, watch, observe, disposeOnUnmount} from 'rewire-core';
import {withStyles, WithStyle}                     from 'rewire-ui';
import {Theme}                                     from '@material-ui/core/styles';
import ErrorIcon                                   from '@material-ui/icons/Error';
import WarningIcon                                 from '@material-ui/icons/Warning';
import InfoIcon                                    from '@material-ui/icons/Info';
import Tooltip                                     from '@material-ui/core/Tooltip';
import Fade                                        from '@material-ui/core/Fade';

const styles = (theme: Theme) => ({
  tableCell: {
    position: 'relative !important',
    overflow: 'hidden !important',
    padding: '0px !important',
  },
  tableCellNotVisible: {
    display: 'none !important',
  },
  tableCellNotEnabled: {
    color: 'gray !important',
    fontStyle: 'italic !important',
  },
  tableCellEditing: {
    borderTopColor: 'transparent !important',
    borderRightColor: `${theme.palette.rowSelectedBorder.main} !important`,
    borderBottomColor: `${theme.palette.rowSelectedBorder.main} !important`,
    borderLeftColor: 'transparent !important',
  },
  cellContainer: {
    display: 'flex',
    flex: '1',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
  },
  cellInnerContainer: {
    overflow: 'hidden',
    flex: '1',
    height: '100%',
    alignItems: 'center',
    padding: '4px',
    margin: 0,
    display: 'flex',
    width: '100%',
  },
  cellInnerContainerEditing: {
    padding: '0px 0px 0px 1px',
  },
  tooltipPopper: {
    // marginLeft: '-8px',
  },
  tooltip: {
    fontSize: `calc(${theme.fontSizes.body} * 0.8)`,
    padding: `calc(${theme.fontSizes.body} * 0.25) calc(${theme.fontSizes.body} * 0.5)`,
  },
  errorContainer: {
    display: 'flex',
    height: '100%',
    marginLeft: '0.3125em',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: '1.125em',
  },
  info: {
    color: '#1A51A8',
  },
  warning: {
    color: '#DD9719',
  },
  error: {
    color: '#AA0000',
  },
  critical: {
    color: '#AA0000',
  },
  editorContainer: {
    display: 'flex',
    flex: '1',
  },
  editorSelectSelect: {
    padding: '0px 3px',
  },
  editorSelectInputRoot: {
    alignItems: 'stretch',
  },
  editorInputRoot: {
    flex: '1',
  },
  editorFormControlRoot: {
    flex: '1',
    flexDirection: 'row',
  },
  editorAutoCompleteContainer: {
    display: 'flex',
  },
  editorCheckboxRoot: {
    height: '100%',
    flex: '1',
  },
});

export interface ICellProps {
  cell: ICell;
}

type CellProps = WithStyle<ReturnType<typeof styles>, ICellProps>;

class Cell extends React.PureComponent<CellProps, {}> {
  cell: ICell;
  row: IRow;
  column: IColumn;
  grid: IGrid;
  keyForEdit?: string;

  constructor(props: CellProps) {
    super(props);
    this.cell       = props.cell;
    this.row        = this.cell.row;
    this.column     = this.cell.column;
    this.grid       = this.cell.grid;
    this.keyForEdit = undefined;
  }

  handleDoubleClick = (evt: React.MouseEvent<any>) => {
    if (!this.cell.enabled || this.cell.readOnly || !this.cell.editable || this.column.fixed || evt.ctrlKey || evt.shiftKey || !this.column.editor) {
      return;
    }

    this.keyForEdit = undefined;
    this.grid.editCell(this.cell);
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.keyCode === 67) { evt.key = 'C'; }
    if (evt.keyCode === 68) { evt.key = 'D'; }
    if (evt.keyCode === 82) { evt.key = 'R'; }
    if (evt.keyCode === 85) { evt.key = 'U'; }
    if (evt.keyCode === 86) { evt.key = 'V'; }
    if (evt.keyCode === 88) { evt.key = 'X'; }
    switch (evt.key) {
      case 'R':
        if (this.cell.editing || !evt.ctrlKey) {
          return;
        }
        this.grid.revertSelectedCells();
        break;
      case 'U':
        if (this.cell.editing || !evt.ctrlKey) {
          return;
        }
        this.grid.revertSelectedRows();
        break;
      case 'C':
        if (this.cell.editing || !evt.ctrlKey) {
          return;
        }
        this.grid.copy();
        break;
      case 'X':
        if (this.cell.editing || !evt.ctrlKey) {
          return;
        }
        this.grid.copy();
        this.grid.selectedCells.forEach(cell => cell.clear());
        break;
      case 'V':
        if (this.cell.editing || !evt.ctrlKey) {
          return;
        }
        this.grid.paste();
        break;
      case 'Escape':
        if (this.cell.editing) {
          this.grid.editCell(undefined);
          setTimeout(() => {
            this.cell.setFocus();
          }, 0);
        } else {
          this.grid.selectCells([]);
          this.cell.setFocus(false);
        }
        break;

      case 'Insert':
        if (this.cell.editing || !evt.ctrlKey) {
          return;
        }
        // insert row
        this.grid.insertRowAtSelection();
        break;

        if (this.cell.editing || !evt.ctrlKey) {
      case 'D':
          return;
        }
        // duplcate row(s)
        this.grid.duplicateSelectedRows();
        break;

      case 'Delete':
        if (this.cell.editing) {
          return;
        }
        if (evt.ctrlKey) {
          // delete row(s)
          this.grid.removeSelectedRows();
          break;
        }
        this.grid.selectedCells.forEach(cell => cell.clear());
        break;

      case 'Enter':
        if (this.column.type === 'multiselect') {
          break;
        }
        this.grid.editCell(undefined);
        this.cell.setFocus();
        break;

      case 'F2':
        if (this.cell.enabled && !this.cell.readOnly && this.cell.editable && this.column.editor) {
          this.keyForEdit = undefined;
          this.grid.editCell(this.cell);
        }
        break;

      case 'ArrowUp':
        let upCell = this.grid.adjacentTopCell(this.cell, true);
        if (!upCell) {
          break;
        }
        if (!evt.shiftKey || !this.grid.multiSelect) {
          this.grid.startCell = upCell;
          this.grid.selectCells([upCell]);
        } else {
          // keyboard multi-select using shift key
          if (!this.grid.startCell) {
            this.grid.startCell = this.cell;
          }
          this.grid.selectCellsTo(upCell);
        }
        break;

      case 'ArrowDown':
        let downCell = this.grid.adjacentBottomCell(this.cell, true);
        if (!downCell) {
          break;
        }
        if (!evt.shiftKey || !this.grid.multiSelect) {
          this.grid.startCell = downCell;
          this.grid.selectCells([downCell]);
        } else {
          // keyboard multi-select using shift key
          if (!this.grid.startCell) {
            this.grid.startCell = this.cell;
          }
          this.grid.selectCellsTo(downCell);
        }
        break;

      case 'ArrowLeft':
        if (this.cell.editing) {
          evt.stopPropagation();
          if (this.column.type === 'select' || this.column.type === 'multiselect' || this.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }

        let prevCell: ICell | undefined;
        if (!evt.shiftKey || !this.grid.multiSelect) {
          prevCell = this.grid.previousCell(this.cell, true);
          if (!prevCell) {
            break;
          }
          this.grid.startCell = prevCell;
          this.grid.selectCells([prevCell]);
        } else {
          // keyboard multi-select using shift key
          prevCell = this.grid.adjacentLeftCell(this.cell, true);
          if (!prevCell) {
            break;
          }
          if (!this.grid.startCell) {
            this.grid.startCell = this.cell;
          }
          this.grid.selectCellsTo(prevCell);
        }
        break;

      case 'ArrowRight':
        if (this.cell.editing) {
          evt.stopPropagation();
          if (this.column.type === 'select' || this.column.type === 'multiselect' || this.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }

        let nextCell: ICell | undefined;
        if (!evt.shiftKey || !this.grid.multiSelect) {
          nextCell = this.grid.nextCell(this.cell, true);
          if (!nextCell) {
            break;
          }
          this.grid.startCell = nextCell;
          this.grid.selectCells([nextCell]);
        } else {
          // keyboard multi-select using shift key
          nextCell = this.grid.adjacentRightCell(this.cell, true);
          if (!nextCell) {
            break;
          }
          if (!this.grid.startCell) {
            this.grid.startCell = this.cell;
          }
          this.grid.selectCellsTo(nextCell);
        }
        break;

      case 'Tab':
        if (!evt.shiftKey) {
          let nextCell = this.grid.nextCell(this.cell, true);
          if (!nextCell) {
            break;
          }
          this.grid.startCell = nextCell;
          this.grid.selectCells([nextCell]);
        } else {
          let prevCell = this.grid.previousCell(this.cell, true);
          if (!prevCell) {
            break;
          }
          this.grid.startCell = prevCell;
          this.grid.selectCells([prevCell]);
        }
        break;

      case 'Home':
        if (this.cell.editing) {
          return;
        }

        if (!evt.ctrlKey) {
          let firstCellInRow = this.grid.firstCellInRow(this.row, true);
          if (firstCellInRow) {
            this.grid.selectCells([firstCellInRow]);
          }
        } else {
          let firstCell = this.grid.firstCell(true);
          if (firstCell) {
            this.grid.selectCells([firstCell]);
          }
        }
        break;

      case 'End':
        if (this.cell.editing) {
        return;
        }

        if (!evt.ctrlKey) {
          let lastCellInRow = this.grid.lastCellInRow(this.row, true);
          if (lastCellInRow) {
            this.grid.selectCells([lastCellInRow]);
          }
        } else {
          let lastCell = this.grid.lastCell(true);
          if (lastCell) {
            this.grid.selectCells([lastCell]);
          }
        }
        break;

      default:
        return;
    }

    evt.preventDefault();
    evt.stopPropagation();
  }

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing) {
      return;
    }

    this.grid.isMouseDown = true;
    if (!evt.shiftKey || !this.grid.startCell) {
      this.grid.startCell = this.cell;
    }

    evt.preventDefault();
    evt.stopPropagation();
  }

  handleMouseEnter = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing || !this.grid.isMouseDown) {
      return;
    }

    this.grid.selectCellsTo(this.cell, evt.ctrlKey);
  }

  handleClick = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing || !this.cell.enabled || this.column.fixed) {
      return;
    }

    let selectedCells = this.grid.selectedCells;

    if (this.grid.multiSelect && selectedCells.length > 0 && (evt.ctrlKey || evt.shiftKey)) {
      if (evt.ctrlKey) {
        let cellToUnselect = selectedCells.find(cell => cell.id === this.cell.id);
        if (cellToUnselect) {
          this.grid.unselectCells([cellToUnselect], cellToUnselect);
        } else {
          this.grid.selectCells([this.cell], this.cell, false, true);
        }
      } else if (evt.shiftKey) {
        this.grid.selectCellsTo(this.cell);
      }
    } else {
      this.grid.selectCells([this.cell]);
    }

    evt.stopPropagation();
  }

  handleFocus = (evt: React.FocusEvent<any>) => {
    evt.stopPropagation();
  }

  handleKeyDownToEnterEditMode = (evt: React.KeyboardEvent<any>) => {
    if (this.cell.editing || !this.cell.enabled || this.cell.readOnly || !this.cell.editable || !this.column.editor) {
      return;
    }

    // if (this._cellType.handleKeyPress) {
    //   this._cellType.handleKeyPress.call(this, evt);
    //   if (evt.defaultPrevented) {
    //     return;
    //   }
    // }

    this.keyForEdit       = evt.key;
    this.grid.editCell(this.cell);
    if (!this.grid.editingCell) {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();
  }

  renderErrorIcon(): JSX.Element {
    let errorCls = cc([{hidden: this.cell.editing}]);

    let ErrorIconToUse: React.ComponentType<any>;
    let errorColorClass: string;
    switch (this.cell!.error!.severity) {
      case ErrorSeverity.Info:
        ErrorIconToUse  = InfoIcon;
        errorColorClass = this.props.classes.info;
        break;
      case ErrorSeverity.Warning:
        ErrorIconToUse  = ErrorIcon;
        errorColorClass = this.props.classes.warning;
        break;
      case ErrorSeverity.Critical:
        ErrorIconToUse  = WarningIcon;
        errorColorClass = this.props.classes.critical;
        break;
      case ErrorSeverity.Error:
      default:
        ErrorIconToUse  = ErrorIcon;
        errorColorClass = this.props.classes.error;
        break;
    }
    if (this.cell.error && !this.cell.editing) {
      return (
        <Tooltip
          title={this.cell.error.messageText}
          placement='right-start'
          TransitionComponent={Fade}
          PopperProps={{ style: {pointerEvents: 'none'} }}
          classes={{popper: this.props.classes.tooltipPopper, tooltip: this.props.classes.tooltip}}
        >
          <div className={this.props.classes.errorContainer}><ErrorIconToUse className={classNames(this.props.classes.errorIcon, errorColorClass, errorCls)} /></div>
        </Tooltip>
      );
    }
    return <div className={this.props.classes.errorContainer}><ErrorIconToUse className={classNames(this.props.classes.errorIcon, errorColorClass, errorCls)} /></div>;
  }

  get value(): string {
    let value: string;
    if (is.array(this.cell.value)) {
      let valueToUse = this.cell.value.slice(0, 3);
      let values     = this.column.map ? this.column.map(valueToUse) : valueToUse;
      value          = this.cell.value.length > 3 ? `${values}, ....` : values;
    } else {
      value = this.column.map ? this.column.map(this.cell.value) : this.cell.value;
    }
    return value;
  }

  onValueChange = (value: any) => {
    this.cell.setValue(value);
    if (this.column.type === 'multiselect') {
      return;
    }
    this.grid.editCell(undefined);
    if ((this.column.type === 'auto-complete' || this.column.type === 'select' || this.column.type === 'checked')) setTimeout(() => this.cell.setFocus(), 0);
  }

  handleTooltip = (evt: React.MouseEvent<HTMLSpanElement>) => {
    const node = evt.target as HTMLSpanElement;
    node.setAttribute('title', (node.offsetWidth < node.scrollWidth) ? this.value : '');
  }

  setCellRef = (element: HTMLTableDataCellElement) => {
    if (element && element !== this.cell.element) {
      // this.cell.element = (element as HTMLTableDataCellElement);
      this.cell.setElement(element as HTMLTableDataCellElement);
    }
  }

  renderCell() {
    let cell = this.cell;
    if (cell.editing) {
      let Editor = this.column.editor;
      if (!Editor) return;
      let cellType              = this.column.type;
      let endOfTextOnFocus      = false;
      let selectOnFocus         = true;
      let cursorPositionOnFocus = undefined;
      let value                 = cell.value;
      if (this.keyForEdit) {
        value            = this.keyForEdit;
        endOfTextOnFocus = true;
        selectOnFocus    = false;
        if (cellType === 'number') {
          endOfTextOnFocus      = false;
          cursorPositionOnFocus = 1;
        }
      }
      let editorClasses = undefined;
      let additionalProps = {};
      if (cellType === 'select' || cellType === 'multiselect') {
        editorClasses = {inputRoot: this.props.classes.editorSelectInputRoot, select: this.props.classes.editorSelectSelect};
      } else if (cellType === 'checked') {
        editorClasses = {checkboxRoot: this.props.classes.editorCheckboxRoot};
      } else if (cellType === 'text' || cellType === 'date' || cellType === 'email' || cellType === 'password' || cellType === 'time' || cellType === 'number' || cellType === 'phone' || cellType === 'auto-complete') {
        editorClasses = {formControlRoot: this.props.classes.editorFormControlRoot, inputRoot: this.props.classes.editorInputRoot};
      }

      if (cellType === 'auto-complete') {
        Object.assign(editorClasses, {container: this.props.classes.editorAutoCompleteContainer});
      }

      return (
        <div className={this.props.classes.editorContainer} style={{height: this.cell.element && (this.cell.element.clientHeight + 'px')}}>
          <Editor field={{...cell, value: value, autoFocus: true, align: cell.align, error: undefined, disableErrors: true}} endOfTextOnFocus={endOfTextOnFocus} selectOnFocus={selectOnFocus} cursorPositionOnFocus={cursorPositionOnFocus} className={cell.cls} onValueChange={this.onValueChange} classes={editorClasses} {...additionalProps}/>
        </div>
      );
    }

    return <Observe render={
      () => {
        let hasError = !!cell.error;
        let value    = this.value !== undefined && this.value !== null ? this.value : <span>&nbsp;</span>;

        return (
          < >
            {cell.renderer
              ? <div onMouseEnter={this.handleTooltip} style={{width: '100%', textAlign: cell.align}}>
                  {cell.renderer(cell)}
            </div>
              : <span onMouseEnter={this.handleTooltip} style={{width: '100%', textAlign: cell.align}}>
                  {value}
                </span>
            }
            {hasError && this.renderErrorIcon()}
          </>
        );
      }
    } />;
  }

  render() {
    const {classes} = this.props;

    return <Observe render={() => {
      let cell = this.cell;
      if (!cell) {
        return <div></div>;
      }

      let clazz = cc([{
        selected           : this.cell.selected,
        selectedTopMost    : this.cell.isTopMostSelection,
        selectedRightMost  : this.cell.isRightMostSelection,
        selectedBottomMost : this.cell.isBottomMostSelection,
        selectedLeftMost   : this.cell.isLeftMostSelection,
        edit               : this.cell.editing,
        disabled           : !this.cell.enabled,
        fixed              : this.column.fixed,
        notVisible         : !this.column.visible || !this.row.visible,
      }, cell.cls]);

      let tdClasses = classNames(clazz, classes.tableCell);

      if (!this.column.visible) {
        tdClasses = classNames(tdClasses, classes.tableCellNotVisible);
      }

      if (!cell.enabled) {
        tdClasses = classNames(tdClasses, classes.tableCellNotEnabled);
      }

      let cellInnerContainerClasses = classes.cellInnerContainer;

      if (cell.editing) {
        cellInnerContainerClasses = classNames(cellInnerContainerClasses, classes.cellInnerContainerEditing);
        tdClasses                 = classNames(tdClasses, classes.tableCellEditing);
      }

      let colSpan = cell.colSpan;
      let rowSpan = cell.rowSpan;

      let innerCell =
        <div className={classNames(classes.cellContainer, 'cellContainer')}>
          <div className={cellInnerContainerClasses}>
            {this.renderCell()}
          </div>
        </div>;
      let cellContent = innerCell;
      // let cellContent = cell.error && !cell.editing
      //   ? <Tooltip
      //       title={cell.error.messageText}
      //       placement='right-start'
      //       TransitionComponent={Fade}
      //       PopperProps={{ style: {pointerEvents: 'none'} }}
      //       classes={{popper: classes.tooltipPopper, tooltip: classes.tooltip}}
      //     >
      //       {innerCell}
      //     </Tooltip>
      //   : innerCell;

      return (
        <td tabIndex={0}
          style={{verticalAlign: cell.verticalAlign}}
          colSpan={colSpan}
          rowSpan={rowSpan}
          onFocus={this.handleFocus}
          onKeyPress={this.handleKeyDownToEnterEditMode}
          onKeyDown={this.handleKeyDown}
          ref={this.setCellRef}
          onDoubleClick={this.handleDoubleClick}
          onClick={this.handleClick}
          onMouseDown={this.grid.multiSelect ? this.handleMouseDown : undefined}
          onMouseEnter={this.grid.multiSelect ? this.handleMouseEnter : undefined}
          className={tdClasses}
          data-column-position={this.cell.columnPosition}>
            {cellContent}
        </td>
      );
    }} />;
  }
}

export default withStyles(styles, Cell);
