import React, { Component } from 'react';
import logo from '../logo.png';
import { withAlert } from 'react-alert';
import { auth } from '../firebase';
import SocialLogin from './SocialLogin';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { getAuthInput } from '../utils/auth';

class SignupPage extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
    this.createUserWithEmailAndPassword = this.createUserWithEmailAndPassword.bind(this);
  }

  createUserWithEmailAndPassword(event) {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    const name = this.nameInput.value;
    event.preventDefault();
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.props.createUser(name, email);
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
                  name="name"
                  type="name"
                  ref={(input) => {
                    this.nameInput = input;
                  }}
                  placeholder="Name"
                />
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

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($name: String!, $email: String!, $auth: AuthInput!) {
    createUser(auth: $auth, data: { name: $name, email: $email }) {
      id
    }
  }
`;

export default withAlert((props) => (
  <Mutation mutation={CREATE_USER_MUTATION}>
    {(createUser, result) => (
      <SignupPage
        {...props}
        createUser={async (name, email) => {
          const auth = await getAuthInput();
          createUser({ variables: { name, email, auth } });
        }}
        createUserResult={result}
      />
    )}
  </Mutation>
));
