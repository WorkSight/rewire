import * as React            from 'react';
import Form                  from '../models/Form';
import decorate, {WithStyle} from './styles';

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
};

export interface IFormViewProps {
  form: Form;
  onSubmit: (form: Form) => void;
}

class FormView extends React.Component<WithStyle<typeof styles, IFormViewProps>> {
  render() {
    const {classes, form, onSubmit, children} = this.props;

    return (
      <form autoComplete='off' className={classes.form} onKeyDown={(evt) => evt.keyCode === 13 && form.submit() && onSubmit(form)} onSubmit={(evt) => { evt.preventDefault(); form.submit() && onSubmit(form); }}>
        {children}
      </form>
    );
  }
}

export default decorate(styles)<IFormViewProps>(FormView);
