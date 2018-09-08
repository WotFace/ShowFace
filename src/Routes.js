import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import Poll from './components/Poll';
import Welcome from './components/Welcome';
import Create from './components/Create';

const Routes = () => (
  <Switch>
    <Redirect exact from="/poll" to="/" />
    <Route exact path="/" component={Welcome} />
    <Route path="/poll/:pollId" component={Poll} />
    <Route path="/create" component={Create} />
  </Switch>
);

export default Routes;
