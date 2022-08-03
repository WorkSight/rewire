/* eslint-disable no-prototype-builtins */
import React                       from 'react';
import is                          from 'is';
import classNames                       from 'classnames';
import {
  debounce,
  match,
  isNullOrUndefined,
}                                       from 'rewire-common';
import {
  observable,
  Observe,
  defaultEquals
}                                       from 'rewire-core';
import _Downshift, {
  ControllerStateAndHelpers,
  DownshiftProps,
  StateChangeOptions
}                                       from 'downshift';
import TextField                        from '@material-ui/core/TextField';
import Chip                             from '@material-ui/core/Chip';
import Paper                            from '@material-ui/core/Paper';
import Popper                           from '@material-ui/core/Popper';
import Popover                          from '@material-ui/core/Popover';
import IconButton                       from '@material-ui/core/IconButton';
import MenuItem                         from '@material-ui/core/MenuItem';
import InputAdornment                   from '@material-ui/core/InputAdornment';
import Typography                       from '@material-ui/core/Typography';
import Fade                             from '@material-ui/core/Fade';
import {Theme}                          from '@material-ui/core/styles';
import CloseIcon                        from '@material-ui/icons/Close';
import CancelIcon                       from '@material-ui/icons/Cancel';
import ArrowDropDownIcon                from '@material-ui/icons/ArrowDropDown';
import { withStyles, WithStyle }        from './styles';
import {
  ISuggestionsContainerComponent,
  ISuggestionsContainerComponentProps,
  IAutoCompleteRenderSuggestionFnProps,
}                                       from './AutoComplete';
import ErrorTooltip                     from './ErrorTooltip';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  EqualsFn,
  defaultMap
}                                       from '../models/search';

type DownshiftType = (props: (DownshiftProps<any> & {ref: any})) => JSX.Element;
const Downshift: DownshiftType = _Downshift as unknown as DownshiftType;

const styles = (theme: Theme) => ({
  container: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    flex: '1',
  },
  popper: {
    zIndex: 1300,
    top: 0, // fixes offset calculation bug
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
  suggestionHighlighted: {
    fontWeight: 700,
  },
  suggestionNotHighlighted: {
    fontWeight: 300,
  },
  textField: {
  },
  textFieldInputContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflow: 'visible',
  },
  // make chips size responsive.
  chip: {
    fontSize: '0.9em',
    height: '1.7em',
    margin: '0px 2px 0.15em 2px',
  },
  inputOutlinedChip: {
    margin: '0.15em 2px',
  },
  chipDeleteIcon: {
    fontSize: '1.55em',
    width: '1em',
    height: 'auto',
  },
  showMoreChip: {
    cursor: 'pointer',
  },
  inputRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
  },
  inputInput: {
    paddingTop: '0.375em',
    paddingBottom: '0.4375em',
    width: 'auto',
    flexGrow: 1,
  },
  inputOutlinedInput: {
    paddingTop: '0.75em',
    paddingBottom: '0.75em',
    width: 'auto',
    flexGrow: 1,
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
  helperTextRootErrorIcon: {
    fontSize: '1.2em',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
  showMoreSelectedItemsPopup: {
    lineHeight: '1.5em',
    padding: '15px',
  },
  showMoreSelectedItemsPopupHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '15px',
  },
  showMoreSelectedItemsPopupIconButton: {
    marginLeft: '10px',
    padding: '0px',
  },
  showMoreSelectedItemsPopupIcon: {
    fontSize: '1.5em',
  },
  showMoreSelectedItemsPopupItemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: '1.25em',
  },
  showMoreSelectedItemsPopupItemSpacing: {
    paddingTop: '10px',
  },
  adornedEndOutlined: {
    paddingRight: '6px',
  },
  openButton: {
    padding: '0.15em',
    fontSize: 'unset',
    '& svg': {
      fontSize: '1.5em',
    },
  },
  openButtonOpen: {
    transform: 'rotate(180deg)',
  },
  openButtonClosed: {
    transform: 'rotate(0deg)',
  },
  errorIcon: {
  },
});

