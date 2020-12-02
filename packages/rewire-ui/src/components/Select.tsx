import * as React                      from 'react';
import classNames                      from 'classnames';
import { ChangeEvent }                 from 'react';
import { isNullOrUndefined }           from 'rewire-common';
import RootRef                         from '@material-ui/core/RootRef';
import {Theme}                         from '@material-ui/core/styles';
import TextField                       from '@material-ui/core/TextField';
import MenuItem                        from '@material-ui/core/MenuItem';
import {SelectProps as MuiSelectProps} from '@material-ui/core/Select';
import InputAdornment                  from '@material-ui/core/InputAdornment';
import ErrorTooltip                    from './ErrorTooltip';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap,
  IRenderSuggestionFnProps,
}                                      from '../models/search';
import {withStyles, WithStyle}         from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
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
    overflow: 'hidden',
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
  selectMenu: {
    height: '1.1875em',
  },
  selectMenuPaper: {
    minWidth: '250px !important',
  },
  selectMenuItem: {
    fontSize: 'inherit',
    height: 'auto',
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
    overflow: 'hidden',
  },
  placeholderValue: {
    opacity: 0.4,
  },
  helperTextRoot: {
    marginTop: '6px',
    fontSize: '0.8em',
  },
  helperTextRootErrorIcon: {
    fontSize: '1.2em',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
  formControlRoot: {
    width: 'auto !important',
  },
  icon: {
    fontSize: '1.5em',
    top: 'calc(50% - 0.5em)',
  },
  errorIcon: {
  },
});

export type SelectStyles = ReturnType<typeof styles>;

export interface ISelectRenderSuggestionFnProps<T> extends IRenderSuggestionFnProps<T> {
  displayName: string;
}

export interface ISelectProps<T> {
  renderSuggestion?: (props: ISelectRenderSuggestionFnProps<T>) => JSX.Element;
  dynamic?: boolean;
}

export type SelectProps<T> = WithStyle<SelectStyles, ISelectProps<T> & ICustomProps<T> & React.InputHTMLAttributes<any> & MuiSelectProps & ISelectProps<T>>;

class Select<T> extends React.Component<SelectProps<T>, any> {
  // private _isMounted: boolean;
  inputRef  : React.RefObject<HTMLInputElement>;
  state     : any;
  search    : SearchFn<T>;
  map       : MapFn<T>;
  _fontSize?: string;

  constructor(props: SelectProps<T>) {
    super(props);
    // this._isMounted    = false;
    this.state         = {suggestions: [], isOpen: false, labelWidth: 0};
    this.search        = props.search;
    this.map           = props.map || defaultMap;
    this.inputRef      = React.createRef();
  }

  async componentDidMount() {
    await this.performSearch();
    // this._isMounted = true;
  }

  performSearch = async () => {
    // if (!this._isMounted) return;

    const suggestions = await this.search('', this.props.options);
    this.setState({suggestions: suggestions});
  }

  UNSAFE_componentWillReceiveProps (nextProps: ICustomProps<T>) {
    if (nextProps.options) {
      if (nextProps.options.parentId !== (this.props.options && this.props.options.parentId)) {
        this.props.onSelectItem(undefined);
      }
    }
  }

  shouldComponentUpdate(nextProps: SelectProps<T>, nextState: any, nextContext: any) {
    return (
        (nextProps.selectedItem        !== this.props.selectedItem)        ||
        (nextProps.error               !== this.props.error)               ||
        (nextProps.disabled            !== this.props.disabled)            ||
        (nextProps.visible             !== this.props.visible)             ||
        (nextState.suggestions         !== this.state.suggestions)         ||
        (nextState.isOpen              !== this.state.isOpen)              ||
        (nextProps.label               !== this.props.label)               ||
        (nextProps.placeholder         !== this.props.placeholder)         ||
        (nextProps.align               !== this.props.align)               ||
        (nextProps.variant             !== this.props.variant)             ||
        (nextProps.multiple            !== this.props.multiple)            ||
        (nextProps.dynamic             !== this.props.dynamic)             ||
        (nextProps.disableErrors       !== this.props.disableErrors)       ||
        (nextProps.useTooltipForErrors !== this.props.useTooltipForErrors) ||
        (nextProps.startAdornment      !== this.props.startAdornment)      ||
        (nextProps.endAdornment        !== this.props.endAdornment)        ||
        (nextProps.tooltip             !== this.props.tooltip)
      );
  }

  getTooltip(value: any): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      if (isNullOrUndefined(value) || (this.props.multiple && value.length <= 0)) {
        return undefined;
      } 
      if (this.props.multiple) {
        return value.join(', ');
      } else {
        return String(value);
      }
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  handleOnClose = (event: object) => {
    this.setState({isOpen: false});
  }

