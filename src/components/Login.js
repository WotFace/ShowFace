import React, { Component } from 'react';
import logo from '../logo.png';
import { withAlert } from 'react-alert';
import { db, provider, auth } from '../db';
const loginStyles = {
  width: '90%',
  maxWidth: '315px',
  margin: '20px auto',
  border: '1px solid #ddd',
  borderRadius: '5px',
  padding: '10px',
};

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
    this.authWithFacebook = this.authWithFacebook.bind(this);
    this.authWithEmailPassword = this.authWithEmailPassword.bind(this);
  }

  authWithFacebook() {
    auth()
      .signInWithPopup(provider)
      .then((result) => {
        console.log('Credentials', result);
        this.setState({ user: result });
      })
      .catch((error) => {
        console.log('Error', error);
      });
    console.log('Authenticating with Zuckerberg', this.state.user);
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
      <div style={loginStyles}>
        <button
          style={{ width: '100%' }}
          className="pt-button pt-intent-primary"
          onClick={() => this.authWithFacebook()}
        >
          Log in with Facebook
        </button>
        <hr style={{ marginTop: '10px', marginBottom: '10px' }} />
        <div
          ref={(form) => {
            this.loginForm = form;
          }}
        >
          <label className="pt-label">
            Email
            <input
              style={{ width: '100%' }}
              className="pt-input"
              name="email"
              type="email"
              ref={(input) => {
                this.emailInput = input;
              }}
              placeholder="Email"
            />
          </label>
          <label className="pt-label">
            Password
            <input
              style={{ width: '100%' }}
              className="pt-input"
              name="password"
              type="password"
              ref={(input) => {
                this.passwordInput = input;
              }}
              placeholder="Password"
            />
          </label>
          <button
            style={{ width: '100%' }}
            className="pt-button pt-intent-primary"
            value="Log in"
            onClick={(event) => {
              this.authWithEmailPassword(event);
            }}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }
}

export default withAlert(Login);
