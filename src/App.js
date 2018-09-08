import React from 'react';
import Routes from './Routes.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { BrowserRouter as Router } from 'react-router-dom';

const App = () => (
  <Router>
    <Routes />
  </Router>
);

export default App;
