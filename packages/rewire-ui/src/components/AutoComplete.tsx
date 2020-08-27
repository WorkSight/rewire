import * as React              from 'react';
import * as is                 from 'is';
import classNames              from 'classnames';
import {
  Observe,
  observable,
}                              from 'rewire-core';
import Downshift,  {
  ControllerStateAndHelpers,
  StateChangeOptions }         from 'downshift';
import TextField               from '@material-ui/core/TextField';
import Fade                    from '@material-ui/core/Fade';
import Paper                   from '@material-ui/core/Paper';
import Popper                  from '@material-ui/core/Popper';
import IconButton              from '@material-ui/core/IconButton';
import MenuItem                from '@material-ui/core/MenuItem';
import InputAdornment          from '@material-ui/core/InputAdornment';
import Typography              from '@material-ui/core/Typography';
import RootRef                 from '@material-ui/core/RootRef';
import {Theme}                 from '@material-ui/core/styles';
import CloseIcon               from '@material-ui/icons/Close';
import ArrowDropDownIcon       from '@material-ui/icons/ArrowDropDown';
import ErrorTooltip            from './ErrorTooltip';
import {
  debounce,
  match,
  isNullOrUndefined,
}                              from 'rewire-common';
import {withStyles, WithStyle} from './styles';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap,
  IRenderSuggestionFnProps,
} from '../models/search';

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
  adornedEndOutlined: {
    paddingRight: '6px',
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
  deleteButton: {
    padding: '0.3em',
    fontSize: 'unset',
    '& svg': {
      fontSize: '1.2em',
    },
  },
  deleteButtonHidden: {
    display: 'none',
  },
  errorIcon: {
  },
});

export type AutoCompleteStyles = ReturnType<typeof styles>;

export interface IAutoCompleteRenderSuggestionFnProps<T> extends IRenderSuggestionFnProps<T> {
  inputValue: any;
  parts: {highlight: boolean, text: string}[];
}

export interface ISuggestionsContainerComponentProps {
  downShift: any;
}

export type ISuggestionsContainerComponent = (props?: ISuggestionsContainerComponentProps) => JSX.Element;

export interface IAutoCompleteProps<T> {
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  initialInputValue?    : any;
  openOnFocus?          : boolean;
  showEmptySuggestions? : boolean;
  hasTransition?        : boolean;
  transitionTimeout?    : number;
  renderSuggestion?     : (props: IAutoCompleteRenderSuggestionFnProps<T>) => JSX.Element;

  suggestionsContainerHeader?: ISuggestionsContainerComponent;
  suggestionsContainerFooter?: ISuggestionsContainerComponent;
}

export type AutoCompleteProps<T> = WithStyle<AutoCompleteStyles, ICustomProps<T> & IAutoCompleteProps<T> & React.InputHTMLAttributes<any>>;

interface IAutoCompleteState {
  suggestions: any[];
}

interface IAutoCompleteObservableState {
  isFocused: boolean;
  isHovered: boolean;
  highlightedIndex: number | null;
}

class AutoComplete<T> extends React.Component<AutoCompleteProps<T>, IAutoCompleteState> {
  state: IAutoCompleteState = {
    suggestions: [],
  };

  observableState: IAutoCompleteObservableState;
  _fontSize?: string;
  _inputComponentNode?: any;
  _suggestionsContainerWidth?: string;
  _manualFocusing: boolean;
  downShift: any;
  search: SearchFn<T>;
  map: MapFn<T>;
  inputRef: React.RefObject<HTMLElement>;
  textFieldRef: React.RefObject<HTMLElement>;

  constructor(props: AutoCompleteProps<T>) {
    super(props);

    this.observableState = observable({isFocused: false, isHovered: false, highlightedIndex: null});
    this._manualFocusing = false;
    this.inputRef        = React.createRef();
    this.textFieldRef    = React.createRef();
    this.search          = props.search;
    if (props.debounce) {
      const wait = is.number(props.debounce) ? props.debounce as number : 150;
      this.search = debounce(this.search, wait);
    }
    this.map = props.map || defaultMap;

    if (!isNullOrUndefined(props.initialInputValue)) {
      this.performSearch(props.initialInputValue);
    }
  }