export type MultiSelectAutoCompleteStyles = ReturnType<typeof styles>;

export interface IMultiSelectAutoCompleteProps<T> {
  selectOnFocus?   :      boolean;
  endOfTextOnFocus?:      boolean;
  cursorPositionOnFocus?: number;
  initialInputValue?:     any;
  selectedItems:          any[];
  chipLimit?:             number;
  inputAdd?:              (value: string) => any;
  equals?:                EqualsFn<T>
  openOnFocus?:           boolean;
  showEmptySuggestions?:  boolean;
  hasTransition?:         boolean;
  transitionTimeout?:     number;
  renderSuggestion?:      (props: IAutoCompleteRenderSuggestionFnProps<T>) => JSX.Element;

  suggestionsContainerHeader?: ISuggestionsContainerComponent;
  suggestionsContainerFooter?: ISuggestionsContainerComponent;
}



export type MultiSelectAutoCompleteProps<T> = WithStyle<MultiSelectAutoCompleteStyles, {onSelectItem: (value?: T[]) => void} & Omit<ICustomProps<T>, 'onSelectItem'> & IMultiSelectAutoCompleteProps<T> & React.InputHTMLAttributes<any>>;

interface IMultiSelectAutoCompleteState {
  suggestions: any[];
}

interface IMultiSelectAutoCompleteObservableState {
  highlightedIndex: number | null;
  showMoreSelectedItemsPopupIsOpen: boolean;
}

class MultiSelectAutoComplete<T> extends React.Component<MultiSelectAutoCompleteProps<T>, IMultiSelectAutoCompleteState> {
  state:                       IMultiSelectAutoCompleteState;
  observableState:             IMultiSelectAutoCompleteObservableState;
  _fontSize?:                  string;
  _inputComponentNode?:        any;
  _suggestionsContainerWidth?: string;
  _manualFocusing:             boolean;
  downShift:                   any;
  search:                      SearchFn<T>;
  map:                         MapFn<T>;
  equals:                      EqualsFn<T>;
  inputRef:                    React.RefObject<HTMLInputElement>;
  textFieldRef:                React.RefObject<HTMLElement>;
  showMoreSelectedItemsRef:    React.RefObject<HTMLDivElement>;

  constructor(props: MultiSelectAutoCompleteProps<T>) {
    super(props);

    this.observableState          = observable({highlightedIndex: null, showMoreSelectedItemsPopupIsOpen: false});
    this._manualFocusing          = false;
    this.inputRef                 = React.createRef();
    this.textFieldRef             = React.createRef();
    this.showMoreSelectedItemsRef = React.createRef();
    this.search                   = props.search;
    if (props.debounce) {
      const wait = is.number(props.debounce) ? props.debounce as number : 150;
      this.search = debounce(this.search, wait);
    }
    this.map    = props.map || defaultMap;
    this.equals = props.equals || defaultEquals;
    this.state  = {suggestions: []};
    if (!isNullOrUndefined(props.initialInputValue)) {
      this.performSearch(props.initialInputValue);
    }
  }

