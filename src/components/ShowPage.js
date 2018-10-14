import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
import { Redirect } from 'react-router';
import { withAlert } from 'react-alert';
import ReactLoading from 'react-loading';
import { Query, Mutation } from 'react-apollo';
import classnames from 'classnames';
import gql from 'graphql-tag';
import _ from 'lodash';
import update from 'immutability-helper';

import copyToClipboard from '../utils/copyToClipboard';
import ShowRespond from './ShowRespond';
import ShowResults from './ShowResults';

import styles from './ShowPage.module.scss';
import logo from '../logo.png';
import clipboardIcon from '../clipboard-regular.svg'; // https://fontawesome.com/license

class ShowPage extends Component {
  copyUrlToClipboard = () => {
    copyToClipboard(window.location.href);
    this.props.alert.show('Url copied to clipboard.', {
      type: 'success',
    });
  };

  latestShow() {
    const { getShowResult, upsertResponsesResult } = this.props;
    if (upsertResponsesResult.data && upsertResponsesResult.data._upsertResponse) {
      return upsertResponsesResult.data._upsertResponse;
    }
    if (getShowResult.data && getShowResult.data.show) {
      return getShowResult.data.show;
    }
    return null;
  }

  handleSelectTimes = (startTimes, name) => {
    // Assume latestShow will return something
    const show = this.latestShow();
    if (!name || !show) return;

    const { slug, respondents } = show;
    const currentRespondent = respondents.find((r) => r.anonymousName === name);
    const responses = currentRespondent ? currentRespondent.response : [];
    const newResponses = [...responses, ...startTimes];
    this.props.upsertResponses(slug, name, newResponses);
  };

  handleDeselectTimes = (startTimes, name) => {
    // TODO: Fire mutation
  };

  render() {
    const { match, getShowResult, upsertResponsesResult } = this.props;
    const { loading: getShowLoading, error: getShowError } = getShowResult;
    const { error: upsertResponsesError } = upsertResponsesResult;
    if (getShowLoading) {
      return (
        <section className="full-page flex">
          <h2>Loading</h2>
          <ReactLoading type="bubbles" color="#111" />
        </section>
      );
    } else if (getShowError) {
      console.log('Show page load got getShowError', getShowError);
      return (
        <section className="full-page flex">
          <h2>That didn&#39;t work</h2>
          <div>{getShowError.message}</div>
        </section>
      );
    } else if (upsertResponsesError) {
      console.log('Show page load got upsertResponsesError', upsertResponsesError);
      return (
        <section className="full-page flex">
          <h2>We couldn&apos;t save your changes didn&#39;t work</h2>
          <div>{upsertResponsesError.message}</div>
        </section>
      );
    }

    const show = this.latestShow();

    return (
      <div className={classnames(styles.container, 'container')}>
        <section id="form-header">
          <img className={classnames(styles.contentLogo, 'content-logo')} alt="" src={logo} />
          <div className={styles.header}>
            <h1 className="ShowPage-name">{show && show.name}</h1>
            <button className="btn btn-link" onClick={this.copyUrlToClipboard}>
              Copy link <img src={clipboardIcon} className="font-icon" alt="Clipboard icon" />
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
                render={() => (
                  <ShowRespond
                    show={show}
                    onSelectTimes={this.handleSelectTimes}
                    onDeselectTimes={this.handleDeselectTimes}
                  />
                )}
              />
              <Route path={match.url + '/results'} render={() => <ShowResults show={show} />} />
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
      id
      slug
      name
      isPrivate
      isReadOnly
      areResponsesHidden
      startDate
      endDate
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

const UPSERT_RESPONSES_MUTATION = gql`
  mutation UpsertResponse($slug: String!, $name: String, $responses: [DateTime!]) {
    _upsertResponse(where: { slug: $slug, name: $name }, data: { response: $responses }) {
      ...ShowPageShow
    }
  }
  ${ShowPage.fragments.show}
`;

function getOptimisticResponseForUpsertResponses(name, responses, getShowResult) {
  const show = getShowResult.data && getShowResult.data.show;
  if (!show) return null;
  const { respondents } = show;
  const index = respondents.findIndex((r) => r.anonymousName === name);
  let newRespondents;
  if (index === -1) {
    newRespondents = [
      ...respondents,
      {
        __typename: 'Respondent',
        anonymousName: name,
        role: 'Member',
        response: responses,
      },
    ];
  } else {
    newRespondents = update(respondents, {
      [index]: {
        response: { $set: responses },
      },
    });
  }

  return {
    __typename: 'Mutation',
    _upsertResponse: {
      __typename: 'Show',
      ...show,
      respondents: newRespondents,
    },
  };
}

export default withAlert((props) => {
  const slug = props.match.params.showId;
  return (
    <Query query={GET_SHOW_QUERY} variables={{ slug }}>
      {(getShowResult) => (
        <Mutation mutation={UPSERT_RESPONSES_MUTATION}>
          {(upsertResponses, upsertResponsesResult) => (
            <ShowPage
              {...props}
              getShowResult={getShowResult}
              upsertResponses={(slug, name, responses) =>
                upsertResponses({
                  variables: { slug, name, responses },
                  // TODO: Figure out why the optimistic response isn't used
                  optimisticResponse: getOptimisticResponseForUpsertResponses(
                    name,
                    responses,
                    getShowResult,
                  ),
                })
              }
              upsertResponsesResult={upsertResponsesResult}
            />
          )}
        </Mutation>
      )}
    </Query>
  );
});
