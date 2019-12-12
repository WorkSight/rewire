import * as React            from 'react';
import {
  Modal,
  Dialog,
  WithStyle,
  withStyles,
  CSSTheme
}                            from 'rewire-ui';
import { Theme, makeStyles } from '@material-ui/core/styles';
import Typography            from '@material-ui/core/Typography';

class HotkeysModel extends Modal {
  constructor() {
    super('');
    this.action('close', {color: 'secondary', icon: 'cancel'});
  }
}

export const hotkeysModel = new HotkeysModel();

const getGridDialogTitle = (dialog: Modal): JSX.Element => {
  return <div>Grid Hotkeys List</div>;
};

const styles = (theme: Theme) => ({
  dialogContentsContainer: {
    padding: '16px',
    maxHeight: '600px',
  },
  dialogContents: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  hotkeyContainer: {
    display: 'flex',
  },
  hotkeyLabel: {
    width: '125px',
  },
}) as CSSTheme;

const useHotKeyStyles = makeStyles(styles);

export const HotKeysDialog = (props: any) => {
    const classes = useHotKeyStyles();

    return (
      <Dialog dialog={hotkeysModel} title={getGridDialogTitle} maxWidth='sm'>
        <div className={classes.dialogContentsContainer}>
          <div className={classes.dialogContents}>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + C:</Typography>
              <Typography variant='body2'>Copy Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + V:</Typography>
              <Typography variant='body2'>Paste To Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + X:</Typography>
              <Typography variant='body2'>Cut Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + R:</Typography>
              <Typography variant='body2'>Revert Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + U:</Typography>
              <Typography variant='body2'>Revert Selected Row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + Insert:</Typography>
              <Typography variant='body2'>Insert Row below selected row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + D:</Typography>
              <Typography variant='body2'>Duplicate selected row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + Delete:</Typography>
              <Typography variant='body2'>Delete selected row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Escape:</Typography>
              <Typography variant='body2'>If editing, exit editing without changes. Otherwise, de-select cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Enter:</Typography>
              <Typography variant='body2'>If editing, exit editing with changes</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Delete:</Typography>
              <Typography variant='body2'>If not editing, delete value of selected cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Arrow Up:</Typography>
              <Typography variant='body2'>Move up one cell</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Arrow Down:</Typography>
              <Typography variant='body2'>Move down one cell</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Arrow Left:</Typography>
              <Typography variant='body2'>Move left one cell. If end of line, attempt to wrap to line above</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Arrow Right:</Typography>
              <Typography variant='body2'>Move right one cell. If end of line, attempt to wrap to line below</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Home:</Typography>
              <Typography variant='body2'>Go to the first selectable cell of the row</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>End:</Typography>
              <Typography variant='body2'>Go to the last selectable cell of the row</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + Home:</Typography>
              <Typography variant='body2'>Go to the first selectable cell of the grid</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + End:</Typography>
              <Typography variant='body2'>Go to the last selectable cell of the grid</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + Click:</Typography>
              <Typography variant='body2'>If Multiselect, append selection</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Ctrl + Drag:</Typography>
              <Typography variant='body2'>If Multiselect, append dragged cells</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Shift + Click:</Typography>
              <Typography variant='body2'>If Multiselect, append cells between start and clicked cell</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography variant='body2' className={classes.hotkeyLabel}>Shift + Drag:</Typography>
              <Typography variant='body2'>If Multiselect, append cells between start and dragged cells</Typography>
            </div>
          </div>
        </div>
      </ Dialog>
    );
};
