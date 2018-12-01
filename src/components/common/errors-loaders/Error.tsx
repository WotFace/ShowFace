import React from 'react';
import styles from './ErrorsLoaders.module.scss';

interface Props {
  title: string;
  message: string;
}

const Error: React.FunctionComponent<Props> = ({ title, message }) => {
  return (
    <section className={styles.container}>
      <h2>{title}</h2>
      <div>{message}</div>
    </section>
  );
};

export default Error;