  handleOnOpen = (event: object) => {
    this.openMenu();
  }

  openMenu = async () => {
    if (this.props.dynamic) {
      await this.performSearch();
    }
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
        this.openMenu();
      case 'Enter':
        break;
      case 'Delete':
        this.props.onSelectItem(undefined);
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

  setFontSize() {
    if (!this._fontSize) {
      this._fontSize = (this.inputRef.current && window.getComputedStyle(this.inputRef.current).getPropertyValue('font-size')) ?? undefined; // needed to make the menu items font-size the same as the shown value
    }
  }

  renderSuggestions(v: any, multiple?: boolean) {
    this.setFontSize();
    return (
      this.state.suggestions.map((suggestion: any, index: number) => {
        const displayName = this.map(suggestion);
        return this.renderSuggestion({
          suggestion,
          index,
          displayName,
          fontSize: this._fontSize,
          isHighlighted: (multiple ? v && v.includes(displayName) : displayName === v)
        });
      })
    );
  }

  renderSuggestion = (props: any) => {
    const { suggestion, displayName, fontSize, isHighlighted, index } = props;
    if (this.props.renderSuggestion) {
      return (
        <MenuItem key={index} selected={isHighlighted} value={displayName} classes={{root: this.props.classes.selectMenuItem}} style={{fontSize: fontSize}}>
          <this.props.renderSuggestion suggestion={suggestion} isHighlighted={isHighlighted} displayName={displayName} />
        </MenuItem>
      );
    }
    let s: any = {fontSize: fontSize};
    if (isHighlighted) {
      s.fontWeight = '500';
    }
    return (
      <MenuItem key={index} component='div' selected={isHighlighted} value={displayName} style={s} classes={{root: this.props.classes.selectMenuItem}}><span>{displayName}</span></MenuItem>
    );
  }

  renderError = React.memo((props: any) => {
    const {classes, error, useTooltipForErrors} = props;

    if (!useTooltipForErrors) {
      return error;
    }

    return (
      <ErrorTooltip
        fontSize={this._fontSize}
        inputRef={this.inputRef}
        error={error}
        classes={{errorIcon: classes.errorIcon}}
      />
    );
  });

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
    const {classes, visible, variant} = this.props;

    if (visible === false) {
      return null;
    }

    const v              = this.props.multiple ? this.props.selectedItem && this.props.selectedItem.map((val: any) => this.map(val)) || [] : this.map(this.props.selectedItem);
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

    let selectRootClasses         = classes.selectRoot;
    let inputClassName            = classes.inputInput;
    let inputFormControlClassName = undefined;
    if (variant === 'outlined') {
      inputClassName = classes.inputOutlinedInput;
      if (!endAdornment) {
        selectRootClasses = classNames(selectRootClasses, classes.selectRootOutlined);
      }
    } else if (variant === 'standard' && this.props.label) {
      inputFormControlClassName = classes.inputFormControlWithLabel;
    }

    let cls = (this.props.className || '') + ' select';

    return (
      <RootRef rootRef={this.inputRef}>
        <TextField
          className={cls}
          classes={{root: classes.formControlRoot}}
          style={this.props.style}
          select={true}
          disabled={!!this.props.disabled}
          label={this.props.label}
          placeholder={this.props.placeholder}
          variant={variant}
          error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
          helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error ? <this.renderError classes={this.props.classes} error={this.props.error} useTooltipForErrors={this.props.useTooltipForErrors} /> : '')}</span>}
          value={v}
          title={this.getTooltip(v)}
          onChange={this.handleChanged}
          autoFocus={this.props.autoFocus}
          inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: this.props.align || 'left'}}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classNames(classes.helperTextRoot, this.props.useTooltipForErrors ? classes.helperTextRootErrorIcon : undefined), contained: classes.helperTextContained}}}
          SelectProps={{
            multiple: this.props.multiple,
            open: this.state.isOpen,
            onOpen: this.handleOnOpen,
            onClose: this.handleOnClose,
            value: v,
            displayEmpty: true,
            classes: {root: selectRootClasses, select: classes.select, selectMenu: classes.selectMenu, icon: classes.icon},
            SelectDisplayProps: {onKeyDown: this.handleKeyDown},
            MenuProps: {classes: {paper: classes.selectMenuPaper}, MenuListProps: menuListProps},
            renderValue: (() => (
              <span className={classes.valueRendererContainer} style={{textAlign: this.props.align || 'left'}}>
                {this.renderValue(v, this.props.multiple, this.props.placeholder)}
              </span>
            ))
          }}
        >
          {this.renderSuggestions(v, this.props.multiple)}
        </TextField>
      </RootRef>
    );
  }
}

export default withStyles(styles, Select);
