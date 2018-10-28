import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { withAlert } from 'react-alert';
import Button from '@material/react-button';
import Card from '@material/react-card';
import classnames from 'classnames';
import { format } from 'date-fns';
import _ from 'lodash';
import { getFirebaseUserInfo, isSignedIn } from '../utils/auth';
import AuthenticatedQuery from './AuthenticatedQuery';
import { datifyShowsResponse } from '../utils/datetime';
import { userShowsToDict } from '../utils/userShows';
import Loading from './Loading';
import Error from './Error';

import sharedStyles from './SharedStyles.module.scss';
import styles from './DashboardPage.module.scss';

class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.userShowItems = this.userShowItems.bind(this);
  }

  userShowItems(userShows, tab) {
    // Sort polls from latest to oldest
    // TODO: Sort by updatedAt
    const sortedShows = _.sortBy(userShows, (s) => -s.createdAt.getTime());
    const dateFormat = 'D MMM YYYY hh:mmA';
    return (
      <ul className="mdc-list mdc-list--two-line">
        {sortedShows.map(function(userShow) {
          const { id, slug, name, createdAt, updatedAt, respondents } = userShow;

          const totalNumRespondents = respondents.length;
          const numRespondents = respondents.filter((r) => r.response.length !== 0).length;

          return (
            <Link key={id} to={`/show/${slug}/${tab}`} className={sharedStyles.buttonLink}>
              <li className="mdc-list-item">
                <span className="mdc-list-item__text">
                  <span className="mdc-list-item__primary-text">{name}</span>
                  <span className="mdc-list-item__secondary-text">
                    Created {format(createdAt, dateFormat)} and updated{' '}
                    {format(updatedAt, dateFormat)}. {numRespondents}/{totalNumRespondents}{' '}
                    responded.
                  </span>
                </span>
              </li>
            </Link>
          );
        })}
      </ul>
    );
  }

  renderContent(userShows) {
    // Invite user to log in user is not logged in
    if (!isSignedIn()) {
      // TODO: redirect to login,
      // for now keep here to avoid error when calling logged out firebaseUser's email
      return;
    }

    // Invite user to create poll if they don't have any
    if (!userShows || userShows.length === 0) {
      // TODO: Beautify
      return (
        <section className={styles.cardSection}>
          <p>You don&apos;t have any polls yet.</p>
          <Link to="/new" className={sharedStyles.buttonLink}>
            <Button>Create Poll</Button>
          </Link>
        </section>
      );
    }

    const firebaseUser = getFirebaseUserInfo();
    const { admin, pending, responded } = userShowsToDict(userShows, firebaseUser.email);

    return (
      <>
        {admin.length > 0 && (
          <Card className={styles.card}>
            <div className={classnames(styles.cardHeader, 'mdc-typography--headline5')}>
              Polls created by you
            </div>
            {this.userShowItems(admin, 'results')}
          </Card>
        )}

        {pending.length > 0 && (
          <Card className={styles.card}>
            <div className={classnames(styles.cardHeader, 'mdc-typography--headline5')}>
              Polls pending your response
            </div>
            {this.userShowItems(pending, 'respond')}
          </Card>
        )}

        {responded.length > 0 && (
          <Card className={styles.card}>
            <div className={classnames(styles.cardHeader, 'mdc-typography--headline5')}>
              Polls you responded to
            </div>
            {this.userShowItems(responded, 'results')}
          </Card>
        )}
      </>
    );
  }

  render() {
    const { getUserShowsResult, getUserResult } = this.props;

    const { loading: getUserShowsLoading, error: getUserShowsError } = getUserShowsResult;

    if (getUserShowsLoading) {
      return <Loading />;
    } else if (getUserShowsError) {
      console.log('Dashboard page load got getUserShowsError', getUserShowsError);
      return <Error title="That didn&#39;t work" message={getUserShowsError.message} />;
    }

    const { userShows } = getUserShowsResult.data;
    const welcomeText = getUserResult.data
      ? `Welcome, ${getUserResult.data.user.name}!`
      : 'Welcome!';

    // TODO: Use our server's display name
    return (
      <div className={styles.pageContainer}>
        <section>
          <h1 className={styles.header}>{welcomeText}</h1>
        </section>
        {this.renderContent(userShows)}
      </div>
    );
  }
}

DashboardPage.fragments = {
  user: gql`
    fragment DashboardUser on User {
      name
    }
  `,
  userShows: gql`
    fragment DashboardPageShow on Show {
      id
      slug
      name
      isPrivate
      isReadOnly
      areResponsesHidden
      startTime
      endTime
      interval
      respondents {
        id
        anonymousName
        user {
          email
          name
          uid
        }
        role
        response
      }
      createdAt
    }
  `,
};

const GET_USER_QUERY = gql`
  query user($auth: AuthInput!) {
    user(auth: $auth) {
      ...DashboardUser
    }
  }
  ${DashboardPage.fragments.user}
`;

const GET_USER_SHOW_QUERY = gql`
  query userShows($auth: AuthInput!) {
    userShows(auth: $auth) {
      ...DashboardPageShow
    }
  }
  ${DashboardPage.fragments.userShows}
`;

export default withAlert((props) => {
  return (
    <AuthenticatedQuery query={GET_USER_SHOW_QUERY} requiresAuth>
      {(getUserShowsResult) => (
        <AuthenticatedQuery query={GET_USER_QUERY} requiresAuth>
          {(getUserResult) => (
            <DashboardPage
              {...props}
              getUserShowsResult={datifyShowsResponse(getUserShowsResult, 'data.userShows')}
              getUserResult={getUserResult}
            />
          )}
        </AuthenticatedQuery>
      )}
    </AuthenticatedQuery>
  );
});
