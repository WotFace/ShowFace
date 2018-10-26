import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material/react-button';
import { isSignedIn } from '../utils/auth';

import sharedStyles from './SharedStyles.module.scss';
import styles from './AppBar.module.scss';
import logo from '../logo.png';

export default class AppBar extends Component {
  render() {
    // TODO: Change buttons on login/signup/dashboard pages
    // TODO: Consider putting AppBar in every page instead, and allow pages to provide buttons
    // TODO: Implement collapsed button menu
    const buttons = isSignedIn() ? (
      <>
        <Link to={`/dashboard`} className={sharedStyles.buttonLink}>
          <Button>Dashboard</Button>
        </Link>
      </>
    ) : (
      <>
        <Link to={`/login`} className={sharedStyles.buttonLink}>
          <Button>Log In</Button>
        </Link>
        <Link to={`/signup`} className={sharedStyles.buttonLink}>
          <Button>Sign Up</Button>
        </Link>
      </>
    );

    return (
      <div className={styles.container}>
        <img className={styles.contentLogo} alt="ShowFace Logo" src={logo} />
        <div className={styles.buttonContainer}>{buttons}</div>
      </div>
    );
  }
}
