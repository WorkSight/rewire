import * as React              from 'react';
import * as is                 from 'is';
import classNames              from 'classnames';
import Downshift, {
  ControllerStateAndHelpers,
  StateChangeOptions }         from 'downshift';
import TextField               from '@material-ui/core/TextField';
import Fade                    from '@material-ui/core/Fade';
import Paper                   from '@material-ui/core/Paper';
import Popper                  from '@material-ui/core/Popper';
import MenuItem                from '@material-ui/core/MenuItem';
import InputAdornment          from '@material-ui/core/InputAdornment';
import Typography              from '@material-ui/core/Typography';
import {Theme}                 from '@material-ui/core/styles';
import {debounce, match}       from 'rewire-common';
import {withStyles, WithStyle} from './styles';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap
} from '../models/search';

const styles = (theme: Theme) => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  popper: {
    zIndex: 1300,
  },
  suggestionsPaper: {
  },
  suggestionsPaperContained: {
    padding: '15px',
  },
  suggestions: {
    overflowY: 'auto',
    maxHeight: 'calc(50vh - 20px)',
  },
  suggestionsContained: {
    maxHeight: 'calc(50vh - 150px)',
    border: `1px solid ${theme.palette.common.black}`,
  },
  suggestionsHasHeader: {
    marginTop: '15px',
  },
  suggestionsHasFooter: {
    marginBottom: '15px',
  },
  textField: {
    width: '100%',
  },
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
  inputLabelRootShrink: {
    transform: 'translate(14px, -0.375em) scale(0.75) !important',
  },
  inputFormControlWithLabel: {
    marginTop: '1em !important',
  },
  inputAdornmentRoot: {
    height: 'auto',
    paddingBottom: '0.125em',
    '& svg': {
      fontSize: '1.5em',
    },
  },
  nativeInput: {
    '&::placeholder, &-webkit-input-::placeholder': {
      color: 'inherit',
      opacity: 0.4,
    },
  },
  formControlRoot: {
  },
  menuItem: {
    fontSize: 'inherit',
    height: 'auto',
    lineHeight: '1em',
  },
  noResults: {
    padding: '11px 16px',
  },
  helperTextRoot: {
    marginTop: '6px',
    fontSize: '0.8em',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
});


export interface ISuggestionsContainerComponentProps {
  downShift: any;
}

export type ISuggestionsContainerComponent = (props?: ISuggestionsContainerComponentProps) => JSX.Element;

export interface IAutoCompleteProps {
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  initialInputValue?    : any;
  openOnFocus?          : boolean;
  showEmptySuggestions? : boolean;
  hasTransition?        : boolean;
  transitionTimeout?    : number;

  suggestionsContainerHeader?: ISuggestionsContainerComponent;
  suggestionsContainerFooter?: ISuggestionsContainerComponent;
}

export type AutoCompleteProps<T> = WithStyle<ReturnType<typeof styles>, IAutoCompleteProps & ICustomProps<T> & React.InputHTMLAttributes<any>>;

class AutoComplete<T> extends React.Component<AutoCompleteProps<T>, any> {
  state = {suggestions: []};
  downShift: any;
  search: SearchFn<T>;
  map: MapFn<T>;
  suggestionsContainerNode: HTMLElement;

  constructor(props: AutoCompleteProps<T>) {
    super(props);
    this.search = props.search;
    if (props.debounce) {
      const wait = is.number(props.debounce) ? props.debounce as number : 150;
      this.search = debounce(this.search, wait);
    }
    this.map = props.map || defaultMap;

    if (props.initialInputValue !== undefined) {
      this.performSearch(props.initialInputValue);
    }
  }

  performSearch = async (value: string) => {
    const suggestions = await this.search(value, this.props.options);
    this.setState({
      suggestions
    });
  }

