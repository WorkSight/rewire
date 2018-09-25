import {
  IGrid,
  IColumn,
  ICell,
  ErrorSeverity,
}                                         from '../models/GridTypes';
import * as React                         from 'react';
import cc                                 from 'classcat';
import classNames                         from 'classnames';
import {Observe, watch, disposeOnUnmount} from 'rewire-core';
import {withStyles, WithStyle}            from 'rewire-ui';
import {Theme}                            from '@material-ui/core/styles';
import ErrorIcon                          from '@material-ui/icons/Error';
import WarningIcon                        from '@material-ui/icons/Warning';
import InfoIcon                           from '@material-ui/icons/Info';
import Tooltip                            from '@material-ui/core/Tooltip';
import Fade                               from '@material-ui/core/Fade';

const styles = (theme: Theme) => ({
  cellContainer: {
    display: 'flex',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
    lineHeight: `calc(2 * ${theme.fontSizes.body})`,
  },
  tooltipPopper: {
    marginLeft: '-8px',
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
  selectEditorSelect: {
    padding: '0px 3px',
  },
  editorPopupMenuItem: {
    fontSize: theme.fontSizes.body,
  },
});

export interface ICellProps {
  cell: ICell;
}

type CellProps = WithStyle<ReturnType<typeof styles>, ICellProps>;

class Cell extends React.PureComponent<CellProps, {}> {
  cell:   ICell;
  column: IColumn;
  grid:   IGrid;
  keyForEdit?: string;
  element: HTMLTableCellElement;
  fromMouseEvent: boolean;

  constructor(props: CellProps) {
    super(props);
    this.cell           = props.cell;
    this.column         = this.cell.column;
    this.grid           = this.column.grid;
    this.keyForEdit     = undefined;
    this.fromMouseEvent = false;
  }

  componentDidMount() {
    disposeOnUnmount(this, () => {
      watch(() => this.cell.value, () => {
        if (this.cell.validator) {
          this.cell.error = this.cell.validator(this.cell.value);
        }
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
    this.fromMouseEvent = true;
    this.setFocus(set);
    this.fromMouseEvent = false;
  }

  handleDoubleClick = (evt: React.MouseEvent<any>) => {
    if (this.cell.enabled && !this.cell.readOnly && !evt.ctrlKey && !evt.shiftKey) {
      this.keyForEdit = undefined;
      this.grid.editCell(this.cell);
    }
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
        evt.stopPropagation;
        evt.preventDefault;
        break;
      case 'V':
        if (!evt.ctrlKey) {
          return;
        }
        this.grid.paste();
        evt.stopPropagation;
        evt.preventDefault;
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
        return;

      case 'Enter':
        this.grid.editCell(undefined);
        if (this.element) this.element.focus();
        break;

      case 'F2':
        if (this.cell.enabled && !this.cell.readOnly) {
          this.keyForEdit = undefined;
          this.grid.editCell(this.cell);
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
    this.grid.startCell   = this.cell;

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
    if (this.cell.editing) {
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
        this.grid.startCell = selectedCells[0];
        this.grid.selectCellsTo(this.cell);
      }
    } else {
      this.grid.selectCells([this.cell]);
    }

    evt.stopPropagation();
    this.setFocusFromMouse(true);
  }

  handleFocus = (evt: React.FocusEvent<any>) => {
    if (this.cell.editing || this.fromMouseEvent) {
      return;
    }
    this.grid.selectCells([this.cell]);
    evt.stopPropagation();
  }

  handleKeyDownToEnterEditMode = (evt: React.KeyboardEvent<any>) => {
    if (this.cell.editing) {
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
    // return (
    // <Tooltip
    //   title={this.cell.error.messageText}
    //   placement='right-start'
    //   TransitionComponent={Fade}
    //   PopperProps={{ style: {pointerEvents: 'none'} }}
    //   classes={{popper: this.props.classes.tooltipPopper, tooltip: this.props.classes.tooltip}}
    // >
    //   <div className={this.props.classes.errorContainer}><ErrorIconToUse className={classNames(this.props.classes.errorIcon, errorColorClass, errorCls)} /></div>
    // </Tooltip>
    // );
    return <div className={this.props.classes.errorContainer}><ErrorIconToUse className={classNames(this.props.classes.errorIcon, errorColorClass, errorCls)} /></div>;
  }

  get value(): string {
    if (this.cell.column.map) return this.cell.column.map(this.cell.value);
    return this.cell.value;
  }

  onValueChange = (value: any) => {
    this.cell.value = value;
    this.grid.editCell(undefined);
  }

  handleTooltip = (evt: React.MouseEvent<HTMLSpanElement>) => {
    const node = evt.target as HTMLSpanElement;
    node.setAttribute('title', (node.offsetWidth < node.scrollWidth) ? this.cell.value : '');
  }

  renderCell() {
    let cell = this.cell;
    if (cell.editing) {
      let Editor = cell.editor || cell.column.editor;
      if (!Editor) return;
      let endOfTextOnFocus = false;
      let selectOnFocus    = true;
      let value            = cell.value;
      if (this.keyForEdit) {
        value = this.keyForEdit;
        endOfTextOnFocus = true;
        selectOnFocus = false;
      }
      let editorClasses = undefined;
      if (cell.type === 'select') {
        editorClasses = {select: this.props.classes.selectEditorSelect, selectMenuItem: this.props.classes.editorPopupMenuItem};
      } else if (cell.type === 'auto-complete') {
        editorClasses = {menuItem: this.props.classes.editorPopupMenuItem};
      }
      return <Editor field={{...cell, value: value, autoFocus: true, error: undefined}} endOfTextOnFocus={endOfTextOnFocus} selectOnFocus={selectOnFocus} className={cell.cls} onValueChange={this.onValueChange} classes={editorClasses} />;
    }

    return <Observe render={
      () => {
        let align    = this.column.align;
        if (this.cell.align) align = align;
        let renderer = cell.renderer || cell.column.renderer;
        let hasError = !!cell.error;
        let value    = this.value || <span>&nbsp;</span>;

        return (
          < >
            {(renderer && renderer(cell)) || <span onMouseEnter={this.handleTooltip} style={{width: '100%', textAlign: align}}>{value}</span>}
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
      let cellInnerContainerStyle: React.CSSProperties = {overflow: 'hidden', flex: '1', height: '100%', alignItems: 'center', padding: '0px 4px', margin: 0, display: 'flex', width: '100%'};
      let clazz = cc([{
        selected              : this.cell.selected,
        selectedTopMost       : this.cell.isTopMostSelection,
        selectedLeftMost      : this.cell.isLeftMostSelection,
        adjacentToSelectedTop : this.cell.isAdjacentToTopSelection,
        adjacentToSelectedLeft: this.cell.isAdjacentToLeftSelection,
        edit                  : this.cell.editing,
      }, cell.cls]);

      let tdStyle: any = {position: 'relative', overflow: 'hidden', padding: '0px'};
      if (!this.column.visible) {
        tdStyle.display = 'none';
      }

      if (!this.cell.enabled) {
        tdStyle.color     = 'gray';
        tdStyle.fontStyle = 'italic';
      }

      if (cell.editing) {
        cellInnerContainerStyle.overflow = 'visible';
        cellInnerContainerStyle.padding  = '0px 2px';
        tdStyle.borderTopColor           = 'transparent';
        tdStyle.borderRightColor         = 'transparent';
        tdStyle.borderBottomColor        = 'transparent';
        tdStyle.borderLeftColor          = 'transparent';
      }

      if (cell.isAdjacentToTopSelection && cell.grid.editingCell) {
        tdStyle.borderBottomColor = this.props.theme.palette.gridBorder.main;
      }
      if (cell.isAdjacentToLeftSelection && cell.grid.editingCell) {
        tdStyle.borderRightColor  = this.props.theme.palette.gridBorder.main;
      }

      let colSpan = cell.colSpan;
      let rowSpan = cell.rowSpan;

      let innerCell =
        <div className={classes.cellContainer}>
          <div style={cellInnerContainerStyle}>
            {this.renderCell()}
          </div>
        </div>;

      let cellContent = cell.error && !cell.editing
        ? <Tooltip
            title={cell.error.messageText}
            placement='right-start'
            TransitionComponent={Fade}
            PopperProps={{ style: {pointerEvents: 'none'} }}
            classes={{popper: classes.tooltipPopper, tooltip: classes.tooltip}}
          >
            {innerCell}
          </Tooltip>
        : innerCell;

      return (
        <td tabIndex={0}
          style={tdStyle}
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
          className={clazz}>
            {cellContent}
        </td>
      );
    }} />;
  }
}

export default withStyles(styles, Cell);
