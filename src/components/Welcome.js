import React from 'react';

import { Link } from 'react-router-dom';

import logo from '../logo.png';

const Welcome = () => (
  <div className="full-page flex">
    <img id="logo" src={logo} alt="logo" className="center" />
    <Link to="/create" className="btn btn-outline-primary btn-lg btn-long">
      Create New Poll
    </Link>
  </div>
);

export default Welcome;
