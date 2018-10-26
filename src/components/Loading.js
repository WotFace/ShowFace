import React from 'react';
import ReactLoading from 'react-loading';
import styles from './Loading.module.scss';

export default function Loading({ text }) {
  return (
    <section className={styles.container}>
      <h2>{text || 'Loading'}</h2>
      <ReactLoading type="bubbles" color="#111" />
    </section>
  );
}
