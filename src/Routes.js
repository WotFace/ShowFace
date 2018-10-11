import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import ShowPage from './components/ShowPage';
import WelcomePage from './components/WelcomePage';
import CreatePage from './components/CreatePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

// TODO: Remove after completing transition to GraphQL
import CreatePageFirebase from './components/CreatePageFirebase';
import PollPageFirebase from './components/PollPageFirebase';

const Routes = () => (
  <Switch>
    <Redirect exact from="/poll" to="/" />
    <Route exact path="/" component={WelcomePage} />
    <Route path="/show/:showId" component={ShowPage} />
    <Route path="/new" component={CreatePage} />
    <Route path="/login" component={LoginPage} />
    <Route path="/signup" component={SignupPage} />

    <Route path="/create" component={CreatePageFirebase} />
    <Route path="/poll/:pollId" component={PollPageFirebase} />
  </Switch>
);

export default Routes;
