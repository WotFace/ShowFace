import React from 'react';
import styles from './ErrorsLoaders.module.scss';

export default function Error({ title, message }) {
  return (
    <section className={styles.container}>
      <h2>{title}</h2>
      <div>{message}</div>
    </section>
  );
}
