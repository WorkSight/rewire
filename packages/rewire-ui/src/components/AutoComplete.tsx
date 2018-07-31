import * as React        from 'react';
import * as is           from 'is';
import Downshift, {
  ControllerStateAndHelpers,
  StateChangeOptions }   from 'downshift';
import TextField         from 'material-ui/TextField';
import Paper             from 'material-ui/Paper';
import { MenuItem }      from 'material-ui/Menu';
import {
  withStyles,
  WithStyles,
  Theme,
  StyledComponentProps } from 'material-ui/styles';
import {debounce}          from 'rewire-common';
import {match}             from 'rewire-common';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap
} from '../models/search';

export {StyledComponentProps as StyledComponentProps};

export type IStyleClasses = 'container' | 'popup' | 'textField';
const decorate = withStyles<IStyleClasses>((theme: Theme) => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  popup: {
    position: 'fixed',
    width: 'auto',
    overflowY: 'auto',
    maxHeight: '80vh',
    minWidth: '150px',
    zIndex: 1500,
  },
  textField: {
    width: '100%'
  }
}));

export type IAutoCompleteProps<T> = ICustomProps<T> & React.InputHTMLAttributes<any> & WithStyles<IStyleClasses>;

class AutoComplete<T> extends React.Component<IAutoCompleteProps<T>, any> {
  state = {suggestions: []};
  downShift: any;
  search   : SearchFn<T>;
  map      : MapFn<T>;

  constructor(props: IAutoCompleteProps<T>) {
    super(props);
    this.search = props.search;
    if (props.debounce) {
      const wait = is.number(props.debounce) ? props.debounce as number : 150;
      this.search = debounce(this.search, wait);
    }
    this.map = props.map || defaultMap;
  }

  performSearch = async (value: string) => {
    const suggestions = await this.search(value, this.props.options);
    this.setState({
      suggestions
    });
  }

  renderInput = (classes: Record<IStyleClasses, string>, error: string | undefined, inputProps: any) => {
    const { label, disabled, autoFocus, value, ref, align, ...other } = inputProps;

    return (
      <TextField
        autoFocus={autoFocus}
        className={classes.textField}
        value={value}
        label={label}
        error={!disabled && !!error}
        helperText={error}
        inputRef={ref}
        disabled={disabled}
        inputProps={{style: {textAlign: align || 'left'}}}
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
    const { suggestion, index, itemProps, theme, highlightedIndex, inputValue } = params;
    const isHighlighted = highlightedIndex === index;
    const name          = this.map(suggestion);

    if (this.props.renderSuggestion) {
      return (
        <MenuItem selected={isHighlighted} component='div' key={index}>
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

  renderSuggestionsContainer = (options: any) => {
    const { containerProps, children, classes } = options;

    return (
      <Paper {...containerProps} className={classes.popup} square>
        {children}
      </Paper>
    );
  }

  handleInputChanged = (inputValue: string, helpers: ControllerStateAndHelpers) => {
    if (helpers.isOpen) {
      this.performSearch(inputValue);
    }
  }

  handleItemChanged = (options: StateChangeOptions, helpers: ControllerStateAndHelpers) => {
    if (!options) {
      return;
    }
    if (options.hasOwnProperty('selectedItem')) {
      this.props.onSelectItem(options.selectedItem);
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.altKey || event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case 9:
      case 13:
        const state = this.downShift.getState();
        if (state.isOpen) {
          if (!state.inputValue) {
            this.downShift.clearSelection();
            return;
          }
        this.downShift.selectHighlightedItem({
            type: '__autocomplete_keydown_enter__'
          });
        }
        break;
    }
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

  shouldComponentUpdate(nextProps: ICustomProps<T> & React.InputHTMLAttributes<any>, nextState: any, nextContext: any) {
    return (
        (nextProps.selectedItem !== this.props.selectedItem) ||
        (nextProps.error !== this.props.error) ||
        (nextProps.disabled !== this.props.disabled) ||
        (nextProps.visible !== this.props.visible) ||
        (nextState.suggestions !== this.state.suggestions)
      );
  }

  render() {
    const { classes, theme, disabled, visible, error, label, placeholder, autoFocus, align } = this.props;
    if (visible === false) {
      return null;
    }

    return (
      <Downshift
        defaultHighlightedIndex={0}
        selectedItem={this.props.selectedItem}
        itemToString={this.map}
        onInputValueChange={this.handleInputChanged}
        onUserAction={this.handleItemChanged}
        ref={(v) => this.downShift = v}
        render={({
          getInputProps,
          getItemProps,
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
                align: align,
              }),
            )}
            {isOpen
              ? this.renderSuggestionsContainer({
                  classes: classes,
                  children: this.state.suggestions.map((suggestion, index) =>
                    this.renderSuggestion({
                      suggestion,
                      index,
                      inputValue,
                      theme,
                      itemProps: getItemProps({ item: suggestion }),
                      highlightedIndex,
                      selectedItem,
                    }),
                  ),
                })
              : this.state.suggestions = []}
          </div>
        )}
      />
    );
  }
}

export default decorate(AutoComplete);
