import * as React from 'react';
const focusedElementSelectorCell = 'td[tabindex="0"]:not([style*="display: none"]):not(.notVisible):not(.disabled):not(.fixed)';
const focusedElementSelector     = '[tabindex="0"]:not([style*="display: none"]):not(.notVisible):not(.disabled):not(.fixed),input:not([type="hidden"]):not([disabled]):not([style*="display: none"])';
const rowsSelector               = '.tabrow:not([type="hidden"]):not(.notVisible):not([disabled])';

export default class GridKeyboardNavigation {
  private _element: HTMLElement;
  private _fields?: HTMLElement[];
  private _rows?: HTMLElement[];

  constructor() {
  }

  get element() {
    return this._element;
  }
  set element(value: HTMLElement | undefined) {
    if (this._element) {
      this._element.removeEventListener('DOMSubtreeModified', this.onDOMChanged);
    }
    this._fields  = undefined;
    this._rows    = undefined;
    if (!value) return;
    this._element = value;
    this._element.addEventListener('DOMSubtreeModified', this.onDOMChanged);
  }

  onDOMChanged = () => {
    this._rows   = undefined;
    this._fields = undefined;
  }

  get fields(): HTMLElement[] {
    if (!this._fields) {
      this._fields = Array.from(this._element.querySelectorAll(focusedElementSelector));
    }
    return this._fields;
  }

  innerRef = (ref: HTMLElement) => {
    this.element = ref;
  }

  get rows(): HTMLElement[] {
    if (!this._rows) {
      this._rows = Array.from(this._element.querySelectorAll(rowsSelector));
    }
    return this._rows;
  }

  selectRange(ctrl: HTMLInputElement, start: number, end?: number) {
    ctrl.focus();
    ctrl.setSelectionRange(start, end || start);
  }

  canMove(ctrl: HTMLElement | HTMLInputElement, direction: number) {
    let input = (ctrl as HTMLInputElement);
    if (input.setSelectionRange) {
      let caretPosition = input.selectionStart! + direction;
      return (caretPosition < 0) || (caretPosition > input.value.length);
    }

    return true;
  }

  moveToNextControl(ctl: HTMLElement, direction: number) {
    // if (!this.canMove(ctl, direction)) {
    //   return false;
    // }

    let index = this.fields.indexOf(ctl);
    if (index < 0) {
      index = this.fields.indexOf(ctl.closest(focusedElementSelector) as HTMLElement);
      if (index < 0) {
        return false;
      }
    }

    index = index + direction;

    if (index < 0) {
      index = 0;
    }
    if (index >= this.fields.length) {
      index = this.fields.length - 1;
    }

    return this.setFocus(this.fields[index] as HTMLElement);
  }

  setFocus(field: HTMLElement | HTMLInputElement) {
    if (!field) {
      return true;
    }

    field.focus();
    const inputElement = field as HTMLInputElement;
    if (inputElement && inputElement.select) {
      inputElement.select();
      return true;
    }

    if (inputElement.type === 'text') {
      this.selectRange(inputElement, 0, inputElement.value.length);
    }
    return true;
  }

  indexOf(nodes: NodeListOf<HTMLElement>, node: HTMLElement) {
    let i = 0;
    for (const current of nodes) {
      if (current === node) return i;
      i++;
    }
    return -1;
  }

  getRowFields(row: HTMLElement): HTMLElement[] {
    return Array.from(row.querySelectorAll(focusedElementSelector));
  }

  getPosition(ctl: HTMLElement) {
    const row = ctl.closest(rowsSelector) as HTMLElement;
    if (!row) {
      return {row: -1, column: -1};
    }

    let currentRowIdx = this.rows.indexOf(row);
    let currentColIdx = this.indexOf(row.querySelectorAll(focusedElementSelectorCell), ctl);
    if (currentColIdx < 0) {
      currentColIdx = this.indexOf(row.querySelectorAll(focusedElementSelector), ctl) - 1;
    }
    if (currentColIdx < 0) {
      return {row: -1, column: -1};
    }

    return {row: currentRowIdx, column: currentColIdx};
  }

  moveToStartOfLine(ctl: HTMLElement) {
    let {row, column} = this.getPosition(ctl);
    if ((row === -1) || (column === 0)) return true;

    const rowFields = this.getRowFields(this.rows[row]);
    return this.setFocus(rowFields[0]);
  }

  moveToStart() {
    if (this.fields.length === 0) return;
    return this.setFocus(this.fields[0]);
  }

