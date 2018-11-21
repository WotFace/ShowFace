import React, { Component } from 'react';
import { MDCDialog } from '@material/dialog';
import Button from '@material/react-button';
import classnames from 'classnames';

export function DialogButton({ className, autoclose, ...otherProps }) {
  const combinedClassNames = classnames(className, 'mdc-dialog__button');
  if (autoclose) otherProps['data-mdc-dialog-action'] = 'none';
  return <Button type="button" className={combinedClassNames} {...otherProps} />;
}

export class ConfirmationDialog extends Component {
  dialogRef = React.createRef();

  componentDidMount() {
    this.dialog = new MDCDialog(this.dialogRef.current);
    this.dialog.listen('MDCDialog:closed', this.handleDialogClose);
    if (this.props.isOpen) {
      this.dialog.open();
    }
  }

  handleDialogClose = () => this.props.onDialogClose && this.props.onDialogClose();

  componentDidUpdate(prevProps) {
    const { dialog, props } = this;
    if (props.isOpen && !prevProps.isOpen && !dialog.isOpen) {
      dialog.open();
    } else if (!props.isOpen && prevProps.isOpen && dialog.isOpen) {
      dialog.close();
    }
  }

  render() {
    const { title, body, children } = this.props;
    return (
      <div
        className="mdc-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title}
        aria-describedby={body}
        ref={this.dialogRef}
      >
        <div className="mdc-dialog__container">
          <div className="mdc-dialog__surface">
            <h2 className="mdc-dialog__title">{title}</h2>
            <div className="mdc-dialog__content">{body}</div>
            <footer className="mdc-dialog__actions">{children}</footer>
          </div>
        </div>
        <div className="mdc-dialog__scrim" />
      </div>
    );
  }
}
