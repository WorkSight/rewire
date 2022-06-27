import * as React                      from 'react';
import * as is                         from 'is';
import classNames                      from 'classnames';
import BlurInputHOC                    from './BlurInputHOC';
import {TextMask}                      from 'react-text-mask-hoc';
import TextField, {TextFieldProps}     from '@material-ui/core/TextField';
import InputAdornment                  from '@material-ui/core/InputAdornment';
import {Theme}                         from '@material-ui/core/styles';
import {isNullOrUndefined}             from 'rewire-common';
import ErrorTooltip                    from './ErrorTooltip';
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
  helperTextRootErrorIcon: {
    fontSize: '1.2em',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
  errorIcon: {
  },
});

export type MaskFieldStyles = ReturnType<typeof styles>;

const isDocument = typeof document !== 'undefined' && document !== null;

interface IInputAdapterCustomProps {
  caretPosition: number;
  onChange(evt: React.ChangeEvent<HTMLInputElement>): void;
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
  handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
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
  inputRef?: any;
  mask?: MaskType | (() => MaskType);
  guide?: boolean;
  onChange(evt: React.ChangeEvent<HTMLInputElement>): void;
}

class TextMaskCustom extends React.PureComponent<ITextMaskCustomProps> {
  constructor(props: ITextMaskCustomProps) {
    super(props);
  }

  handleChange = (evt: React.ChangeEvent<HTMLInputElement>, inputData: ITextMaskInputData) => {
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
  useTooltipForErrors?  : boolean;
  error?                : string;
  value?                : string;
  tooltip?              : string | ((value: any) => string);
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

export type MaskFieldProps = WithStyle<MaskFieldStyles, TextFieldProps & IMaskFieldProps>;

class MaskField extends React.Component<MaskFieldProps> {
  textFieldRef: React.RefObject<HTMLInputElement>;

  constructor(props: MaskFieldProps) {
    super(props);
    this.textFieldRef = React.createRef();
  }

  shouldComponentUpdate(nextProps: MaskFieldProps) {
    return (
      (nextProps.value               !== this.props.value)               ||
      (nextProps.disabled            !== this.props.disabled)            ||
      (nextProps.visible             !== this.props.visible)             ||
      (nextProps.error               !== this.props.error)               ||
      (nextProps.label               !== this.props.label)               ||
      (nextProps.placeholder         !== this.props.placeholder)         ||
      (nextProps.align               !== this.props.align)               ||
      (nextProps.variant             !== this.props.variant)             ||
      (nextProps.mask                !== this.props.mask)                ||
      (nextProps.guide               !== this.props.guide)               ||
      (nextProps.placeholderChar     !== this.props.placeholderChar)     ||
      (nextProps.showMask            !== this.props.showMask)            ||
      (nextProps.disableErrors       !== this.props.disableErrors)       ||
      (nextProps.useTooltipForErrors !== this.props.useTooltipForErrors) ||
      (nextProps.startAdornment      !== this.props.startAdornment)      ||
      (nextProps.endAdornment        !== this.props.endAdornment)        ||
      (nextProps.tooltip             !== this.props.tooltip)
    );
  }

  getTooltip(value: any): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      return value;
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  getPlaceholder(): string {
    const {placeholderChar, placeholder, mask, showMask} = this.props;

    let maskPlaceholderChar = placeholderChar || '_';
    let maskMask            = is.function(mask) ? (mask as any)() : mask;
    let maskPlaceholder     = placeholder;
    if (maskMask && (isNullOrUndefined(showMask) || showMask)) {
      let ph = '';
      maskMask.forEach((maskChar: string | RegExp) => {
        ph += is.string(maskChar) ? maskChar : maskPlaceholderChar;
      });
      maskPlaceholder = ph;
    }

    return maskPlaceholder || '';
  }

  renderError = React.memo((props: any) => {
    const {classes, error, useTooltipForErrors} = props;

    if (!useTooltipForErrors) {
      return error;
    }

    return (
      <ErrorTooltip
        inputRef={this.textFieldRef}
        error={error}
        classes={{errorIcon: classes.errorIcon}}
      />
    );
  });

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

    let value = !isNullOrUndefined(this.props.value) ? this.props.value : '';

    if (this.props.updateOnChange) {
      return (
      <TextField
        className={this.props.className}
        classes={{root: classes.formControlRoot}}
        disabled={this.props.disabled}
        label={this.props.label}
        inputRef={this.textFieldRef}
        placeholder={maskPlaceholder}
        variant={variant as any}
        error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
        helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error ? <this.renderError classes={this.props.classes} error={this.props.error} useTooltipForErrors={this.props.useTooltipForErrors} /> : '')}</span>}
        value={value}
        title={this.getTooltip(value)}
        autoFocus={this.props.autoFocus}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: this.props.align || 'left'}, ...maskProps}}
        InputProps={{inputComponent: TextMaskCustom, startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
        FormHelperTextProps={{classes: {root: classNames(classes.helperTextRoot, this.props.useTooltipForErrors ? classes.helperTextRootErrorIcon : undefined), contained: classes.helperTextContained}}}
      />
      );
    }
    return (
    <BlurInputHOC {...(this.props as any)} value={value} onValueChange={this.props.onValueChange}
      render={(props: MaskFieldProps) =>
        <TextField
          inputRef={this.textFieldRef}
          className={props.className}
          classes={{root: classes.formControlRoot}}
          disabled={props.disabled}
          label={props.label}
          placeholder={maskPlaceholder}
          variant={variant as any}
          error={!props.disableErrors && !props.disabled && !!props.error}
          helperText={!props.disableErrors && <span>{(!props.disabled && props.error ? <this.renderError classes={props.classes} error={props.error} useTooltipForErrors={props.useTooltipForErrors} /> : '')}</span>}
          value={props.value}
          title={this.getTooltip(props.value)}
          autoFocus={props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={props.onBlur}
          onChange={props.onChange}
          inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: props.align || 'left'}, ...maskProps}}
          InputProps={{inputComponent: TextMaskCustom, startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classNames(props.classes.helperTextRoot, props.useTooltipForErrors ? props.classes.helperTextRootErrorIcon : undefined), contained: props.classes.helperTextContained}}}
        />
      }
    />
    );
  }
}

export default withStyles(styles, MaskField);
