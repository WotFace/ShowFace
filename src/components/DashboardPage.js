import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';
import logo from '../logo.png';
import { Link } from 'react-router-dom';
import { withAlert } from 'react-alert';
import { getFirebaseUserInfo } from '../utils/auth';

class DashboardPage extends Component {
  render() {
    const firebaseUser = getFirebaseUserInfo();

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

// DashboardPage.fragments = {
//   suserShows: gql`
//     fragment DashboardPageShow on UserShows {
//       id
//       slug
//       name
//       isPrivate
//       isReadOnly
//       areResponsesHidden
//       startDate
//       endDate
//       interval
//       respondents {
//         id
//         anonymousName
//         user {
//           email
//           name
//           uid
//         }
//         role
//         response
//       }
//     }
//   `,
// };
//
// const GET_USER_SHOW_QUERY = gql`
//   query UserShow($auth: AuthInput!) {
//     show(where: { auth: $auth }) {
//       ...DashboardPageShow
//     }
//   }
//   ${DashboardPage.fragments.show}
// `;

export default withAlert(DashboardPage);
