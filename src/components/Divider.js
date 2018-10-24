import React from 'react';
import classnames from 'classnames';
import styles from './Divider.module.scss';

export default function Divider({ className, ...otherProps }) {
  return <hr className={classnames(className, styles.divider)} {...otherProps} />;
}
