import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { facebookAuthProvider, googleAuthProvider, auth } from '../db';

class SocialLogin extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
    this.socialAuth = this.socialAuth.bind(this);
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

  render() {
    return (
      <div>
        <button
          style={{ width: '100%', marginBottom: '10px' }}
          className="pt-button pt-intent-primary"
          onClick={() => this.socialAuth(googleAuthProvider)}
        >
          Log in with Google
        </button>
        <button
          style={{ width: '100%' }}
          className="pt-button pt-intent-primary"
          onClick={() => this.socialAuth(facebookAuthProvider)}
        >
          Log in with Facebook
        </button>
        <hr style={{ marginTop: '10px', marginBottom: '10px' }} />
      </div>
    );
  }
}

export default withAlert(SocialLogin);
