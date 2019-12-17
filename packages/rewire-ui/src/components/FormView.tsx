import * as React              from 'react';
import Form                    from '../models/Form';
import classNames              from 'classnames';
import {withStyles, WithStyle} from './styles';

const styles = () => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export interface IFormViewProps {
  form: Form;
  className?: string;
  style?: React.CSSProperties;
  onSubmit: (form: Form) => void;
}

type FormViewProps = WithStyle<ReturnType<typeof styles>, IFormViewProps>;

class FormView extends React.Component<FormViewProps> {
  shouldComponentUpdate(nextProps: FormViewProps) {
    return (
      nextProps.form !== this.props.form ||
      (!!nextProps.children && !this.props.children) ||
      (!nextProps.children && !!this.props.children) ||
      (nextProps.children && this.props.children && React.Children.count(nextProps.children) !== React.Children.count(this.props.children)) ||
      nextProps.onSubmit !== this.props.onSubmit
    );
  }

  submitForm() {
    const {form, onSubmit} = this.props;
    onSubmit(form);
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    if (evt.keyCode === 13) {
      evt.preventDefault();
      let activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
        activeElement.focus();
      }
      this.submitForm();
    }
  }

  handleSubmit = (evt: any) => {
    evt.preventDefault();
    this.submitForm();
  }

  render() {
    const {style, className, classes, children} = this.props;
    return (
      <form autoComplete='off' className={classNames(classes.form, className)} style={style} onKeyDown={this.handleKeyDown} onSubmit={this.handleSubmit}>
        {children}
      </form>
    );
  }
}

export default withStyles(styles, FormView);
