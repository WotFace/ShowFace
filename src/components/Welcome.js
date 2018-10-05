import React from 'react';

import { Link } from 'react-router-dom';

import logo from '../logo.png';

const Welcome = () => (
  <div id="landing-page" className="full-page flex">
    <div className="container Welcome-content">
      <img id="logo" src={logo} alt="logo" className="center" />
      <Link to="/login" className="btn btn-outline-primary btn-lg btn-block">
        Log in
      </Link>
      <Link to="/signup" className="btn btn-outline-primary btn-lg btn-block">
        Sign up
      </Link>
      <Link to="/create" className="btn btn-outline-primary btn-lg btn-block">
        Create New Poll
      </Link>
    </div>
  </div>
);

export default Welcome;
