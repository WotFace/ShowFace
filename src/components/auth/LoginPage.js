import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { Redirect, withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import classnames from 'classnames';

import Card from '@material/react-card';
import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import TextField, { Input } from '@material/react-text-field';

import { auth } from '../../firebase';
import { getAuthInput } from '../../utils/auth';
import SocialLogin from './SocialLogin';

import styles from './LoginPage.module.scss';

class LoginPage extends Component {
  LOGIN_TAB_IDX = 0;

  state = {
    selectedTab: this.props.match.params[0].toLowerCase() === 'login' ? 0 : 1,
    nameInput: '',
    emailInput: '',
    passwordInput: '',

    authenticating: false, // Logging in or signing up
    authenticated: false, // Logged in or signed up
    authError: null,
  };

  authWithEmailPassword() {
    const { emailInput, passwordInput } = this.state;
    this.setState({ authenticating: true, authenticated: false, authError: null });
    auth()
      .signInWithEmailAndPassword(emailInput, passwordInput)
      .then((res) => {
        this.setState({ authenticating: false, authenticated: true, authError: null });
      })
      .catch((error) => {
        this.setState({ authenticating: false, authenticated: false, authError: error });
      });
  }

  createUserWithEmailAndPassword() {
    const { nameInput, emailInput, passwordInput } = this.state;
    this.setState({ authenticating: true, authenticated: false, authError: null });
    auth()
      .createUserWithEmailAndPassword(emailInput, passwordInput)
      .then(() => this.props.createUser(nameInput, emailInput))
      .then((res) => {
        this.setState({ authenticating: false, authenticated: true, authError: null });
      })
      .catch((error) => {
        this.setState({ authenticating: false, authenticated: false, authError: error });
      });
  }

  handleBackButtonClick = () => this.props.history.goBack();

  handleFormSubmit = (e) => {
    e.preventDefault();
    if (this.state.selectedTab === this.LOGIN_TAB_IDX) {
      this.authWithEmailPassword();
    } else {
      this.createUserWithEmailAndPassword();
    }
  };

  handleTabChange = (selectedTab) => this.setState({ selectedTab, authError: null });
  handleNameInputChange = (e) => this.setState({ nameInput: e.target.value });
  handleEmailInputChange = (e) => this.setState({ emailInput: e.target.value });
  handlePasswordInputChange = (e) => this.setState({ passwordInput: e.target.value });

  handleSocialLogInStart = () =>
    this.setState({ authenticating: true, authenticated: false, authError: null });
  handleSocialLoggedIn = () =>
    this.setState({ authenticating: false, authenticated: true, authError: null });
  handleSocialLogInError = (error) =>
    this.setState({ authenticating: false, authenticated: false, authError: error });

  render() {
    const { location } = this.props;
    const {
      selectedTab,
      nameInput,
      emailInput,
      passwordInput,
      authenticating,
      authenticated,
      authError,
    } = this.state;

    if (authenticated) {
      let to = '/dashboard';
      // Redirect back to where we came from if location.state.from exists
      if (location.state && location.state.from) {
        to = location.state.from;
      }
      return <Redirect to={to} />;
    }

    const isLoginPage = selectedTab === this.LOGIN_TAB_IDX;

    const submitButton = isLoginPage ? (
      <Button
        type="submit"
        className={styles.submitButton}
        icon={<MaterialIcon icon="exit_to_app" />}
        disabled={authenticating || emailInput.length === 0 || passwordInput.length === 0}
        raised
      >
        {authenticating ? 'Logging in...' : 'Log in'}
      </Button>
    ) : (
      <Button
        type="submit"
        className={styles.submitButton}
        icon={<MaterialIcon icon="account_circle" />}
        disabled={
          authenticating ||
          nameInput.length === 0 ||
          emailInput.length === 0 ||
          passwordInput.length === 0
        }
        raised
      >
        {authenticating ? 'Signing up...' : 'Sign up'}
      </Button>
    );

    // TODO: Beautify error display
    return (
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <div className={styles.backButtonContainer}>
            <Button
              icon={<MaterialIcon icon="arrow_back" />}
              disabled={authenticating}
              onClick={this.handleBackButtonClick}
            >
              Back
            </Button>
          </div>
          <img className={styles.contentLogo} alt="ShowFace Logo" src="/img/logos/sf.png" />
          <Card className={classnames(styles.card, styles.socialCard)}>
            <SocialLogin
              onLogInStart={this.handleSocialLogInStart}
              onLoggedIn={this.handleSocialLoggedIn}
              onLogInError={this.handleSocialLogInError}
            />
          </Card>
          <Card className={styles.card}>
            <TabBar activeIndex={selectedTab} handleActiveIndexUpdate={this.handleTabChange}>
              <Tab key="Login" disabled={authenticating}>
                <span className="mdc-tab__text-label">Log in</span>
              </Tab>
              <Tab key="Signup" disabled={authenticating}>
                <span className="mdc-tab__text-label">Sign up</span>
              </Tab>
            </TabBar>
            <form className={styles.form} onSubmit={this.handleFormSubmit}>
              {!!authError && (
                <div>
                  Could not {isLoginPage ? 'log in' : 'sign up'}. {authError.message}
                </div>
              )}
              {!isLoginPage && (
                <TextField label="Name" className={styles.formInput}>
                  <Input
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={nameInput}
                    onChange={this.handleNameInputChange}
                    maxLength="50"
                  />
                </TextField>
              )}
              <TextField label="Email" className={styles.formInput}>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={emailInput}
                  onChange={this.handleEmailInputChange}
                />
              </TextField>
              <TextField label="Password" className={styles.formInput}>
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={this.handlePasswordInputChange}
                />
              </TextField>
              {submitButton}
            </form>
          </Card>
        </div>
      </div>
    );
  }
}

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($name: String!, $email: String!, $auth: AuthInput!) {
    createUser(auth: $auth, data: { name: $name, email: $email }) {
      id
    }
  }
`;

export default withRouter((props) => (
  <Mutation mutation={CREATE_USER_MUTATION}>
    {(createUser, result) => (
      <LoginPage
        {...props}
        createUser={async (name, email) => {
          const auth = await getAuthInput();
          return createUser({ variables: { name, email, auth } });
        }}
        createUserResult={result}
      />
    )}
  </Mutation>
));
