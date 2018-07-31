import {
  IGrid,
  IColumn,
  ICell
}                    from '../models/GridTypes';
import * as React    from 'react';
import cc            from 'classcat';
import {Observe}     from 'rewire-core';

export interface ICellProps {
  cell: ICell;
}

export default class Cell extends React.PureComponent<ICellProps, {}> {
  cell:   ICell;
  column: IColumn;
  grid:   IGrid;
  keyForEdit?: string;
  element: HTMLTableCellElement;

  constructor(props: ICellProps) {
    super(props);
    this.cell       = props.cell;
    this.column     = this.cell.column;
    this.grid       = this.column.grid;
    this.keyForEdit = undefined;

    // this.using(this.selected.on(v => this.setFocus(v)));
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

    setTimeout(function() {
      this.element.focus();
    }, 0);
    this.element.focus();
  }

  handleDoubleClick = (evt: React.MouseEvent<any>) => {
    if (this.cell.enabled && !this.cell.readOnly) {
      this.keyForEdit = undefined;
      this.grid.editCell(this.cell);
    }
  }

  copyToClipboard() {
    let text = this.cell.value;
    if (this.cell.column.map) {
      text = this.cell.column.map(text);
    }
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.keyCode === 67) { evt.key = 'C'; }
    switch (evt.key) {
      case 'C':
        if (!evt.ctrlKey) {
          return;
        }
        this.copyToClipboard();
        evt.stopPropagation;
        evt.preventDefault;
        break;
      case 'Escape':
        this.grid.editCell(undefined);
        setTimeout(() => {
          if (this.element) this.element.focus();
        }, 0);
        break;

      case 'Delete':
        if (this.cell.editing) {
          return;
        }
        this.cell.clear();
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

  handleClick = (evt: React.MouseEvent<any>) => {
    this.grid.selectCell(this.cell);
    evt.stopPropagation();
  }

  handleFocus = (evt: React.FocusEvent<any>) => {
    if (this.cell.editing) {
      return;
    }
    this.grid.selectCell(this.cell);
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

  renderError() {
    if (!this.cell.error || !this.cell.selected) {
      return null;
    }

    return (
      <div style={{marginTop: 0, marginLeft: 4}} className='tooltip fade in right' role='tooltip'><div className='tooltip-arrow'></div><div className='tooltip-inner'>{this.cell.error.messageText}</div></div>
    );
  }

  get value(): string {
    if (this.cell.column.map) return this.cell.column.map(this.cell.value);
    return this.cell.value;
  }

  onValueChange = (value: any) => { this.cell.value = value; this.grid.editCell(undefined); };

  handleTooltip = (evt: React.MouseEvent<HTMLSpanElement>) => {
    const node = evt.target as HTMLSpanElement;
    node.setAttribute('title', (node.offsetWidth < node.scrollWidth) ? this.cell.value : '');
  }

  renderCell() {
    let cell = this.cell;
    if (cell.editing) {
      let Editor =  cell.editor || cell.column.editor;
      if (!Editor) return;
      let endOfTextOnFocus = false;
      let selectOnFocus    = true;
      let value            = cell.value;
      if (this.keyForEdit) {
        value = this.keyForEdit;
        endOfTextOnFocus = true;
        selectOnFocus = false;
      }
      return <Editor field={{...cell, value: value, autoFocus: true}} endOfTextOnFocus={endOfTextOnFocus} selectOnFocus={selectOnFocus} className={cell.cls} onValueChange={this.onValueChange} />;
    }

    return <Observe render={
    () => {
        let align    = this.column.align;
        if (this.cell.align) align = align;
        let hasError = !!this.cell.error;
        let errorCls = cc([{hidden: !hasError || cell.editing}, 'fa fa-exclamation-circle']);

        return (
        <>
          {cell.renderer || <span onMouseEnter={this.handleTooltip} style={{width: '100%', textAlign: align}}>{this.value}</span>}
          {hasError && <i className={errorCls} title={cell.error && cell.error.messageText} style={{flexBasis: '12px', lineHeight: '28px', height: '100%', fontSize: 10, color: '#AA0000', marginLeft: '4px', alignSelf: 'center'}} />}
        </>
      );
    }} />;
  }

  render() {
    return <Observe render={() => {
      let cell = this.cell;
      if (!cell) {
        return <div></div>;
      }
      let style: React.CSSProperties = {overflow: 'hidden', flex: '1', height: '100%', alignItems: 'center', padding: 0, margin: 0, display: 'flex', width: '100%'};
      let clazz      = cc([{
        selected    : this.cell.selected,
        edit        : this.cell.editing,
      }, cell.cls]);

      let tdStyle: any = {overflow: 'hidden', padding: '0 4px'};
      if (!this.column.visible) {
        tdStyle.display = 'none';
      }

      if (this.cell.readOnly || !this.cell.enabled) {
        tdStyle.color     = 'gray';
        tdStyle.fontStyle = 'italic';
      }

      if (cell.editing) {
        style.overflow   = 'visible';
        tdStyle.overflow = 'visible';
        tdStyle.outline  = 0;
        tdStyle.padding  = 0;
      }
      let colSpan  = cell.colSpan;
      let rowSpan  = cell.rowSpan;

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
            className={clazz}>
          <div style={{display: 'flex', alignItems: 'stretch', lineHeight: '28px', height: '100%', width: '100%'}}>
            <div style={style}>
              {this.renderCell()}
            </div>
            {this.renderError()}
          </div>
        </td>
      );
    }} />;
  }
}
