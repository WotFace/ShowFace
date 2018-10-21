import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';
import logo from '../logo.png';
import { Link } from 'react-router-dom';
import { withAlert } from 'react-alert';
import { getFirebaseUserInfo } from '../utils/auth';
import { getAuthInput } from '../utils/auth';

class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // userShows: [],
    };
  }

  render() {
    const firebaseUser = getFirebaseUserInfo();
    // const { getUserShowsResult } = this.props;
    this.props.getUserShowsResult.then((x) => console.log(`Resolved: ${x}`));

    const header = firebaseUser ? (
      <div>
        <h1>Welcome, {firebaseUser.displayName}!</h1>
      </div>
    ) : (
      <div>
        <Link to="/login" className="btn btn-outline-primary btn-lg btn-block">
          Log in
        </Link>
      </div>
    );

    return (
      <div className="container">
        <section id="form-header">
          <img className="content-logo" alt="" src={logo} />
          {header}
          <Link to="/new" className="btn btn-outline-primary btn-lg btn-block">
            Create New Poll
          </Link>
        </section>
        <section id="attending">
          <h3>Shows I created</h3>
          <ol>Shows I created</ol>
        </section>
        <section id="notAttending">
          <h3>Shows I responded to</h3>
          <ol>Shows I responded to</ol>
        </section>
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

const getUserShowsResult = async (props) => {
  const auth = await getAuthInput();
  return (
    <Query query={GET_USER_SHOW_QUERY} variables={{ auth }}>
      {(userShows) => <DashboardPage {...props} userShows={userShows} />}
    </Query>
  );
};

export default withAlert((props) => {
  return <DashboardPage {...props} getUserShowsResult={getUserShowsResult(props).then((x) => x)} />;
});
