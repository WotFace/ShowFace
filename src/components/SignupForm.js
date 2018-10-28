import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { auth } from '../firebase';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { getAuthInput } from '../utils/auth';

class SignupForm extends Component {
  constructor(props) {
    super(props);
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
      })
      .catch((error) => {
        console.log('Error', error);
      });
  }

  render() {
    return (
      <div className="container Welcome-content">
        <section id="form" className="row">
          <div className="col">
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
              <input
                style={{ width: '100%', margin: '10px auto' }}
                className="form-control"
                name="name"
                type="name"
                ref={(input) => {
                  this.nameInput = input;
                }}
                placeholder="Display Name"
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
      <SignupForm
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
