import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import Button from '@material/react-button';
import Card from '@material/react-card';
import TextField, { Input } from '@material/react-text-field';
import classnames from 'classnames';
import { cleanName } from '../../utils/string';
import Divider from '../Divider';

import sharedStyles from '../../styles/SharedStyles.module.scss';
import styles from './PollRespondNameForm.module.scss';

class PollRespondNameForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name || '',
    };
  }

  cleanName() {
    return cleanName(this.state.name);
  }

  handleNameChange = (e) => {
    this.setState({ name: e.target.value });
  };

  handleNameFormSubmit = (e) => {
    e.preventDefault();
    this.props.onSetName(this.cleanName());
  };

  handleContinueAsUser = () => {
    this.props.onContinueAsSignedInUser();
  };

  renderWithAccountSection() {
    const { signedInName, canContinueAsSignedInUser } = this.props;
    const respondAsPersonText = `Respond as ${signedInName || 'signed in user'}`;

    return (
      <>
        <div className="mdc-typography--headline6">
          {canContinueAsSignedInUser ? 'Use your account' : 'Already have an account?'}
        </div>
        <div className={classnames(styles.descText, 'mdc-typography--caption')}>
          With an account, everyone can rest assured that your availability was marked by you, and
          only you.
        </div>
        {canContinueAsSignedInUser ? (
          <Button onClick={this.handleContinueAsUser} unelevated>
            {respondAsPersonText}
          </Button>
        ) : (
          <div className={styles.authButtonContainer}>
            <Link
              to={{ pathname: '/login', state: { from: this.props.location } }}
              className={sharedStyles.buttonLink}
            >
              <Button outlined>Log In</Button>
            </Link>
            <Link
              to={{ pathname: '/signup', state: { from: this.props.location } }}
              className={sharedStyles.buttonLink}
            >
              <Button outlined>Sign Up</Button>
            </Link>
          </div>
        )}
      </>
    );
  }

  renderNameSection() {
    const { canContinueAsSignedInUser } = this.props;
    const { name } = this.state;
    const formContinueDisabled = !name || this.cleanName().length === 0;
    const formContinueButtonText = formContinueDisabled
      ? 'Respond'
      : `Respond as ${this.cleanName()}`;

    return (
      <form className={styles.nameForm} onSubmit={this.handleNameFormSubmit}>
        <div className="mdc-typography--headline6">Use a display name</div>
        <div className={classnames(styles.descText, 'mdc-typography--caption')}>
          Quicky and easily indicate your availability with just a name. Do note that your responses
          can be changed by anyone.
        </div>
        <TextField label="Your Name" className={styles.nameField} outlined>
          <Input
            type="text"
            name="name"
            value={name}
            onChange={this.handleNameChange}
            autoComplete="off"
          />
        </TextField>
        <Button
          type="submit"
          disabled={formContinueDisabled}
          unelevated={!canContinueAsSignedInUser}
          outlined={canContinueAsSignedInUser}
        >
          {formContinueButtonText}
        </Button>
      </form>
    );
  }

  render() {
    const { canContinueAsSignedInUser } = this.props;
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          {canContinueAsSignedInUser ? this.renderWithAccountSection() : this.renderNameSection()}
          <Divider className={styles.divider} text="OR" />
          {canContinueAsSignedInUser ? this.renderNameSection() : this.renderWithAccountSection()}
        </Card>
      </div>
    );
  }
}

export default withRouter(PollRespondNameForm);
