import React, { Component } from 'react';
import { MDCTextField } from '@material/textfield';
import classnames from 'classnames';

import styles from './NoLabelTextField.module.scss';

// Custom material text field without a label
export default class NoLabelTextField extends Component {
  textFieldRef = React.createRef();

  componentDidMount() {
    new MDCTextField(this.textFieldRef.current);
  }

  render() {
    const { className, inputClassName, ...otherProps } = this.props;
    return (
      <div
        className={classnames(className, styles.textField, 'mdc-text-field')}
        ref={this.textFieldRef}
      >
        <input
          type="text"
          className={classnames(inputClassName, styles.input, 'mdc-text-field__input')}
          {...otherProps}
        />
        <div className="mdc-line-ripple" />
      </div>
    );
  }
}
