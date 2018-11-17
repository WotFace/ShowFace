import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import Button from '@material/react-button';
import gql from 'graphql-tag';
import { facebookAuthProvider, googleAuthProvider, auth } from '../../firebase';
import { getAuthInput } from '../../utils/auth';

import GoogleIcon from '../../icons/google.svg';
import FacebookIcon from '../../icons/facebook.svg';
import styles from './LoginPage.module.scss';

export default class SocialLogin extends Component {
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
            <Button
              id={styles.googleButton}
              icon={<img src={GoogleIcon} alt="Google logo" />}
              onClick={() => this.socialAuth(googleAuthProvider, client)}
            >
              Log in with Google
            </Button>
            <Button
              id={styles.facebookButton}
              icon={<img src={FacebookIcon} alt="Facebook logo" />}
              onClick={() => this.socialAuth(facebookAuthProvider, client)}
            >
              Log in with Facebook
            </Button>
          </>
        )}
      </ApolloConsumer>
    );
  }
}
