import React, { Component } from 'react';
import QuickCreate from './QuickCreate';
import styles from './WelcomePage.module.scss';

class WelcomePage extends Component {
  render() {
    return (
      <div id={styles.halfPage}>
        <div id={styles.titleContainer}>
          <h1 id={styles.pageTitle}>Welcome to ShowFace!</h1>
          <h2 id={styles.subText}>We help you navigate schedules to find the best time to meet.</h2>
        </div>
        <QuickCreate />
      </div>
    );
  }
}

export default WelcomePage;
