import React from 'react';
import ReactLoading from 'react-loading';
import styles from './ErrorsLoaders.module.scss';

interface Props {
  text?: string;
}

const Loading: React.FunctionComponent<Props> = ({ text }) => {
  return (
    <section className={styles.container}>
      <h2>{text || 'Loading'}</h2>
      <ReactLoading type="bubbles" color="#111" />
    </section>
  );
};

export default Loading;