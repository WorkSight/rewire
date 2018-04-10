import * as React           from 'react';
import is                   from 'is';
import { CircularProgress } from 'material-ui/Progress';
import Fade, {FadeProps}    from 'material-ui/transitions/Fade';

// patch fade to get rid of the error for passing the style.
const F = Fade as React.ComponentType<FadeProps & {style?: React.CSSProperties}>;

export default (props: {loading?: boolean, delay?: (boolean | number), children: JSX.Element}) => {
  if (props.loading) {
    const delay = props.delay ? (is.number(props.delay) ? props.delay : 800) : 0;
    return (
      <div style={{position: 'relative'}}>
        {props.children}
        <F in={props.loading} style={{transitionDelay: delay + 'ms'}} unmountOnExit>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#153d4638'}}>
            <CircularProgress />
          </div>
        </F>
      </div>
    );
  }
  return props.children;
};
