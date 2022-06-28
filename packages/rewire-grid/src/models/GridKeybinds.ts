    import React from 'react';
    import {
      IRow,
      ICell,
      IGridStaticKeybinds,
      IGridVariableKeybinds
    } from './GridTypes';

    /**********************************************************************/
    /************************** Static Keybinds ***************************/
    /**********************************************************************/
    export const gridStaticKeybinds: IGridStaticKeybinds = {
      /******************************/
      /********* NAVIGATION *********/
      /******************************/
      /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
       ArrowUp:          Select the first selectable cell above the currently selected and focused cell
       ArrowDown:        Select the first selectable cell below the currently selected and focused cell
       ArrowLeft:        Select the first selectable cell to the left of the currently selected and focused cell. If there are none, move up a row and start from the end (right)
       ArrowRight:       Select the first selectable cell to the right of the currently selected and focused cell. If there are none, move down a row and begin from the start (left)
      -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
       Shift+ArrowUp:    Select all selectable cells between the starting cell and the first selectable cell above the currently selected and focused cell
       Shift+ArrowDown:  Select all selectable cells between the starting cell and the first selectable cell below the currently selected and focused cell
       Shift+ArrowLeft:  Select all selectable cells between the starting cell and the first selectable cell that is to the left of the currently selected and focused cell
       Shift+ArrowRight: Select all selectable cells between the starting cell and the first selectable cell that is to the right of the currently selected and focused cell
      -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
       Tab:              Select the first selectable cell to the right of the currently selected and focused cell. If there are none, move down a row and begin from the start (left)
       Shift+Tab:        Select the first selectable cell to the left of the currently selected and focused cell. If there are none, move up a row and start from the end (right)
      -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
       Home:             Select the first selectable cell in the currently selected row (left-most)
       End:              Select the last selectable cell in the currently selected row (right-most)
      -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
       Ctrl+Home:        Select the first selectable cell grid (top-left-most)
       Ctrl+End:         Select the last selectable cell grid (bottom-right-most)
      -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
      'ArrowUp': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell above the currently selected and focused cell
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let nextStartCell   = cell;
        let upCell          = cell.grid.adjacentTopCell(cell, true);
        if (upCell) {
          cell.grid.selectCells([upCell]);
          nextStartCell = upCell;
        }
        cell.grid.startCell = nextStartCell;
      },

      'ArrowDown': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell below the currently selected and focused cell
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let nextStartCell   = cell;
        let downCell        = cell.grid.adjacentBottomCell(cell, true);
        if (downCell) {
          cell.grid.selectCells([downCell]);
          nextStartCell = downCell;
        }
        cell.grid.startCell = nextStartCell;
      },

      'ArrowLeft': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell to the left of the currently selected and focused cell. If there are none, move up a row and start from the end (right)
        if (cell.editing) {
          evt.stopPropagation();
          if (cell.column.type === 'select' || cell.column.type === 'multiselect' || cell.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let nextStartCell   = cell;
        let prevCell: ICell | undefined;
        prevCell = cell.grid.previousCell(cell, true);
        if (prevCell) {
          cell.grid.selectCells([prevCell]);
          nextStartCell = prevCell;
        }
        cell.grid.startCell = nextStartCell;
      },

      'ArrowRight': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell to the right of the currently selected and focused cell. If there are none, move down a row and begin from the start (left)
        if (cell.editing) {
          evt.stopPropagation();
          if (cell.column.type === 'select' || cell.column.type === 'multiselect' || cell.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let nextStartCell   = cell;
        let nextCell: ICell | undefined;
        nextCell = cell.grid.nextCell(cell, true);
        if (nextCell) {
          cell.grid.selectCells([nextCell]);
          nextStartCell = nextCell;
        }
        cell.grid.startCell = nextStartCell;
      },

      'Shift+ArrowUp': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select all selectable cells between the starting cell and the first selectable cell above the currently selected and focused cell if multiselect is enabled
        if (!cell.grid.multiSelect) {
          gridStaticKeybinds['ArrowUp'](evt, cell);
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let upCell = cell.grid.adjacentTopCell(cell, true);
        if (!upCell) {
          return;
        }
        if (!cell.grid.startCell) {
          cell.grid.startCell = cell;
        }
        cell.grid.selectCellsTo(upCell);
      },

      'Shift+ArrowDown': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select all selectable cells between the starting cell and the first selectable cell below the currently selected and focused cell if multiselect is enabled
        if (!cell.grid.multiSelect) {
          gridStaticKeybinds['ArrowDown'](evt, cell);
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let downCell = cell.grid.adjacentBottomCell(cell, true);
        if (!downCell) {
          return;
        }
        if (!cell.grid.startCell) {
          cell.grid.startCell = cell;
        }
        cell.grid.selectCellsTo(downCell);
      },

      'Shift+ArrowLeft': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select all selectable cells between the starting cell and the first selectable cell that is to the left of the currently selected and focused cell if multiselect is enabled
        if (cell.editing) {
          evt.stopPropagation();
          if (cell.column.type === 'select' || cell.column.type === 'multiselect' || cell.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }
        if (!cell.grid.multiSelect) {
          gridStaticKeybinds['ArrowLeft'](evt, cell);
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let leftCell: ICell | undefined;
        leftCell = cell.grid.adjacentLeftCell(cell, true);
        if (!leftCell) {
          return;
        }
        if (!cell.grid.startCell) {
          cell.grid.startCell = cell;
        }
        cell.grid.selectCellsTo(leftCell);
      },

      'Shift+ArrowRight': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select all selectable cells between the starting cell and the first selectable cell that is to the right of the currently selected and focused cell if multiselect is enabled
        if (cell.editing) {
          evt.stopPropagation();
          if (cell.column.type === 'select' || cell.column.type === 'multiselect' || cell.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }
        if (!cell.grid.multiSelect) {
          gridStaticKeybinds['ArrowRight'](evt, cell);
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let rightCell: ICell | undefined;
        rightCell = cell.grid.adjacentRightCell(cell, true);
        if (!rightCell) {
          return;
        }
        if (!cell.grid.startCell) {
          cell.grid.startCell = cell;
        }
        cell.grid.selectCellsTo(rightCell);
      },

      'Tab': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell to the right of the currently selected and focused cell. If there are none, move down a row and begin from the start (left)
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let newStartCell    = cell;
        let nextCell        = cell.grid.nextCell(cell, true);
        if (nextCell) {
          cell.grid.selectCells([nextCell]);
          newStartCell = nextCell;
        }
        cell.grid.startCell = newStartCell;
      },

      'Shift+Tab': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell to the left of the currently selected and focused cell. If there are none, move up a row and start from the end (right)
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let newStartCell    = cell;
        let prevCell        = cell.grid.previousCell(cell, true);
        if (prevCell) {
          cell.grid.selectCells([prevCell]);
          newStartCell = prevCell;
        }
        cell.grid.startCell = newStartCell;
      },

      'Home': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell in the currently selected row (left-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let newStartCell    = cell;
        let firstCellInRow  = cell.grid.firstCellInRow(cell.row, true);
        if (firstCellInRow) {
          cell.grid.selectCells([firstCellInRow]);
          newStartCell = firstCellInRow;
        }
        cell.grid.startCell = newStartCell;
      },

      'End': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the last selectable cell in the currently selected row (right-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let newStartCell    = cell;
        let lastCellInRow   = cell.grid.lastCellInRow(cell.row, true);
        if (lastCellInRow) {
          cell.grid.selectCells([lastCellInRow]);
          newStartCell = lastCellInRow;
        }
        cell.grid.startCell = newStartCell;
      },

      'Ctrl+Home': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell grid (top-left-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let newStartCell    = cell;
        let firstCell       = cell.grid.firstCell(true);
        if (firstCell) {
          cell.grid.selectCells([firstCell]);
          newStartCell = firstCell;
        }
        cell.grid.startCell = newStartCell;
      },

      'Ctrl+End': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the last selectable cell grid (bottom-right-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.startCell = undefined;
        let newStartCell    = cell;
        let lastCell        = cell.grid.lastCell(true);
        if (lastCell) {
          cell.grid.selectCells([lastCell]);
          newStartCell = lastCell;
        }
        cell.grid.startCell = newStartCell;
      },

      /******************************/
      /********** Edit Mode *********/
      /******************************/
      /*-----------------------------------------------------------------------------------------------------
       Escape: If editing, exit editing mode without changes, and re-select cell. Otherwise, remove selection
       Enter:  Exit editing mode with changes, and re-select cell
       F2:     Enter editing mode on selected cell
      -----------------------------------------------------------------------------------------------------*/
      'Escape': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // If editing, exit editing mode without changes, and re-select cell. Otherwise, remove selection
        evt.preventDefault();
        evt.stopPropagation();
        if (cell.editing) {
          cell.grid.editCell(undefined);
          setTimeout(() => {
            cell.setFocus();
          }, 0);
        } else {
          cell.grid.selectCells([]);
          cell.grid.startCell = undefined;
          cell.setFocus(false);
        }
      },

      'Enter': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Exit editing mode with changes, and re-select cell
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.editCell(undefined);
        cell.setFocus();
      },

      'F2': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Enter editing mode on selected cell
        evt.preventDefault();
        evt.stopPropagation();
        if (!cell.readOnly && cell.editable && cell.column.editor && cell.canSelect) {
          cell.keyForEdit = undefined;
          cell.grid.editCell(cell);
        }
      },

      /******************************/
      /******** Miscellaneous *******/
      /******************************/
      /*----------------------------
       Ctrl+C: Copy selected cell(s)
      -----------------------------*/
      'Ctrl+C': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Copy selected cell(s)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        cell.grid.copy();
      },
    };

    /**********************************************************************/
    /********************* Default Variable Keybinds **********************/
    /**********************************************************************/
    export const gridDefaultVariableKeybinds: IGridVariableKeybinds = {
      /******************************/
      /*** Cell Value Manipulation **/
      /******************************/
      /*-----------------------------------------------------------------
       Ctrl+Shift+U: Revert grid to its original value (data cells only)
       Ctrl+X:       Cut selected cell(s)
       Ctrl+V:       Paste to selected cell(s)
       Delete:       Delete value(s) of selected cell(s)
      -----------------------------------------------------------------*/
      'Ctrl+Shift+U': (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing || !cell.grid.isChangeTracking) { return; } cell.grid.revert(); evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+X'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.cut();                                   evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+V'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.paste();                                 evt.stopPropagation(); evt.preventDefault(); },
      'Delete'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.clearSelectedCells();                    evt.stopPropagation(); evt.preventDefault(); },

      /******************************/
      /*** Grid Row Manipulation ****/
      /******************************/
      /*---------------------------------------------------
       Ctrl+Insert: Insert new row below selected row(s)
       Ctrl+D:      Duplicate selected row(s) below them
       Ctrl+Delete: Delete selected row(s)
      ---------------------------------------------------*/
      'Ctrl+Insert': (evt: React.KeyboardEvent<any>, cell: ICell): IRow | undefined   => { if (cell.editing) { return; } let newRow = cell.grid.rowKeybindPermissions.insertRow && cell.grid.insertRowAtSelection() || undefined;     evt.stopPropagation(); evt.preventDefault(); return newRow; },
      'Ctrl+D'     : (evt: React.KeyboardEvent<any>, cell: ICell): IRow[] | undefined => { if (cell.editing) { return; } let newRow = cell.grid.rowKeybindPermissions.duplicateRow && cell.grid.duplicateSelectedRows() || undefined; evt.stopPropagation(); evt.preventDefault(); return newRow; },
      'Ctrl+Delete': (evt: React.KeyboardEvent<any>, cell: ICell)                     => { if (cell.editing) { return; } cell.grid.rowKeybindPermissions.deleteRow && cell.grid.removeSelectedRows();                                 evt.stopPropagation(); evt.preventDefault(); },
    };