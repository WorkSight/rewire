import {
  IGrid,
  IRow,
  IColumn,
  ICell
}                                 from '../models/GridTypes';
import * as React                 from 'react';
import * as is                    from 'is';
import cc                         from 'classcat';
import classNames                 from 'classnames';
import {isNullOrUndefinedOrEmpty} from 'rewire-common';
import {Observe}                  from 'rewire-core';
import {
  withStyles,
  WithStyle,
  ErrorSeverity
}                                 from 'rewire-ui';
import {Theme}                    from '@material-ui/core/styles';
import ErrorIcon                  from '@material-ui/icons/Error';
import WarningIcon                from '@material-ui/icons/Warning';
import InfoIcon                   from '@material-ui/icons/Info';
import Tooltip                    from '@material-ui/core/Tooltip';
import Fade                       from '@material-ui/core/Fade';
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
  tooltipPopper: {
    // marginLeft: '-8px',
  },
  tooltip: {
    fontSize: `calc(${theme.fontSizes.body} * 0.95)`,
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
  rendererContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  customRendererContainer: {
    height: '100%',
  },
  editorContainer: {
    display: 'flex',
    flex: '1',
    overflow: 'hidden',
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
  editorMultiSelectAutoCompleteTextFieldInputContainer: {
    overflow: 'hidden',
    flexWrap: 'nowrap',
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

  constructor(props: CellProps) {
    super(props);
    this.cell       = props.cell;
    this.row        = this.cell.row;
    this.column     = this.cell.column;
    this.grid       = this.cell.grid;
  }

  handleDoubleClick = (evt: React.MouseEvent<any>) => {
    if (!this.cell.enabled || this.cell.readOnly || !this.cell.editable || evt.ctrlKey || evt.shiftKey || !this.column.editor) {
      return;
    }

    this.cell.keyForEdit = undefined;
    this.grid.editCell(this.cell);
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.key === 'Shift' || evt.key === 'Control' || evt.key === 'Alt') return;

    if (evt.keyCode >= 65 && evt.keyCode <= 90) {
      evt.key = evt.key.toUpperCase();
    }
    if (evt.shiftKey) { evt.key = 'Shift+' + evt.key; }
    if (evt.ctrlKey)  { evt.key = 'Ctrl+' + evt.key; }
    if (evt.altKey)   { evt.key = 'Alt+' + evt.key; }

    this.cell.performKeybindAction(evt);
  }

  handleMouseDown = (evt: React.MouseEvent<any>) => {
    evt.preventDefault();
    evt.stopPropagation();

    this.grid.isMouseDown = true;

    if (this.cell.editing || !this.grid.multiSelect) {
      return;
    }

    if (!evt.shiftKey || !this.grid.startCell) {
      this.grid.startCell = this.cell;
    }
  }

  handleMouseEnter = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing || !this.grid.isMouseDown) {
      return;
    }

    if (!this.grid.startCell) {
      this.grid.startCell = this.cell;
    }
    this.grid.selectCellsTo(this.cell, evt.ctrlKey);
  }

  handleClick = (evt: React.MouseEvent<any>) => {
    if (this.cell.editing) {
      return;
    }

    if (!this.cell.enabled) {
      // allow processing of cell rows, even if cell is not enabled
      this.grid.selectCells([this.cell]);
      return;
    }

    let selectedCells = this.grid.selectedCells;

    if (this.grid.multiSelect && selectedCells.length > 0 && (evt.ctrlKey || evt.shiftKey)) {
      if (evt.ctrlKey) {
        let cellToUnselect = selectedCells.find(cell => cell.id === this.cell.id);
        if (cellToUnselect) {
          this.grid.unselectCells([cellToUnselect], cellToUnselect);
        } else {
          this.grid.selectCells([this.cell], this.cell, true, true);
        }
      } else if (evt.shiftKey) {
        this.grid.selectCellsTo(this.cell);
      }
    } else {
      this.grid.selectCells([this.cell]);
    }
    // commented out to allow row click handling
    // evt.stopPropagation();
  }

  handleFocus = (evt: React.FocusEvent<any>) => {
    evt.stopPropagation();
    if (!this.grid.focusedCell && this.grid.selectedCells.length <= 0) {
      this.grid.selectCells([this.cell]);
    } else {
      this.grid.focusedCell = this.cell;
    }
  }

  handleBlur = (evt: React.FocusEvent<any>) => {
    this.grid.focusedCell = undefined;
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

    if (this.column.type !== 'select' && this.column.type !== 'multiselect') {
      this.cell.keyForEdit = evt.key;
    }
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
          title={this.cell.error.text}
          placement='right'
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

  onValueChange = (v: any) => {
    let value = isNullOrUndefinedOrEmpty(v) ? undefined : v;
    this.cell.keyForEdit = undefined;
    this.cell.value      = value;
    if (this.column.type === 'multiselect' || this.column.type === 'multiselectautocomplete') {
      return;
    }
    this.grid.editCell(undefined);
    if ((this.column.type === 'auto-complete' || this.column.type === 'select' || this.column.type === 'checked')) setTimeout(() => this.cell.setFocus(), 0);
  }

  handleTooltip = (node: HTMLElement) => {
    node.setAttribute('title', (node.offsetWidth < node.scrollWidth) ? this.value : '');
  }

  handleTooltipForSpan = (evt: React.MouseEvent<HTMLSpanElement>) => {
    this.handleTooltip(evt.currentTarget as HTMLElement);
  }

  handleTooltipForDiv = (evt: React.MouseEvent<HTMLDivElement>) => {
    this.handleTooltip(evt.currentTarget as HTMLElement);
  }

  setCellRef = (element: HTMLTableDataCellElement) => {
    if (element && element !== (this.cell as CellModel).element) {
      // this.cell.element = (element as HTMLTableDataCellElement);
      (this.cell as CellModel).setElement(element as HTMLTableDataCellElement);
    }
  }

  renderCell = React.memo((): JSX.Element | null => {
    return <Observe render={() => {
      let cell = this.cell;
      if (cell.editing) {
        if (!this.column.editor) return null;
        let Editor                                    = this.column.editor;
        let cellType                                  = this.column.type;
        let additionalProps                           = {};
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
            let num               = parseFloat(value);
            if (!Number.isNaN(num)) {
              value = num;
            }
          }
          else if (cellType === 'auto-complete' || cellType === 'multiselectautocomplete') {
            value                                = undefined;
            additionalProps['initialInputValue'] = cell.keyForEdit;
          }
        }
        let editorClasses: Object | undefined = undefined;
        if (cellType === 'select' || cellType === 'multiselect') {
          editorClasses = {inputRoot: this.props.classes.editorSelectInputRoot, select: this.props.classes.editorSelectSelect};
        } else if (cellType === 'checked') {
          editorClasses = {checkboxRoot: this.props.classes.editorCheckboxRoot};
        } else if (cellType === 'text' || cellType === 'date' || cellType === 'email' || cellType === 'password' || cellType === 'time' || cellType === 'number' || cellType === 'phone' || cellType === 'auto-complete' || 'mask') {
          editorClasses = {formControlRoot: this.props.classes.editorFormControlRoot, inputRoot: this.props.classes.editorInputRoot};
        }

        if (cellType === 'auto-complete' || cellType === 'multiselectautocomplete') {
          Object.assign(editorClasses, {container: this.props.classes.editorAutoCompleteContainer});
        }

        if (cellType === 'multiselectautocomplete') {
          Object.assign(editorClasses, {textFieldInputContainer: this.props.classes.editorMultiSelectAutoCompleteTextFieldInputContainer});
        }

        const height = (this.cell as CellModel).element!.getBoundingClientRect().height - 2;
        return <Observe render={() => (
          <div className={this.props.classes.editorContainer} style={{height}}>
            <Editor field={{...cell, value: value, autoFocus: true, align: cell.align, error: undefined, disableErrors: true}} endOfTextOnFocus={endOfTextOnFocus} selectOnFocus={selectOnFocus} cursorPositionOnFocus={cursorPositionOnFocus} className={cell.cls} onValueChange={this.onValueChange} classes={editorClasses} {...additionalProps}/>
          </div>
        )} />;
      }

      return <Observe render={() => {
        let value        = !isNullOrUndefinedOrEmpty(this.value) ? this.value : <span>&nbsp;</span>;
        let CellRenderer = cell.renderer;
        return (
          < >
            {CellRenderer
              ? <div onMouseEnter={this.handleTooltipForDiv} className={classNames(this.props.classes.rendererContainer, this.props.classes.customRendererContainer)} style={{textAlign: cell.align}}>
                  <CellRenderer cell={cell} />
                </div>
              : <span onMouseEnter={this.handleTooltipForSpan} className={this.props.classes.rendererContainer} style={{textAlign: cell.align}}>
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

      let colSpan   = cell.colSpan;
      let rowSpan   = cell.rowSpan;
      let innerCell =
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
