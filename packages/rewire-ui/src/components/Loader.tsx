import * as React              from 'react';
import * as is                 from 'is';
import CircularProgress        from '@material-ui/core/CircularProgress';
import Fade, {FadeProps}       from '@material-ui/core/Fade';
import {makeStyles, Theme}     from '@material-ui/core/styles';    
import {WithStyle, CSSTheme}   from './styles';

// patch fade to get rid of the error for passing the style.
const F = Fade as React.ComponentType<FadeProps & {style?: React.CSSProperties}>;

const styles = (theme: Theme) => ({
  root: {
    position: 'relative',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#153d4638',
  },
}) as CSSTheme;

export type LoaderStyles = ReturnType<typeof styles>;

const useStyles = makeStyles(styles);

export interface ILoaderProps {
  loading?: boolean,
  delay?: boolean | number,
  children: JSX.Element,
  classes?: any,
}

export type LoaderProps = WithStyle<LoaderStyles, ILoaderProps>;

export default (props: LoaderProps) => {
  if (props.loading) {
    const classes = useStyles(props);
    const delay   = props.delay ? (is.number(props.delay) ? props.delay : 800) : 0;
    return (
      <div className={classes.root}>
        {props.children}
        <F in={props.loading} style={{transitionDelay: delay + 'ms'}} unmountOnExit>
          <div className={classes.progressContainer}>
            <CircularProgress />
          </div>
        </F>
      </div>
    );
  }
  return props.children;
};
