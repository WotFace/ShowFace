import React, { Component } from 'react';
import QuickCreate from './QuickCreate';
import { NavLink } from 'react-router-dom';
import MaterialIcon from '@material/react-material-icon';
import Button from '@material/react-button';
import classnames from 'classnames';
import Slider from 'react-slick';

import styles from './WelcomePage.module.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import slider1 from '../screen.png';
import slider2 from '../screen2.png';
import slider3 from '../screen3.png';
import slider4 from '../screen4.png';

class WelcomePage extends Component {
  render() {
    const sliderSettings = {
      arrows: false,
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
    };

    return (
      <div className={styles.background}>
        <div id={styles.halfPage}>
          <div id={styles.titleContainer}>
            <h1 id={styles.pageTitle}>Welcome to ShowFace!</h1>
            <h2 id={styles.subText}>
              We help you navigate schedules to find the best time to meet.
            </h2>
          </div>
          <QuickCreate />
        </div>
        <div className={styles.carouselContainer}>
          <Slider className={styles.slider} {...sliderSettings}>
            <div className={styles.imageContainer}>
              <img className={styles.carouselImage} src={slider1} alt="ShowFace Screenshot 1" />
            </div>
            <div className={styles.imageContainer}>
              <img className={styles.carouselImage} src={slider2} alt="ShowFace Screenshot 2" />
            </div>
            <div className={styles.imageContainer}>
              <img className={styles.carouselImage} src={slider3} alt="ShowFace Screenshot 3" />
            </div>
            <div className={styles.imageContainer}>
              <img className={styles.carouselImage} src={slider4} alt="ShowFace Screenshot 4" />
            </div>
          </Slider>
        </div>
        <div className={styles.descriptionContainer}>
          <div className={styles.descriptionItems}>
            <MaterialIcon icon="bar_chart" className={styles.descriptionIcon} />
            <h2 className={styles.descriptionItemsHeader}>Beautiful Visualizations</h2>
            <h3>
              View everyone's schedules in a timetable-style heatmap. Immediately see who is busy at
              any particular time and easily identify the timeslots with the highest availability!
            </h3>
          </div>
          <div className={styles.descriptionItems}>
            <MaterialIcon icon="dashboard" className={styles.descriptionIcon} />
            <h2 className={styles.descriptionItemsHeader}>Intuitive Interface</h2>
            <h3>
              Our drag-to-highlight feature provides you with the efficiency of painting over large
              swaths of the timetable, yet retaining the precision required to indicate single
              slots.
            </h3>
          </div>
          <div className={styles.descriptionItems}>
            <MaterialIcon icon="phonelink" className={styles.descriptionIcon} />
            <h2 className={styles.descriptionItemsHeader}>Powerful Functionality</h2>
            <h3>
              Get the best suggested meeting time, send automated reminders, share calendar invites!
              Organizing a meeting has never been easier!
            </h3>
          </div>
        </div>
        <div className={styles.readyContainer}>
          <div className={styles.readyColumnText}>
            <h2 className={styles.readyText}>Ready to start organizing?</h2>
            <h2>Create an account or start now</h2>
          </div>
          <div className={styles.readyColumnButton}>
            <NavLink className={styles.navLink} to={{ pathname: '/login' }}>
              <Button className={classnames(styles.readyButton, styles.readyButtonSignUp)} raised>
                CREATE AN ACCOUNT
              </Button>
            </NavLink>
            <NavLink className={styles.navLink} to={{ pathname: '/new' }}>
              <Button className={styles.readyButton} outlined>
                CREATE A NEW POLL
              </Button>
            </NavLink>
          </div>
        </div>
        <footer className={styles.footerContainer} />
      </div>
    );
  }
}

export default WelcomePage;
