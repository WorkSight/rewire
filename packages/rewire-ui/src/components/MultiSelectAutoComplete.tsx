import * as React                       from 'react';
import * as is                          from 'is';
import classNames                       from 'classnames';
import Downshift, {
  ControllerStateAndHelpers,
  StateChangeOptions
}                                       from 'downshift';
import TextField                        from '@material-ui/core/TextField';
import Chip                             from '@material-ui/core/Chip';
import Paper                            from '@material-ui/core/Paper';
import Popper                           from '@material-ui/core/Popper';
import MenuItem                         from '@material-ui/core/MenuItem';
import InputAdornment                   from '@material-ui/core/InputAdornment';
import Typography                       from '@material-ui/core/Typography';
import RootRef                          from '@material-ui/core/RootRef';
import Fade                             from '@material-ui/core/Fade';
import {Theme}                          from '@material-ui/core/styles';

import {
  debounce,
  match,
  isNullOrUndefined,
}                                       from 'rewire-common';
import {withStyles, WithStyle}          from './styles';
import {
  ISuggestionsContainerComponent,
  ISuggestionsContainerComponentProps,
  IAutoCompleteRenderSuggestionFnProps,
}                                       from './AutoComplete';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap
}                                       from '../models/search';

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
  // make chips size responsive.
  chip: {
    fontSize: '0.8em',
    height: '1.85em',
    margin: '0px 2px 0.15em 2px',
  },
  chipDeleteIcon: {
    fontSize: '1.6em',
  },
  inputRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
    overflow: 'hidden',
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

interface IMultiSelectAutoCompleteProps<T> {
  selectOnFocus?   :      boolean;
  endOfTextOnFocus?:      boolean;
  cursorPositionOnFocus?: number;
  initialInputValue?:     any;
  selectedItems:          any[];
  chipLimit?:             number;
  openOnFocus?          : boolean;
  showEmptySuggestions? : boolean;
  hasTransition?        : boolean;
  transitionTimeout?    : number;
  renderSuggestion?     : (props: IAutoCompleteRenderSuggestionFnProps<T>) => JSX.Element;

  suggestionsContainerHeader?: ISuggestionsContainerComponent;
  suggestionsContainerFooter?: ISuggestionsContainerComponent;
}

interface IMultiSelectAutoCompleteState {
  suggestions: any[];
  deleting: boolean;
}

export type MultiSelectAutoCompleteProps<T> = WithStyle<ReturnType<typeof styles>, ICustomProps<T> & IMultiSelectAutoCompleteProps<T> & React.InputHTMLAttributes<any>>;

class MultiSelectAutoComplete<T> extends React.Component<MultiSelectAutoCompleteProps<T>, IMultiSelectAutoCompleteState> {
  state = {suggestions: [], deleting: false};
  downShift:                any;
  search:                   SearchFn<T>;
  map:                      MapFn<T>;
  suggestionsContainerNode: HTMLElement;
  textFieldRef:             React.RefObject<HTMLElement>;

