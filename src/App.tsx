import React, { Component } from 'react';
import { AnyAction, Store } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import { auth } from './firebase';
import Routes from './Routes';
import apolloClient from './apolloClient';

import './App.scss';

interface Props {
  store: Store<any, AnyAction>;
}

export default class App extends Component<Props> {
  componentDidMount() {
    auth().onAuthStateChanged(() => this.forceUpdate());
  }

  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <ApolloProvider client={apolloClient}>
          <Router>
            <Routes />
          </Router>
        </ApolloProvider>
      </Provider>
    );
  }
}
