import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { auth } from '../firebase';
import SocialLogin from './SocialLogin';
import SignupForm from './SignupForm';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import styles from './ShowPage.module.scss';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedTab: 0 };
    this.authWithEmailPassword = this.authWithEmailPassword.bind(this);
  }

  authWithEmailPassword(event) {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    event.preventDefault();
    auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => {
        console.log('Error', error);
      });
  }

  changeTab(activeIndex) {
    this.setState({ selectedTab: activeIndex });
  }

  render() {
    const { selectedTab } = this.state;
    return (
      <div className="container Welcome-content">
        <section id="form-header">
          <h1 id="header">Log in</h1>
        </section>
        <section id="form" className="row">
          <div className="col">
            <TabBar
              className={styles.tabBar}
              activeIndex={selectedTab}
              handleActiveIndexUpdate={(activeIndex) => this.changeTab(activeIndex)}
            >
              <Tab key="Login">
                <span className="mdc-tab__text-label">Log in</span>
              </Tab>
              <Tab key="Signup">
                <span className="mdc-tab__text-label">Sign up</span>
              </Tab>
            </TabBar>
            {selectedTab === 0 ? (
              <div>
                <SocialLogin />
                <div
                  ref={(form) => {
                    this.loginForm = form;
                  }}
                >
                  <input
                    style={{ width: '100%', margin: '10px auto' }}
                    className="form-control"
                    name="email"
                    type="email"
                    ref={(input) => {
                      this.emailInput = input;
                    }}
                    placeholder="Email"
                  />
                  <input
                    style={{ width: '100%', margin: '10px auto' }}
                    className="form-control"
                    name="password"
                    type="password"
                    ref={(input) => {
                      this.passwordInput = input;
                    }}
                    placeholder="Password"
                  />
                  <button
                    style={{ width: '100%' }}
                    className="btn btn-outline-primary btn-lg btn-block"
                    value="Log in"
                    onClick={(event) => {
                      this.authWithEmailPassword(event);
                    }}
                  >
                    Log in
                  </button>
                </div>
              </div>
            ) : (
              <SignupForm />
            )}
          </div>
        </section>
      </div>
    );
  }
}

export default withAlert(LoginPage);