  moveToEnd() {
    if (this.fields.length === 0) return;
    return this.setFocus(this.fields[this.fields.length - 1]);
  }

  moveToEndOfLine(ctl: HTMLElement) {
    let {row} = this.getPosition(ctl);
    if (row === -1) return true;

    const nextRowFields = this.getRowFields(this.rows[row]);
    return this.setFocus(nextRowFields[nextRowFields.length - 1]);
  }

  moveToNextRow(ctl: HTMLElement, direction: number) {
    let {row, column} = this.getPosition(ctl);
    if (row === -1) return;

    row += direction;
    if ((row < 0) || (row >= this.rows.length)) {
      return false;
    }

    const currRowFields = this.getRowFields(this.rows[row - direction]);
    const nextRowFields = this.getRowFields(this.rows[row]);
    let currColumnPos   = currRowFields[column]['dataset']['columnPosition'];
    column              = Math.min(column, nextRowFields.length - 1);
    let newColumnPos    = nextRowFields[column]['dataset']['columnPosition'];

    if (currColumnPos && newColumnPos) {
      let currColumnPosNum = Number.parseInt(currColumnPos);
      let newColumnPosNum  = Number.parseInt(newColumnPos);

      if (newColumnPosNum > currColumnPosNum) {
        do {
          column--;
          newColumnPos    = nextRowFields[column]['dataset']['columnPosition'];
          newColumnPosNum = newColumnPos && Number.parseInt(newColumnPos) || 0;
        } while (newColumnPos && newColumnPosNum > currColumnPosNum);
      } else if (newColumnPosNum < currColumnPosNum) {
        do {
          column++;
          newColumnPos    = nextRowFields[column]['dataset']['columnPosition'];
          newColumnPosNum = newColumnPos && Number.parseInt(newColumnPos) || 0;
        } while (newColumnPos && newColumnPosNum < currColumnPosNum);
      }
    }

    if (column < 0) {
      column = 0;
    }
    if (column > nextRowFields.length) {
      column = nextRowFields.length - 1;
    }

    return this.setFocus(nextRowFields[column]);
  }

  handleKeyDown = (evt: React.KeyboardEvent<HTMLElement>) => {
    if (!this._element) return;
    if (evt.shiftKey) {
      evt.key = 'Shift' + evt.key;
    }
    if (evt.ctrlKey) {
      evt.key = 'Ctrl' + evt.key;
    }

    switch (evt.key) {
      case 'CtrlHome':
        this.moveToStart();
        evt.preventDefault();
        evt.stopPropagation();
        return;

      case 'CtrlEnd':
        this.moveToEnd();
        evt.preventDefault();
        evt.stopPropagation();
        return;

      case 'Home':
        this.moveToStartOfLine(evt.target as HTMLElement);
        evt.preventDefault();
        evt.stopPropagation();
        return;

      case 'End':
        this.moveToEndOfLine(evt.target as HTMLElement);
        evt.preventDefault();
        evt.stopPropagation();
        return;

      case 'CtrlDelete':
        if (this.moveToNextRow(evt.target as HTMLElement, 1) || this.moveToNextRow(evt.target as HTMLElement, -1)) {
          evt.preventDefault();
        }
        evt.stopPropagation();
        return;

      case 'ArrowUp':
      case 'ShiftArrowUp':
        if (this.moveToNextRow(evt.target as HTMLElement, -1)) {
          evt.preventDefault();
        }
        evt.stopPropagation();
        return;

      case 'ArrowDown':
      case 'ShiftArrowDown':
        if (this.moveToNextRow(evt.target as HTMLElement, 1)) {
          evt.preventDefault();
        }
        evt.stopPropagation();
        return;

      case 'ArrowLeft':
      case 'ShiftTab':
      case 'ShiftArrowLeft':
        if (this.moveToNextControl(evt.target as HTMLElement, -1)) {
          evt.preventDefault();
        }
        evt.stopPropagation();
        return;

        case 'ArrowRight':
        case 'Tab':
        case 'ShiftArrowRight':
        if (this.moveToNextControl(evt.target as HTMLElement, 1)) {
          evt.preventDefault();
        }
        evt.stopPropagation();
        return;

      default:
        return;
    }
  }
}

export class GridKeyHandler extends React.Component<{children: (keyboard: GridKeyboardNavigation) => JSX.Element}> {
  private _keyboard = new GridKeyboardNavigation();

  componentWillUnmount() {
    this._keyboard.element = undefined;
  }

  render() {
    return this.props.children(this._keyboard);
  }
}