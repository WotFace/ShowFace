import React, { Component } from 'react';
import { Route, withRouter, Link, Prompt } from 'react-router-dom';
import { Redirect } from 'react-router';
import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import IconButton from '@material/react-icon-button';
import { withAlert } from 'react-alert';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';
import update from 'immutability-helper';
import { getAuthInput, getFirebaseUserInfo, isSignedIn } from '../utils/auth';
import AuthenticatedQuery from './AuthenticatedQuery';
import { datifyShowResponse } from '../utils/datetime';
import copyToClipboard from '../utils/copyToClipboard';
import Loading from './errorsLoaders/Loading';
import Error from './errorsLoaders/Error';
import ShowRespond from './ShowRespond';
import ShowResults from './ShowResults';
import ShareModal from './ShareModal';
import Modal from 'react-modal';
import './ReactModalOverride.scss';

import sharedStyles from './SharedStyles.module.scss';
import styles from './ShowPage.module.scss';
import clipboardIcon from '../clipboard-regular.svg'; // https://fontawesome.com/license

class ShowPageComponent extends Component {
  constructor(props) {
    super();
    this.state = {
      pendingSubmission: null, // Shape: { showToSave: Show!, name: String, email: String, responses: [Date]! }
      hasSetName: false,
      modalIsOpen: props.isModalOpen || false,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillMount() {
    Modal.setAppElement('body');
  }

  meetingPageBaseUrl() {
    return `/meeting/${this.props.match.params.showId}`;
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

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

  renderLoginPrompt = () => {
    return (
      <>
        <p>Log in to be part of this meeting</p>
        <Link to="/login" className={sharedStyles.buttonLink}>
          <Button>Log in</Button>
        </Link>
      </>
    );
  };

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

  handleDeleteRespondents = (id) => {
    const slug = this.props.match.params.showId;
    this.props.deleteRespondents(slug, [id]);
  };

  handleDeleteResponse = (id) => {
    const slug = this.props.match.params.showId;
    this.props.deleteResponse(slug, id);
  };

  handleEditRespondentStatus = (id, role, isKeyRespondent) => {
    const slug = this.props.match.params.showId;
    this.props.editShowRespondentStatus(slug, id, role, isKeyRespondent);
    //TODO: add rerender method
  };

  renderTabBar = (responseAllowed) => {
    const { location, history } = this.props;
    const { pendingSubmission } = this.state;
    var links = [{ text: 'Results', icon: 'list', path: `${this.meetingPageBaseUrl()}/results` }];
    var responseIcon = pendingSubmission ? 'warning' : 'add';
    if (responseAllowed) {
      links.unshift({
        text: 'Respond',
        icon: `${responseIcon}`,
        path: `${this.meetingPageBaseUrl()}/respond`,
      });
    }

    const { pathname } = location;
    const activeIndex = links.length === 1 ? 0 : links.findIndex(({ path }) => path === pathname);
    const tabs = links.map(({ text, icon }) => (
      <Tab key={text}>
        <MaterialIcon className="mdc-tab__icon" icon={icon} />
        <span className="mdc-tab__text-label">{text}</span>
      </Tab>
    ));

    return (
      <div className={styles.tabBarContainer}>
        <TabBar
          className={styles.tabBar}
          activeIndex={activeIndex === -1 ? undefined : activeIndex}
          handleActiveIndexUpdate={(activeIndex) => history.push(links[activeIndex].path)}
        >
          {tabs}
        </TabBar>
      </div>
    );
  };

  amIAdmin = () => {
    const user = getFirebaseUserInfo();
    const email = user ? user.email : null;
    const latestSavedShow = this.latestShow(true);
    const { respondents } = latestSavedShow;
    // Find current respondent by current user's email
    const currentRespondent = respondents.find((r) => (r.user ? r.user.email : false) === email);

    return currentRespondent && currentRespondent.role === 'admin';
  };

  render() {
    const { match, getShowResult, upsertResponsesResult } = this.props;
    const { hasSetName, pendingSubmission } = this.state;
    const { loading: getShowLoading, error: getShowError } = getShowResult;
    // TODO: Display something when saving
    const { loading: upsertResponsesLoading, error: upsertResponsesError } = upsertResponsesResult;

    if (getShowLoading) {
      return <Loading />;
    } else if (getShowError) {
      console.log('Show page load got getShowError', getShowError);
      if (
        getShowError.message === "GraphQL error: TypeError: Cannot read property 'token' of null"
      ) {
        return <Error title="This meeting is private" message={this.renderLoginPrompt()} />;
      } else if (getShowError.message === 'GraphQL error: Error: UserNotAuthorizedError') {
        return (
          <Error
            title="This meeting is private"
            message="Contact the meeting&apos;s organizers to ask for an email invite"
          />
        );
      }
      return <Error title="That didn&#39;t work" message={getShowError.message} />;
    } else if (upsertResponsesError) {
      console.log('Show upsert responses got upsertResponsesError', upsertResponsesError);
      return (
        <Error title="We couldn&apos;t save your changes" message={upsertResponsesError.message} />
      );
    }

    const show = this.latestShow(true);
    const latestSavedShow = this.latestShow(false);

    if (!latestSavedShow || !show) {
      return (
        <Error
          title="We couldn&apos;t find this poll"
          message="Check if you entered the correct link."
        />
      );
    }

    const adminAccess = this.amIAdmin();
    const responseAllowed = !latestSavedShow.isReadOnly || adminAccess;

    const baseUrl = this.meetingPageBaseUrl();
    const lastPathComponent = match.params[0]; // undefined if URL is /meeting/<slug>

    // Redirects if necessary, according to show settings
    if (!lastPathComponent && responseAllowed) {
      return <Redirect to={`${baseUrl}/respond`} />;
    }
    if (!responseAllowed && (!lastPathComponent || lastPathComponent === 'respond')) {
      return <Redirect to={`${baseUrl}/results`} />;
    }

    return (
      <div className={styles.container}>
        <Prompt
          when={!!pendingSubmission}
          message={(location) =>
            location.pathname.startsWith(this.meetingPageBaseUrl())
              ? true
              : 'You have unsaved changes. Are you sure you want to leave this page?'
          }
        />
        <section className={styles.headerSection}>
          <div className={styles.header}>
            <div className={styles.headerWithShareBtn}>
              <h1 className={styles.showNameHeader}>{show && show.name}</h1>
              <IconButton onClick={this.openModal}>
                <MaterialIcon className="mdc-tab__icon" icon="share" />
              </IconButton>
            </div>
            {latestSavedShow.isReadOnly && (
              <>
                <p className="mdc-typography--body1">
                  This meeting is closed from further responses.
                </p>

                {adminAccess ? (
                  <p className="mdc-typography--body1">
                    You can allow others to respond again in settings tab.
                  </p>
                ) : (
                  <p className="mdc-typography--body1">
                    You can contact meeting organizers to enable response again.
                  </p>
                )}
              </>
            )}
            <div className={styles.copyUrlInputContainer}>
              <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Share"
              >
                <ShareModal
                  link={window.location.href
                    .split('/')
                    .slice(0, -1)
                    .join('/')}
                />
              </Modal>
            </div>
          </div>
        </section>
        {this.renderTabBar(responseAllowed)}
        <section id="show">
          {lastPathComponent === 'respond' && (
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
          {lastPathComponent === 'results' && (
            <ShowResults
              show={latestSavedShow}
              onDeleteResponse={this.handleDeleteResponse}
              onDeleteRespondents={this.handleDeleteRespondents}
              onEditRespondentStatus={this.handleEditRespondentStatus}
              onUserAction={this.onUserAction}
            />
          )}
        </section>
      </div>
    );
  }
}

ShowPageComponent.fragments = {
  respondent: gql`
    fragment ShowPageShowRespondent on Respondent {
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
  `,
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
        ...ShowPageShowRespondent
      }
    }
  `,
};

const GET_SHOW_QUERY = gql`
  query Show($slug: String!, $auth: AuthInput) {
    show(where: { slug: $slug }, auth: $auth) {
      ...ShowPageShow
    }
  }
  ${ShowPageComponent.fragments.show}
  ${ShowPageComponent.fragments.respondent}
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
  ${ShowPageComponent.fragments.show}
  ${ShowPageComponent.fragments.respondent}
`;

const EDIT_SHOW_RESPONDENT_STATUS = gql`
  mutation EditShowRespondentStatus(
    $slug: String!
    $id: String!
    $role: String
    $isKeyRespondent: Boolean
    $auth: AuthInput
  ) {
    editShowRespondentStatus(
      auth: $auth
      where: { slug: $slug, id: $id }
      data: { role: $role, isKeyRespondent: $isKeyRespondent }
    ) {
      id
      respondents {
        ...ShowPageShowRespondent
      }
    }
  }
  ${ShowPageComponent.fragments.respondent}
`;

const DELETE_RESPONDENTS = gql`
  mutation DeleteRespondents($slug: String!, $id: [String!]!, $auth: AuthInput) {
    deleteRespondents(auth: $auth, where: { slug: $slug, id: $id }) {
      id
      respondents {
        ...ShowPageShowRespondent
      }
    }
  }
  ${ShowPageComponent.fragments.respondent}
`;

const DELETE_RESPONSE = gql`
  mutation DeleteResponse($slug: String!, $id: String!, $auth: AuthInput) {
    deleteResponse(auth: $auth, where: { slug: $slug, id: $id }) {
      id
      respondents {
        ...ShowPageShowRespondent
      }
    }
  }
  ${ShowPageComponent.fragments.respondent}
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

function ShowPageWithQueries(props) {
  const slug = props.match.params.showId;
  return (
    <AuthenticatedQuery query={GET_SHOW_QUERY} variables={{ slug }}>
      {(getShowResult) => (
        <Mutation mutation={UPSERT_RESPONSES_MUTATION}>
          {(upsertResponses, upsertResponsesResult) => (
            <Mutation mutation={DELETE_RESPONSE}>
              {(deleteResponse, deleteResponseResult) => (
                <Mutation mutation={DELETE_RESPONDENTS}>
                  {(deleteRespondents, deleteRespondentsResult) => (
                    <Mutation mutation={EDIT_SHOW_RESPONDENT_STATUS}>
                      {(editShowRespondentStatus, editShowRespondentStatusResult) => (
                        <ShowPageComponent
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
                          deleteResponse={async (slug, id) => {
                            const auth = await getAuthInput();
                            deleteResponse({
                              variables: { slug, id, auth },
                            });
                          }}
                          deleteResponseResult={deleteResponseResult}
                          deleteRespondents={async (slug, id) => {
                            const auth = await getAuthInput();
                            deleteRespondents({
                              variables: { slug, id, auth },
                            });
                          }}
                          deleteRespondentsResult={deleteRespondentsResult}
                          editShowRespondentStatus={async (slug, id, role, isKeyRespondent) => {
                            const auth = await getAuthInput();
                            editShowRespondentStatus({
                              variables: { slug, id, role, isKeyRespondent, auth },
                            });
                          }}
                          editShowRespondentStatusResult={editShowRespondentStatusResult}
                        />
                      )}
                    </Mutation>
                  )}
                </Mutation>
              )}
            </Mutation>
          )}
        </Mutation>
      )}
    </AuthenticatedQuery>
  );
}

export default withRouter(withAlert(ShowPageWithQueries));
