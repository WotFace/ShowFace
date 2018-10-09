import React, { Component } from 'react';
import Card from '@material/react-card';
import '@material/react-card/dist/card.css';

import { Link } from 'react-router-dom';

import logo from '../logo.png';
import { auth } from '../db';

class WelcomePage extends Component {
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

    const dashboardButton = user && (
      <>
        <h1 id="header">Welcome, {this.state.user.displayName}!</h1>
        <Link to="/dashboard" className="btn btn-outline-primary btn-lg btn-block">
          Dashboard
        </Link>
      </>
    );

    const authButtons = user || (
      <>
        <Link to="/login" className="btn btn-outline-primary btn-lg btn-block">
          Log in
        </Link>
        <Link to="/signup" className="btn btn-outline-primary btn-lg btn-block">
          Sign up
        </Link>
      </>
    );

    return (
      <div>
        <div id="landing-page" className="full-page flex">
          <Card className="container WelcomePage-content">
            <img id="logo" src={logo} alt="logo" className="center" />
            <div>
              {dashboardButton}
              <Link to="/create" className="btn btn-outline-primary btn-lg btn-block">
                Create Show
              </Link>
              {authButtons}
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

export default WelcomePage;
