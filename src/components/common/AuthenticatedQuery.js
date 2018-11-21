import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { auth } from '../../firebase';
import { getAuthInput } from '../../utils/auth';
import { Redirect } from 'react-router-dom';

// Wrapper around the Query component that automatically injects an auth
// variable if it is present. If requiresAuth is true, the component will also
// not render anything if the user is logged out.
export default class AuthenticatedQuery extends Component {
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
    const { variables, requiresAuth } = this.props;
    const { auth, authRefreshed } = this.state;

    // Render null if we require authentication
    // TODO: Render something if not authenticated instead of just putting a
    // blank screen. Maybe have a default blank component or take in a prop for
    // this.
    if (requiresAuth && !auth) {
      if (authRefreshed === true) {
        return <Redirect to="/login" />;
      }
      return null;
    }

    const mergedVars = { auth, ...variables };
    return <Query {...this.props} variables={mergedVars} />;
  }
}
