import React from 'react';
import { withRouter } from 'react-router-dom';
import ReactGA from 'react-ga';

// Adapted from https://stackoverflow.com/a/47385875/5281021
class GoogleAnalytics extends React.Component {
  componentDidUpdate({ location, history }) {
    ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID, {
      debug: process.env.NODE_ENV === 'development',
    });

    if (location.pathname === this.props.location.pathname) {
      // don't log identical link clicks (nav links likely)
      return;
    }
    if (history.action === 'PUSH' && ReactGA) {
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }

  render() {
    return null;
  }
}

export default withRouter(GoogleAnalytics);
