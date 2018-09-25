import { ChangeEvent }         from 'react';
import {Theme}                 from '@material-ui/core/styles';
import FormControl             from '@material-ui/core/FormControl';
import FormHelperText          from '@material-ui/core/FormHelperText';
import Input                   from '@material-ui/core/Input';
import InputLabel              from '@material-ui/core/InputLabel';
import MenuItem                from '@material-ui/core/MenuItem';
import * as React              from 'react';
import Select                  from '@material-ui/core/Select';
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
  select: {
  },
  selectMenuPaper: {
  },
  selectMenuItem: {
    fontSize: 'inherit',
    // paddingTop: '8px',
    // paddingBottom: '8px',
  },
});

export type ISelectProps<T> = ICustomProps<T> & React.InputHTMLAttributes<any>;
type SelectProps<T>         = WithStyle<ReturnType<typeof styles>, ISelectProps<T>>;

class SelectInternal<T> extends React.Component<SelectProps<T>, any> {
  state : any;
  search: SearchFn<T>;
  map   : MapFn<T>;

  constructor(props: SelectProps<T>) {
    super(props);
    this.state  = {suggestions: []};
    this.search = props.search;
    this.map    = props.map || defaultMap;
  }

  componentDidMount() {
    disposeOnUnmount(this, () => this.performSearch(''));
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
    const v = this.map(value);
    return (
    <Select disabled={disabled} value={v as any} onChange={this.handleChanged} className={cls} style={this.props.style} classes={{root: this.props.classes.inputRoot, select: this.props.classes.select}} MenuProps={{classes: {paper: this.props.classes.selectMenuPaper}}} input={<Input classes={{root: this.props.classes.inputRoot}}/>} renderValue={(p) => <span>{v}</span>}>{
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
    const visible  = this.props.visible;
    const error    = this.props.error;
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

export default withStyles(styles, SelectInternal);