  constructor(props: MultiSelectAutoCompleteProps<T>) {
    super(props);
    this.textFieldRef = React.createRef();
    this.search       = props.search;
    if (props.debounce) {
      const wait = is.number(props.debounce) ? props.debounce as number : 150;
      this.search = debounce(this.search, wait);
    }
    this.map = props.map || defaultMap;

    if (!isNullOrUndefined(props.initialInputValue)) {
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
      <RootRef rootRef={this.textFieldRef}>
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
          inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: align || 'left'}}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classes.helperTextRoot, contained: classes.helperTextContained}}}
          {...other}
        />
      </RootRef>
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

  suggestionComparisonFn = (prevProps: any, nextProps: any): boolean => {
    let prevAriaSelected = prevProps.itemProps && prevProps.itemProps['aria-selected'];
    let nextAriaSelected = nextProps.itemProps && nextProps.itemProps['aria-selected'];
    return (
      (prevProps.suggestion === nextProps.suggestion) &&
      (prevProps.index === nextProps.index) &&
      (prevAriaSelected === nextAriaSelected) &&
      (prevProps.isHighlighted === nextProps.isHighlighted) &&
      (prevProps.inputValue === nextProps.inputValue) &&
      (prevProps.classes === nextProps.classes)
    );
  }

  renderSuggestion = React.memo((props: any) => {
    const { suggestion, index, itemProps, isHighlighted, inputValue, classes } = props;
    const name  = this.map(suggestion);
    const parts = this.parse(inputValue, name);

    if (this.props.renderSuggestion) {
      return (
        <MenuItem {...itemProps} selected={isHighlighted} component='div' key={index} className={classes.menuItem} >
          <this.props.renderSuggestion suggestion={suggestion} isHighlighted={isHighlighted} inputValue={inputValue} parts={parts} />
        </MenuItem>
      );
    }

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
  }, this.suggestionComparisonFn);

  renderSuggestionsContainerContents = React.memo((props: any) => {
    const { suggestionsContainerHeader, suggestionsContainerFooter, suggestions, getMenuProps, isOpen, classes } = props;
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

    const SuggestionsHeader = suggestionsContainerHeader;
    const SuggestionsFooter = suggestionsContainerFooter;

    return (
      <div {...(isOpen ? getMenuProps({}, {suppressRefError: true}) : {})} {...menuProps}>
        <Paper elevation={4} className={classNames(...suggestionsPaperClasses)} style={{fontSize: fontSize}}>
          {SuggestionsHeader && <SuggestionsHeader suggestionsContainerComponentProps={suggestionsContainerComponentProps} />}
          <div className={classNames(...suggestionsClasses)}>
            {suggestions}
          </div>
          {SuggestionsFooter && <SuggestionsFooter suggestionsContainerComponentProps={suggestionsContainerComponentProps} />}
        </Paper>
      </div>
    );
  });

  renderSuggestionsContainer = React.memo((props: any) => {
    const { openOnFocus, showEmptySuggestions, suggestionsContainerHeader, suggestionsContainerFooter, hasTransition, transitionTimeout, label, isOpen, children, classes, getMenuProps } = props;

    let transition  = !isNullOrUndefined(hasTransition) ? hasTransition : true;
    let timeout     = !isNullOrUndefined(transitionTimeout) && transitionTimeout! >= 0 ? transitionTimeout : 350;
    let showEmpty   = !isNullOrUndefined(showEmptySuggestions) ? showEmptySuggestions : openOnFocus ? true : false;
    let suggestions = children;

    if (!suggestions || suggestions.length <= 0) {
      if (showEmpty) {
       suggestions = <Typography variant='body2' className={classNames(classes.menuItem, classes.noResults)}>No Results</Typography>;
      } else {
        return null;
      }
    }

    const popperModifiers = {
      preventOverflow: {
        boundariesElement: 'viewport',
      },
    };

    const inputComponentNode = this.textFieldRef.current && (label ? this.textFieldRef.current.children[1] : this.textFieldRef.current.children[0]);

    return (
      <Popper open={isOpen} placement='bottom-start' anchorEl={inputComponentNode} transition={transition} modifiers={popperModifiers} className={classes.popper} style={{minWidth: inputComponentNode ? inputComponentNode.clientWidth : 'auto'}}>
        {transition
          ? ({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={timeout}>
                <div>
                  <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} getMenuProps={getMenuProps} isOpen={isOpen} classes={classes} />
                </div>
              </Fade>
            )
          : <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} getMenuProps={getMenuProps} isOpen={isOpen} classes={classes} />
        }
      </Popper>
    );
  });

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }

    if (this.props.openOnFocus && !this.state.deleting) {
      this.handleOpenOnFocus();
    }
  }

  handleOpenOnFocus = async () => {
    await this.performSearch('');
    this.downShift.openMenu();
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
      if (!options.selectedItem) {
        return;
      }

      if (!this.props.selectedItems.map(item => this.map(item)).includes(this.map(options.selectedItem))) {
        const newItems = [...this.props.selectedItems, options.selectedItem];
        this.props.onSelectItem && this.props.onSelectItem(newItems);
      }

        this.downShift.setState({
          inputValue: '',
          highlightedIndex: null,
          selectedItem: null
        });
    }
  }

  handleKeyDown = (event: any) => {
    if (event.altKey || event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case 8:
        const {inputValue, isOpen} = this.downShift.getState();
        const {selectedItems}      = this.props;
        if (!isOpen && selectedItems.length && (!inputValue || !inputValue.length) && event.key === 'Backspace') {
          this.props.onSelectItem && this.props.onSelectItem(selectedItems.slice(0, selectedItems.length - 1));
        }
        break;
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

  handleDelete = (item: any) => () => {
    const selectedItems = [...this.props.selectedItems];
    const selectedItem  = this.map(item);
    selectedItems.splice(selectedItems.findIndex(i => this.map(i) === selectedItem), 1);
    this.props.onSelectItem && this.props.onSelectItem(selectedItems);

    if (this.props.openOnFocus) {
      this.setState({deleting: true}, () => { this.suggestionsContainerNode.focus(); this.setState({deleting: false}); });
    } else {
      this.suggestionsContainerNode.focus();
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

  componentWillReceiveProps (nextProps: any) {
    if (isNullOrUndefined(nextProps.selectedItems) && (nextProps.selectedItems !== this.props.selectedItems) && this.downShift) {
      this.downShift.clearSelection();
    }

    if (nextProps.options) {
      if (nextProps.options.parentId !== (this.props.options && this.props.options.parentId)) {
        nextProps.onSelectItem(undefined);
      }
    }
  }

  shouldComponentUpdate(nextProps: MultiSelectAutoCompleteProps<T>, nextState: any, nextContext: any) {
    return (
        (nextProps.selectedItems !== this.props.selectedItems) ||
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
        (nextProps.endAdornment !== this.props.endAdornment)
      );
  }

  renderChips(classes: Record<any, string>) {
    const chipLimit     = this.props.chipLimit || 3;
    const itemsToRender = this.props.selectedItems.slice(0, chipLimit);
    const returnValue   = itemsToRender.map((item: any, index: number) => (
        <Chip
          key={this.map(item)}
          tabIndex={-1}
          label={this.map(item)}
          className={classes.chip}
          classes={{deleteIcon: classes.chipDeleteIcon}}
          onDelete={this.handleDelete(item)}
        />
    ));
    const showMore = this.props.selectedItems.length > itemsToRender.length;
    if (showMore) {
      returnValue.push(
        <Chip
          key='...'
          label='...'
          className={classes.chip}
        />
      );
    }
    return returnValue;
  }

  render() {
    const {classes, disabled, visible, error, label, placeholder, autoFocus, align, disableErrors, variant, initialInputValue, selectedItems, showEmptySuggestions, openOnFocus, suggestionsContainerHeader, suggestionsContainerFooter, hasTransition, transitionTimeout} = this.props;
    if (visible === false) {
      return null;
    }

    const startAdornment = this.props.startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment   = this.props.endAdornment ? <InputAdornment position='end' classes={{root: classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;

    return (
      <Downshift
        defaultHighlightedIndex={0}
        initialInputValue={initialInputValue}
        initialIsOpen={!isNullOrUndefined(initialInputValue)}
        selectedItem={selectedItems}
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
                  onFocus: this.handleFocus,
                  autoFocus: autoFocus,
                  label: label,
                  placeholder: placeholder,
                }),
                {
                  align: align,
                  variant: variant,
                  disableErrors: disableErrors,
                  startAdornment: (< >{startAdornment}{this.renderChips(classes)}</>),
                  endAdornment: endAdornment,
                },
                (node => {
                  this.suggestionsContainerNode = node;
                }),
              )}
              {isOpen
              ? <this.renderSuggestionsContainer
                 getMenuProps={getMenuProps}
                 isOpen={isOpen}
                 classes={classes}
                 openOnFocus={openOnFocus}
                 showEmptySuggestions={showEmptySuggestions}
                 suggestionsContainerHeader={suggestionsContainerHeader}
                 suggestionsContainerFooter={suggestionsContainerFooter}
                 hasTransition={hasTransition}
                 transitionTimeout={transitionTimeout}
                 label={label}
                 >
                   {this.state.suggestions.filter(suggestion => !selectedItems.map((item: any) => this.map(item)).includes(this.map(suggestion))).map((suggestion, index) =>
                     <this.renderSuggestion
                       key={index}
                       suggestion={suggestion}
                       index={index}
                       inputValue={inputValue}
                       classes={classes}
                       itemProps={getItemProps({ item: suggestion })}
                       isHighlighted={highlightedIndex === index}
                       selectedItem={selectedItem}
                     />
                   )}
                </this.renderSuggestionsContainer>
              : null}
            </div>
          )}
      </Downshift>
    );
  }
}

export default withStyles(styles, MultiSelectAutoComplete);
