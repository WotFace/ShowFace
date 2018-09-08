import React from 'react';

import { Link } from 'react-router-dom';

import logo from '../logo.png';

const Welcome = () => (
  <div id="full-page" class="flex">
    <img id="logo" src={logo} alt="logo" class="center" />
    <Link to="/create" class="btn btn-outline-primary btn-lg btn-long">
      Create New Poll
    </Link>
  </div>
);

export default Welcome;
