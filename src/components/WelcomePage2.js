import React, { Component } from 'react';
import Card from '@material/react-card';
import Button from '@material/react-button';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { getFirebaseUserInfo } from '../utils/auth';

import styles from './WelcomePage2.module.scss';
import logo from '../logo.png';

function Divider() {
  return <hr className={styles.divider} />;
}

class WelcomePage extends Component {
  render() {
    const user = getFirebaseUserInfo();

    const dashboardButton = user && (
      <>
        <h1 id="header">Welcome, {user.displayName}!</h1>
        <Link to="/dashboard">
          <Button raised>Dashboard</Button>
        </Link>
      </>
    );

    const authButtons = user || (
      <div className={styles.authButtons}>
        <Link to="/login">
          <Button>Log in</Button>
        </Link>
        <Link to="/signup">
          <Button raised>Sign up</Button>
        </Link>
      </div>
    );

    return (
      <div className={classnames(styles.landingPage, 'full-page flex')}>
        <Card className={classnames(styles.content, 'container')}>
          <img src={logo} alt="logo" className={styles.logo} />
          <div>
            {dashboardButton}
            <Link to="/new">
              <Button outlined className={styles.createButton}>
                Create Show
              </Button>
            </Link>
            <Divider />
            {authButtons}
          </div>
        </Card>
      </div>
    );
  }
}

export default WelcomePage;
