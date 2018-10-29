import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { ApolloProvider } from 'react-apollo';
import { auth } from './firebase';
import Routes from './Routes.js';
import apolloClient from './apolloClient';
import store from './store';

import ReactGA from 'react-ga';

import './App.scss';

ReactGA.initialize(process.env.REACT_GA_TRACKING_ID);
ReactGA.pageview('/');

const alertOptions = {
  timeout: 2000,
  position: 'bottom center',
};

export default class App extends Component {
  componentDidMount() {
    auth().onAuthStateChanged(() => this.forceUpdate());
  }

  render() {
    return (
      <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Provider store={store}>
          <ApolloProvider client={apolloClient}>
            <Router>
              <Routes />
            </Router>
          </ApolloProvider>
        </Provider>
      </AlertProvider>
    );
  }
}
