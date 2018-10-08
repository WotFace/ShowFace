import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import logo from '../logo.png';
import { auth } from '../db';

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
    };
  }

  componentDidMount() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user });
      }
    });
  }

  render() {
    const user = this.state.user;

    // TODO: Redirect to user's page if logged in
    const splashScreenButtons = user ? (
      <div>
        <h1 id="header">Welcome, {this.state.user.displayName}!</h1>
        <Link to="/create" className="btn btn-outline-primary btn-lg btn-block">
          Create New Poll
        </Link>
      </div>
    ) : (
      <div>
        <Link to="/login" className="btn btn-outline-primary btn-lg btn-block">
          Log in
        </Link>
        <Link to="/signup" className="btn btn-outline-primary btn-lg btn-block">
          Sign up
        </Link>
      </div>
    );
    return (
      <div>
        <div id="landing-page" className="full-page flex">
          <div className="container Welcome-content">
            <img id="logo" src={logo} alt="logo" className="center" />
            {splashScreenButtons}
          </div>
        </div>
      </div>
    );
  }
}

export default Welcome;
