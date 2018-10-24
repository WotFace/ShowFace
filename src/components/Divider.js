import React from 'react';
import classnames from 'classnames';
import styles from './Divider.module.scss';

function DividerLine({ className, ...otherProps }) {
  return <hr className={classnames(className, styles.dividerLine)} {...otherProps} />;
}

export default function Divider({ text, ...otherProps }) {
  if (!text) return <DividerLine {...otherProps} />;
  const { className, ...otherOtherProps } = otherProps;
  return (
    <div {...otherOtherProps} className={classnames(className, styles.divider)}>
      <DividerLine />
      <span className={classnames(styles.text, 'mdc-typography--overline')}>{text}</span>
      <DividerLine />
    </div>
  );
}
