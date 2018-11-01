import React from 'react';
import loadingStyles from './Loading.module.scss';

export default function NotFoundPage() {
  return (
    <section className={loadingStyles.container}>
      <h2>Oops, page not found</h2>
      <div>Are you sure you have the correct URL?</div>
    </section>
  );
}
