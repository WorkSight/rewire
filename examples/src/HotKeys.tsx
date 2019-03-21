import * as React        from 'react';
import { Modal, Dialog } from 'rewire-ui';
import Typography        from '@material-ui/core/Typography';

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

export const HotKeysDialog = () => (
  <Dialog dialog={hotkeysModel} title={getGridDialogTitle} maxWidth='sm'>
    <div style={{padding: '16px', maxHeight: '500px'}}>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap'}}>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + C:</Typography>
          <Typography>Copy Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + V:</Typography>
          <Typography>Paste To Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + X:</Typography>
          <Typography>Cut Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + R:</Typography>
          <Typography>Revert Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + U:</Typography>
          <Typography>Revert Selected Row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Insert:</Typography>
          <Typography>Insert Row below selected row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + D:</Typography>
          <Typography>Duplicate selected row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Delete:</Typography>
          <Typography>Delete selected row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Escape:</Typography>
          <Typography>If editing, exit editing without changes. Otherwise, de-select cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Enter:</Typography>
          <Typography>If editing, exit editing with changes</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Delete:</Typography>
          <Typography>If not editing, delete value of selected cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Up:</Typography>
          <Typography>Move up one cell</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Down:</Typography>
          <Typography>Move down one cell</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Left:</Typography>
          <Typography>Move left one cell. If end of line, attempt to wrap to line above</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Right:</Typography>
          <Typography>Move right one cell. If end of line, attempt to wrap to line below</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Home:</Typography>
          <Typography>Go to the first selectable cell of the row</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>End:</Typography>
          <Typography>Go to the last selectable cell of the row</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Home:</Typography>
          <Typography>Go to the first selectable cell of the grid</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + End:</Typography>
          <Typography>Go to the last selectable cell of the grid</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Click:</Typography>
          <Typography>If Multiselect, append selection</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Drag:</Typography>
          <Typography>If Multiselect, append dragged cells</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Shift + Click:</Typography>
          <Typography>If Multiselect, append cells between start and clicked cell</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Shift + Drag:</Typography>
          <Typography>If Multiselect, append cells between start and dragged cells</Typography>
        </div>
      </div>
    </div>
  </ Dialog>
);
