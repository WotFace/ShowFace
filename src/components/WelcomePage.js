import React, { Component } from 'react';
import QuickCreate from './QuickCreate';
import Card from '@material/react-card';
import { NavLink } from 'react-router-dom';
import MaterialIcon from '@material/react-material-icon';
import Button from '@material/react-button';
import classnames from 'classnames';

import styles from './WelcomePage.module.scss';

class WelcomePage extends Component {
  render() {
    return (
      <div className={styles.background}>
        <div id={styles.halfPage}>
          <div id={styles.titleContainer}>
            <h1 id={styles.pageTitle}>Welcome to ShowFace!</h1>
            <h2 id={styles.subText}>We help you navigate schedules to find the best time to meet.</h2>
          </div>
          <QuickCreate />
        </div>
        <div className={styles.carouselContainer}>
          <Card className={styles.carouselCard} />
        </div>
        <div className={styles.descriptionContainer}>
          <div className={styles.descriptionItems}>
            <MaterialIcon icon="bar_chart" className={styles.descriptionIcon} />
            <h2 className={styles.descriptionItemsHeader}>Beautiful Visualizations</h2>
            <h2>View everyone's schedules in a timetable-style heatmap. Immediately see who is busy at any particular time and easily identify the timeslots with the highest availability!</h2>
          </div>
          <div className={styles.descriptionItems}>
            <MaterialIcon icon="dashboard" className={styles.descriptionIcon} />
            <h2 className={styles.descriptionItemsHeader}>Intuitive Interface</h2>
            <h2>Our drag-to-highlight feature provides you with the efficiency of painting over large swaths of the timetable, yet retaining the precision required to indicate single slots.</h2>
          </div>
          <div className={styles.descriptionItems}>
            <MaterialIcon icon="phonelink" className={styles.descriptionIcon} />
            <h2 className={styles.descriptionItemsHeader}>Powerful Functionality</h2>
            <h2>Get the best suggested meeting time, send automated reminders, share calendar invites! Organizing a meeting has never been easier!</h2>
          </div>
        </div>
        <div className={styles.readyContainer}>
          <div className={styles.readyColumnText}>
            <h2 className={styles.readyText}>Ready to start organizing?</h2>
            <h2>Create an account or start now</h2>
          </div>
          <div className={styles.readyColumnButton}>
            <NavLink className={styles.navLink} to={{ pathname: '/login' }}>
              <Button className={classnames(styles.readyButton, styles.readyButtonSignUp)} raised>CREATE AN ACCOUNT</Button>
            </NavLink>
            <NavLink className={styles.navLink} to={{ pathname: '/new' }}>
              <Button className={styles.readyButton} outlined>CREATE A NEW POLL</Button>
            </NavLink>
          </div>
        </div>
        <footer className={styles.footerContainer}>
        </footer>
      </div>
    );
  }
}

export default WelcomePage;
