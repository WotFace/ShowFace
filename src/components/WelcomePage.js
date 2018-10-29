import React, { Component } from 'react';
import QuickCreate from './QuickCreate';
import styles from './WelcomePage.module.scss';

class WelcomePage extends Component {
  render() {
    return (
      <div id={styles.halfPage}>
        <div id={styles.titleContainer}>
          <h1 id={styles.pageTitle}> Get together with ShowFace</h1>
          <h2 id={styles.subText}>The simple way to decide on dates, places &amp; more.</h2>
        </div>
        <QuickCreate />
      </div>
    );
  }
}

export default WelcomePage;
