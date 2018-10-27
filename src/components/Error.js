import React from 'react';
import loadingStyles from './Loading.module.scss';

export default function Error({ title, message }) {
  return (
    <section className={loadingStyles.container}>
      <h2>{title}</h2>
      <div>{message}</div>
    </section>
  );
}
