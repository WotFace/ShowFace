import React, { Component } from 'react';
import { withAlert } from 'react-alert';

import Button from '@material/react-button';
import Card from '@material/react-card';
import MaterialIcon from '@material/react-material-icon';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import TextField, { Input } from '@material/react-text-field';

import { auth } from '../firebase';
import SocialLogin from './SocialLogin';
import SignupForm from './SignupForm';

import styles from './LoginPage.module.scss';

class LoginPage extends Component {
  state = {
    selectedTab: 0,
    emailInput: '',
    passwordInput: '',
  };

  authWithEmailPassword = (e) => {
    e.preventDefault();
    const { emailInput, passwordInput } = this.state;
    auth()
      .signInWithEmailAndPassword(emailInput, passwordInput)
      .catch((error) => {
        console.log('Error', error);
      });
  };

  handleTabChange = (selectedTab) => this.setState({ selectedTab });
  handleEmailInputChange = (e) => this.setState({ emailInput: e.target.value });
  handlePasswordInputChange = (e) => this.setState({ passwordInput: e.target.value });

  render() {
    const { selectedTab, emailInput, passwordInput } = this.state;
    return (
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <Card className={styles.card}>
            <div>
              <SocialLogin />
              <TabBar activeIndex={selectedTab} handleActiveIndexUpdate={this.handleTabChange}>
                <Tab key="Login">
                  <span className="mdc-tab__text-label">Log in</span>
                </Tab>
                <Tab key="Signup">
                  <span className="mdc-tab__text-label">Sign up</span>
                </Tab>
              </TabBar>
              {selectedTab === 0 ? (
                <div>
                  <form className={styles.form} onSubmit={this.authWithEmailPassword}>
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
                    <Button
                      type="submit"
                      className={styles.submitButton}
                      icon={<MaterialIcon icon="send" />}
                      disabled={emailInput.length === 0 || passwordInput.length === 0}
                      raised
                    >
                      Log in
                    </Button>
                  </form>
                </div>
              ) : (
                <SignupForm />
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

export default withAlert(LoginPage);
