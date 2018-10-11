import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { ApolloProvider } from 'react-apollo';
import Routes from './Routes.js';
import apolloClient from './apolloClient';

import './App.scss';

const alertOptions = {
  timeout: 2000,
  position: 'bottom center',
};

const App = () => (
  <AlertProvider template={AlertTemplate} {...alertOptions}>
    <ApolloProvider client={apolloClient}>
      <Router>
        <Routes />
      </Router>
    </ApolloProvider>
  </AlertProvider>
);

export default App;
