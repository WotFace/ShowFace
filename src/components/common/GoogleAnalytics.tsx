import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import ReactGA from 'react-ga';

type Props = {} & RouteComponentProps<{}>;

// Adapted from https://stackoverflow.com/a/47385875/5281021
class GoogleAnalytics extends React.Component<Props> {
  componentDidUpdate({ location, history }: Props) {
    const { REACT_APP_GA_TRACKING_ID } = process.env;
    if (!REACT_APP_GA_TRACKING_ID) return;

    ReactGA.initialize(REACT_APP_GA_TRACKING_ID, {
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
