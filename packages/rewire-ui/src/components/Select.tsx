import * as React              from 'react';
import { ChangeEvent }         from 'react';
import {disposeOnUnmount}      from 'rewire-core';
import classNames              from 'classnames';
import RootRef                 from '@material-ui/core/RootRef';
import {Theme}                 from '@material-ui/core/styles';
import FormControl             from '@material-ui/core/FormControl';
import FormHelperText          from '@material-ui/core/FormHelperText';
import Input                   from '@material-ui/core/Input';
import OutlinedInput           from '@material-ui/core/OutlinedInput';
import InputLabel              from '@material-ui/core/InputLabel';
import MenuItem                from '@material-ui/core/MenuItem';
import Select, {SelectProps}   from '@material-ui/core/Select';
import InputAdornment          from '@material-ui/core/InputAdornment';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap
}                              from '../models/search';
import {withStyles, WithStyle} from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
    flex: '1',
    lineHeight: 'inherit',
    fontSize: 'inherit',
  },
  inputInput: {
    paddingTop: '0.375em',
    paddingBottom: '0.4375em',
  },
  inputOutlinedInput: {
    paddingTop: '0.75em',
    paddingBottom: '0.75em',
  },
  inputLabelRoot: {
    fontSize: 'inherit',
  },
  inputLabelOutlined: {
    '&$inputLabelShrink': {
      transform: 'translate(14px, -0.375em) scale(0.75)',
    },
  },
  inputLabelShrink: {
  },
  inputFormControlWithLabel: {
    marginTop: '1em !important',
  },
  selectRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
    display: 'inline-flex',
    alignItems: 'stretch',
  },
  selectRootOutlined: {
    '& svg': {
      right: '5px',
    },
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
    minWidth: '250px !important',
  },
  selectMenuItem: {
    fontSize: 'inherit',
    height: 'auto',
    lineHeight: '1em',
  },
  inputAdornmentRoot: {
    height: 'auto',
    paddingBottom: '0.125em',
    '& svg': {
      fontSize: '1.5em',
    },
  },
  valueRendererContainer: {
    width: '100%',
    paddingRight: '20px',
  },
  placeholderValue: {
    opacity: 0.4,
  },
  helperTextRoot: {
    marginTop: '6px',
    fontSize: '0.8em',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
  formControlRoot: {
    flex: '1',
  },
});

export type ISelectInternalProps<T> = ICustomProps<T> & React.InputHTMLAttributes<any> & SelectProps;
type SelectInternalProps<T>         = WithStyle<ReturnType<typeof styles>, ISelectInternalProps<T>>;

class SelectInternal<T> extends React.Component<SelectInternalProps<T>, any> {
  // private _isMounted: boolean;
  private InputLabelRef: React.RefObject<HTMLElement>;
  private SelectRef: React.RefObject<HTMLElement>;
  state : any;
  search: SearchFn<T>;
  map   : MapFn<T>;

  constructor(props: SelectInternalProps<T>) {
    super(props);
    // this._isMounted    = false;
    this.state         = {suggestions: [], isOpen: false, labelWidth: 0};
    this.search        = props.search;
    this.map           = props.map || defaultMap;
    this.InputLabelRef = React.createRef();
    this.SelectRef     = React.createRef();
  }

  componentDidMount() {
    disposeOnUnmount(this, () => this.performSearch());
    let labelElement = this.InputLabelRef.current;
    if (labelElement) {
      this.setState({
        labelWidth: labelElement.offsetWidth,
      });
    }
    // this._isMounted = true;
  }

  performSearch = async () => {
    // if (!this._isMounted) return;

    const suggestions = await this.search('', this.props.options);
    this.setState({suggestions: suggestions});
  }

  renderSuggestion = (params: any) => {
    const { suggestion, index, isHighlighted, displayName, fontSize} = params;
    if (this.props.renderSuggestion) {
      return (
        <MenuItem value={displayName} key={index} classes={{root: this.props.classes.selectMenuItem}} style={{fontSize: fontSize}}>
          {this.props.renderSuggestion(suggestion, {isHighlighted, displayName, index})}
        </MenuItem>
      );
    }
    let s: any = {fontSize: fontSize};
    if (isHighlighted) {
      s.fontWeight = '500';
    }

    return (
      <MenuItem key={index} component='div' value={displayName} style={s} classes={{root: this.props.classes.selectMenuItem}}><span>{displayName}</span></MenuItem>
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
        let valueToSelect = this.state.suggestions.find((v: any) => event.target.dataset.value === this.map(v));
        if (this.props.multiple) {
          let values = this.props.selectedItem;
          if (values) {
            let valueToSelectMapped = this.map(valueToSelect);
            if (values.findIndex((v: any) => this.map(v) === valueToSelectMapped) >= 0) {
              values = values.filter((v: any) => this.map(v) !== valueToSelectMapped);
              values = values.length <= 0 ? undefined : values;
            } else {
              values.push(valueToSelect);
            }
          }
          this.props.onSelectItem && this.props.onSelectItem(values);
        } else {
          this.props.onSelectItem && this.props.onSelectItem(valueToSelect);
        }
        this.setState({isOpen: false});
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
      case 13:
      case 37:
      case 38:
      case 39:
      case 40:
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        break;
    }
  }

  handleMenuKeyPress = (event: React.KeyboardEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  handleMenuMouseEnter = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  handleMenuMouseDown = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  handleMenuMouseUp = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  handleMenuClick = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  handleMenuDoubleClick = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    this.props.onKeyDown && this.props.onKeyDown(evt);

    switch (evt.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case ' ':
        evt.preventDefault();
        this.setState({isOpen: true});
      case 'Enter':
        break;

      default:
        break;
    }
  }

