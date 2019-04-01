    import * as React from 'react';
    import {
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
        let upCell = cell.grid.adjacentTopCell(cell, true);
        if (!upCell) {
          return;
        }
        cell.grid.startCell = upCell;
        cell.grid.selectCells([upCell]);
      },

      'ArrowDown': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell below the currently selected and focused cell
        evt.preventDefault();
        evt.stopPropagation();
        let downCell = cell.grid.adjacentBottomCell(cell, true);
        if (!downCell) {
          return;
        }
        cell.grid.startCell = downCell;
        cell.grid.selectCells([downCell]);
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
        let prevCell: ICell | undefined;
        prevCell = cell.grid.previousCell(cell, true);
        if (!prevCell) {
          return;
        }
        cell.grid.startCell = prevCell;
        cell.grid.selectCells([prevCell]);
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
        let nextCell: ICell | undefined;
        nextCell = cell.grid.nextCell(cell, true);
        if (!nextCell) {
          return;
        }
        cell.grid.startCell = nextCell;
        cell.grid.selectCells([nextCell]);
      },

      'Shift+ArrowUp': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select all selectable cells between the starting cell and the first selectable cell above the currently selected and focused cell
        evt.preventDefault();
        evt.stopPropagation();
        if (!cell.grid.multiSelect) {
          return;
        }
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
        // Select all selectable cells between the starting cell and the first selectable cell below the currently selected and focused cell
        evt.preventDefault();
        evt.stopPropagation();
        if (!cell.grid.multiSelect) {
          return;
        }
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
        // Select all selectable cells between the starting cell and the first selectable cell that is to the left of the currently selected and focused cell
        if (cell.editing) {
          evt.stopPropagation();
          if (cell.column.type === 'select' || cell.column.type === 'multiselect' || cell.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        if (!cell.grid.multiSelect) {
          return;
        }
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
        // Select all selectable cells between the starting cell and the first selectable cell that is to the right of the currently selected and focused cell
        if (cell.editing) {
          evt.stopPropagation();
          if (cell.column.type === 'select' || cell.column.type === 'multiselect' || cell.column.type === 'checked') {
            evt.preventDefault();
          }
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        if (!cell.grid.multiSelect) {
          return;
        }
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
        let nextCell = cell.grid.nextCell(cell, true);
        if (!nextCell) {
          return;
        }
        cell.grid.startCell = nextCell;
        cell.grid.selectCells([nextCell]);
      },

      'Shift+Tab': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell to the left of the currently selected and focused cell. If there are none, move up a row and start from the end (right)
        evt.preventDefault();
        evt.stopPropagation();
        let prevCell = cell.grid.previousCell(cell, true);
        if (!prevCell) {
          return;
        }
        cell.grid.startCell = prevCell;
        cell.grid.selectCells([prevCell]);
      },

      'Home': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell in the currently selected row (left-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let firstCellInRow = cell.grid.firstCellInRow(cell.row, true);
        if (firstCellInRow) {
          cell.grid.selectCells([firstCellInRow]);
        }
      },

      'End': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the last selectable cell in the currently selected row (right-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let lastCellInRow = cell.grid.lastCellInRow(cell.row, true);
        if (lastCellInRow) {
          cell.grid.selectCells([lastCellInRow]);
        }
      },

      'Ctrl+Home': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the first selectable cell grid (top-left-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let firstCell = cell.grid.firstCell(true);
        if (firstCell) {
          cell.grid.selectCells([firstCell]);
        }
      },

      'Ctrl+End': (evt: React.KeyboardEvent<any>, cell: ICell) => {
        // Select the last selectable cell grid (bottom-right-most)
        if (cell.editing) {
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        let lastCell = cell.grid.lastCell(true);
        if (lastCell) {
          cell.grid.selectCells([lastCell]);
        }
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
        if (cell.enabled && !cell.readOnly && cell.editable && cell.column.editor) {
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
       Ctrl+R:       Revert selected cell(s) to their original values
       Ctrl+U:       Revert selected row(s) to their original values
       Ctrl+Shift+U: Revert grid to its original value (data cells only)
       Ctrl+X:       Cut selected cell(s)
       Ctrl+V:       Paste to selected cell(s)
       Delete:       Delete value(s) of selected cell(s)
      -----------------------------------------------------------------*/
      'Ctrl+R'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.revertSelectedCells(); evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+U'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.revertSelectedRows();  evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+Shift+U': (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.revert();              evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+X'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.cut();                 evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+V'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.paste();               evt.stopPropagation(); evt.preventDefault(); },
      'Delete'      : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.clearSelectedCells();  evt.stopPropagation(); evt.preventDefault(); },

      /******************************/
      /*** Grid Row Manipulation ****/
      /******************************/
      /*---------------------------------------------------
       Ctrl+Insert: Insert new row below selected row(s)
       Ctrl+D:      Duplicate selected row(s) below them
       Ctrl+Delete: Delete selected row(s)
      ---------------------------------------------------*/
      'Ctrl+Insert': (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.rowKeybindPermissions.insertRow && cell.grid.insertRowAtSelection();     evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+D'     : (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.rowKeybindPermissions.duplicateRow && cell.grid.duplicateSelectedRows(); evt.stopPropagation(); evt.preventDefault(); },
      'Ctrl+Delete': (evt: React.KeyboardEvent<any>, cell: ICell) => { if (cell.editing) { return; } cell.grid.rowKeybindPermissions.deleteRow && cell.grid.removeSelectedRows();       evt.stopPropagation(); evt.preventDefault(); },
    };