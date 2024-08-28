import React              from 'react';
import Form                    from '../models/Form';
import classNames              from 'classnames';
import {withStyles, WithStyle} from './styles';
import './flexgrid.css';

const styles = () => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export type FormViewStyles = ReturnType<typeof styles>;

export interface IFormViewProps {
  form: Form;
  className?: string;
  style?: React.CSSProperties;
  onSubmit: (form: Form) => void;
  children?: React.ReactNode;
}

export type FormViewProps = WithStyle<FormViewStyles, IFormViewProps>;

class FormView extends React.Component<IFormViewProps> {
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
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
        activeElement.focus();
      }
      this.submitForm();
    }
  };

  handleSubmit = (evt: any) => {
    evt.preventDefault();
    this.submitForm();
  };

  render() {
    const {style, className, classes, children} = (this.props as FormViewProps);
    return (
      <form autoComplete='off' className={classNames(classes.form, className)} style={style} onKeyDown={this.handleKeyDown} onSubmit={this.handleSubmit}>
        {children}
      </form>
    );
  }
}

export default withStyles(styles, FormView);
