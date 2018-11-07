import React, { Component } from 'react';
import { auth } from '../firebase';
import { getAuthInput } from '../utils/auth';
import { Redirect, Route } from 'react-router-dom';

// Wrapper around Routes components which require authentication, such as
// DashboardPage. Automatically redirects to Login if user is not authenticated.
// Pass in to Login component a path to redirect back on successful auth.
export default class PrivateRoute extends Component {
  state = {
    auth: null,
    authRefreshed: false,
  };

  refreshAuthInfo() {
    getAuthInput().then((auth) => {
      if (auth) {
        this.setState({ auth, authRefreshed: true });
      } else {
        this.setState({ auth });
      }
    });
  }

  componentDidMount() {
    this.refreshAuthInfo();
    // Necessary because if this page is loaded directly, getAuthInput will
    // give you a null auth object.
    auth().onAuthStateChanged(() => this.refreshAuthInfo());
  }

  componentWillUnmount() {
    this.setState({ authRefreshed: false });
  }

  render() {
    const { component: Component, ...rest } = this.props;
    const { auth, authRefreshed } = this.state;
    console.log(auth, authRefreshed);

    // Redirect to /login when unauthorized
    // Render component if authorized
    // Render null if authentication is ongoing
    return (
      <Route
        {...rest}
        render={(props) => {
          if (!auth && authRefreshed) {
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
          } else if (auth) {
            return <Component {...props} />;
          }
          return null;
        }}
      />
    );
  }
}
