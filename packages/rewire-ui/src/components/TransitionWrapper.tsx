import React from 'react';
import Fade       from '@material-ui/core/Fade';
import Grow       from '@material-ui/core/Grow';

export interface ITransitionWrapperProps {
  transition?: 'fade' | 'grow';
  timeout?:    number;
  children:    JSX.Element;
}

const defaultTimeout: number = 600;

export default class TransitionWrapper extends React.Component<ITransitionWrapperProps> {
  render() {
    const { timeout, transition, children, ...restProps }  = this.props;

    if (transition === 'grow') {
      return (
        <Grow in={true} timeout={timeout ? timeout : defaultTimeout} {...restProps}>
          {children}
        </Grow>
      );
    }

    return (
      <Fade in={true} timeout={timeout ? timeout : defaultTimeout} {...restProps}>
        {children}
      </Fade>
    );
  }
}
