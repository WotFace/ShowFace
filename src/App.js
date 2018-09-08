import React from 'react';
import logo from './logo.svg';
import './App.css';
import Routes from './Routes.js';

import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router } from 'react-router-dom';

const App = () => (
  <Router>
    <Routes />
  </Router>
);

export default App;
