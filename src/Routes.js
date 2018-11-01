import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import AppBar from './components/AppBar';
import GoogleAnalytics from './components/GoogleAnalytics';

import ShowPage from './components/ShowPage';
import WelcomePage from './components/WelcomePage';
import CreatePage from './components/CreatePage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import NotFoundPage from './components/NotFoundPage';

const Routes = () => (
  <>
    <AppBar />
    <Switch>
      <Redirect exact from="/poll" to="/" />
      <Route exact path="/" component={WelcomePage} />
      <Route path="/meeting/:showId" component={ShowPage} />
      <Route path="/new" component={CreatePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="*" component={NotFoundPage} />
    </Switch>
    <GoogleAnalytics />
  </>
);

export default Routes;
