import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import AppBar from './components/AppBar';
import GoogleAnalytics from './components/GoogleAnalytics';

import ShowPage from './components/ShowPage';
import WelcomePage from './components/WelcomePage';
import CreatePage from './components/CreatePage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import NotFoundPage from './components/errorsLoaders/NotFoundPage';

const Routes = () => (
  <>
    <AppBar pathBlacklist={['/login', '/signup']} />
    <Switch>
      <Redirect exact from="/poll" to="/" />
      <Route exact path="/" component={WelcomePage} />
      <Route exact path="/meeting/:showId/(respond|results)?" component={ShowPage} />
      <Route exact path="/new" component={CreatePage} />
      <Route exact path="/(login|signup)" component={LoginPage} />
      <Route exact path="/dashboard" component={DashboardPage} />
      <Route path="*" component={NotFoundPage} />
    </Switch>
    <GoogleAnalytics />
  </>
);

export default Routes;
