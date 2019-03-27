import * as React from 'react';
import Fade       from '@material-ui/core/Fade';
import Grow       from '@material-ui/core/Grow';

type TransitionProps = {
  transition?: 'fade' | 'grow',
  timeout?:    number,
  children:    JSX.Element
};

const defaultTimeout: number = 1500;

export default class TransitionWrapper extends React.Component<TransitionProps> {
  render() {
    const { timeout, transition, children }  = this.props;

    if (transition === 'grow') {
      return (
        <Grow in={true} timeout={timeout ? timeout : defaultTimeout}>
          {children}
        </Grow>
      );
    }

    return (
      <Fade in={true} timeout={timeout ? timeout : defaultTimeout}>
        {children}
      </Fade>
    );
  }
}
