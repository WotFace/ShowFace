import React, { Component } from 'react';
import logo from '../logo.png';
import { Link } from 'react-router-dom';
import { db, auth } from '../db';
import { withAlert } from 'react-alert';

class Dashboard extends Component {
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

    const header = user ? (
      <div>
        <h1 id="header">Welcome, {this.state.user.displayName}!</h1>
        <Link to="/create" className="btn btn-outline-primary btn-lg btn-block">
          Create New Poll
        </Link>
      </div>
    ) : (
      // TODO: redirect to welcome page
      <div />
    );

    return (
      <div className="container">
        <section id="form-header">
          <img className="content-logo" alt="" src={logo} />
          {header}
        </section>
        <section id="form" className="row">
          <div className="col" />
        </section>
      </div>
    );
  }
}

export default withAlert(Dashboard);
