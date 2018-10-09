import React, { Component } from 'react';
import logo from '../logo.png';
import { withAlert } from 'react-alert';
import { auth } from '../db';
import SocialLogin from './SocialLogin';

// TODO: Restyle page with Material
import 'bootstrap/dist/css/bootstrap.min.css';

const loginStyles = {
  width: '90%',
  maxWidth: '315px',
  margin: '20px auto',
  border: '1px solid #ddd',
  borderRadius: '5px',
  padding: '10px',
};

class SignupPage extends Component {
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
      <div className="container Welcome-content">
        <section id="form-header">
          <img className="content-logo" alt="" src={logo} />
          <h1 id="header">Sign up</h1>
        </section>
        <section id="form" className="row">
          <div className="col">
            <div>
              <SocialLogin />
              <div
                ref={(form) => {
                  this.signupForm = form;
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
                  value="Sign up"
                  onClick={(event) => {
                    this.createUserWithEmailAndPassword(event);
                  }}
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default withAlert(SignupPage);
