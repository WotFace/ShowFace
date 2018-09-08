import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Create from './components/Create';
import Welcome from './components/Welcome';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Welcome} />
    <Route path="/" component={Create} />
  </Switch>
);

export default Routes;
