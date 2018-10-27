import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { withAlert } from 'react-alert';
import { facebookAuthProvider, googleAuthProvider, auth } from '../firebase';
import { getAuthInput } from '../utils/auth';

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
    auth()
      .signInWithPopup(provider)
      .then(async (result) => {
        const auth = await getAuthInput();
        const { data } = await client.query({
          query: GET_USER_QUERY,
          variables: { auth: auth },
        });
        console.log(data.user);
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
            <button
              style={{ width: '100%', marginBottom: '10px' }}
              className="btn btn-outline-primary btn-lg btn-block"
              onClick={() => this.socialAuth(googleAuthProvider, client)}
            >
              Log in with Google
            </button>
            <button
              style={{ width: '100%' }}
              className="btn btn-outline-primary btn-lg btn-block"
              onClick={() => this.socialAuth(facebookAuthProvider, client)}
            >
              Log in with Facebook
            </button>
            <hr style={{ marginTop: '10px', marginBottom: '10px' }} />
          </div>
        )}
      </ApolloConsumer>
    );
  }
}

export default withAlert(SocialLogin);
