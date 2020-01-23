import * as React              from 'react';
import classNames              from 'classnames';
import {Observe, observable}   from 'rewire-core';
import {isNullOrUndefined}     from 'rewire-common';
import Tooltip, {TooltipProps} from '@material-ui/core/Tooltip';
import Fade                    from '@material-ui/core/Fade';
import {SvgIconProps}          from '@material-ui/core/SvgIcon';
import {Theme, makeStyles}     from '@material-ui/core/styles';
import ErrorIcon               from '@material-ui/icons/Error';
import {withStyles, WithStyle} from './styles';

const styles = (theme: Theme) => ({
  root: {
  },
  errorIcon: {
    display: 'block',
    fontSize: '1em',
    color: '#AA0000',
  },
  tooltip: {
  },
});

const useTooltipStyles = makeStyles({
  tooltip: (props: any) => ({
    fontSize: isNullOrUndefined(props.fontSize) ? 'inherit' : `calc(${props.fontSize} * 0.8)`,
    padding: isNullOrUndefined(props.fonSize) ? undefined : `calc(${props.fontSize} * 0.2) calc(${props.fontSize} * 0.4)`,
  }),
});

export interface IErrorTooltipProps {
  classes  : any;
  error?   : string;
  fontSize?: string | number;
  inputRef?: React.RefObject<HTMLElement>
  Icon?    : (props: SvgIconProps) => JSX.Element;
}

interface IErrorTooltipObservableState {
  fontSize?: string | number; 
}

type ErrorTooltipProps = WithStyle<ReturnType<typeof styles>, IErrorTooltipProps>;

class ErrorTooltip extends React.PureComponent<ErrorTooltipProps> {
  observableState: IErrorTooltipObservableState

  constructor(props: ErrorTooltipProps){
    super(props);

    this.observableState = observable({
      fontSize: props.fontSize,
    });
  }

  get fontSize(): string | number | undefined {
    return this.observableState.fontSize;
  }

  setFontSize() {
    if (!this.fontSize) {
      this.observableState.fontSize = !isNullOrUndefined(this.props.fontSize) ? this.props.fontSize : (this.props.inputRef?.current && window.getComputedStyle(this.props.inputRef!.current).getPropertyValue('font-size')) ?? undefined; // needed to make the menu items font-size the same as the shown value
    }
  }

  onOpen = () => {
    this.setFontSize();
  }

  renderTooltip = React.memo((props: any) => {
    return <Observe render={() => {
      const {classes, error, fontSize, inputRef, Icon, ...restProps} = props;
      const {root, errorIcon, ...tooltipClasses}                     = classes;
      const tooltipClass                                             = useTooltipStyles({fontSize: this.fontSize}).tooltip;
      const ErrorIconToUse                                           = Icon ?? ErrorIcon;
      return (
        <Tooltip
          title={error}
          placement='right'
          TransitionComponent={Fade}
          PopperProps={{style: {pointerEvents: 'none'}}}
          classes={{...tooltipClasses, tooltip: classNames(tooltipClass, tooltipClasses.tooltip)}}
          arrow={true}
          onOpen={this.onOpen}
          {...restProps}
        >
          <ErrorIconToUse className={classes.errorIcon} />
        </Tooltip>
      );
    }} />;
  });

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <this.renderTooltip {...this.props} />
      </div>
    );
  }
}

export default withStyles(styles, ErrorTooltip);
