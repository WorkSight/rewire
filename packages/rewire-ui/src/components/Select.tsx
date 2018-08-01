import { ChangeEvent }                 from 'react';
import FormControl                     from '@material-ui/core/FormControl';
import FormHelperText                  from '@material-ui/core/FormHelperText';
import InputLabel                      from '@material-ui/core/InputLabel';
import MenuItem                        from '@material-ui/core/MenuItem';
import * as React                      from 'react';
import Select                          from '@material-ui/core/Select';
import {
  ICustomProps,
  SearchFn,
  MapFn,
  defaultMap
} from '../models/search';

export type ISelectProps<T> = ICustomProps<T> & React.InputHTMLAttributes<any>;

export default class SelectInternal<T> extends React.Component<ISelectProps<T>, any> {
  // state = {suggestions: []};
  search   : SearchFn<T>;
  map      : MapFn<T>;

  constructor(props: ISelectProps<T>) {
    super(props);
    this.state  = {suggestions: []};
    this.search = props.search;
    this.map    = props.map || defaultMap;
  }

  performSearch = async (value: string) => {
    const suggestions = await this.search(value, this.props.options);
    this.setState({suggestions});
  }

  componentWillMount() {
    this.performSearch('');
  }

  renderSuggestion = (params: any) => {
    const { suggestion, index, isHighlighted, displayName } = params;

    if (this.props.renderSuggestion) {
      return (
        <MenuItem value={displayName} component='div' key={index}>
          {this.props.renderSuggestion(suggestion, {isHighlighted, displayName, index})}
        </MenuItem>
      );
    }
    let s: any = {};
    if (isHighlighted) {
      s.fontWeight = '500';
    }

    return (
      <MenuItem key={index} component='div' value={displayName} style={s}>{displayName}</MenuItem>
    );
  }

  componentWillReceiveProps (nextProps: ICustomProps<T>) {
    if (nextProps.options) {
      if (nextProps.options.parentId !== (this.props.options && this.props.options.parentId)) {
        this.props.onSelectItem(undefined);
      }
    }
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
        (nextState.suggestions !== this.state.suggestions)
      );
  }

  renderSelect(disabled: boolean, cls: string, value?: T, autoFocus?: boolean) {
    const v   = this.map(value);
    return (
    <Select disabled={disabled} value={v as any} onChange={this.handleChanged} className={cls} style={this.props.style} renderValue={(p) => <span>{v}</span>}>{
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
    const disabled           = this.props.disabled === true;
    const visible            = this.props.visible;
    const error              = this.props.error;
    if (visible === false) {
      return null;
    }

    const label = this.props.label;
    let   cls   = (this.props.className || '') + ' select';
    if (label) {
      return (
        <FormControl error={!disabled && !!error} className={cls}>
          <InputLabel htmlFor='name-error'>{label}</InputLabel>
          {this.renderSelect(disabled, '', this.props.selectedItem, this.props.autoFocus)}
          {!disabled && error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );
    }

    return this.renderSelect(disabled, cls, this.props.selectedItem, this.props.autoFocus);
  }
}
