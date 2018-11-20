import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';

import AppBar from './components/AppBar';
import GoogleAnalytics from './components/GoogleAnalytics';
import Loading from './components/errorsLoaders/Loading';

const ShowPage = lazy(() => import('./components/ShowPage'));
const WelcomePage = lazy(() => import('./components/WelcomePage'));
const CreatePage = lazy(() => import('./components/CreatePage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const NotFoundPage = lazy(() => import('./components/errorsLoaders/NotFoundPage'));

const Routes = () => (
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
