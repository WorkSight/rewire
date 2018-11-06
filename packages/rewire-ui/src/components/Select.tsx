import RootRef                 from '@material-ui/core/RootRef';
import { ChangeEvent }         from 'react';
import {Theme}                 from '@material-ui/core/styles';
import FormControl             from '@material-ui/core/FormControl';
import FormHelperText          from '@material-ui/core/FormHelperText';
import Input                   from '@material-ui/core/Input';
import OutlinedInput           from '@material-ui/core/OutlinedInput';
import InputLabel              from '@material-ui/core/InputLabel';
import MenuItem                from '@material-ui/core/MenuItem';
import * as React              from 'react';
import Select, {SelectProps}   from '@material-ui/core/Select';
import InputAdornment          from '@material-ui/core/InputAdornment';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap
} from '../models/search';
import {disposeOnUnmount}      from 'rewire-core';
import {withStyles, WithStyle} from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
  },
  selectRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
    display: 'inline-flex',
    alignItems: 'stretch',
  },
  select: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    '&:focus': {
      backgroundColor: 'transparent',
    }
  },
  selectMenuPaper: {
  },
  selectMenuItem: {
    fontSize: 'inherit',
    height: 'auto',
    lineHeight: '1em',
  },
  inputAdornmentRoot: {
    height: 'auto',
    paddingBottom: '2px',
  },
  valueRendererContainer: {
    width: '100%',
  },
  placeholderValue: {
    opacity: 0.4,
  },
  helperTextRoot: {
    marginTop: '6px',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
});

export type ISelectInternalProps<T> = ICustomProps<T> & React.InputHTMLAttributes<any> & SelectProps;
type SelectInternalProps<T>         = WithStyle<ReturnType<typeof styles>, ISelectInternalProps<T>>;

class SelectInternal<T> extends React.Component<SelectInternalProps<T>, any> {
  private InputLabelRef: React.RefObject<HTMLInputElement>;
  state : any;
  search: SearchFn<T>;
  map   : MapFn<T>;

  constructor(props: SelectInternalProps<T>) {
    super(props);
    this.state         = {suggestions: [], isOpen: false, labelWidth: 0};
    this.search        = props.search;
    this.map           = props.map || defaultMap;
    this.InputLabelRef = React.createRef();
  }

  componentDidMount() {
    disposeOnUnmount(this, () => this.performSearch(''));
    let labelElement = this.InputLabelRef.current;
    if (labelElement) {
      this.setState({
        labelWidth: labelElement.offsetWidth,
      });
    }
  }

  performSearch = async (value: string) => {
    const suggestions = await this.search(value, this.props.options);
    this.setState({suggestions: suggestions});
  }

  renderSuggestion = (params: any) => {
    const { suggestion, index, isHighlighted, displayName } = params;

    if (this.props.renderSuggestion) {
      return (
        <MenuItem value={displayName} component='div' key={index} classes={{root: this.props.classes.selectMenuItem}}>
          {this.props.renderSuggestion(suggestion, {isHighlighted, displayName, index})}
        </MenuItem>
      );
    }
    let s: any = {};
    if (isHighlighted) {
      s.fontWeight = '500';
    }

    return (
      <MenuItem key={index} component='div' value={displayName} style={s} classes={{root: this.props.classes.selectMenuItem}}>{displayName}</MenuItem>
    );
  }

  componentWillReceiveProps (nextProps: ICustomProps<T>) {
    if (nextProps.options) {
      if (nextProps.options.parentId !== (this.props.options && this.props.options.parentId)) {
        this.props.onSelectItem(undefined);
      }
    }
  }

  handleOnClose = (event: object) => {
    this.setState({isOpen: false});
  }

  handleOnOpen = (event: object) => {
    this.setState({isOpen: true});
  }

  handleMenuKeyDown = (event: React.KeyboardEvent<any>) => {
    switch (event.keyCode) {
      case 9:
        this.props.onSelectItem && this.props.onSelectItem(this.state.suggestions.find((v: any) => event.target.dataset.value === this.map(v)));
        this.setState({isOpen: false});
        event.stopPropagation();
        event.preventDefault();
      case 13:
      case 37:
      case 38:
      case 39:
      case 40:
        event.stopPropagation();
        break;
    }
  }

