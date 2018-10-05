import React, { Component } from 'react';
import logo from '../logo.png';
import { withAlert } from 'react-alert';
import { auth } from '../db';
import SocialLogin from './SocialLogin';

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
    this.createUserWithEmailAndPassword = this.createUserWithEmailAndPassword.bind(this);
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
        <SocialLogin />
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