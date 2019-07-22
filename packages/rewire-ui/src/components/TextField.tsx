import * as React                    from 'react';
import {isNullOrUndefined, utc, UTC} from 'rewire-common';
import BlurInputHOC                  from './BlurInputHOC';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment                from '@material-ui/core/InputAdornment';
import {Theme}                       from '@material-ui/core/styles';
import {TextAlignment, TextVariant}  from './editors';
import {withStyles, WithStyle}       from './styles';

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
  inputMultiline: {
    paddingTop: '0.28125em !important',
    paddingBottom: '0.34375em !important',
  },
  inputOutlinedMultilineInput: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: '0.65625em',
    marginBottom: '0.65625em',
  },
  inputOutlinedMultiline: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputMultilineWithAdornment: {
    padding: '0.1875em 0 0.1875em',
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
  formControlRoot: {
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
    '&[type=date]': {
      '&::-webkit-clear-button': {
        // marginRight: '4px',
      },
      '&::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        // marginRight: '1px',
      },
      '&::-webkit-calendar-picker-indicator': {
        // marginTop: '2px',
        marginTop: '0.125em',
        fontSize: '1.1em',
      },
    },
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

export interface ITextFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  disableErrors?        : boolean;
  error?                : string;
  value?                : string;
  label?                : string;
  placeholder?          : string;
  align?                : TextAlignment;
  variant?              : TextVariant;
  multiline?            : boolean;
  rows?                 : string | number; // only used if multiline is true
  rowsMax?              : string | number; // only used if multiline is true
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  updateOnChange?       : boolean;
  startAdornment?       : JSX.Element;
  endAdornment?         : JSX.Element;

  onValueChange: (value?: string | UTC) => void;
}

type TextFieldPropsStyled = WithStyle<ReturnType<typeof styles>, TextFieldProps & ITextFieldProps>;

class TextFieldInternal extends React.Component<TextFieldPropsStyled> {
  constructor(props: TextFieldPropsStyled) {
    super(props);
  }

  shouldComponentUpdate(nextProps: TextFieldPropsStyled) {
    let equalValue: boolean;

    if (nextProps.multiline && nextProps.value && this.props.value) {
      equalValue = nextProps.value.localeCompare(this.props.value) === 0;
    } else {
      equalValue = nextProps.value === this.props.value;
    }

    return (
      !equalValue ||
      (nextProps.disabled       !== this.props.disabled)       ||
      (nextProps.visible        !== this.props.visible)        ||
      (nextProps.error          !== this.props.error)          ||
      (nextProps.label          !== this.props.label)          ||
      (nextProps.placeholder    !== this.props.placeholder)    ||
      (nextProps.align          !== this.props.align)          ||
      (nextProps.multiline      !== this.props.multiline)      ||
      (nextProps.rows           !== this.props.rows)           ||
      (nextProps.rowsMax        !== this.props.rowsMax)        ||
      (nextProps.variant        !== this.props.variant)        ||
      (nextProps.disableErrors  !== this.props.disableErrors)  ||
      (nextProps.startAdornment !== this.props.startAdornment) ||
      (nextProps.endAdornment   !== this.props.endAdornment)
    );
  }

  onValueChange = (value?: string | UTC) => {
    let v = value;
    if (this.props.type === 'date') {
      v = v ? utc(v).startOfDay() : undefined;
    }
    this.props.onValueChange(v);
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.type === 'date' && (this.props.selectOnFocus || this.props.endOfTextOnFocus)) {
      evt.target.select();
    } else if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    this.props.onKeyDown && this.props.onKeyDown(evt);

    switch (evt.key) {
      case 'Enter':
        if (!this.props.multiline) {
          break;
        }
        evt.stopPropagation();
        break;

      default:
        break;
    }
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes, type, variant, multiline} = this.props;
    const startAdornment                      = this.props.startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment                        = this.props.endAdornment ? <InputAdornment position='end' classes={{root: classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const multilineClassName                  = variant === 'outlined' ? classes.inputOutlinedMultiline : startAdornment || endAdornment ? classes.inputMultilineWithAdornment : classes.inputMultiline;
    const inputFormControlClassName           = variant === 'standard' && this.props.label ? classes.inputFormControlWithLabel : undefined;
    let inputClassName: string | undefined    = undefined;
    if (variant === 'outlined') {
      inputClassName = multiline ? classes.inputOutlinedMultilineInput : classes.inputOutlinedInput;
    } else if (variant === 'standard') {
      if (!multiline) {
        inputClassName = classes.inputInput;
      }
    }
    let value = !isNullOrUndefined(this.props.value) ? this.props.value : '';

    if (this.props.updateOnChange) {
      return (
      <TextField
        className={this.props.className}
        classes={{root: classes.formControlRoot}}
        type={type}
        multiline={multiline}
        rows={this.props.rows || 2}
        rowsMax={this.props.rowsMax || 4}
        disabled={this.props.disabled}
        label={this.props.label}
        placeholder={this.props.placeholder}
        variant={variant as any}
        error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
        helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error) || ''}</span>}
        value={value}
        autoFocus={this.props.autoFocus}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onKeyDown={this.handleKeyDown}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.onValueChange(evt.target.value)}
        inputProps={{spellCheck: !!multiline, className: classes.nativeInput, style: {textAlign: this.props.align || 'left'}}}
        InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, multiline: multilineClassName, input: inputClassName, formControl: inputFormControlClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
        FormHelperTextProps={{classes: {root: classes.helperTextRoot, contained: classes.helperTextContained}}}
      />);
    }

    return (
    <BlurInputHOC {...this.props} value={value} onValueChange={this.onValueChange}
      render={(props: TextFieldPropsStyled) =>
        <TextField
          className={props.className}
          classes={{root: classes.formControlRoot}}
          type={type}
          multiline={multiline}
          rows={props.rows || 2}
          rowsMax={props.rowsMax || 4}
          disabled={props.disabled}
          label={props.label}
          placeholder={props.placeholder}
          variant={variant as any}
          error={!props.disableErrors && !props.disabled && !!props.error}
          helperText={!props.disableErrors && <span>{(!props.disabled && props.error) || ''}</span>}
          value={props.value}
          autoFocus={props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={props.onBlur}
          onKeyDown={this.handleKeyDown}
          onChange={props.onChange}
          inputProps={{spellCheck: !!multiline, className: classes.nativeInput, style: {textAlign: props.align || 'left'}}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, multiline: multilineClassName, input: inputClassName, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classes.helperTextRoot, contained: classes.helperTextContained}}}
        />
      }
    />);
  }
}

export default withStyles(styles, TextFieldInternal);
