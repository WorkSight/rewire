import React        from 'react';
import { Modal, Dialog } from 'rewire-ui';
import Typography        from '@material-ui/core/Typography';

export class YesNoModel extends Modal {
  constructor(params: any) {
    super(params.title, params.open);

    const action           = params.action;
    const primaryCaption   = params.yesCaption    || 'yes';
    const secondaryCaption = params.noCaption     || 'no';
    const primaryColour    = params.primaryColour || 'primary';
    const secondaryColour  = params.secondaryColour;

    this.action(primaryCaption, () => (action ? action() : true), {color: primaryColour});
    this.action(secondaryCaption, {color: secondaryColour});
  }
}

export const YesNoDialog = (props: any) => (
  <Dialog dialog={props.viewModel} maxWidth='md'>
    <div style={{ textAlign: 'center', margin: 16 }}>
      {props.children}
    </div>
  </Dialog>
);

export class ConfirmationModel extends Modal {
  constructor(params: any) {
    super(params.title, params.open);

    const yesAction        = params.yesAction;
    const noAction         = params.noAction;
    const primaryCaption   = params.yesCaption    || 'yes';
    const secondaryCaption = params.noCaption     || 'no';
    const primaryColour    = params.primaryColour || 'primary';
    const secondaryColour  = params.secondaryColour;

    this.action(primaryCaption,   () => (yesAction && yesAction()), {color: primaryColour});
    this.action(secondaryCaption, () => (noAction  && noAction()),  {color: secondaryColour});
  }
}

export const ConfirmationDialog = (props: any) => (
  <Dialog dialog={props.viewModel} maxWidth='xs'>
    <div style={{ textAlign: 'center', margin: 16 }}>
      <Typography variant='body2'>Are you really sure?</Typography>
    </div>
  </Dialog>
);
