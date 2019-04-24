import * as React                      from 'react';
import * as is                         from 'is';
import BlurInputHOC                    from './BlurInputHOC';
import {TextMask}                      from 'react-text-mask-hoc';
import TextField, {TextFieldProps}     from '@material-ui/core/TextField';
import InputAdornment                  from '@material-ui/core/InputAdornment';
import {Theme}                         from '@material-ui/core/styles';
import {TextAlignment, TextVariant}    from './editors';
import {withStyles, WithStyle}         from './styles';

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
  inputOutlinedMultilineInput: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: '0.75em',
    marginBottom: '0.75em',
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
  inputType: {
    height: 'auto',
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
  helperTextRoot: {
    marginTop: '6px',
    fontSize: '0.8em',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
});

const isDocument = typeof document !== 'undefined' && document !== null;

interface IInputAdapterCustomProps {
  caretPosition: number;
  onChange(evt: React.ChangeEvent): void;
}

class InputAdapterCustom extends React.PureComponent<IInputAdapterCustomProps> {
  input: HTMLInputElement;

  constructor(props: IInputAdapterCustomProps) {
    super(props);
  }

  componentDidUpdate(prevProps: IInputAdapterCustomProps) {
    this.setCaretPosition();
  }
  get caretPosition(): number | null {
    return this.input.selectionEnd;
  }
  getRef = (element: HTMLInputElement) => {
    this.input = element;
  }
  handleChange = (evt: React.ChangeEvent) => {
    evt.persist();
    this.props.onChange(evt);
  }
  setCaretPosition() {
    if (isDocument && this.input === document.activeElement) {
      this.input.setSelectionRange(this.props.caretPosition, this.props.caretPosition);
    }
  }
  render() {
    const {caretPosition, onChange, ...rest} = this.props;
    return <input ref={this.getRef} type='text' onChange={this.handleChange} {...rest} />;
  }
}

interface ITextMaskInputData {
  caretPosition: number;
  value?: string;
}

interface ITextMaskCustomProps {
  inputRef: any;
  mask?: MaskType | (() => MaskType);
  guide?: boolean;
  onChange(evt: React.ChangeEvent): void;
}

class TextMaskCustom extends React.PureComponent<ITextMaskCustomProps> {
  constructor(props: ITextMaskCustomProps) {
    super(props);
  }

  handleChange = (evt: React.ChangeEvent, inputData: ITextMaskInputData) => {
    (evt.target as HTMLInputElement).value = inputData.value || '';
    this.props.onChange(evt);
  }

  render() {
    const {inputRef, mask, onChange, guide, ...otherProps} = this.props;

    return (
      <TextMask
        ref={(ref: any) => inputRef(ref ? ref.inputElement : null)}
        Component={InputAdapterCustom}
        mask={mask || false}
        onChange={this.handleChange}
        guide={false}
        {...otherProps}
      />
    );
  }
}

export type MaskType = (string | RegExp)[];

export interface IMaskFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  disableErrors?        : boolean;
  error?                : string;
  value?                : string;
  label?                : string;
  placeholder?          : string;
  align?                : TextAlignment;
  variant?              : TextVariant;
  mask?                 : MaskType | (() => MaskType);
  guide?                : boolean;
  placeholderChar?      : string;
  showMask?             : boolean;
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  updateOnChange?       : boolean;
  startAdornment?       : JSX.Element;
  endAdornment?         : JSX.Element;

  onValueChange: (value?: string) => void;
}

type MaskFieldProps = WithStyle<ReturnType<typeof styles>, TextFieldProps & IMaskFieldProps>;

class MaskField extends React.Component<MaskFieldProps> {
  constructor(props: MaskFieldProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: MaskFieldProps) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.error !== this.props.error) ||
      (nextProps.label !== this.props.label) ||
      (nextProps.placeholder !== this.props.placeholder) ||
      (nextProps.align !== this.props.align) ||
      (nextProps.variant !== this.props.variant) ||
      (nextProps.mask !== this.props.mask) ||
      (nextProps.guide !== this.props.guide) ||
      (nextProps.placeholderChar !== this.props.placeholderChar) ||
      (nextProps.showMask !== this.props.showMask) ||
      (nextProps.disableErrors !== this.props.disableErrors) ||
      (nextProps.startAdornment !== this.props.startAdornment) ||
      (nextProps.endAdornment !== this.props.endAdornment)
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
  }

  getPlaceholder(): string {
    const {placeholderChar, placeholder, mask, showMask} = this.props;

    let maskPlaceholderChar = placeholderChar || '_';
    let maskMask            = is.function(mask) ? mask() : mask;
    let maskPlaceholder     = placeholder;
    if (maskMask && (showMask === undefined || showMask)) {
      let ph = '';
      maskMask.forEach((maskChar: string | RegExp) => {
        ph += is.string(maskChar) ? maskChar : maskPlaceholderChar;
      });
      maskPlaceholder = ph;
    }

    return maskPlaceholder || '';
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes, variant, mask, guide, placeholderChar} = this.props;
    const maskProps                        = {mask, guide, placeholderChar};
    const startAdornment                   = this.props.startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment                     = this.props.endAdornment ? <InputAdornment position='end' classes={{root: classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const inputFormControlClassName        = variant === 'standard' && this.props.label ? classes.inputFormControlWithLabel : undefined;
    let inputClassName: string | undefined = undefined;
    if (variant === 'outlined') {
      inputClassName = classes.inputOutlinedInput;
    } else if (variant === 'standard') {
      inputClassName = classes.inputInput;
    }

    let maskPlaceholder = this.getPlaceholder();

    let value = this.props.value !== undefined && this.props.value !== null ? this.props.value : '';

    if (this.props.updateOnChange) {
      return (
      <TextField
        className={this.props.className}
        classes={{root: classes.formControlRoot}}
        disabled={this.props.disabled}
        label={this.props.label}
        placeholder={maskPlaceholder}
        variant={variant}
        error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
        helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error) || ''}</span>}
        value={value}
        autoFocus={this.props.autoFocus}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: this.props.align || 'left'}, ...maskProps}}
        InputProps={{inputComponent: TextMaskCustom, startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, inputType: classes.inputType, formControl: inputFormControlClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined}}}
        FormHelperTextProps={{classes: {root: classes.helperTextRoot, contained: classes.helperTextContained}}}
      />);
    }

    return (
    <BlurInputHOC {...this.props} value={value} onValueChange={this.props.onValueChange}
      render={(props: MaskFieldProps) =>
        <TextField
          className={props.className}
          classes={{root: classes.formControlRoot}}
          disabled={props.disabled}
          label={props.label}
          placeholder={maskPlaceholder}
          variant={variant}
          error={!props.disableErrors && !props.disabled && !!props.error}
          helperText={!props.disableErrors && <span>{(!props.disabled && props.error) || ''}</span>}
          value={props.value}
          autoFocus={props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={props.onBlur}
          onChange={props.onChange}
          inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: props.align || 'left'}, ...maskProps}}
          InputProps={{inputComponent: TextMaskCustom, startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, inputType: classes.inputType, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined}}}
          FormHelperTextProps={{classes: {root: classes.helperTextRoot, contained: classes.helperTextContained}}}
        />
      }
    />);
  }
}

export default withStyles(styles, MaskField);
