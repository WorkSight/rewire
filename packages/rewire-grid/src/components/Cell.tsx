import {
  IGrid,
  IRow,
  IColumn,
  ICell
}                                 from '../models/GridTypes';
import React                      from 'react';
import is                         from 'is';
import cc                         from 'classcat';
import classNames                 from 'classnames';
import {
  isNullOrUndefined,
  isNullOrUndefinedOrEmpty
}                                 from 'rewire-common';
import {Observe}                  from 'rewire-core';
import {
  withStyles,
  WithStyle,
  ErrorSeverity,
  ErrorTooltip
}                                 from 'rewire-ui';
import {SvgIconProps}             from '@material-ui/core/SvgIcon';
import {Theme}                    from '@material-ui/core/styles';
import ErrorIcon                  from '@material-ui/icons/Error';
import WarningIcon                from '@material-ui/icons/Warning';
import InfoIcon                   from '@material-ui/icons/Info';
import { CellModel }              from '../models/CellModel';

const styles = (theme: Theme) => ({
  tableCell: {
    height: 'inherit',
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
  errorTooltipRoot: {
    display: 'flex',
    height: '100%',
    marginLeft: '0.3125em',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTooltip: {
    fontSize: `calc(${theme.fontSizes.body} * 0.9)`,
    padding: `calc(${theme.fontSizes.body} * 0.25) calc(${theme.fontSizes.body} * 0.5)`,
  },
  errorIcon: {
    fontSize: '1.2em',
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
    overflow: 'hidden',
  },
  editorSelectSelect: {
    padding: '0px 3px',
  },
  editorSelectSelectMenu: {
    height: 'auto',
  },
  editorSelectInputRoot: {
    flex: '1',
  },
  editorInputRoot: {
    flex: '1',
  },
  editorFormControlRoot: {
    flex: '1',
    flexDirection: 'row',
  },
  selectEditorFormControlRoot: {
    flex: '1',
  },
  editorMultiSelectAutoCompleteTextFieldInputContainer: {
    overflow: 'hidden',
  },
  editorCheckboxRoot: {
    height: '100%',
    flex: '1',
  },
});

export type CellStyles = ReturnType<typeof styles>;

export interface ICellProps {
  cell: ICell;
}

export type CellProps = WithStyle<CellStyles, ICellProps>;

class Cell extends React.PureComponent<CellProps, unknown> {
  cell: ICell;
  row: IRow;
  column: IColumn;
  grid: IGrid;

  constructor(props: CellProps) {
    super(props);
    this.cell       = props.cell;
    this.row        = this.cell.row;
    this.column     = this.cell.column;
    this.grid       = this.cell.grid;
  }

  handleDoubleClick = (evt: React.MouseEvent<any>) => {
    if (!this.cell.canSelect || this.cell.readOnly || !this.cell.editable || evt.ctrlKey || evt.shiftKey || !this.column.editor) {
      return;
    }

    this.cell.keyForEdit = undefined;
    this.grid.editCell(this.cell);
  };

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.key === 'Shift' || evt.key === 'Control' || evt.key === 'Alt') return;

    if (evt.keyCode >= 65 && evt.keyCode <= 90) {
      evt.key = evt.key.toUpperCase();
    }
    if (evt.shiftKey) { evt.key = 'Shift+' + evt.key; }
    if (evt.ctrlKey)  { evt.key = 'Ctrl+' + evt.key; }
    if (evt.altKey)   { evt.key = 'Alt+' + evt.key; }

    this.cell.performKeybindAction(evt);
  };

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    evt.preventDefault();
    evt.stopPropagation();

    this.grid.isMouseDown = true;

    if (this.cell.editing || !this.grid.multiSelect || (evt.shiftKey && this.grid.startCell)) {
      return;
    }

    this.grid.startCell = undefined;

    if (this.cell.canSelect) {
      this.grid.startCell = this.cell;
    }
  };

  handleMouseEnter = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing || !this.grid.isMouseDown) {
      return;
    }

    if (!this.grid.startCell) {
      this.grid.startCell = this.cell;
    }

    const startCellIsSelected = this.grid.startCell && (this.grid.selectedCells.findIndex((cell: ICell) => cell.id === this.grid.startCell!.id) >= 0);
    if (!startCellIsSelected && this.grid.startCell && this.grid.startCell.id !== this.cell.id) {
      if (!evt.shiftKey && !evt.ctrlKey) {
        this.grid.selectCells([]);
      }
      if (this.grid.startCell.canSelect) {
        this.grid.selectCells([this.grid.startCell], undefined, undefined, evt.ctrlKey);
      }
    }
    if (this.cell.canSelect) {
      this.grid.selectCellsTo(this.cell, evt.ctrlKey);
    }
  };

  private isAlreadySelected = () => {
    if (this.grid.selectedCells?.length === 1 && this.grid.selectedCells[0].id === this.cell.id) {
      return true;
    }
    return false;
  };

  handleClick = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing) {
      return;
    }

    const selectedCells = this.grid.selectedCells;

    if (this.grid.multiSelect && selectedCells.length > 0 && (evt.ctrlKey || evt.shiftKey)) {
      if (evt.ctrlKey) {
        const cellToUnselect = selectedCells.find(cell => cell.id === this.cell.id);
        if (cellToUnselect) {
          this.grid.unselectCells([cellToUnselect], cellToUnselect);
        } else {
          if (!this.cell.canSelect) {
            return;
          }
          if (this.isAlreadySelected()) return;
          this.grid.selectCells([this.cell], this.cell, true, true);
        }
      } else if (evt.shiftKey) {
        if (!this.cell.canSelect) {
          return;
        }
        this.grid.selectCellsTo(this.cell);
      }
    } else {
      if (this.isAlreadySelected()) return;
      this.grid.startCell = undefined;
      this.grid.selectCells([this.cell]);
      if (this.cell.canSelect) {
        this.grid.startCell = this.cell;
      }
    }
    // commented out to allow row click handling
    // evt.stopPropagation();
  };

  handleFocus = (evt: React.FocusEvent<any>) => {
    evt.stopPropagation();

    if (this.grid.focusedCell) {
      this.grid.previousFocusedCell = this.grid.focusedCell;
    } else if (this.grid.selectedCells.length <= 0) {
      this.grid.selectCells([this.cell]);
    }

    this.grid.focusedCell = this.cell;
  };

  handleBlur = (_evt: React.FocusEvent<any>) => {
    this.grid.previousFocusedCell = this.grid.focusedCell;
    this.grid.focusedCell         = undefined;
  };

  handleKeyDownToEnterEditMode = (evt: React.KeyboardEvent<any>) => {
    if (this.cell.editing || this.cell.readOnly || !this.cell.editable || !this.column.editor || !this.cell.canSelect) {
      return;
    }

    // if (this._cellType.handleKeyPress) {
    //   this._cellType.handleKeyPress.call(this, evt);
    //   if (evt.defaultPrevented) {
    //     return;
    //   }
    // }

    if (this.column.type !== 'select' && this.column.type !== 'multiselect') {
      this.cell.keyForEdit = evt.key;
    }
    this.grid.editCell(this.cell);
    if (!this.grid.editingCell) {
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();
  };

  renderErrorIcon(): JSX.Element {
    let ErrorIconToUse: (props: SvgIconProps) => JSX.Element;
    let errorColorClass: string | undefined;
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

    return (
      <ErrorTooltip
        classes={{root: this.props.classes.errorTooltipRoot, tooltip: this.props.classes.errorTooltip, errorIcon: classNames(this.props.classes.errorIcon, errorColorClass)}}
        error={this.cell.error?.text}
        Icon={ErrorIconToUse}
      />
    );
  }

  get value(): string {
    let value: string;
    if (is.array(this.cell.value)) {
      const valueToUse = this.cell.value.slice(0, 3);
      const values     = this.column.map ? this.column.map(valueToUse) : valueToUse;
      value            = this.cell.value.length > 3 ? `${values}, ....` : values;
    } else {
      value = this.column.map ? this.column.map(this.cell.value) : this.cell.value;
    }
    return value;
  }

  onValueChange = (v: any) => {
    const value = isNullOrUndefinedOrEmpty(v) ? undefined : v;
    this.cell.keyForEdit = undefined;
    this.cell.value      = value;
    if (this.column.type === 'multiselect' || this.column.type === 'multiselectautocomplete' || this.column.type === 'date') {
      return;
    }
    this.grid.editCell(undefined);
    if ((this.column.type === 'auto-complete' || this.column.type === 'select' || this.column.type === 'checked')) setTimeout(() => this.cell.setFocus(), 0);
  };

  getCellTooltip() {
    const tooltip = this.column.cellTooltip;
    let title     = this.value;
    if (!isNullOrUndefined(tooltip)) {
      if (is.function(tooltip))  {
        title = (tooltip as CallableFunction)(this.value);
      } else {
        title = tooltip as string;
      }
    }

    return title;
  }

  handleTooltip = (node: HTMLElement) => {
    node.setAttribute('title', (node.offsetWidth < node.scrollWidth) ? this.getCellTooltip() : '');
  };

  handleTooltipForSpan = (evt: React.MouseEvent<HTMLSpanElement>) => {
    this.handleTooltip(evt.currentTarget as HTMLElement);
  };

  handleTooltipForDiv = (evt: React.MouseEvent<HTMLDivElement>) => {
    this.handleTooltip(evt.currentTarget as HTMLElement);
  };

  setCellRef = (element: HTMLTableDataCellElement) => {
    if (element && element !== (this.cell as CellModel).element) {
      // this.cell.element = (element as HTMLTableDataCellElement);
      (this.cell as CellModel).setElement(element as HTMLTableDataCellElement);
    }
  };

  renderCell = React.memo((): JSX.Element | null => {
    return <Observe render={() => {
      const cell = this.cell;
      if (cell.editing) {
        if (!this.column.editor) return null;
        const Editor                                  = this.column.editor;
        const tooltip                                 = this.column.editorTooltip;
        const cellType                                = this.column.type;
        const additionalProps                         = {};
        let endOfTextOnFocus                          = false;
        let selectOnFocus                             = true;
        let cursorPositionOnFocus: number | undefined = undefined;
        let value                                     = cell.value;
        if (this.cell.keyForEdit) {
          value            = cell.keyForEdit;
          endOfTextOnFocus = true;
          selectOnFocus    = false;
          if (cellType === 'number') {
            endOfTextOnFocus      = false;
            cursorPositionOnFocus = 1;
            const num               = parseFloat(value);
            if (!Number.isNaN(num)) {
              value = num;
            }
          } else if (cellType === 'auto-complete' || cellType === 'multiselectautocomplete') {
            value                                = undefined;
            additionalProps['initialInputValue'] = cell.keyForEdit;
          } else if (cellType === 'date') {
            endOfTextOnFocus                     = false;
            cursorPositionOnFocus                = 1;
            additionalProps['initialInputValue'] = cell.keyForEdit;
          }
        }
        let editorClasses: Record<string, unknown> = {};
        if (cellType === 'checked') {
          editorClasses = {checkboxRoot: this.props.classes.editorCheckboxRoot};
        } else if (cellType === 'text' || cellType === 'date' || cellType === 'email' || cellType === 'password' || cellType === 'time' || cellType === 'number' || cellType === 'phone' || cellType === 'auto-complete' ||  cellType === 'mask') {
          editorClasses = {formControlRoot: this.props.classes.editorFormControlRoot, inputRoot: this.props.classes.editorInputRoot};
        }

        if (cellType === 'select' || cellType === 'multiselect') {
          editorClasses = Object.assign(editorClasses, {formControlRoot: this.props.classes.selectEditorFormControlRoot, inputRoot: this.props.classes.editorInputRoot, select: this.props.classes.editorSelectSelect, selectMenu: this.props.classes.editorSelectSelectMenu});
        } else if (cellType === 'multiselectautocomplete') {
          Object.assign(editorClasses, {textFieldInputContainer: this.props.classes.editorMultiSelectAutoCompleteTextFieldInputContainer});
        }

        const height = (this.cell as CellModel).element!.getBoundingClientRect().height - 2;
        return <Observe render={() => (
          <div className={this.props.classes.editorContainer} style={{height}}>
            <Editor field={{...cell, value: value, autoFocus: true, align: cell.align, error: undefined, disableErrors: true, tooltip: tooltip}} endOfTextOnFocus={endOfTextOnFocus} selectOnFocus={selectOnFocus} cursorPositionOnFocus={cursorPositionOnFocus} className={cell.cls} onValueChange={this.onValueChange} classes={editorClasses} {...additionalProps}/>
          </div>
        )} />;
      }

      return <Observe render={() => {
        const value        = !isNullOrUndefinedOrEmpty(this.value) ? this.value : <span>&nbsp;</span>;
        const CellRenderer = cell.renderer;
        return (
          < >
            {CellRenderer
              ? <div onMouseEnter={this.handleTooltipForDiv} style={{flex: '1', overflow: 'hidden', alignSelf: 'stretch', textAlign: cell.align}}>
                  <CellRenderer cell={cell} />
                </div>
              : <span onMouseEnter={this.handleTooltipForSpan} style={{flex: '1', overflow: 'hidden', textAlign: cell.align}}>
                  {value}
                </span>
            }
          </>
        );
      }} />;
    }} />;
  });

  render() {
    const {classes} = this.props;

    return <Observe render={() => {
      const cell = this.cell;
      if (!cell) {
        return <div></div>;
      }

      const clazz = cc([{
        selected           : this.cell.selected,
        selectedTopMost    : this.cell.isTopMostSelection,
        selectedRightMost  : this.cell.isRightMostSelection,
        selectedBottomMost : this.cell.isBottomMostSelection,
        selectedLeftMost   : this.cell.isLeftMostSelection,
        readOnly           : this.cell.readOnly,
        edit               : this.cell.editing,
        disabled           : !this.cell.enabled,
        fixed              : this.column.fixed,
        hasChanges         : this.cell.hasChanges,
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

      const colSpan   = cell.colSpan;
      const rowSpan   = cell.rowSpan;
      const innerCell =
        <div className={classNames(classes.cellContainer, 'cellContainer')}>
          <div className={cellInnerContainerClasses}>
            <this.renderCell />
            <Observe render={() => {
              if (this.cell.editing || !this.cell.error) return null;
              return this.renderErrorIcon();
            }} />
            {}
          </div>
        </div>;
      const cellContent = innerCell;

      return (
        <td tabIndex={0}
          style={{verticalAlign: cell.verticalAlign}}
          colSpan={colSpan}
          rowSpan={rowSpan}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onKeyPress={this.handleKeyDownToEnterEditMode}
          onKeyDown={this.handleKeyDown}
          ref={this.setCellRef}
          onDoubleClick={this.handleDoubleClick}
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
          onMouseEnter={this.grid.multiSelect ? this.handleMouseEnter : undefined}
          className={tdClasses}
         >
            {cellContent}
        </td>
      );
    }} />;
  }
}

export default withStyles(styles, Cell);
