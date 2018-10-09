import React from 'react';
import Routes from './Routes.js';

import './App.scss';

import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import { BrowserRouter as Router } from 'react-router-dom';

const alertOptions = {
  timeout: 2000,
  position: 'bottom center',
};

const App = () => (
  <AlertProvider template={AlertTemplate} {...alertOptions}>
    <Router>
      <Routes />
    </Router>
  </AlertProvider>
);

export default App;