  shouldComponentUpdate(nextProps: MultiSelectAutoCompleteProps<T>, nextState: any, _nextContext: any) {
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
      (nextProps.useTooltipForErrors !== this.props.useTooltipForErrors) ||
      (nextProps.startAdornment !== this.props.startAdornment) ||
      (nextProps.endAdornment !== this.props.endAdornment) ||
      (nextProps.tooltip !== this.props.tooltip)
    );
  }

  get highlightedIndex(): number | null {
    return this.observableState.highlightedIndex;
  }

  get showMoreSelectedItemsPopupIsOpen(): boolean {
    return this.observableState.showMoreSelectedItemsPopupIsOpen;
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      const cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }

    if (this.props.openOnFocus && !this._manualFocusing) {
      this.handleOpenOnFocus();
    }
  };

  handleOpenOnFocus = async () => {
    await this.performSearch('');
    this.downShift.openMenu();
  };

  handleInputChanged = (inputValue: string, helpers: ControllerStateAndHelpers<any>) => {
    if (helpers.isOpen) {
      this.performSearch(inputValue);
    }
  };

  handleItemChanged = (options: StateChangeOptions<any>, _helpers: ControllerStateAndHelpers<any>) => {
    if (!options) {
      return;
    }

    if (options.hasOwnProperty('selectedItem')) {
      if (!options.selectedItem) {
        return;
      }

      if (!this.props.selectedItems.some(item => this.equals(item, options.selectedItem))) {
        const newItems = [...this.props.selectedItems, options.selectedItem];
        this.props.onSelectItem && this.props.onSelectItem(newItems);
      }

      this.downShift.setState({
        inputValue: '',
        highlightedIndex: null,
        selectedItem: null
      });
    }
  };

  handleKeyDown = (event: any) => {
    if (event.altKey || event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case 8: {
        const {inputValue, isOpen} = this.downShift.getState();
        const {selectedItems}      = this.props;
        if (!isOpen && selectedItems.length && (!inputValue || !inputValue.length) && event.key === 'Backspace') {
          let newItems: any[] | undefined = selectedItems.slice(0, selectedItems.length - 1);
          if (!newItems.length) {
            newItems = undefined;
          }
          this.props.onSelectItem && this.props.onSelectItem(newItems);
        }
        break;
      }
      case 9:
      case 13: {
        const state = this.downShift.getState();
        if (state.isOpen) {
          if (this.state.suggestions.length > 0) {
            this.downShift.selectHighlightedItem({
              type: '__autocomplete_keydown_enter__'
            });
          } else {
            if (this.props.inputAdd && state.inputValue && state.inputValue.length > 0) {
              const value = this.props.inputAdd(state.inputValue);
              if (value && (!this.props.selectedItems.some((item: any) => this.equals(item, value)))) {
                this.props.onSelectItem && this.props.onSelectItem([...this.props.selectedItems, value]);
                this.downShift.closeMenu();
                event.preventDefault();
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
                return;
              }
            }

            this.downShift.selectItem(state.selectedItem, {
              type: '__autocomplete_keydown_enter__'
            });
          }
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
        }
        break;
      }
      case 27: {
        const st = this.downShift.getState();
        if (st.isOpen) {
          event.nativeEvent.preventDownshiftDefault = false;
          event.stopPropagation();
        } else {
          event.nativeEvent.preventDownshiftDefault = true;
        }
        break;
      }
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
  };

  deleteItem = (item: any) => {
    let selectedItems: any[] | undefined = [...this.props.selectedItems];
    selectedItems.splice(selectedItems.findIndex(i => this.equals(i, item)), 1);
    if (!selectedItems.length) {
      selectedItems = undefined;
    }
    this.props.onSelectItem && this.props.onSelectItem(selectedItems);
  };

  handleDelete = (item: any) => () => {
    this.deleteItem(item);

    this._manualFocusing = true;
    this.inputRef.current && this.inputRef.current.focus();
    this._manualFocusing = false;
  };

  handlePopupDelete = (item: any, isLastItem: boolean) => () => {
    this.deleteItem(item);
    if (isLastItem) {
      this.closeShowMoreSelectedItemsPopup();
    }
  };

  handleMenuMouseDown = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  };

  handleMenuMouseUp = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  };

  handleMenuClick = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  };

  handleMenuDoubleClick = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  };

  UNSAFE_componentWillReceiveProps (nextProps: any) {
    if (isNullOrUndefined(nextProps.selectedItems) && (nextProps.selectedItems !== this.props.selectedItems) && this.downShift) {
      this.downShift.clearSelection();
    }

    if (nextProps.options) {
      if (nextProps.options.parentId !== (this.props.options && this.props.options.parentId)) {
        nextProps.onSelectItem(undefined);
      }
    }
  }

  performSearch = async (value: string) => {
    const suggestions = await this.search(value, this.props.options);
    this.setState({
      suggestions
    });
  };

  html(str: string) {
    if (str && (str.length > 0)) {
      return str.replace(/^\s+|\s+$/gm, '&nbsp;');
    }
    return str;
  }

  parse(searchText: string, value: string): {highlight: boolean, text: string}[] {
    const results: {highlight: boolean, text: string}[] = [];
    if (searchText && searchText.length > 0) {
      const regex = match(searchText);
      let prevIndex = 0;
      for (let i = 0; i < 10; i++) {
        const matches = regex.exec(value);
        if (!matches) {
          break;
        }
        const match: string = matches[0];
        const index = matches.index;
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

  getTooltip(value: any): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      if (isNullOrUndefined(value) || !value.length) {
        return undefined;
      }
      return value.map((v: T) => this.map(v)).join(', ');
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  suggestionComparisonFn = (prevProps: any, nextProps: any): boolean => {
    const prevAriaSelected = prevProps.itemProps && prevProps.itemProps['aria-selected'];
    const nextAriaSelected = nextProps.itemProps && nextProps.itemProps['aria-selected'];
    return (
      (prevProps.suggestion === nextProps.suggestion) &&
      (prevProps.index === nextProps.index) &&
      (prevAriaSelected === nextAriaSelected) &&
      (prevProps.isHighlighted === nextProps.isHighlighted) &&
      (prevProps.inputValue === nextProps.inputValue) &&
      (prevProps.classes === nextProps.classes)
    );
  };

  openShowMoreSelectedItemsPopup = () => {
    this.observableState.showMoreSelectedItemsPopupIsOpen = true;
  };

  closeShowMoreSelectedItemsPopup = () => {
    this._manualFocusing                                  = true;
    this.observableState.showMoreSelectedItemsPopupIsOpen = false;
    setTimeout(() => { this.inputRef.current && this.inputRef.current.focus(); this._manualFocusing = false; });
  };

  handleOpenButtonClick = (isOpen: boolean) => () => {
    if (isOpen) {
      this.downShift.closeMenu();
    } else {
      this.performSearch(this.map(this.props.selectedItem));
      this.downShift.openMenu();
    }

    this._manualFocusing = true;
    setTimeout(() => { this.inputRef.current && this.inputRef.current.focus(); this._manualFocusing = false; }, 0);
  };

  setFontSize() {
    if (!this._fontSize) {
      this._fontSize = (this.inputRef.current && window.getComputedStyle(this.inputRef.current).getPropertyValue('font-size')) ?? undefined; // needed to make the menu items font-size the same as the shown value
    }
  }

  renderError = React.memo((props: any) => {
    const {classes, error, useTooltipForErrors} = props;

    if (!useTooltipForErrors) {
      return error;
    }

    return (
      <ErrorTooltip
        fontSize={this._fontSize!}
        inputRef={this.inputRef}
        error={error}
        classes={{errorIcon: classes.errorIcon}}
      />
    );
  });

  renderOpenButton = React.memo((props: {disabled: boolean, isOpen: boolean}) => {
    const {classes}          = this.props;
    const {isOpen, disabled} = props;
    const openButtonClasses  = classNames(classes.openButton, isOpen ? classes.openButtonOpen : classes.openButtonClosed);

    return (
      <IconButton className={openButtonClasses} tabIndex={-1} disabled={disabled} onClick={this.handleOpenButtonClick(isOpen)}>
        <ArrowDropDownIcon />
      </IconButton>
    );
  });

  renderCustomInnerInputComponent = (props: any) => {
    const {inputRef, ...inputProps} = props;
    return (
      <div className={this.props.classes.textFieldInputContainer}><this.renderChips selectedItems={this.props.selectedItems} /><input ref={inputRef} {...inputProps}></input></div>
    );
  };

  renderInput = React.memo((props: any) => {
    const {classes, error, getInputProps, startAdornment, isOpen, align, variant, disableErrors, useTooltipForErrors, label, disabled, autoFocus, placeholder, tooltip} = props;
    const inputProps = getInputProps({
      disabled: disabled,
      onKeyDown: this.handleKeyDown,
      onFocus: this.handleFocus,
      autoFocus: autoFocus,
      label: label,
      placeholder: placeholder,
    });
    const inputClassName            = variant === 'outlined' ? classes.inputOutlinedInput : classes.inputInput;
    const adornedEndClassName       = variant === 'outlined' ? classes.adornedEndOutlined : undefined;
    const inputFormControlClassName = variant === 'standard' && label ? classes.inputFormControlWithLabel : undefined;
    const sAdornment                = startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{startAdornment}</InputAdornment> : undefined;
    const eAdornment                = <this.renderOpenButton disabled={disabled} isOpen={isOpen} />;

    return (
      <TextField
        ref={this.textFieldRef}
        className={classes.textField}
        classes={{root: classes.formControlRoot}}
        variant={variant}
        title={tooltip}
        error={!disableErrors && !disabled && !!error}
        helperText={!disableErrors && <span>{(!disabled && error ? <this.renderError classes={classes} error={error} useTooltipForErrors={useTooltipForErrors} /> : '')}</span>}
        inputRef={this.inputRef}
        inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: align || 'left'}}}
        InputProps={{inputComponent: this.renderCustomInnerInputComponent, startAdornment: sAdornment, endAdornment: eAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName, adornedEnd: adornedEndClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
        FormHelperTextProps={{classes: {root: classNames(classes.helperTextRoot, useTooltipForErrors ? classes.helperTextRootErrorIcon : undefined), contained: classes.helperTextContained}}}
        {...inputProps}
      />
    );
  });

  renderSuggestion = React.memo((props: any) => {
    const { suggestion, index, itemProps, isHighlighted, inputValue, classes } = props;
    const name    = this.map(suggestion);
    const parts   = this.parse(inputValue, name);

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
      >
        {parts.map((part, index) => {
          return (
            <span key={String(index)} className={part.highlight ? classes.suggestionHighlighted : classes.suggestionNotHighlighted} dangerouslySetInnerHTML={{__html: part.text}} />
          );
        })}
      </MenuItem>
    );
  }, this.suggestionComparisonFn);

  renderSuggestionsContainerContents = React.memo((props: any) => {
    const { suggestionsContainerHeader, suggestionsContainerFooter, inputValue, selectedItems, suggestions, getMenuProps, getItemProps, isOpen, classes } = props;
    const menuProps = {
      onMouseDown: this.handleMenuMouseDown,
      onMouseUp: this.handleMenuMouseUp,
      onClick: this.handleMenuClick,
      onDoubleClick: this.handleMenuDoubleClick,
    };

    const suggestionsPaperClasses: string[] = [classes.suggestionsPaper];
    const suggestionsClasses: string[]      = [classes.suggestions];
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

    this.setFontSize();
    const suggestionsContainerComponentProps: ISuggestionsContainerComponentProps = {
      downShift: this.downShift,
    };

    const SuggestionsHeader = suggestionsContainerHeader;
    const SuggestionsFooter = suggestionsContainerFooter;

    return (
      <div {...(isOpen ? getMenuProps({}, {suppressRefError: true}) : {})} {...menuProps}>
        <Paper elevation={4} className={classNames(...suggestionsPaperClasses)} style={{fontSize: this._fontSize}}>
          {SuggestionsHeader && <SuggestionsHeader suggestionsContainerComponentProps={suggestionsContainerComponentProps} />}
          <div className={classNames(...suggestionsClasses)}>
            {(!suggestions || suggestions.length <= 0)
              ? <Typography variant='body2' className={classNames(classes.menuItem, classes.noResults)}>No Results</Typography>
              : <Observe render={() => suggestions.filter((suggestion: any) => !selectedItems.some((item: any) => this.equals(item, suggestion))).map((suggestion: any, index: number) =>
                  <this.renderSuggestion
                    key={index}
                    suggestion={suggestion}
                    index={index}
                    inputValue={inputValue}
                    classes={classes}
                    itemProps={getItemProps({ item: suggestion })}
                    isHighlighted={this.highlightedIndex === index}
                  />
                )} />
            }
          </div>
          {SuggestionsFooter && <SuggestionsFooter suggestionsContainerComponentProps={suggestionsContainerComponentProps} />}
        </Paper>
      </div>
    );
  });

  renderSuggestionsContainer = React.memo((props: any) => {
    const { openOnFocus, showEmptySuggestions, suggestionsContainerHeader, suggestionsContainerFooter, hasTransition, transitionTimeout, label, isOpen, classes, getMenuProps, getItemProps, inputValue, selectedItems, suggestions } = props;

    const transition = !isNullOrUndefined(hasTransition) ? hasTransition : true;
    const timeout    = !isNullOrUndefined(transitionTimeout) && transitionTimeout! >= 0 ? transitionTimeout : 350;
    const showEmpty  = !isNullOrUndefined(showEmptySuggestions) ? showEmptySuggestions : openOnFocus ? true : false;

    if ((!suggestions || suggestions.length <= 0) && !showEmpty) {
      return null;
    }

    const popperModifiers = {
      preventOverflow: {
        boundariesElement: 'viewport',
      },
    };

    if (!this._inputComponentNode && this.textFieldRef.current) {
      this._inputComponentNode = this.textFieldRef.current && (label ? this.textFieldRef.current.children[1] : this.textFieldRef.current.children[0]);
    }
    if (!this._suggestionsContainerWidth && this._inputComponentNode) {
      this._suggestionsContainerWidth = this._inputComponentNode.clientWidth;
    }

    return (
      <Popper open={isOpen} placement='bottom-start' anchorEl={this._inputComponentNode} transition={transition} modifiers={popperModifiers} className={classes.popper} style={{minWidth: this._suggestionsContainerWidth}}>
        {transition
          ? ({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={timeout}>
                <div>
                  <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} getMenuProps={getMenuProps} inputValue={inputValue} selectedItems={selectedItems} getItemProps={getItemProps} isOpen={isOpen} classes={classes} />
                </div>
              </Fade>
            )
          : <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} getMenuProps={getMenuProps} inputValue={inputValue} selectedItems={selectedItems} getItemProps={getItemProps}  isOpen={isOpen} classes={classes} />
        }
      </Popper>
    );
  });

  renderShowMoreSelectedItemsPopup = React.memo((props: any) => {
    const {classes, open, items} = props;
    if (!this._fontSize) {
      this._fontSize = this.inputRef && this.inputRef.current && window.getComputedStyle(this.inputRef.current!).getPropertyValue('font-size') || undefined; // needed to keep the suggestions the same font size as the input
    }
    return (
      <Popover
        classes={{paper: classes.showMoreSelectedItemsPopup}}
        open={open}
        onClose={this.closeShowMoreSelectedItemsPopup}
        anchorEl={this.showMoreSelectedItemsRef && this.showMoreSelectedItemsRef.current}
        marginThreshold={5}
      >
        <div style={{fontSize: this._fontSize}}>
          <div className={classes.showMoreSelectedItemsPopupHeader}>
            <IconButton className={classes.showMoreSelectedItemsPopupIconButton} style={{fontSize: this._fontSize}} onClick={this.closeShowMoreSelectedItemsPopup}>
              <CloseIcon className={classes.showMoreSelectedItemsPopupIcon} />
            </IconButton>
          </div>
          {items.map((item: any, idx: number) =>
            <div key={idx} className={idx > 0 ? classes.showMoreSelectedItemsPopupItemSpacing : undefined}>
              <div className={classes.showMoreSelectedItemsPopupItemContainer}>
                <span>{this.map(item)}</span>
                {!this.props.disabled &&
                  <IconButton className={classes.showMoreSelectedItemsPopupIconButton} style={{fontSize: this._fontSize}} onClick={this.handlePopupDelete(item, items.length <= 1)}>
                    <CancelIcon className={classes.showMoreSelectedItemsPopupIcon} />
                  </IconButton>
                }
              </div>
            </div>
          )}
        </div>
      </Popover>
    );
  });

  renderChips = React.memo((props: {selectedItems: any[]}) => {
    const {classes}       = this.props;
    const {selectedItems} = props;
    const baseChipClass   = this.props.variant === 'outlined' ? classNames(classes.chip, classes.inputOutlinedChip) : classes.chip;
    const chipLimit       = this.props.chipLimit || 3;
    const itemsToRender   = selectedItems.slice(0, chipLimit);
    const returnValue     = itemsToRender.map((item: any, _index: number) => (
      <Chip
        key={this.map(item)}
        tabIndex={-1}
        label={this.map(item)}
        disabled={this.props.disabled}
        className={baseChipClass}
        classes={{deleteIcon: classes.chipDeleteIcon}}
        onDelete={this.handleDelete(item)}
      />
    ));
    const showMore = selectedItems.length > itemsToRender.length;
    if (showMore) {
      const showMoreItems = selectedItems.slice(chipLimit);
      returnValue.push(
        <Chip
          ref={this.showMoreSelectedItemsRef}
          key='...'
          label='...'
          disabled={this.props.disabled}
          className={classNames(baseChipClass, classes.showMoreChip)}
          onClick={!this.props.disabled ? this.openShowMoreSelectedItemsPopup : undefined}
        />
      );
      returnValue.push(<div key='showMoreSelectedItemsPopup'><Observe render={() => <this.renderShowMoreSelectedItemsPopup classes={classes} open={this.showMoreSelectedItemsPopupIsOpen} items={showMoreItems} /> } /></div>);
    }
    return < >{returnValue}</>;
  });

  render() {
    const {classes, disabled, visible, error, label, placeholder, autoFocus, align, disableErrors, useTooltipForErrors, variant, startAdornment, initialInputValue, selectedItems, showEmptySuggestions, openOnFocus, suggestionsContainerHeader, suggestionsContainerFooter, hasTransition, transitionTimeout} = this.props;
    if (visible === false) {
      return null;
    }

    return (
      <Downshift
        defaultHighlightedIndex={0}
        initialInputValue={initialInputValue}
        initialIsOpen={!isNullOrUndefined(initialInputValue)}
        selectedItem={selectedItems}
        itemToString={this.map}
        onInputValueChange={this.handleInputChanged}
        onUserAction={this.handleItemChanged}
        ref={(v: any) => this.downShift = v}
        >
          {({
            getInputProps,
            getItemProps,
            getMenuProps,
            isOpen,
            inputValue,
            selectedItem,
            highlightedIndex,
          }) => {
            if (!isOpen) {
              this._suggestionsContainerWidth = undefined;
            }
            this.observableState.highlightedIndex = highlightedIndex;
            return (
            <div className={classes.container + ' ' + (this.props.className || '')}>
              {<this.renderInput
                classes={classes}
                error={error}
                getInputProps={getInputProps}
                disabled={!!disabled}
                autoFocus={!!autoFocus}
                label={label}
                tooltip={this.getTooltip(selectedItem)}
                placeholder={placeholder}
                align={align}
                variant={variant}
                disableErrors={disableErrors}
                useTooltipForErrors={useTooltipForErrors}
                startAdornment={startAdornment}
                isOpen={isOpen}
                inputValue={inputValue}
                selectedItem={selectedItem}
              />}
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
                  getItemProps={getItemProps}
                  inputValue={inputValue}
                  selectedItems={selectedItems}
                  suggestions={this.state.suggestions}
                 />
              : null}
            </div>
            );
          }}
      </Downshift>
    );
  }
}

export default withStyles(styles, MultiSelectAutoComplete);