  shouldComponentUpdate(nextProps: IAutoCompleteProps<T> & ICustomProps<T> & React.InputHTMLAttributes<any>, nextState: any, nextContext: any) {
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
        (nextProps.useTooltipForErrors !== this.props.useTooltipForErrors) ||
        (nextProps.startAdornment !== this.props.startAdornment) ||
        (nextProps.suggestionsContainerHeader !== this.props.suggestionsContainerHeader) ||
        (nextProps.suggestionsContainerFooter !== this.props.suggestionsContainerFooter) ||
        (nextProps.openOnFocus !== this.props.openOnFocus) ||
        (nextProps.showEmptySuggestions !== this.props.showEmptySuggestions) ||
        (nextProps.hasTransition !== this.props.hasTransition) ||
        (nextProps.transitionTimeout !== this.props.transitionTimeout)
      );
  }

  get isFocused(): boolean {
    return this.observableState.isFocused;
  }

  get isHovered(): boolean {
    return this.observableState.isHovered;
  }

  get highlightedIndex(): number | null {
    return this.observableState.highlightedIndex;
  }

  performSearch = async (value: string) => {
    const suggestions = await this.search(value, this.props.options);
    this.setState({
      suggestions
    });
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

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    this.observableState.isFocused = true;

    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }

    if (this.props.openOnFocus && !this._manualFocusing) {
      this.handleOpenOnFocus();
    }
  }

  handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    this.observableState.isFocused = false;
  }

  handleMouseEnter = (evt: React.PointerEvent<HTMLInputElement>) => {
    this.observableState.isHovered = true;
  }

  handleMouseLeave = (evt: React.PointerEvent<HTMLInputElement>) => {
    this.observableState.isHovered = false;
  }

  handleInputChanged = (inputValue: string, helpers: ControllerStateAndHelpers<any>) => {
    if (helpers.isOpen) {
      this.performSearch(inputValue);
    }
  }

  handleOpenOnFocus = async () => {
    await this.performSearch(this.map(this.props.selectedItem));
    this.downShift.openMenu();
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
          event.stopPropagation();
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

  UNSAFE_componentWillReceiveProps (nextProps: ICustomProps<T>) {
    if (isNullOrUndefined(nextProps.selectedItem) && (nextProps.selectedItem !== this.props.selectedItem) && this.downShift) {
      this.downShift.clearSelection();
    }

    if (nextProps.options) {
      if (nextProps.options.parentId !== (this.props.options && this.props.options.parentId)) {
        nextProps.onSelectItem(undefined);
      }
    }
  }

  handleDeleteButtonClick = () => {
    this.props.onSelectItem(undefined);
    this._manualFocusing = true;
    setTimeout(() => { this.inputRef.current && this.inputRef.current.focus(); this._manualFocusing = false; }, 0);
  }

  handleOpenButtonClick = (isOpen: boolean) => () => {
    if (isOpen) {
      this.downShift.closeMenu();
    } else {
      this.performSearch(this.map(this.props.selectedItem));
      this.downShift.openMenu();
    }

    this._manualFocusing = true;
    setTimeout(() => { this.inputRef.current && this.inputRef.current.focus(); this._manualFocusing = false; }, 0);
  }

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
        fontSize={this._fontSize}
        inputRef={this.inputRef}
        error={error}
        classes={{errorIcon: classes.errorIcon}}
      />
    );
  });

  renderDeleteButton = React.memo((props: any) => {
    const {classes} = this.props;

    return <Observe render={() => {
      let deleteButtonClasses: string;
      if (props.disabled || !props.hasSelectedItem || (!this.isHovered && !this.isFocused)) {
        deleteButtonClasses = classNames(classes.deleteButton, classes.deleteButtonHidden);
      } else {
        deleteButtonClasses = classes.deleteButton!;
      }
      return (
        <IconButton className={deleteButtonClasses} tabIndex={-1} onClick={this.handleDeleteButtonClick}>
          <CloseIcon />
        </IconButton>
      );
    }} />;
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

  renderInput = React.memo((props: any) => {
    const {classes, error, getInputProps, startAdornment, isOpen, align, variant, disableErrors, useTooltipForErrors, hasSelectedItem, label, disabled, autoFocus, placeholder} = props;
    let inputProps = getInputProps({
      disabled: disabled,
      onKeyDown: this.handleKeyDown,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      autoFocus: autoFocus,
      label: label,
      placeholder: placeholder,
    });
    const inputClassName            = variant === 'outlined' ? classes.inputOutlinedInput : classes.inputInput;
    const adornedEndClassName       = variant === 'outlined' ? classes.adornedEndOutlined : undefined;
    const inputFormControlClassName = variant === 'standard' && label ? classes.inputFormControlWithLabel : undefined;
    const sAdornment                = startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{startAdornment}</InputAdornment> : undefined;
    const eAdornment                = (< ><this.renderDeleteButton disabled={disabled} hasSelectedItem={hasSelectedItem} /><this.renderOpenButton disabled={disabled} isOpen={isOpen} /></>);
    return (
      <RootRef rootRef={this.textFieldRef}>
        <TextField
          className={classes.textField}
          classes={{root: classes.formControlRoot}}
          variant={variant}
          error={!disableErrors && !disabled && !!error}
          helperText={!disableErrors && <span>{(!disabled && error ? <this.renderError classes={classes} error={error} useTooltipForErrors={useTooltipForErrors} /> : '')}</span>}
          inputRef={this.inputRef}
          inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: align || 'left'}}}
          InputProps={{onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave, startAdornment: sAdornment, endAdornment: eAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName, adornedEnd: adornedEndClassName}}}
          InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classNames(classes.helperTextRoot, useTooltipForErrors ? classes.helperTextRootErrorIcon : undefined), contained: classes.helperTextContained}}}
          {...inputProps}
        />
      </RootRef>
    );
  });

  renderSuggestion = React.memo((props: any) => {
    const { suggestion, index, itemProps, isHighlighted, inputValue, classes } = props;
    const name  = this.map(suggestion);
    const parts = this.parse(inputValue, name);

    if (this.props.renderSuggestion) {
      return (
        <MenuItem {...itemProps} selected={isHighlighted} component='div' key={index} className={classes.menuItem}>
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
    const { suggestionsContainerHeader, suggestionsContainerFooter, inputValue, suggestions, getMenuProps, getItemProps, isOpen, classes } = props;
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

    this.setFontSize();
    let suggestionsContainerComponentProps: ISuggestionsContainerComponentProps = {
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
              : <Observe render={() => suggestions.map((suggestion: any, index: number) =>
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
    const { openOnFocus, showEmptySuggestions, suggestionsContainerHeader, suggestionsContainerFooter, hasTransition, transitionTimeout, label, isOpen, classes, getMenuProps, getItemProps, inputValue, suggestions } = props;

    let transition = !isNullOrUndefined(hasTransition) ? hasTransition : true;
    let timeout    = !isNullOrUndefined(transitionTimeout) && transitionTimeout! >= 0 ? transitionTimeout : 350;
    let showEmpty  = !isNullOrUndefined(showEmptySuggestions) ? showEmptySuggestions : openOnFocus ? true : false;

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
                  <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} getMenuProps={getMenuProps} inputValue={inputValue} getItemProps={getItemProps} isOpen={isOpen} classes={classes} />
                </div>
              </Fade>
            )
          : <this.renderSuggestionsContainerContents suggestions={suggestions} suggestionsContainerHeader={suggestionsContainerHeader} suggestionsContainerFooter={suggestionsContainerFooter} getMenuProps={getMenuProps} inputValue={inputValue} getItemProps={getItemProps} isOpen={isOpen} classes={classes} />
        }
      </Popper>
    );
  });

  render() {
    const {classes, disabled, visible, error, label, placeholder, autoFocus, align, disableErrors, useTooltipForErrors, variant, startAdornment, initialInputValue, showEmptySuggestions, openOnFocus, suggestionsContainerHeader, suggestionsContainerFooter, hasTransition, transitionTimeout} = this.props;
    if (visible === false) {
      return null;
    }

    return (
      <Downshift
        defaultHighlightedIndex={0}
        initialInputValue={initialInputValue}
        initialIsOpen={!isNullOrUndefined(initialInputValue)}
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
                 disabled={disabled}
                 autoFocus={autoFocus}
                 label={label}
                 placeholder={placeholder}
                 align={align}
                 variant={variant}
                 disableErrors={disableErrors}
                 useTooltipForErrors={useTooltipForErrors}
                 startAdornment={startAdornment}
                 isOpen={isOpen}
                 inputValue={inputValue}
                 hasSelectedItem={!!selectedItem}
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

export default withStyles(styles, AutoComplete);