  renderInput = (classes: Record<any, string>, error: string | undefined, inputProps: any, InputProps: any, ref: (node: any) => any) => {
    const {label, disabled, autoFocus, value, ...other}                 = inputProps;
    const {startAdornment, endAdornment, align, variant, disableErrors} = InputProps;
    const inputClassName            = variant === 'outlined' ? classes.inputOutlinedInput : classes.inputInput;
    const inputFormControlClassName = variant === 'standard' && this.props.label ? classes.inputFormControlWithLabel : undefined;

    return (
      <TextField
        className={classes.textField}
        classes={{root: classes.formControlRoot}}
        value={value}
        label={label}
        variant={variant}
        error={!disableErrors && !disabled && !!error}
        helperText={!disableErrors && <span>{(!disabled && error) || ''}</span>}
        inputRef={ref}
        disabled={disabled}
        autoFocus={autoFocus}
        onFocus={this.handleFocus}
        inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: align || 'left'}}}
        InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelRootShrink}}}
        FormHelperTextProps={{classes: {root: classes.helperTextRoot, contained: classes.helperTextContained}}}
        {...other}
      />
    );
  }

  html(str: string) {
    if (str && (str.length > 0)) {
      return str.replace(/^\s+|\s+$/gm, '&nbsp;');
    }
    return str;
  }

  parse(searchText: string, value: string): {highlight: boolean, text: string}[] {
    let results: {highlight: boolean, text: string}[] = [];
    if (searchText && searchText.length > 0) {
      let regex = match(searchText);
      let prevIndex = 0;
      for (let i = 0; i < 10; i++) {
        let matches = regex.exec(value);
        if (!matches) {
          break;
        }
        let match: string = matches[0];
        let index = matches.index;
        if (prevIndex < index) {
          results.push({highlight: false, text: this.html(value.substring(prevIndex, index))});
        }
        results.push({highlight: true, text: this.html(match)});
        prevIndex = index + match.length;
      }

      if (prevIndex < value.length) {
        results.push({highlight: false, text: this.html(value.substring(prevIndex, value.length))});
      }
      return results;
    }
    results.push({highlight: false, text: this.html(value)});
    return results;
  }

  renderSuggestion = (params: any) => {
    const { suggestion, index, itemProps, theme, highlightedIndex, inputValue, classes } = params;
    const isHighlighted = highlightedIndex === index;
    const name          = this.map(suggestion);

    if (this.props.renderSuggestion) {
      return (
        <MenuItem selected={isHighlighted} component='div' key={index} className={classes.menuItem}>
          {this.props.renderSuggestion(suggestion, {theme, isHighlighted, inputValue})}
        </MenuItem>
      );
    }

    const parts = this.parse(inputValue, name);

    return (
      <MenuItem
        {...itemProps}
        key={index}
        selected={isHighlighted}
        component='div'
        className={classes.menuItem}
      >{parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 700 }} dangerouslySetInnerHTML={{__html: part.text}} />
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }} dangerouslySetInnerHTML={{__html: part.text}} />
          );
        })}
      </MenuItem>
    );
  }

  renderSuggestionsContainerContents = (props: any) => {
    const { suggestionsContainerHeader, suggestionsContainerFooter, suggestions, options } = props;
    const { getMenuProps, isOpen, classes } = options;
    const menuProps = {
      onMouseDown: this.handleMenuMouseDown,
      onMouseUp: this.handleMenuMouseUp,
      onClick: this.handleMenuClick,
      onDoubleClick: this.handleMenuDoubleClick,
    };

    let suggestionsPaperClasses: string[] = [classes.suggestionsPaper];
    let suggestionsClasses: string[]      = [classes.suggestions];
    if (suggestionsContainerHeader || suggestionsContainerFooter) {
      suggestionsPaperClasses.push(classes.suggestionsPaperContained);
      suggestionsClasses.push(classes.suggestionsContained);

      if (suggestionsContainerHeader) {
        suggestionsClasses.push(classes.suggestionsHasHeader);
      }

      if (suggestionsContainerFooter) {
        suggestionsClasses.push(classes.suggestionsHasFooter);
      }
    }

    let fontSize = window.getComputedStyle(this.suggestionsContainerNode).getPropertyValue('font-size'); // needed to keep the suggestions the same font size as the input
    let suggestionsContainerComponentProps: ISuggestionsContainerComponentProps = {
      downShift: this.downShift,
    };

    return (
      <div {...(isOpen ? getMenuProps({}, {suppressRefError: true}) : {})} {...menuProps}>
        <Paper elevation={4} className={classNames(...suggestionsPaperClasses)}>
          {suggestionsContainerHeader && suggestionsContainerHeader(suggestionsContainerComponentProps)}
          <div className={classNames(...suggestionsClasses)} style={{fontSize: fontSize}}>
            {suggestions}
          </div>
          {suggestionsContainerFooter && suggestionsContainerFooter(suggestionsContainerComponentProps)}
        </Paper>
      </div>
    );
  }

  renderSuggestionsContainer = (options: any) => {
    const { openOnFocus, showEmptySuggestions, suggestionsContainerHeader, suggestionsContainerFooter, hasTransition, transitionTimeout } = this.props;
    const { isOpen, children, classes } = options;

    let transition  = hasTransition !== undefined ? hasTransition : true;
    let timeout     = transitionTimeout !== undefined && transitionTimeout >= 0 ? transitionTimeout : 350;
    let showEmpty   = showEmptySuggestions !== undefined ? showEmptySuggestions : openOnFocus ? true : false;
    let suggestions = children;

    if (!suggestions || suggestions.length <= 0) {
      if (showEmpty) {
       suggestions = <Typography className={classNames(classes.menuItem, classes.noResults)}>No Results</Typography>;
      } else {
        return null;
      }
    }

    const popperModifiers = {
      preventOverflow: {
        boundariesElement: 'viewport',
      },
    };

    return (
      <Popper open={isOpen} placement='bottom-start' anchorEl={this.suggestionsContainerNode} transition={transition} modifiers={popperModifiers} className={classes.popper} style={{minWidth: this.suggestionsContainerNode ? this.suggestionsContainerNode.clientWidth : 'auto'}}>
        {transition
          ? ({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={timeout}>
                <div>
                  <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} options={...options} />
                </div>
              </Fade>
            )
          : <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} options={...options} />
        }
      </Popper>
    );
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (this.props.cursorPositionOnFocus !== undefined) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }

    if (this.props.openOnFocus) {
      setTimeout(() => this.downShift.openMenu(), 0);
    }
  }

  handleInputChanged = (inputValue: string, helpers: ControllerStateAndHelpers<any>) => {
    if (helpers.isOpen) {
      this.performSearch(inputValue);
    }
  }

  handleItemChanged = (options: StateChangeOptions<any>, helpers: ControllerStateAndHelpers<any>) => {
    if (!options) {
      return;
    }
    if (options.hasOwnProperty('selectedItem')) {
      this.props.onSelectItem(options.selectedItem);
    }
  }

  handleKeyDown = (event: any) => {
    if (event.altKey || event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case 9:
      case 13:
        const state = this.downShift.getState();
        if (state.isOpen) {
          if (this.state.suggestions.length > 0) {
            this.downShift.selectHighlightedItem({
              type: '__autocomplete_keydown_enter__'
            });
          } else {
            this.downShift.selectItem(state.selectedItem, {
              type: '__autocomplete_keydown_enter__'
            });
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
        }
        break;
      case 27:
        const st = this.downShift.getState();
        if (st.isOpen) {
          event.nativeEvent.preventDownshiftDefault = false;
        } else {
          event.nativeEvent.preventDownshiftDefault = true;
        }
        break;
      case 37:
      case 38:
      case 39:
      case 40:
        if (this.state.suggestions.length > 0) {
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
        }
        break;
    }
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

  componentWillReceiveProps (nextProps: ICustomProps<T>) {
    if (nextProps.selectedItem === undefined && (nextProps.selectedItem !== this.props.selectedItem) && this.downShift) {
      this.downShift.clearSelection();
    }

    if (nextProps.options) {
      if (nextProps.options.parentId !== (this.props.options && this.props.options.parentId)) {
        nextProps.onSelectItem(undefined);
      }
    }
  }

  shouldComponentUpdate(nextProps: IAutoCompleteProps & ICustomProps<T> & React.InputHTMLAttributes<any>, nextState: any, nextContext: any) {
    return (
        (nextProps.selectedItem !== this.props.selectedItem) ||
        (nextProps.error !== this.props.error) ||
        (nextProps.disabled !== this.props.disabled) ||
        (nextProps.visible !== this.props.visible) ||
        (nextState.suggestions !== this.state.suggestions) ||
        (nextProps.label !== this.props.label) ||
        (nextProps.placeholder !== this.props.placeholder) ||
        (nextProps.align !== this.props.align) ||
        (nextProps.variant !== this.props.variant) ||
        (nextProps.disableErrors !== this.props.disableErrors) ||
        (nextProps.startAdornment !== this.props.startAdornment) ||
        (nextProps.endAdornment !== this.props.endAdornment) ||
        (nextProps.suggestionsContainerHeader !== this.props.suggestionsContainerHeader) ||
        (nextProps.suggestionsContainerFooter !== this.props.suggestionsContainerFooter) ||
        (nextProps.openOnFocus !== this.props.openOnFocus) ||
        (nextProps.showEmptySuggestions !== this.props.showEmptySuggestions) ||
        (nextProps.hasTransition !== this.props.hasTransition) ||
        (nextProps.transitionTimeout !== this.props.transitionTimeout)
      );
  }

  render() {
    const {classes, theme, disabled, visible, error, label, placeholder, autoFocus, align, disableErrors, variant, initialInputValue} = this.props;
    if (visible === false) {
      return null;
    }

    const startAdornment = this.props.startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment   = this.props.endAdornment ? <InputAdornment position='end' classes={{root: classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;

    return (
      <Downshift
        defaultHighlightedIndex={0}
        initialInputValue={initialInputValue}
        initialIsOpen={initialInputValue !== undefined}
        selectedItem={this.props.selectedItem || null}
        itemToString={this.map}
        onInputValueChange={this.handleInputChanged}
        onUserAction={this.handleItemChanged}
        ref={(v) => this.downShift = v}
        >
          {({
            getInputProps,
            getItemProps,
            getMenuProps,
            isOpen,
            inputValue,
            selectedItem,
            highlightedIndex,
          }) => (
            <div className={classes.container + ' ' + (this.props.className || '')}>
              {this.renderInput(classes, error,
                getInputProps({
                  disabled: disabled,
                  onKeyDown: this.handleKeyDown,
                  autoFocus: autoFocus,
                  label: label,
                  placeholder: placeholder,
                }),
                {align: align, variant, disableErrors: disableErrors, startAdornment: startAdornment, endAdornment: endAdornment},
                (node => {
                  this.suggestionsContainerNode = node;
                }),
              )}
              {this.renderSuggestionsContainer({
                getMenuProps: getMenuProps,
                isOpen: isOpen,
                classes: classes,
                children: this.state.suggestions.map((suggestion, index) =>
                  this.renderSuggestion({
                    suggestion,
                    index,
                    inputValue,
                    theme,
                    classes: classes,
                    itemProps: getItemProps({ item: suggestion }),
                    highlightedIndex,
                    selectedItem,
                  }),
                ),
              })}
            </div>
          )}
      </Downshift>
    );
  }
}

export default withStyles(styles, AutoComplete);
