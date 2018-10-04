import React, { Component } from 'react';
import logo from '../logo.png';
import { withAlert } from 'react-alert';
import { db, facebookAuthProvider, googleAuthProvider, auth } from '../db';
const loginStyles = {
  width: '90%',
  maxWidth: '315px',
  margin: '20px auto',
  border: '1px solid #ddd',
  borderRadius: '5px',
  padding: '10px',
};

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
    this.socialAuth = this.socialAuth.bind(this);
    this.createUserWithEmailAndPassword = this.createUserWithEmailAndPassword.bind(this);
  }

  socialAuth(provider) {
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

  createUserWithEmailAndPassword(event) {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    event.preventDefault();
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        console.log('Credentials', result);
        this.setState({ user: result });
      })
      .catch((error) => {
        console.log('Error', error);
      });
    console.log('Creating user in Firebase');
    console.table([
      {
        email: email,
        password: password,
      },
    ]);
  }

  render() {
    return (
      <div style={loginStyles}>
        <button
          style={{ width: '100%' }}
          className="pt-button pt-intent-primary"
          onClick={() => this.socialAuth(googleAuthProvider)}
        >
          Log in with Google
        </button>
        <hr style={{ marginTop: '10px', marginBottom: '10px' }} />
        <button
          style={{ width: '100%' }}
          className="pt-button pt-intent-primary"
          onClick={() => this.socialAuth(facebookAuthProvider)}
        >
          Log in with Facebook
        </button>
        <hr style={{ marginTop: '10px', marginBottom: '10px' }} />
        <div
          ref={(form) => {
            this.signupForm = form;
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
              this.createUserWithEmailAndPassword(event);
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }
}

export default withAlert(Signup);
