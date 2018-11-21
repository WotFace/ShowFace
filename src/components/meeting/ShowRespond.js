import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Mutation } from 'react-apollo';

import _ from 'lodash';
import gql from 'graphql-tag';
import update from 'immutability-helper';

import { getAuthInput, getFirebaseUserInfo, isSignedIn } from '../../utils/auth';
import { datifyShowResponse } from '../../utils/datetime';
import { setRespondName } from '../../actions/userData';

import ShowRespondComponent from './ShowRespondComponent';
import { showFragment } from './fragments';

class ShowRespondContainer extends Component {
  canSubmit(name) {
    const { show } = this.props;
    if ((!name && !isSignedIn()) || !show) return false;
    return true;
  }

  handleSelectDeselectTimes(startTimes, name, isSelect) {
    if (!this.canSubmit(name)) return;

    const user = getFirebaseUserInfo();
    const email = user ? user.email : null;
    const { show } = this.props;
    const { respondents, slug } = show;

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
    this.props.upsertResponses(slug, name, email, newResponses);
  }

  handleSelectTimes = (startTimes, name) => this.handleSelectDeselectTimes(startTimes, name, true);
  handleDeselectTimes = (startTimes, name) =>
    this.handleSelectDeselectTimes(startTimes, name, false);

  render() {
    return (
      <ShowRespondComponent
        {...this.props}
        onSelectTimes={this.handleSelectTimes}
        onDeselectTimes={this.handleDeselectTimes}
      />
    );
  }
}

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
      ...ShowFragment
    }
  }
  ${showFragment}
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
        role: 'member',
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

function getOptimisticResponseForUpsertResponses(name, email, responses, show) {
  if (!show) return null;
  return {
    __typename: 'Mutation',
    _upsertResponse: getOptimisticResponseForShow(name, email, responses, show),
  };
}

function mapStateToProps(state) {
  return {
    name: state.userData.name,
  };
}

export default connect(
  mapStateToProps,
  { setRespondName },
)((props) => (
  <Mutation mutation={UPSERT_RESPONSES_MUTATION}>
    {(upsertResponses, upsertResponsesResult) => (
      <ShowRespondContainer
        {...props}
        upsertResponses={async (slug, name, email, responses) => {
          // N.B. We don't pass in auth if user wants to use name instead.
          const auth = name ? null : await getAuthInput();
          const variables = { slug, responses };
          if (auth) {
            variables.auth = auth;
            variables.email = email;
          } else {
            variables.name = name;
          }
          upsertResponses({
            variables,
            optimisticResponse: getOptimisticResponseForUpsertResponses(
              name,
              email,
              responses,
              props.show,
            ),
          });
        }}
        upsertResponsesResult={datifyShowResponse(upsertResponsesResult, 'data._upsertResponse')}
      />
    )}
  </Mutation>
));
