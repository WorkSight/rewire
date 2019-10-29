import * as React               from 'react';
import { Observe, observable }  from 'rewire-core';
import {
  editor,
  TextEditorProps,
  Modal,
  Dialog,
  IField,
  IModalState,
  withStyles,
}                   from 'rewire-ui';
import Popover      from '@material-ui/core/Popover';
import {Theme}      from '@material-ui/core/styles';

/***  ***/
// To get this version working, need to edit Cell.tsx onValueChange function with:
// if (this.column.type === 'multiselect') {
//   return;
// }
/***  ***/

// interface IMultiSelectAutoCompleteEditorModelState {
//   value: any;
// }

// class MultiSelectAutoCompleteEditorModel {
//   public state: IMultiSelectAutoCompleteEditorModelState;

//   constructor(private field: IField, private onValueChangeGrid: any) {
//     this.state = observable({
//       value: this.field.value,
//     });
//   }

//   get value(): any {
//     return this.state.value;
//   }

//   onValueChange = (value: any) => {
//     this.state.value = value;
//   }

//   cancel = () => {
//     this.field.grid.editCell(undefined);
//     this.field.__element.focus();
//   }

//   save = () => {
//     this.onValueChangeGrid(this.value);
//   }
// }

// const styles = (theme: Theme) => ({
//   paper: {
//     padding: '20px',
//     minWidth: '300px',
//     maxWidth: '500px',
//   },
//   formControlRoot: {
//   },
//   inputRoot: {
//   },
//   container: {
//   },
//   textFieldInputContainer: {
//   },
// });

// export function createMultiSelectAutoCompleteEditor(options: any) {
//   const Editor = withStyles(styles, (props: TextEditorProps) => {
//     const {classes, ...restProps}            = props;
//     const {paper, ...editorClasses}          = classes;
//     const {field, onValueChange}             = restProps;
//     const E                                  = editor('multiselectautocomplete', options);
//     const multiSelectAutoCompleteEditorModel = new MultiSelectAutoCompleteEditorModel(field, onValueChange);

//     function handleKeyDown(evt: React.KeyboardEvent<any>) {
//       switch (evt.key) {
//         case 'Enter':
//           multiSelectAutoCompleteEditorModel.save();
//           evt.preventDefault();
//           evt.stopPropagation();
//           break;
//         case 'Escape':
//             multiSelectAutoCompleteEditorModel.cancel();
//             evt.preventDefault();
//             evt.stopPropagation();
//         default:
//           break;
//       }
//     }

//     return (
//       <Observe render={() => (
//         <Popover
//           classes={{paper: classes.paper}}
//           open={true}
//           anchorEl={field.__element}
//           marginThreshold={5}
//           onKeyDown={handleKeyDown}
//           onBackdropClick={() => multiSelectAutoCompleteEditorModel.save()}
//         >
//           <E {...restProps} classes={{...editorClasses}} field={{...field, value: multiSelectAutoCompleteEditorModel.value}} onValueChange={multiSelectAutoCompleteEditorModel.onValueChange} />
//         </Popover>
//         )}
//       />
//     );
//   });

//   return (props: TextEditorProps) => {
//     return <Editor {...props} />;
//   };
// }

const styles = (theme: Theme) => ({
  paper: {
    padding: '16px',
    minWidth: '300px',
    maxWidth: '500px',
  },
  formControlRoot: {
  },
  inputRoot: {
  },
  container: {
  },
  textFieldInputContainer: {
  },
});

export function createMultiSelectAutoCompleteEditor(options: any) {
  const Editor = withStyles(styles, (props: TextEditorProps) => {
    const {classes, ...restProps}   = props;
    const {paper, ...editorClasses} = classes;
    const {field}                   = restProps;
    const E                         = editor('multiselectautocomplete', options);

    return (
      <Observe render={() => (
        <Popover
          classes={{paper: classes.paper}}
          open={true}
          anchorEl={field.__element}
          marginThreshold={5}
          onKeyDown={() => {}}
          onBackdropClick={() => { field.grid.editCell(undefined); field.__element.focus(); }}
        >
          <E {...restProps} classes={{...editorClasses}} />
        </Popover>
        )}
      />
    );
  });

  return (props: TextEditorProps) => {
    return <Editor {...props} />;
  };
}
