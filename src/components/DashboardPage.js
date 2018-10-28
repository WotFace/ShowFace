import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { withAlert } from 'react-alert';
import Button from '@material/react-button';
import Card from '@material/react-card';
import { getFirebaseUserInfo } from '../utils/auth';
import AuthenticatedQuery from './AuthenticatedQuery';
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
    return (
      <ul>
        {userShows.map(function(userShow) {
          return (
            <>
              <Link
                to={`/show/${userShow.slug}/${tab}`}
                className="btn btn-outline-primary btn-lg btn-block"
              >
                {userShow.slug}
              </Link>
              <br />
            </>
          );
        })}
      </ul>
    );
  }

  renderContent(userShows) {
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
          <section>
            <h3>Shows created by you</h3>
            {this.userShowItems(admin, 'results')}
          </section>
        )}

        {pending.length > 0 && (
          <section>
            <h3>Shows pending your response</h3>
            {this.userShowItems(pending, 'respond')}
          </section>
        )}

        {responded.length > 0 && (
          <section>
            <h3>Shows you responded to</h3>
            {this.userShowItems(responded, 'results')}
          </section>
        )}
      </>
    );
  }

  render() {
    const firebaseUser = getFirebaseUserInfo();
    const { getUserShowsResult } = this.props;

    const { loading: getUserShowsLoading, error: getUserShowsError } = getUserShowsResult;

    if (getUserShowsLoading) {
      return <Loading />;
    } else if (getUserShowsError) {
      console.log('Dashboard page load got getUserShowsError', getUserShowsError);
      return <Error title="That didn&#39;t work" message={getUserShowsError.message} />;
    }

    const { userShows } = getUserShowsResult.data;

    // TODO: Use our server's display name
    return (
      <div className={styles.pageContainer}>
        <section>
          <h1 className={styles.header}>Welcome, {firebaseUser.displayName}!</h1>
        </section>
        {this.renderContent(userShows)}
      </div>
    );
  }
}

DashboardPage.fragments = {
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
      {(getUserShowsResult) => <DashboardPage {...props} getUserShowsResult={getUserShowsResult} />}
    </AuthenticatedQuery>
  );
});
