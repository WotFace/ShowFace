import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Button from '@material/react-button';
import Card from '@material/react-card';
import MaterialIcon from '@material/react-material-icon';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import TextField, { Input } from '@material/react-text-field';

import { auth } from '../firebase';
import { getAuthInput } from '../utils/auth';
import SocialLogin from './SocialLogin';

import styles from './LoginPage.module.scss';

class LoginPage extends Component {
  LOGIN_TAB_IDX = 0;

  state = {
    selectedTab: 0,
    nameInput: '',
    emailInput: '',
    passwordInput: '',
  };

  authWithEmailPassword() {
    const { emailInput, passwordInput } = this.state;
    auth()
      .signInWithEmailAndPassword(emailInput, passwordInput)
      .then((res) => {
        console.log('Logged in', res, emailInput);
      })
      .catch((error) => {
        console.log('Error', error);
      });
  }

  createUserWithEmailAndPassword() {
    const { nameInput, emailInput, passwordInput } = this.state;
    auth()
      .createUserWithEmailAndPassword(emailInput, passwordInput)
      .then(() => this.props.createUser(nameInput, emailInput))
      .then((res) => {
        console.log('Signed up!', res, nameInput, emailInput);
      })
      .catch((error) => {
        console.log('Error', error);
      });
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    if (this.state.selectedTab === this.LOGIN_TAB_IDX) {
      this.authWithEmailPassword();
    } else {
      this.createUserWithEmailAndPassword();
    }
  };

  handleTabChange = (selectedTab) => this.setState({ selectedTab });
  handleNameInputChange = (e) => this.setState({ nameInput: e.target.value });
  handleEmailInputChange = (e) => this.setState({ emailInput: e.target.value });
  handlePasswordInputChange = (e) => this.setState({ passwordInput: e.target.value });

  render() {
    const { selectedTab, nameInput, emailInput, passwordInput } = this.state;

    const submitButton =
      selectedTab === this.LOGIN_TAB_IDX ? (
        <Button
          type="submit"
          className={styles.submitButton}
          icon={<MaterialIcon icon="exit_to_app" />}
          disabled={emailInput.length === 0 || passwordInput.length === 0}
          raised
        >
          Log in
        </Button>
      ) : (
        <Button
          type="submit"
          className={styles.submitButton}
          icon={<MaterialIcon icon="account_circle" />}
          disabled={nameInput.length === 0 || emailInput.length === 0 || passwordInput.length === 0}
          raised
        >
          Sign up
        </Button>
      );

    return (
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <Card className={styles.card}>
            <SocialLogin />
          </Card>
          <Card className={styles.card}>
            <TabBar activeIndex={selectedTab} handleActiveIndexUpdate={this.handleTabChange}>
              <Tab key="Login">
                <span className="mdc-tab__text-label">Log in</span>
              </Tab>
              <Tab key="Signup">
                <span className="mdc-tab__text-label">Sign up</span>
              </Tab>
            </TabBar>
            <form className={styles.form} onSubmit={this.handleFormSubmit}>
              {selectedTab !== this.LOGIN_TAB_IDX && (
                <TextField label="Name" className={styles.formInput}>
                  <Input
                    name="name"
                    type="name"
                    value={nameInput}
                    onChange={this.handleNameInputChange}
                  />
                </TextField>
              )}
              <TextField label="Email" className={styles.formInput}>
                <Input
                  name="email"
                  type="email"
                  value={emailInput}
                  onChange={this.handleEmailInputChange}
                />
              </TextField>
              <TextField label="Password" className={styles.formInput}>
                <Input
                  name="password"
                  type="password"
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

export default withAlert((props) => (
  <Mutation mutation={CREATE_USER_MUTATION}>
    {(createUser, result) => (
      <LoginPage
        {...props}
        createUser={async (name, email) => {
          const auth = await getAuthInput();
          createUser({ variables: { name, email, auth } });
        }}
        createUserResult={result}
      />
    )}
  </Mutation>
));