  handleChanged = (event: ChangeEvent<any>) => {
    if (this.props.onSelectItem) {
      if (this.props.multiple) {
        let values = this.state.suggestions.filter((v: any) => event.target.value && event.target.value.includes(this.map(v)));
        values = values.length <= 0 ? undefined : values;
        this.props.onSelectItem(values);
      } else {
        this.props.onSelectItem(this.state.suggestions.find((v: any) => event.target.value === this.map(v)));
      }
    }
  }

  shouldComponentUpdate(nextProps: ICustomProps<T> & React.InputHTMLAttributes<any>, nextState: any, nextContext: any) {
    return (
        (nextProps.selectedItem   !== this.props.selectedItem)   ||
        (nextProps.error          !== this.props.error)          ||
        (nextProps.disabled       !== this.props.disabled)       ||
        (nextProps.visible        !== this.props.visible)        ||
        (nextState.suggestions    !== this.state.suggestions)    ||
        (nextState.isOpen         !== this.state.isOpen)         ||
        (nextProps.label          !== this.props.label)          ||
        (nextProps.placeholder    !== this.props.placeholder)    ||
        (nextProps.align          !== this.props.align)          ||
        (nextProps.variant        !== this.props.variant)        ||
        (nextProps.multiple       !== this.props.multiple)       ||
        (nextProps.disableErrors  !== this.props.disableErrors)  ||
        (nextProps.startAdornment !== this.props.startAdornment) ||
        (nextProps.endAdornment   !== this.props.endAdornment)   ||
        (nextState.labelWidth     !== this.state.labelWidth)
      );
  }

  renderSelect(disabled: boolean, cls: string, value?: T, autoFocus?: boolean, placeholder?: string) {
    const {classes, style, align, variant, multiple} = this.props;
    const v              = multiple ? value && value.map(val => this.map(val)) : this.map(value);
    const startAdornment = this.props.startAdornment ? <InputAdornment position='start' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment   = this.props.endAdornment ? <InputAdornment position='end' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const menuListProps  = {
      onKeyDown: this.handleMenuKeyDown,
      onKeyPress: this.handleMenuKeyPress,
      onMouseEnter: this.handleMenuMouseEnter,
      onMouseDown: this.handleMenuMouseDown,
      onMouseUp: this.handleMenuMouseUp,
      onClick: this.handleMenuClick,
      onDoubleClick: this.handleMenuDoubleClick,
    };

    let InputToUse                = Input;
    let selectRootClasses         = classes.selectRoot;
    let additionalProps: any      = {};
    let inputClassName            = classes.inputInput;
    let inputFormControlClassName = undefined;
    if (variant === 'outlined') {
      InputToUse                 = OutlinedInput;
      additionalProps.labelWidth = this.state.labelWidth;
      inputClassName             = classes.inputOutlinedInput;
      if (!endAdornment) {
        selectRootClasses = classNames(selectRootClasses, classes.selectRootOutlined);
      }
    } else if (variant === 'standard' && this.props.label) {
      inputFormControlClassName = classes.inputFormControlWithLabel;
    }

    return (
      <RootRef rootRef={this.SelectRef}>
        <Select
          disabled={disabled}
          value={v as any}
          multiple={multiple}
          open={this.state.isOpen}
          onOpen={this.handleOnOpen}
          onClose={this.handleOnClose}
          onChange={this.handleChanged}
          displayEmpty={true}
          className={cls}
          style={style}
          classes={{root: selectRootClasses, select: classes.select}}
          SelectDisplayProps={{onKeyDown: this.handleKeyDown}}
          MenuProps={{classes: {paper: classes.selectMenuPaper}, MenuListProps: menuListProps}}
          input={<InputToUse startAdornment={startAdornment} endAdornment={endAdornment} autoFocus={autoFocus} classes={{root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}} {...additionalProps} />}
          renderValue={() => (
            <span className={classes.valueRendererContainer} style={{textAlign: align || 'left'}}>
              {this.renderValue(v, multiple, placeholder)}
            </span>)}>
            {this.state.suggestions.map((suggestion: any, index: number) => {
              const fontSize    = window.getComputedStyle(this.SelectRef.current!).getPropertyValue('font-size'); // needed to make the menu items font-size the same as the shown value
              const displayName = this.map(suggestion);
              return this.renderSuggestion({
                suggestion,
                index,
                displayName,
                fontSize,
                isHighlighted: (multiple ? v && v.includes(displayName) : displayName === v)
              });
            })
          }
        </Select>
      </RootRef>
    );
  }

  renderValue(v: any, multiple?: boolean, placeholder?: string) {
    if (!v || (multiple && v.length <= 0)) {
      return <span className={this.props.classes.placeholderValue}>{placeholder}</span>;
    }

    if (multiple) {
      return v.length > 3 ? `${v.slice(0, 3).join(', ')}, ....` : v.join(', ');
    } else {
      return v;
    }
  }

  render() {
    const disabled = this.props.disabled === true;
    const {classes, disableErrors, visible, error, variant} = this.props;

    if (visible === false) {
      return null;
    }

    const label = this.props.label;
    let   cls   = (this.props.className || '') + ' select';
    return (
      <FormControl error={!disableErrors && !disabled && !!error} variant={variant} className={classNames(cls, classes.formControlRoot)}>
        {label && <RootRef rootRef={this.InputLabelRef}><InputLabel htmlFor='name-error' shrink={true} classes={{root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined}}>{label}</InputLabel></RootRef>}
        {this.renderSelect(disabled, '', this.props.selectedItem, this.props.autoFocus, this.props.placeholder)}
        {!disableErrors && <FormHelperText classes={{root: classes.helperTextRoot, contained: classes.helperTextContained}}>{!disabled && error}</FormHelperText>}
      </FormControl>
    );
  }
}

export default withStyles(styles, SelectInternal);
