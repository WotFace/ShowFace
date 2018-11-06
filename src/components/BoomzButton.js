// Something... you know? Boomz! Something that shouts... ME!
// https://www.youtube.com/watch?v=5F74FZfdSJY

import React from 'react';
import Button from '@material/react-button';
import IconButton from '@material/react-icon-button';
import classnames from 'classnames';

import styles from './BoomzButton.module.scss';

function BoomzComponent({ component: Component, className, boomzClassName, ...otherProps }) {
  const finalClassName = classnames(boomzClassName, className);
  return <Component className={finalClassName} {...otherProps} />;
}

export function BoomzButton(props) {
  return <BoomzComponent component={Button} boomzClassName={styles.button} outlined {...props} />;
}

export function BoomzMenuItem(props) {
  const li = (liProps) => <li {...liProps} />;
  return (
    <BoomzComponent
      component={li}
      boomzClassName={classnames('mdc-list-item', styles.menuItem)}
      role="menuitem"
      {...props}
    />
  );
}

export function BoomzIconButton(props) {
  return <BoomzComponent component={IconButton} boomzClassName={styles.iconButton} {...props} />;
}
