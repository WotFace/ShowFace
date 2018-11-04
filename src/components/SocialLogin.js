import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { withAlert } from 'react-alert';
import { facebookAuthProvider, googleAuthProvider, auth } from '../firebase';
import { getAuthInput } from '../utils/auth';
import Button from '@material/react-button';

class SocialLogin extends Component {
  fragments = {
    user: gql`
      fragment LoginPage on User {
        id
        uid
        email
        name
        isPremium
        createdAt
      }
    `,
  };

  GET_USER_QUERY = gql`
    query user($auth: AuthInput!) {
      user(auth: $auth) {
        ...LoginPage
      }
    }
    ${this.fragments.user}
  `;

  CREATE_USER_MUTATION = gql`
    mutation CreateUser($name: String!, $email: String!, $auth: AuthInput!) {
      createUser(auth: $auth, data: { name: $name, email: $email }) {
        id
      }
    }
  `;

  socialAuth(provider, client) {
    var authInput = {};
    var name = '';
    var email = '';

    auth()
      .signInWithPopup(provider)
      .then(async (result) => {
        this.props.onLogInStart();
        authInput = await getAuthInput();
        const { data } = await client.query({
          query: this.GET_USER_QUERY,
          variables: { auth: authInput },
        });
        name = result.user.displayName;
        email = result.user.email;
        return data.user;
      })
      .then(async (result) => {
        if (result) {
          return;
        }
        const auth = authInput;
        const { data } = await client.mutate({
          mutation: this.CREATE_USER_MUTATION,
          variables: { name, email, auth },
        });
        return data;
      })
      .then(() => this.props.onLoggedIn())
      .catch((error) => {
        console.log('Error', error);
        this.props.onLogInError(error);
      });
  }

  render() {
    return (
      <ApolloConsumer>
        {(client) => (
          <>
            <Button onClick={() => this.socialAuth(googleAuthProvider, client)} outlined>
              Log in with Google
            </Button>
            <Button onClick={() => this.socialAuth(facebookAuthProvider, client)} outlined>
              Log in with Facebook
            </Button>
          </>
        )}
      </ApolloConsumer>
    );
  }
}

export default withAlert(SocialLogin);
