import React    from 'react';
import Form     from '../models/Form';
import decorate from './styles';

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column'
  }
};

type FormProps = {form: Form, onSubmit: (form: Form) => void};

export default decorate(styles)<FormProps>(({form, classes, children, onSubmit}) => (
  <form autoComplete='off' className={classes.form} onKeyDown={(evt) => evt.keyCode === 13 && form.submit() && onSubmit(form)} onSubmit={(evt) => { evt.preventDefault(); form.submit() && onSubmit(form); }}>
    {children}
  </form>
));
