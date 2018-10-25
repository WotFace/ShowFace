import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
import { Redirect } from 'react-router';
import { withAlert } from 'react-alert';
import ReactLoading from 'react-loading';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';
import update from 'immutability-helper';
import { getAuthInput, getFirebaseUserInfo, isSignedIn } from '../utils/auth';
import { datifyShowResponse } from '../utils/datetime';
import copyToClipboard from '../utils/copyToClipboard';
import ShowRespond from './ShowRespond';
import ShowResults from './ShowResults';

import styles from './ShowPage.module.scss';
import clipboardIcon from '../clipboard-regular.svg'; // https://fontawesome.com/license

import TextField, { Input } from '@material/react-text-field';
import Button from '@material/react-button';

class ShowPage extends Component {
  state = {
    pendingSubmission: null, // Shape: { showToSave: Show!, name: String, email: String, responses: [Date]! }
    hasSetName: false,
  };

  copyUrlToClipboard = () => {
    copyToClipboard(window.location.href);
    this.props.alert.show('Url copied to clipboard.', {
      type: 'success',
    });
  };

  canSubmit(name) {
    const show = this.latestShow(true);
    if ((!name && !isSignedIn()) || !show) return false;
    return true;
  }

  latestShow(includePending) {
    const { getShowResult, upsertResponsesResult } = this.props;
    const { pendingSubmission } = this.state;
    if (includePending && pendingSubmission) {
      return pendingSubmission.show;
    }
    if (upsertResponsesResult.data && upsertResponsesResult.data._upsertResponse) {
      return upsertResponsesResult.data._upsertResponse;
    }
    if (getShowResult.data && getShowResult.data.show) {
      return getShowResult.data.show;
    }
    return null;
  }

  handleSetName = (isSet) => {
    this.setState({ hasSetName: isSet });
  };

  handleSelectDeselectTimes(startTimes, name, isSelect) {
    if (!this.canSubmit(name)) return;

    const user = getFirebaseUserInfo();
    const email = user ? user.email : null;
    const show = this.latestShow(true);
    const { respondents } = show;
    // Find current respondent by anonymousName if name is supplied,
    // if not find by current user's email
    const currentRespondent = name
      ? respondents.find((r) => r.anonymousName === name)
      : respondents.find((r) => (r.user ? r.user.email : false) === email);
    const responses = currentRespondent ? currentRespondent.response : [];
    const responsesTimestamps = responses.map((r) => new Date(r).getTime()); // Create Dates as some are strings
    const startTimestamps = startTimes.map((r) => r.getTime());

    let newResponseTimestamps;
    if (isSelect) {
      newResponseTimestamps = _.uniq([...responsesTimestamps, ...startTimestamps]);
    } else {
      newResponseTimestamps = responsesTimestamps.filter((r) => !startTimestamps.includes(r));
    }

    const newResponses = newResponseTimestamps.map((ts) => new Date(ts));
    const showToSave = getOptimisticResponseForShow(name, email, newResponses, show);
    this.setState({
      pendingSubmission: {
        show: showToSave,
        name,
        email,
        responses: newResponses,
      },
    });
  }

  handleSelectTimes = (startTimes, name) => this.handleSelectDeselectTimes(startTimes, name, true);
  handleDeselectTimes = (startTimes, name) =>
    this.handleSelectDeselectTimes(startTimes, name, false);

  handleSubmit = () => {
    const { pendingSubmission } = this.state;
    if (!pendingSubmission) return;
    const { name, email, responses, show } = pendingSubmission;
    const { slug } = show;
    this.props.upsertResponses(slug, name, email, responses);
    this.setState({ pendingSubmission: null });
  };

  render() {
    const { match, getShowResult, upsertResponsesResult } = this.props;
    const { hasSetName, pendingSubmission } = this.state;
    const { loading: getShowLoading, error: getShowError } = getShowResult;
    // TODO: Display something when saving
    const { loading: upsertResponsesLoading, error: upsertResponsesError } = upsertResponsesResult;

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
      console.log('Show upsert responses got upsertResponsesError', upsertResponsesError);
      return (
        <section className="full-page flex">
          <h2>We couldn&apos;t save your changes</h2>
          <div>{upsertResponsesError.message}</div>
        </section>
      );
    }

    const show = this.latestShow(true); // TODO: Show non-latest in Results

    return (
      <div className={styles.container}>
        <section id="form-header">
          <div className={styles.header}>
            <h1>{show && show.name}</h1>
            <div className={styles.copyUrlInputContainer}>
              <TextField outlined className={styles.copyUrlInput} label="">
                <Input type="text" value={window.location.href} />
              </TextField>

              <Button
                className={styles.clipboardButton}
                onClick={this.copyUrlToClipboard}
                icon={<img src={clipboardIcon} className="font-icon" alt="Clipboard icon" />}
              />
            </div>
          </div>
          <div className={styles.tabsContainer}>
            <NavLink to={`${match.url}/respond`} className={styles.noUnderline}>
              <Button>Respond</Button>
            </NavLink>

            <NavLink to={`${match.url}/results`} className={styles.noUnderline}>
              <Button>Results</Button>
            </NavLink>
          </div>
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
                    hasSetName={hasSetName}
                    onSetName={this.handleSetName}
                    onSelectTimes={this.handleSelectTimes}
                    onDeselectTimes={this.handleDeselectTimes}
                    hasPendingSubmissions={!!pendingSubmission}
                    isSaving={upsertResponsesLoading}
                    onSubmit={this.handleSubmit}
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
      dates
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
  mutation UpsertResponse(
    $slug: String!
    $name: String
    $email: String
    $auth: AuthInput
    $responses: [DateTime!]
  ) {
    _upsertResponse(
      where: { slug: $slug, name: $name, email: $email }
      data: { response: $responses }
      auth: $auth
    ) {
      ...ShowPageShow
    }
  }
  ${ShowPage.fragments.show}
`;

function getOptimisticResponseForShow(name, email, responses, show) {
  if (!show) return null;
  const { respondents } = show;
  const index = name
    ? respondents.findIndex((r) => r.anonymousName === name)
    : respondents.findIndex((r) => (r.user ? r.user.email : false) === email);
  let newRespondents;
  if (index === -1) {
    const firebaseUser = getFirebaseUserInfo();
    const user = firebaseUser
      ? {
          __typename: 'User',
          name: firebaseUser.displayName, // TODO: Use user's name on our server
          uid: firebaseUser.uid,
          email,
        }
      : null;
    newRespondents = [
      ...respondents,
      {
        __typename: 'Respondent',
        id: 'optimisticRespondent',
        anonymousName: name,
        user,
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
    __typename: 'Show',
    ...show,
    respondents: newRespondents,
  };
}

function getOptimisticResponseForUpsertResponses(name, email, responses, getShowResult) {
  const show = getShowResult.data && getShowResult.data.show;
  if (!show) return null;
  return {
    __typename: 'Mutation',
    _upsertResponse: getOptimisticResponseForShow(name, email, responses, show),
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
              getShowResult={datifyShowResponse(getShowResult, 'data.show')}
              upsertResponses={async (slug, name, email, responses) => {
                const auth = await getAuthInput();
                upsertResponses({
                  variables: { slug, name, email, auth, responses },
                  optimisticResponse: getOptimisticResponseForUpsertResponses(
                    name,
                    email,
                    responses,
                    getShowResult,
                  ),
                });
              }}
              upsertResponsesResult={datifyShowResponse(
                upsertResponsesResult,
                'data._upsertResponse',
              )}
            />
          )}
        </Mutation>
      )}
    </Query>
  );
});
