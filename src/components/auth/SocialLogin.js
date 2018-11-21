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
      fragment LoginPageUser on User {
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
        ...LoginPageUser
      }
    }
    ${this.fragments.user}
  `;

  CREATE_USER_MUTATION = gql`
    mutation CreateUser($name: String!, $email: String!, $auth: AuthInput!) {
      createUser(auth: $auth, data: { name: $name, email: $email }) {
        ...LoginPageUser
      }
    }
    ${this.fragments.user}
  `;

  EDIT_USER_MUTATION = gql`
    mutation EditUser($name: String!, $auth: AuthInput!) {
      editUserSettings(auth: $auth, data: { name: $name }) {
        ...LoginPageUser
      }
    }
    ${this.fragments.user}
  `;

  async logIn(provider, client) {
    this.props.onLogInStart();
    try {
      const authResult = await auth().signInWithPopup(provider);

      // Get existing user info
      const authInput = await getAuthInput();
      const { data: existingData } = await client.query({
        query: this.GET_USER_QUERY,
        variables: { auth: authInput },
      });

      // Signup or edit existing user as necessary.
      const existingUser = existingData.user;
      const name = authResult.user.displayName;
      const email = authResult.user.email;

      if (!existingUser) {
        // New users have no user record with us
        await client.mutate({
          mutation: this.CREATE_USER_MUTATION,
          variables: { name, email, auth: authInput },
        });
      } else if (!existingUser.name) {
        // Invited users have null names
        await client.mutate({
          mutation: this.EDIT_USER_MUTATION,
          variables: { name, auth: authInput },
        });
      }

      this.props.onLoggedIn();
    } catch (error) {
      console.log('Social auth error', error);
      this.props.onLogInError(error);
    }
  }

  render() {
    return (
      <ApolloConsumer>
        {(client) => (
          <>
            <Button
              id={styles.googleButton}
              icon={<img src={GoogleIcon} alt="Google logo" />}
              onClick={() => this.logIn(googleAuthProvider, client)}
            >
              Log in with Google
            </Button>
            <Button
              id={styles.facebookButton}
              icon={<img src={FacebookIcon} alt="Facebook logo" />}
              onClick={() => this.logIn(facebookAuthProvider, client)}
            >
              Log in with Facebook
            </Button>
          </>
        )}
      </ApolloConsumer>
    );
  }
}
