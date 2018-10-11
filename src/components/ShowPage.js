import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
import { Redirect } from 'react-router';
import { withAlert } from 'react-alert';
import ReactLoading from 'react-loading';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';

import copyToClipboard from '../utils/copyToClipboard';
import ShowRespond from './ShowRespond';
import ShowResults from './ShowResults';

import './ShowPage.css';
import logo from '../logo.png';
import clipboardIcon from '../clipboard-regular.svg'; // https://fontawesome.com/license

class ShowPage extends Component {
  copyUrlToClipboard = () => {
    copyToClipboard(window.location.href);
    this.props.alert.show('Url copied to clipboard.', {
      type: 'success',
    });
  };

  uploadShow = _.debounce(() => {
    console.log('Update show');
    // this.pollDoc.update(this.state.show);
  }, 500);

  handleShowChange = (newShow) => {
    this.uploadShow();
    this.setState({ show: newShow }); // Optimistically update the local state
  };

  render() {
    const { match, getShowResult } = this.props;
    const { loading, data, error } = getShowResult;
    if (loading) {
      return (
        <section className="full-page flex">
          <h2>Loading</h2>
          <ReactLoading type="bubbles" color="#111" />
        </section>
      );
    } else if (error) {
      console.log('Show page load got error', error);
      return (
        <section className="full-page flex">
          <h2>That didn&#39;t work</h2>
          <div>{error.message}</div>
        </section>
      );
    }

    const { show } = data;

    return (
      <div className="container ShowPage-container">
        <section id="form-header">
          <img className="content-logo" alt="" src={logo} />
          <div className="ShowPage-header">
            <h1 className="ShowPage-name">{show && show.name}</h1>
            <button className="btn btn-link" onClick={this.copyUrlToClipboard}>
              Copy link <img src={clipboardIcon} className="font-icon" />
            </button>
          </div>
          <nav>
            <ul className="nav nav-tabs nav-fill">
              <NavLink
                to={`${match.url}/respond`}
                className="nav-item nav-link"
                activeClassName="active"
              >
                Respond
              </NavLink>
              <NavLink
                to={`${match.url}/results`}
                className="nav-item nav-link"
                activeClassName="active"
              >
                Results
              </NavLink>
            </ul>
          </nav>
        </section>
        <section id="show">
          {show && (
            <React.Fragment>
              <Route
                exact
                path={match.url}
                component={() => (
                  <Redirect to={`/show/${this.props.match.params.showId}/respond`} />
                )}
              />
              <Route
                path={match.url + '/respond'}
                render={() => <ShowRespond show={show} onShowChange={this.handleShowChange} />}
              />
              <Route
                path={match.url + '/results'}
                render={() => <ShowResults show={show} onShowChange={this.handleShowChange} />}
              />
            </React.Fragment>
          )}
        </section>
      </div>
    );
  }
}

ShowPage.fragments = {
  show: gql`
    fragment ShowPageShow on Show {
      slug
      name
      isPrivate
      isAnonymous
      isReadOnly
      isCreatedAnonymously
      startDate
      endDate
      interval
      respondents {
        anonymousName
        user {
          email
          name
          uid
        }
        role
        response
        updatedAt
      }
    }
  `,
};

const GET_SHOW_QUERY = gql`
  query Show($slug: String!) {
    show(where: { slug: $slug }) {
      ...ShowPageShow
    }
  }
  ${ShowPage.fragments.show}
`;

export default withAlert((props) => {
  const slug = props.match.params.showId;
  return (
    <Query query={GET_SHOW_QUERY} variables={{ slug }}>
      {(getShowResult) => <ShowPage {...props} getShowResult={getShowResult} />}
    </Query>
  );
});
