import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';

import AppBar from './components/common/AppBar';
import GoogleAnalytics from './components/common/GoogleAnalytics';
import Loading from './components/common/errors-loaders/Loading';

const ShowPage = lazy(() => import('./components/meeting/ShowPage'));
const WelcomePage = lazy(() => import('./components/welcome/WelcomePage'));
const CreatePage = lazy(() => import('./components/create/CreatePage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage'));
const NotFoundPage = lazy(() => import('./components/common/errors-loaders/NotFoundPage'));

const Routes: React.FunctionComponent = () => (
  <>
    <AppBar pathBlacklist={['/login', '/signup']} />
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route exact path="/" component={WelcomePage} />
        <Route exact path="/meeting/:showId/(respond|results|settings)?" component={ShowPage} />
        <Route exact path="/new" component={CreatePage} />
        <Route exact path="/(login|signup)" component={LoginPage} />
        <Route exact path="/dashboard" component={DashboardPage} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </Suspense>
    <GoogleAnalytics />
  </>
);

export default Routes;
