import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import AppBar from './components/AppBar';
import ShowPage from './components/ShowPage';
import WelcomePage from './components/WelcomePage';
import CreatePage from './components/CreatePage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

const Routes = () => (
  <>
    <AppBar />
    <Switch>
      <Redirect exact from="/poll" to="/" />
      <Route exact path="/" component={WelcomePage} />
      <Route path="/show/:showId" component={ShowPage} />
      <Route path="/new" component={CreatePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
    </Switch>
  </>
);

export default Routes;
