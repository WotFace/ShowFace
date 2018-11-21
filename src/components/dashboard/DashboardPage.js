import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import Card from '@material/react-card';
import classnames from 'classnames';
import { format } from 'date-fns';
import _ from 'lodash';

import { getFirebaseUserInfo, isSignedIn } from '../../utils/auth';
import { datifyShowsResponse } from '../../utils/datetime';
import { userShowsToDict } from '../../utils/userShows';
import Loading from '../common/errors-loaders/Loading';
import Error from '../common/errors-loaders/Error';
import AuthenticatedQuery from '../common/AuthenticatedQuery';
import QuickCreate from '../common/QuickCreate';

import sharedStyles from '../../styles/SharedStyles.module.scss';
import styles from './DashboardPage.module.scss';

const dateFormat = 'D MMM YYYY hh:mmA';

class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.userShowItems = this.userShowItems.bind(this);
  }

  renderPendingListItem = (show, respondent) => {
    const { name } = show;
    const { createdAt } = respondent;
    return (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{name}</span>
          <span className="mdc-list-item__secondary-text">
            Invited {format(createdAt, dateFormat)}
          </span>
        </span>
      </li>
    );
  };

  renderOrganizerListItem = (show) => {
    const { name, createdAt, updatedAt, respondents } = show;
    const totalNumRespondents = respondents.length;
    const numRespondents = respondents.filter((r) => r.response.length !== 0).length;
    return (
      <li className={classnames(styles.listItem, 'mdc-list-item')}>
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{name}</span>
          <span className={classnames(styles.secondaryText, 'mdc-list-item__secondary-text')}>
            Created {format(createdAt, dateFormat)}. Updated {format(updatedAt, dateFormat)}.<br />
            {numRespondents}/{totalNumRespondents} responded.
          </span>
        </span>
      </li>
    );
  };

  renderRespondedListItem = (show, respondent) => {
    const { name } = show;
    const { updatedAt } = respondent;
    return (
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          <span className="mdc-list-item__primary-text">{name}</span>
          <span className="mdc-list-item__secondary-text">
            Responded {format(updatedAt, dateFormat)}
          </span>
        </span>
      </li>
    );
  };

  userShowItems(userShows, tab, sorter, listItemRenderer) {
    // Sort polls from latest to oldest
    const sortedShows = _.sortBy(userShows, sorter);
    return (
      <ul className="mdc-list mdc-list--two-line">
        {sortedShows.map(({ show, respondent }) => {
          const { id, slug } = show;
          return (
            <Link key={id} to={`/meeting/${slug}/${tab}`} className={sharedStyles.buttonLink}>
              {listItemRenderer(show, respondent)}
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
      return (
        <>
          <p className="mdc-typography--body1">
            You don&apos;t have any polls yet. Create one now!
          </p>
          <Card className={styles.card} id={styles.createCard}>
            <QuickCreate />
          </Card>
        </>
      );
    }

    const firebaseUser = getFirebaseUserInfo();
    const { adminShows, pendingShows, respondedShows } = userShowsToDict(
      userShows,
      firebaseUser.email,
    );

    const cardHeaderClass = classnames(styles.cardHeader, 'mdc-typography--headline6');

    return (
      <>
        <Card className={styles.card} id={styles.createCard}>
          <QuickCreate />
        </Card>

        {pendingShows.length > 0 && (
          <Card className={styles.card} id={styles.toRespondCard}>
            <div className={cardHeaderClass}>Polls awaiting your response</div>
            {this.userShowItems(
              pendingShows,
              'respond',
              (s) => -s.respondent.createdAt.getTime(),
              this.renderPendingListItem,
            )}
          </Card>
        )}

        {adminShows.length > 0 && (
          <Card className={styles.card}>
            <div className={cardHeaderClass}>Polls you are organizing</div>
            {this.userShowItems(
              adminShows,
              'results',
              (s) => -s.show.updatedAt.getTime(),
              this.renderOrganizerListItem,
            )}
          </Card>
        )}

        {respondedShows.length > 0 && (
          <Card className={styles.card}>
            <div className={cardHeaderClass}>Polls you responded to</div>
            {this.userShowItems(
              respondedShows,
              'results',
              (s) => -s.respondent.updatedAt.getTime(),
              this.renderRespondedListItem,
            )}
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
    const welcomeText =
      getUserResult.data && getUserResult.data.user
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
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
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

export default (props) => {
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
};
