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
      nextProps.onSubmit !== this.props.onSubmit
    );
  }

  render() {
    const {style, className, classes, form, onSubmit, children} = this.props;
    return (
      <form autoComplete='off' className={classNames(classes.form, className)} style={style} onKeyDown={(evt) => evt.keyCode === 13 && form.submit() && onSubmit(form)} onSubmit={(evt) => { evt.preventDefault(); form.submit() && onSubmit(form); }}>
        {children}
      </form>
    );
  }
}

export default withStyles(styles, FormView);
