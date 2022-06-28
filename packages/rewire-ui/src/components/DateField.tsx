import React                    from 'react';
import classNames                    from 'classnames';
import {
  isNullOrUndefined,
  utc,
  UTC,
  getTimezoneOffset,
}                                    from 'rewire-common';
import DateBlurInputHOC              from './DateBlurInputHOC';
import InputAdornment                from '@material-ui/core/InputAdornment';
import {
  Theme,
}                                    from '@material-ui/core/styles';
import DateFnsUtils                  from '@date-io/date-fns';
import {
  DatePicker,
  KeyboardDatePicker,
  KeyboardDatePickerProps,
  MuiPickersUtilsProvider,
}                                    from '@material-ui/pickers';
import ErrorTooltip                  from './ErrorTooltip';
import {
  TextAlignment,
  TextVariant,
  DateVariant,
}                                    from './editors';
import {withStyles, WithStyle}       from './styles';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

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
  },
  inputAdornmentButton: {
    fontSize: 'inherit',
    color: 'inherit',
    padding: '0px',
    '&:hover': {
      opacity:'0.7',
    },
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

export type DateFieldStyles = ReturnType<typeof styles>;

export interface IDateFieldProps {
  visible?              : boolean;
  disableErrors?        : boolean;
  useTooltipForErrors?  : boolean;
  error?                : string;
  label?                : string;
  tooltip?              : string | ((value: any) => string);
  placeholder?          : string;
  variant?              : TextVariant;
  dateVariant?          : DateVariant;
  align?                : TextAlignment;
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  updateOnChange?       : boolean;
  startAdornment?       : JSX.Element;
  endAdornment?         : JSX.Element;
  allowKeyboardInput?   : boolean;

  onValueChange: (value?: UTC) => void;
}

export type DateFieldProps = WithStyle<DateFieldStyles, IDateFieldProps & KeyboardDatePickerProps>;

class DateField extends React.PureComponent<DateFieldProps> {
  inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: DateFieldProps) {
    super(props);

    this.inputRef = React.createRef();
  }

  getTooltip(value: any): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      return !isNullOrUndefined(value) ? value.toDateString() : undefined;
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  onValueChange = (date?: Date | null, inputValue?: string | null) => {
    const v = date && date instanceof Date && !isNaN(date.getTime())
      ? utc(date.getTime() - getTimezoneOffset(date)).startOfDay()
      : undefined;

    this.props.onValueChange(v);
  }

  onClose = () => {
    this.inputRef.current?.focus();
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus || this.props.endOfTextOnFocus) {
      evt.target.select();
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  handleInputKeyDown = (event: any) => {
    if (event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    switch (event.keyCode) {
      case 46:
        if (!this.props.allowKeyboardInput) {
          this.onValueChange(null);
        }
        break;
    }
  }

  renderError = React.memo((props: any) => {
    const {classes, error, useTooltipForErrors} = props;

    if (!useTooltipForErrors) {
      return error;
    }

    return (
      <ErrorTooltip
        inputRef={this.inputRef}
        error={error}
        classes={{errorIcon: classes.errorIcon}}
      />
    );
  });

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes}                          = this.props;
    const startAdornment                     = this.props.startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment                       = this.props.endAdornment ? <InputAdornment position='end' classes={{root: classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const inputFormControlClassName          = this.props.variant === 'standard' && this.props.label ? classes.inputFormControlWithLabel : undefined;
    const inputClassName: string | undefined = this.props.variant === 'standard' ? classes.inputInput : classes.inputOutlinedInput;
    const allowKeyboardInput                 = !isNullOrUndefined(this.props.allowKeyboardInput) ? this.props.allowKeyboardInput : true;
    const format                             = this.props.format || 'yyyy-MM-dd';
    const emptyLabel                         = this.props.emptyLabel || 'yyyy-mm-dd'
    const dateVariant                        = this.props.dateVariant || 'inline';
    const autoOk                             = !isNullOrUndefined(this.props.autoOk) ? this.props.autoOk : dateVariant === 'inline' || dateVariant === 'static';
    const clearable                          = !isNullOrUndefined(this.props.clearable) ? this.props.clearable : true;
    const onChange                           = (date: MaterialUiPickersDate) => { this.onValueChange(date, null); this.props.onChange?.(date, null); };
    const onClose                            = () => { this.onClose(); this.props.onClose?.(); }
    const value                              = !isNullOrUndefined(this.props.value) ? this.props.value : null;

    const dateVariantSpecificProps =
      dateVariant === 'inline'
        ? { PopoverProps: this.props.PopoverProps }
        : dateVariant === 'dialog'
          ? {
              cancelLabel: this.props.cancelLabel,
              clearable: clearable,
              clearLabel: this.props.clearLabel,
              DialogProps: this.props.DialogProps,
              okLabel: this.props.okLabel,
              showTodayButton: this.props.showTodayButton,
              todayLabel: this.props.todayLabel,
            }
          : undefined;

    if (!allowKeyboardInput) {
      return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        className={this.props.className}
        // classes={{root: classes.formControlRoot}}
        disabled={this.props.disabled}
        label={this.props.label}
        placeholder={this.props.placeholder}
        variant={dateVariant}
        inputVariant={this.props.variant}
        error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
        helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error ? <this.renderError classes={classes} error={this.props.error} useTooltipForErrors={this.props.useTooltipForErrors} /> : '')}</span>}
        value={value}
        title={this.getTooltip(value)}
        autoFocus={this.props.autoFocus}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onChange={onChange}
        inputRef={this.inputRef}
        inputProps={{className: classes.nativeInput, style: {textAlign: this.props.align || 'left'}, onKeyDown: this.handleInputKeyDown}}
        InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
        FormHelperTextProps={{classes: {root: classNames(classes.helperTextRoot, this.props.useTooltipForErrors ? classes.helperTextRootErrorIcon : undefined), contained: classes.helperTextContained}}}
        allowKeyboardControl={this.props.allowKeyboardControl}
        animateYearScrolling={this.props.animateYearScrolling}
        autoOk={autoOk}
        disableFuture={this.props.disableFuture}
        disablePast={this.props.disablePast}
        disableToolbar={this.props.disableToolbar}
        emptyLabel={emptyLabel}
        format={format}
        initialFocusedDate={this.props.initialFocusedDate}
        // InputAdornmentProps={{classes: {root: classes.inputAdornmentRoot}, ...this.props.InputAdornmentProps}}
        invalidDateMessage={this.props.invalidDateMessage}
        invalidLabel={this.props.invalidLabel}
        labelFunc={this.props.labelFunc}
        leftArrowButtonProps={this.props.leftArrowButtonProps}
        leftArrowIcon={this.props.leftArrowIcon}
        rightArrowButtonProps={this.props.rightArrowButtonProps}
        rightArrowIcon={this.props.rightArrowIcon}
        loadingIndicator={this.props.loadingIndicator}
        maxDate={this.props.maxDate}
        maxDateMessage={this.props.maxDateMessage}
        minDate={this.props.minDate}
        minDateMessage={this.props.minDateMessage}
        onAccept={this.props.onAccept}
        onClose={onClose}
        onError={this.props.onError}
        onMonthChange={this.props.onMonthChange}
        onOpen={this.props.onOpen}
        onYearChange={this.props.onYearChange}
        openTo={this.props.openTo}
        orientation={this.props.orientation}
        readOnly={this.props.readOnly}
        renderDay={this.props.renderDay}
        shouldDisableDate={this.props.shouldDisableDate}
        strictCompareDates={this.props.strictCompareDates}
        TextFieldComponent={this.props.TextFieldComponent}
        ToolbarComponent={this.props.ToolbarComponent}
        views={this.props.views}
        {...dateVariantSpecificProps}
      />
      </MuiPickersUtilsProvider>
      );
    }

    return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <DateBlurInputHOC {...(this.props as any)} value={value} onValueChange={(date?: (Date | null | undefined) | (UTC | undefined)) => onChange(date as MaterialUiPickersDate)}
      render={(props: DateFieldProps) =>
        <KeyboardDatePicker
          className={props.className}
          // classes={{root: props.classes.formControlRoot}}
          disabled={props.disabled}
          label={props.label}
          placeholder={props.placeholder}
          variant={dateVariant}
          inputVariant={props.variant}
          inputValue={props.inputValue}
          error={!props.disableErrors && !props.disabled && !!props.error}
          helperText={!props.disableErrors && <span>{(!props.disabled && props.error ? <this.renderError classes={props.classes} error={props.error} useTooltipForErrors={props.useTooltipForErrors} /> : '')}</span>}
          value={props.value}
          title={this.getTooltip(props.value)}
          autoFocus={props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={props.onBlur}
          onChange={props.onChange}
          inputRef={this.inputRef}
          inputProps={{className: props.classes.nativeInput, style: {textAlign: props.align || 'left'}, onKeyDown: this.handleInputKeyDown}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: props.classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: props.classes.inputLabelRoot, outlined: props.classes.inputLabelOutlined, shrink: props.classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classNames(props.classes.helperTextRoot, props.useTooltipForErrors ? props.classes.helperTextRootErrorIcon : undefined), contained: props.classes.helperTextContained}}}
          allowKeyboardControl={props.allowKeyboardControl}
          animateYearScrolling={props.animateYearScrolling}
          autoOk={autoOk}
          disableFuture={props.disableFuture}
          disablePast={props.disablePast}
          disableToolbar={props.disableToolbar}
          emptyLabel={emptyLabel}
          format={format}
          initialFocusedDate={props.initialFocusedDate}
          // InputAdornmentProps={{classes: {root: classes.inputAdornmentRoot}, ...props.InputAdornmentProps}}
          invalidDateMessage={props.invalidDateMessage}
          invalidLabel={props.invalidLabel}
          KeyboardButtonProps={{className: classes.inputAdornmentButton, tabIndex: -1, ...props.KeyboardButtonProps}}
          keyboardIcon={props.keyboardIcon}
          labelFunc={props.labelFunc}
          leftArrowButtonProps={props.leftArrowButtonProps}
          leftArrowIcon={props.leftArrowIcon}
          refuse={props.refuse}
          rightArrowButtonProps={props.rightArrowButtonProps}
          rightArrowIcon={props.rightArrowIcon}
          loadingIndicator={props.loadingIndicator}
          mask={props.mask}
          maskChar={props.maskChar}
          maxDate={props.maxDate}
          maxDateMessage={props.maxDateMessage}
          minDate={props.minDate}
          minDateMessage={props.minDateMessage}
          onAccept={(date: Date) => { this.onValueChange(date); props.onAccept?.(date); }}
          onClose={onClose}
          onError={props.onError}
          onMonthChange={props.onMonthChange}
          onOpen={props.onOpen}
          onYearChange={props.onYearChange}
          openTo={props.openTo}
          orientation={props.orientation}
          readOnly={props.readOnly}
          renderDay={props.renderDay}
          rifmFormatter={props.rifmFormatter}
          shouldDisableDate={props.shouldDisableDate}
          strictCompareDates={props.strictCompareDates}
          TextFieldComponent={props.TextFieldComponent}
          ToolbarComponent={props.ToolbarComponent}
          views={props.views}
          {...dateVariantSpecificProps}
        />
      }
    />
    </MuiPickersUtilsProvider>
    );
  }
}

export default withStyles(styles, DateField);