  handleMenuKeyPress = (event: React.KeyboardEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuMouseEnter = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuMouseDown = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuClick = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuDoubleClick = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleChanged = (event: ChangeEvent<any>) => {
    if (this.props.onSelectItem) {
      this.props.onSelectItem(this.state.suggestions.find((v: any) => event.target.value === this.map(v)));
    }
  }

  shouldComponentUpdate(nextProps: ICustomProps<T> & React.InputHTMLAttributes<any>, nextState: any, nextContext: any) {
    return (
        (nextProps.selectedItem !== this.props.selectedItem) ||
        (nextProps.error !== this.props.error) ||
        (nextProps.disabled !== this.props.disabled) ||
        (nextProps.visible !== this.props.visible) ||
        (nextState.suggestions !== this.state.suggestions) ||
        (nextState.isOpen !== this.state.isOpen) ||
        (nextProps.label !== this.props.label) ||
        (nextProps.placeholder !== this.props.placeholder) ||
        (nextProps.align !== this.props.align) ||
        (nextProps.variant !== this.props.variant) ||
        (nextProps.disableErrors !== this.props.disableErrors) ||
        (nextProps.startAdornment !== this.props.startAdornment) ||
        (nextProps.endAdornment !== this.props.endAdornment)
      );
  }

  renderSelect(disabled: boolean, cls: string, value?: T, autoFocus?: boolean, placeholder?: string) {
    const {classes, style, align, variant} = this.props;
    const v              = this.map(value);
    const startAdornment = this.props.startAdornment ? <InputAdornment position='start' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment   = this.props.endAdornment ? <InputAdornment position='end' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const menuListProps  = {
      onKeyDown: this.handleMenuKeyDown,
      onKeyPress: this.handleMenuKeyPress,
      onMouseEnter: this.handleMenuMouseEnter,
      onMouseDown: this.handleMenuMouseDown,
      onClick: this.handleMenuClick,
      onDoubleClick: this.handleMenuDoubleClick,
    };

    let InputToUse           = Input;
    let additionalProps: any = {};
    if (variant === 'outlined') {
      InputToUse                 = OutlinedInput;
      additionalProps.labelWidth = this.state.labelWidth;
    }

    return (
    <Select
      disabled={disabled}
      value={v as any}
      open={this.state.isOpen}
      onOpen={this.handleOnOpen}
      onClose={this.handleOnClose}
      onChange={this.handleChanged}
      displayEmpty={true}
      className={cls}
      style={style}
      classes={{root: classes.selectRoot, select: classes.select}}
      MenuProps={{classes: {paper: classes.selectMenuPaper}, MenuListProps: menuListProps}}
      input={<InputToUse startAdornment={startAdornment} endAdornment={endAdornment} autoFocus={autoFocus} classes={{root: classes.inputRoot}} {...additionalProps} />}
      renderValue={() => (
        <span className={classes.valueRendererContainer} style={{textAlign: align || 'left'}}>
          {v || <span className={classes.placeholderValue}>{placeholder}</span>}
        </span>)}>{
        this.state.suggestions.map((suggestion: any, index: number) => {
          const displayName = this.map(suggestion);
          return this.renderSuggestion({
            suggestion,
            index,
            displayName,
            isHighlighted: (displayName === v)
          });
        })
      }
      </Select>
    );
  }

  render() {
    const disabled = this.props.disabled === true;
    const {classes, disableErrors, visible, error, variant} = this.props;

    if (visible === false) {
      return null;
    }

    const label = this.props.label;
    let   cls   = (this.props.className || '') + ' select';
    if (label) {
      return (
        <FormControl error={!disableErrors && !disabled && !!error} variant={variant} className={cls}>
          <RootRef rootRef={this.InputLabelRef}><InputLabel htmlFor='name-error' shrink={true}>{label}</InputLabel></RootRef>
          {this.renderSelect(disabled, '', this.props.selectedItem, this.props.autoFocus, this.props.placeholder)}
          {!disableErrors && <FormHelperText classes={{root: classes.helperTextRoot, contained: classes.helperTextContained}}>{!disabled && error}</FormHelperText>}
        </FormControl>
      );
    }

    return this.renderSelect(disabled, cls, this.props.selectedItem, this.props.autoFocus, this.props.placeholder);
  }
}

export default withStyles(styles, SelectInternal);
