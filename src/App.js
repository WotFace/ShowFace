import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { ApolloProvider } from 'react-apollo';
import { auth } from './firebase';
import Routes from './Routes.js';
import apolloClient from './apolloClient';

import './App.scss';

const alertOptions = {
  timeout: 2000,
  position: 'bottom center',
};

export default class App extends Component {
  componentDidMount() {
    auth().onAuthStateChanged(() => this.forceUpdate());
  }

  render() {
    const { store } = this.props;
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
