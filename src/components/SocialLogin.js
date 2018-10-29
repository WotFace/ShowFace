import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { withAlert } from 'react-alert';
import { facebookAuthProvider, googleAuthProvider, auth } from '../firebase';
import { getAuthInput } from '../utils/auth';
import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import styles from './ShowPage.module.scss';

class SocialLogin extends Component {
  constructor(props) {
    super(props);
    this.socialAuth = this.socialAuth.bind(this);
  }

  socialAuth(provider, client) {
    const fragments = {
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

    const GET_USER_QUERY = gql`
      query user($auth: AuthInput!) {
        user(auth: $auth) {
          ...LoginPage
        }
      }
      ${fragments.user}
    `;

    const CREATE_USER_MUTATION = gql`
      mutation CreateUser($name: String!, $email: String!, $auth: AuthInput!) {
        createUser(auth: $auth, data: { name: $name, email: $email }) {
          id
        }
      }
    `;

    var authInput = {};
    var name = '';
    var email = '';

    auth()
      .signInWithPopup(provider)
      .then(async (result) => {
        authInput = await getAuthInput();
        const { data } = await client.query({
          query: GET_USER_QUERY,
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
          mutation: CREATE_USER_MUTATION,
          variables: { name, email, auth },
        });
        return data;
      })
      .catch((error) => {
        console.log('Error', error);
      });
  }

  render() {
    return (
      <ApolloConsumer>
        {(client) => (
          <div>
            <Button
              className={styles.submitButton}
              value="Log in"
              onClick={() => this.socialAuth(googleAuthProvider, client)}
              icon={<MaterialIcon icon="send" />}
              raised
            >
              Log in with Google
            </Button>
            <Button
              className={styles.submitButton}
              value="Log in"
              onClick={() => this.socialAuth(facebookAuthProvider, client)}
              icon={<MaterialIcon icon="send" />}
              raised
            >
              Log in with Facebook
            </Button>
          </div>
        )}
      </ApolloConsumer>
    );
  }
}

export default withAlert(SocialLogin);
