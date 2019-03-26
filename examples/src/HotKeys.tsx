import * as React                               from 'react';
import { Modal, Dialog, WithStyle, withStyles } from 'rewire-ui';
import Typography                               from '@material-ui/core/Typography';

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

const styles = () => ({
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
});

type HotKeysDialogProps = WithStyle<ReturnType<typeof styles>>;

export const HotKeysDialog = withStyles(styles, (props: HotKeysDialogProps) => {
    const {classes} = props;

    return (
      <Dialog dialog={hotkeysModel} title={getGridDialogTitle} maxWidth='sm'>
        <div className={classes.dialogContentsContainer}>
          <div className={classes.dialogContents}>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + C:</Typography>
              <Typography>Copy Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + V:</Typography>
              <Typography>Paste To Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + X:</Typography>
              <Typography>Cut Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + R:</Typography>
              <Typography>Revert Selected Cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + U:</Typography>
              <Typography>Revert Selected Row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + Insert:</Typography>
              <Typography>Insert Row below selected row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + D:</Typography>
              <Typography>Duplicate selected row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + Delete:</Typography>
              <Typography>Delete selected row(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Escape:</Typography>
              <Typography>If editing, exit editing without changes. Otherwise, de-select cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Enter:</Typography>
              <Typography>If editing, exit editing with changes</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Delete:</Typography>
              <Typography>If not editing, delete value of selected cell(s)</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Arrow Up:</Typography>
              <Typography>Move up one cell</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Arrow Down:</Typography>
              <Typography>Move down one cell</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Arrow Left:</Typography>
              <Typography>Move left one cell. If end of line, attempt to wrap to line above</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Arrow Right:</Typography>
              <Typography>Move right one cell. If end of line, attempt to wrap to line below</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Home:</Typography>
              <Typography>Go to the first selectable cell of the row</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>End:</Typography>
              <Typography>Go to the last selectable cell of the row</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + Home:</Typography>
              <Typography>Go to the first selectable cell of the grid</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + End:</Typography>
              <Typography>Go to the last selectable cell of the grid</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + Click:</Typography>
              <Typography>If Multiselect, append selection</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Ctrl + Drag:</Typography>
              <Typography>If Multiselect, append dragged cells</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Shift + Click:</Typography>
              <Typography>If Multiselect, append cells between start and clicked cell</Typography>
            </div>
            <div className={classes.hotkeyContainer}>
              <Typography className={classes.hotkeyLabel}>Shift + Drag:</Typography>
              <Typography>If Multiselect, append cells between start and dragged cells</Typography>
            </div>
          </div>
        </div>
      </ Dialog>
    );
});
