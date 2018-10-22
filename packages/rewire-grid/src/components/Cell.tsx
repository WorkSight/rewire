import {
  IGrid,
  IRow,
  IColumn,
  ICell,
  ErrorSeverity,
}                                                  from '../models/GridTypes';
import * as React                                  from 'react';
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
    lineHeight: `calc(2 * ${theme.fontSizes.body})`,
  },
  cellInnerContainer: {
    overflow: 'hidden',
    flex: '1',
    height: '100%',
    alignItems: 'center',
    padding: '0px 4px',
    margin: 0,
    display: 'flex',
    width: '100%',
  },
  cellInnerContainerEditing: {
    padding: '0px 1px',
  },
  tooltipPopper: {
    // marginLeft: '-8px',
  },
  tooltip: {
  },
  errorContainer: {
    display: 'flex',
    height: '100%',
    marginLeft: '5px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: '18px',
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
  selectEditorSelect: {
    padding: '0px 3px',
  },
  editorPopupMenuItem: {
    fontSize: theme.fontSizes.body,
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
  element: HTMLTableCellElement;

  constructor(props: CellProps) {
    super(props);
    this.cell       = props.cell;
    this.row        = this.cell.row;
    this.column     = this.cell.column;
    this.grid       = this.cell.grid;
    this.keyForEdit = undefined;
  }

  componentDidMount() {
    disposeOnUnmount(this, () => {
      const value = observe(() => {
        if (typeof this.cell.value === 'object') {
          Object.keys(this.cell.value).map(key => this.cell.value[key]);
        }
      });
      watch(value, () => {
        if (this.column.validator) {
          this.cell.error = this.column.validator(this.cell.value);
        }
        this.grid.changed = this.grid.hasChanges();
      });
    });
  }

  setFocus(set: boolean) {
    if (!set) {
      return;
    }

    if (this.cell.editing) {
      return;
    }

    if (!this.element) {
      return;
    }

    if (!this.cell.selected) {
      return;
    }

    if (!this.element || (this.element === document.activeElement)) {
      return;
    }

    // if (item[0].scrollIntoView) {
    //   item[0].scrollIntoView(false);
    // }

    // setTimeout(function() {
    //   this.element.focus();
    // }, 0);
    this.element.focus();
  }

  setFocusFromMouse(set: boolean) {
    this.setFocus(set);
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
    if (evt.keyCode === 86) { evt.key = 'V'; }
    switch (evt.key) {
      case 'C':
        if (!evt.ctrlKey) {
          return;
        }
        this.grid.copy();
        break;
      case 'V':
        if (!evt.ctrlKey) {
          return;
        }
        this.grid.paste();
        break;
      case 'Escape':
        if (this.cell.editing) {
          this.grid.editCell(undefined);
          setTimeout(() => {
            if (this.element) this.element.focus();
          }, 0);
        } else {
          this.grid.selectCells([]);
          setTimeout(() => {
            if (this.element) this.element.blur();
          }, 0);
        }
        break;

      case 'Delete':
        if (this.cell.editing) {
          return;
        }
        this.grid.selectedCells.forEach(cell => cell.clear());
        this.grid.updateCellSelectionProperties(this.grid.selectedCells);
        break;

      case 'Enter':
        this.grid.editCell(undefined);
          if (this.element) this.element.focus();
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
        return;

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
        return;

      case 'ArrowLeft':
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
        return;

      case 'ArrowRight':
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
        return;

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
        return;

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
    this.setFocusFromMouse(true);
  }

  handleClick = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing || !this.cell.enabled || this.column.fixed) {
      return;
    }

    let selectedCells = this.grid.selectedCells;

    if (this.grid.multiSelect && selectedCells.length > 0 && (evt.ctrlKey || evt.shiftKey)) {
      if (evt.ctrlKey) {
        let cellIdx = selectedCells.findIndex(cell => cell.id === this.cell.id);
        if (cellIdx >= 0) {
          this.grid.unselectCells([selectedCells[cellIdx]]);
        } else {
          this.grid.selectCells([this.cell], false, true);
        }
      } else if (evt.shiftKey) {
        this.grid.selectCellsTo(this.cell);
      }
    } else {
      this.grid.selectCells([this.cell]);
    }

    evt.stopPropagation();
    this.setFocusFromMouse(true);
  }

  handleFocus = (evt: React.FocusEvent<any>) => {
    // if (this.grid.selectedCells.length <= 0) {
    //   this.grid.selectCells([this.cell]);
    // }
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
      case ErrorSeverity.info:
        ErrorIconToUse  = InfoIcon;
        errorColorClass = this.props.classes.info;
        break;
      case ErrorSeverity.warning:
        ErrorIconToUse  = ErrorIcon;
        errorColorClass = this.props.classes.warning;
        break;
      case ErrorSeverity.critical:
        ErrorIconToUse  = WarningIcon;
        errorColorClass = this.props.classes.critical;
        break;
      case ErrorSeverity.error:
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

  splitDecimal(numStr: string) {
    const hasNagation = numStr[0] === '-';
    const addNegation = hasNagation;
    numStr = numStr.replace('-', '');

    const parts         = numStr.split('.');
    const beforeDecimal = parts[0];
    const afterDecimal  = parts[1] || '';

    return {
      beforeDecimal,
      afterDecimal,
      addNegation,
    };
  }

  getThousandSeparatedNumberString(numStr: string): string {
    let {beforeDecimal, afterDecimal, addNegation} = this.splitDecimal(numStr);
    let hasDecimalSeparator = !!afterDecimal && afterDecimal.length > 0;

    beforeDecimal = beforeDecimal.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + ',');

    if (addNegation) beforeDecimal = '-' + beforeDecimal;

    return beforeDecimal + (hasDecimalSeparator ? '.' : '') + afterDecimal;
  }

  get value(): string {
    let value = this.column.map ? this.column.map(this.cell.value) : this.cell.value;

    if (value && this.column.type === 'number' && !this.cell.renderer && this.column.options && this.column.options.thousandSeparator) {
      value = this.getThousandSeparatedNumberString(value);
    }

    return value;
  }

  onValueChange = (value: any) => {
    this.cell.value = value;
    this.grid.editCell(undefined);
    if ((this.column.type === 'auto-complete' || this.column.type === 'select' || this.column.type === 'checked') && this.element) setTimeout(() => this.element.focus(), 0);
  }

  handleTooltip = (evt: React.MouseEvent<HTMLSpanElement>) => {
    const node = evt.target as HTMLSpanElement;
    node.setAttribute('title', (node.offsetWidth < node.scrollWidth) ? this.cell.value : '');
  }

  renderCell() {
    let cell = this.cell;
    if (cell.editing) {
      let Editor = this.column.editor;
      if (!Editor) return;
      let endOfTextOnFocus = false;
      let selectOnFocus    = true;
      let value            = cell.value;
      if (this.keyForEdit) {
        value = this.keyForEdit;
        endOfTextOnFocus = true;
        selectOnFocus = false;
      }
      let editorClasses   = undefined;
      let cellType        = this.column.type;
      let additionalProps = {};
      if (cellType === 'select') {
        editorClasses = {select: this.props.classes.selectEditorSelect, selectMenuItem: this.props.classes.editorPopupMenuItem};
      } else if (cellType === 'checked') {
        editorClasses = {checkboxRoot: this.props.classes.editorCheckboxRoot};
      } else if (cellType === 'text' || cellType === 'date' || cellType === 'email' || cellType === 'password' || cellType === 'time' || cellType === 'number' || cellType === 'auto-complete') {
        editorClasses = {formControlRoot: this.props.classes.editorFormControlRoot, inputRoot: this.props.classes.editorInputRoot};
      }

      if (cellType === 'auto-complete') {
        additionalProps['usePopper'] = true;
        Object.assign(editorClasses, {menuItem: this.props.classes.editorPopupMenuItem, container: this.props.classes.editorAutoCompleteContainer});
      }

      return (
        <div className={this.props.classes.editorContainer} style={{height: this.element.clientHeight + 'px'}}>
          <Editor field={{...cell, value: value, autoFocus: true, error: undefined}} endOfTextOnFocus={endOfTextOnFocus} selectOnFocus={selectOnFocus} className={cell.cls} onValueChange={this.onValueChange} classes={editorClasses} {...additionalProps}/>
        </div>
      );
    }

    return <Observe render={
      () => {
        let hasError = !!cell.error;
        let value    = this.value || <span>&nbsp;</span>;

        return (
          < >
            {(cell.renderer && cell.renderer(cell)) || <span onMouseEnter={this.handleTooltip} style={{width: '100%', textAlign: cell.align}}>{value}</span>}
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
        <div className={classes.cellContainer}>
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
          colSpan={colSpan}
          rowSpan={rowSpan}
          onFocus={this.handleFocus}
          onKeyPress={this.handleKeyDownToEnterEditMode}
          onKeyDown={this.handleKeyDown}
          ref={(element) => this.element = element as HTMLTableCellElement}
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
