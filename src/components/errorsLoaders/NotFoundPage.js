import React from 'react';
import styles from './ErrorsLoaders.module.scss';

export default function NotFoundPage() {
  return (
    <section className={styles.container}>
      <h2>Oops, page not found</h2>
      <div>Are you sure you have the correct URL?</div>
    </section>
  );
}
