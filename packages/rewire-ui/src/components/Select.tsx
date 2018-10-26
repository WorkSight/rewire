import { ChangeEvent }         from 'react';
import {Theme}                 from '@material-ui/core/styles';
import FormControl             from '@material-ui/core/FormControl';
import FormHelperText          from '@material-ui/core/FormHelperText';
import Input                   from '@material-ui/core/Input';
import InputLabel              from '@material-ui/core/InputLabel';
import MenuItem                from '@material-ui/core/MenuItem';
import * as React              from 'react';
import Select                  from '@material-ui/core/Select';
import InputAdornment          from '@material-ui/core/InputAdornment';
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
    alignItems: 'stretch',
  },
  selectRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
    display: 'inline-flex',
    alignItems: 'stretch',
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
  },
  selectMenuItem: {
    fontSize: 'inherit',
    height: 'auto',
    lineHeight: '1em',
  },
  inputAdornmentRoot: {
    height: 'auto',
    paddingBottom: '2px',
  },
  placeholderValue: {
    opacity: 0.4,
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

  handleMenuKeyDown = (event: React.KeyboardEvent<any>) => {
    switch (event.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40:
        event.stopPropagation();
        event.preventDefault();
        break;
    }
  }

  handleMenuKeyPress = (event: React.KeyboardEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuMouseEnter = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuMouseDown = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuClick = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
  }

  handleMenuDoubleClick = (event: React.MouseEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();
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

  renderSelect(disabled: boolean, cls: string, value?: T, autoFocus?: boolean, placeholder?: string) {
    const {classes, style} = this.props;
    const v                = this.map(value);
    const startAdornment   = this.props.startAdornment ? <InputAdornment position='start' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment     = this.props.endAdornment ? <InputAdornment position='end' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const menuListProps    = {
      onKeyDown: this.handleMenuKeyDown,
      onKeyPress: this.handleMenuKeyPress,
      onMouseEnter: this.handleMenuMouseEnter,
      onMouseDown: this.handleMenuMouseDown,
      onClick: this.handleMenuClick,
      onDoubleClick: this.handleMenuDoubleClick,
    };

    return (
    <Select
      disabled={disabled}
      value={v as any}
      onChange={this.handleChanged}
      displayEmpty={true}
      className={cls}
      style={style}
      classes={{root: classes.selectRoot, select: classes.select}}
      MenuProps={{classes: {paper: classes.selectMenuPaper}, MenuListProps: menuListProps}}
      input={<Input startAdornment={startAdornment} endAdornment={endAdornment} autoFocus={autoFocus} classes={{root: classes.inputRoot}}/>}
      renderValue={(p) => <span>{v || <span className={classes.placeholderValue}>{placeholder}</span>}</span>}>{
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
          <InputLabel htmlFor='name-error' shrink={true}>{label}</InputLabel>
          {this.renderSelect(disabled, '', this.props.selectedItem, this.props.autoFocus, this.props.placeholder)}
          {<FormHelperText>{!disabled && error}</FormHelperText>}
        </FormControl>
      );
    }

    return this.renderSelect(disabled, cls, this.props.selectedItem, this.props.autoFocus, this.props.placeholder);
  }
}

export default withStyles(styles, SelectInternal);
