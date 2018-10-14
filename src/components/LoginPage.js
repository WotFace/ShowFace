import React, { Component } from 'react';
import logo from '../logo.png';
import { withAlert } from 'react-alert';
import { auth } from '../firebase';
import SocialLogin from './SocialLogin';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
    this.authWithEmailPassword = this.authWithEmailPassword.bind(this);
  }

  authWithEmailPassword(event) {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    event.preventDefault();
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        console.log('Credentials', result);
        this.setState({ user: result });
      })
      .catch((error) => {
        console.log('Error', error);
      });
    console.log('Authenticating with Firebase');
    console.table([
      {
        email: this.emailInput.value,
        password: this.passwordInput.value,
      },
    ]);
  }

  render() {
    return (
      <div className="container Welcome-content">
        <section id="form-header">
          <img className="content-logo" alt="" src={logo} />
          <h1 id="header">Log in</h1>
        </section>
        <section id="form" className="row">
          <div className="col">
            <div>
              <SocialLogin />
              <div
                ref={(form) => {
                  this.loginForm = form;
                }}
              >
                <input
                  style={{ width: '100%', margin: '10px auto' }}
                  className="form-control"
                  name="email"
                  type="email"
                  ref={(input) => {
                    this.emailInput = input;
                  }}
                  placeholder="Email"
                />
                <input
                  style={{ width: '100%', margin: '10px auto' }}
                  className="form-control"
                  name="password"
                  type="password"
                  ref={(input) => {
                    this.passwordInput = input;
                  }}
                  placeholder="Password"
                />
                <button
                  style={{ width: '100%' }}
                  className="btn btn-outline-primary btn-lg btn-block"
                  value="Log in"
                  onClick={(event) => {
                    this.authWithEmailPassword(event);
                  }}
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default withAlert(LoginPage);
