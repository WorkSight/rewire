import * as React                from 'react';
// import * as PropTypes            from 'prop-types';
import {disposeOnUnmount}        from 'rewire-core';
import Downshift                 from 'downshift';
import {Theme}                   from '@material-ui/core/styles';
import TextField                 from '@material-ui/core/TextField';
import Paper                     from '@material-ui/core/Paper';
import MenuItem                  from '@material-ui/core/MenuItem';
import Chip                      from '@material-ui/core/Chip';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap
}                                from '../models/search';
import { withStyles, WithStyle } from './styles';
import { SelectProps }           from '@material-ui/core/Select';
// import { withStyles } from '@material-ui/core/styles';

const styles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    height: 250,
  },
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  inputRoot: {
    flexWrap: 'wrap',
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
});

const suggestions = [
  { label: 'Afghanistan' },
  { label: 'Aland Islands' },
  { label: 'Albania' },
  { label: 'Algeria' },
  { label: 'American Samoa' },
  { label: 'Andorra' },
  { label: 'Angola' },
  { label: 'Anguilla' },
  { label: 'Antarctica' },
  { label: 'Antigua and Barbuda' },
  { label: 'Argentina' },
  { label: 'Armenia' },
  { label: 'Aruba' },
  { label: 'Australia' },
  { label: 'Austria' },
  { label: 'Azerbaijan' },
  { label: 'Bahamas' },
  { label: 'Bahrain' },
  { label: 'Bangladesh' },
  { label: 'Barbados' },
  { label: 'Belarus' },
  { label: 'Belgium' },
  { label: 'Belize' },
  { label: 'Benin' },
  { label: 'Bermuda' },
  { label: 'Bhutan' },
  { label: 'Bolivia, Plurinational State of' },
  { label: 'Bonaire, Sint Eustatius and Saba' },
  { label: 'Bosnia and Herzegovina' },
  { label: 'Botswana' },
  { label: 'Bouvet Island' },
  { label: 'Brazil' },
  { label: 'British Indian Ocean Territory' },
  { label: 'Brunei Darussalam' },
];

// TODO: this needs to change (or be deleted?)
interface ISuggestionPropTypes {
  label: string;
}

interface IRenderSuggestionPropTypes {
  highlightedIndex: number;
  index:            number;
  // itemProps:        React.ObjectHTMLAttributes;
  itemProps:        any;
  selectedItem:     string;
  suggestion:       ISuggestionPropTypes;
}

type IDownshiftMultipleProps<T> = ICustomProps<T> & React.InputHTMLAttributes<any> & SelectProps;
type DownshiftMultipleProps<T>  = WithStyle<ReturnType<typeof styles>, IDownshiftMultipleProps<T>>;

class DownshiftMultiple<T> extends React.Component<DownshiftMultipleProps<T>, any> {
  state:  any;
  search: SearchFn<T>;
  map:    MapFn<T>;

  constructor(props: DownshiftMultipleProps<T>) {
    super(props);
    this.state  = { inputValue: '', selectedItem: [] };
    this.search = props.search;
    this.map    = props.map || defaultMap;
  }

  // componentDidMount() {
  //   disposeOnUnmount(this, () => this.performSearch());
  // }

  // performSearch = async () => {
  //   const suggestions = await this.search('', this.props.options);
  //   this.setState({ suggestions: suggestions });
  // }

  renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }: IRenderSuggestionPropTypes) {
    const isHighlighted = highlightedIndex === index;
    const isSelected    = (selectedItem || '').indexOf(suggestion.label) > -1;

    return (
      <MenuItem
        {...itemProps}
        key={suggestion.label}
        selected={isHighlighted}
        component='div'
        style={{
          fontWeight: isSelected ? 500 : 400,
        }}
      >
        {suggestion.label}
      </MenuItem>
    );
  }

  getSuggestions(value: string) {
    const inputValue  = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : suggestions.filter(suggestion => {
        const keep = count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;
        if (keep) {
          count += 1;
        }
        return keep;
      });
  }

  renderInput(inputProps) {
    const { InputProps, classes, ref, ...other } = inputProps;

    return (
      <TextField
        InputProps={{
          inputRef: ref,
          classes: {
            root: classes.inputRoot,
            input: classes.inputInput,
          },
          ...InputProps,
        }}
        {...other}
      />
    );
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const { inputValue, selectedItem } = this.state;
    if (selectedItem.length && (!inputValue || !inputValue.length) && event.key === 'Backspace') {
      this.setState({
        selectedItem: selectedItem.slice(0, selectedItem.length - 1),
      });
    }
  }

  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
  }

  handleChange = (item: ISuggestionPropTypes) => {
    let { selectedItem } = this.state;

    if (selectedItem.indexOf(item) === -1) {
      selectedItem = [...selectedItem, item];
    }

    this.setState({
      inputValue: '',
      selectedItem,
    });
  }

  handleDelete = (item: ISuggestionPropTypes) => () => {
    this.setState(state => {
      const selectedItem = [...state.selectedItem];
      selectedItem.splice(selectedItem.indexOf(item), 1);
      return { selectedItem };
    });
  }

  render() {
    const { classes, label, placeholder } = this.props;
    const { inputValue, selectedItem }    = this.state;

    return (
      <Downshift
        id='downshift-multiple'
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItem}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue: inputValue2,
          selectedItem: selectedItem2,
          highlightedIndex,
        }) => (
          <div className={classes.container}>
            {this.renderInput({
              fullWidth: true,
              classes,
              InputProps: getInputProps({
                startAdornment: selectedItem.map(item => (
                  <Chip
                    key={item}
                    tabIndex={-1}
                    label={item}
                    className={classes.chip}
                    onDelete={this.handleDelete(item)}
                  />
                )),
                onChange: this.handleInputChange,
                onKeyDown: this.handleKeyDown,
                placeholder: placeholder,
              }),
              label: label,
            })}
            {isOpen ? (
              <Paper className={classes.paper} square>
                {this.getSuggestions(inputValue2).map((suggestion: ISuggestionPropTypes, index: number) =>
                  this.renderSuggestion({
                    suggestion,
                    index,
                    itemProps: getItemProps({ item: suggestion.label }),
                    highlightedIndex,
                    selectedItem: selectedItem2,
                  }),
                )}
              </Paper>
            ) : null}
          </div>
        )}
      </Downshift>
    );
  }
}

export default withStyles(styles, DownshiftMultiple);
