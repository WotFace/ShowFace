import React from 'react';
import Button from '@material/react-button';
import classnames from 'classnames';

import styles from './BoomzButton.module.scss';

export default function BoomzButton({ className, ...otherProps }) {
  const finalClassName = classnames(styles.button, className);
  return <Button className={finalClassName} outlined {...otherProps} />;
}
