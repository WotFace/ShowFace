import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Button from '@material/react-button';
import Card from '@material/react-card';
import TextField, { Input } from '@material/react-text-field';
import classnames from 'classnames';
import { cleanName } from '../utils/string';
import Divider from './Divider';
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

  handleLogIn = () => {
    // Show log in dialog/page, and make auth page redirect back to this page
    const { history } = this.props;
    history.push('/login', { from: history.location });
  };

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
          {canContinueAsSignedInUser ? 'Respond as yourself' : 'Already have an account?'}
        </div>
        <div className={classnames(styles.descText, 'mdc-typography--caption')}>
          With an account, only you will be able to edit your responses.
        </div>
        {canContinueAsSignedInUser ? (
          <Button onClick={this.handleContinueAsUser} unelevated>
            {respondAsPersonText}
          </Button>
        ) : (
          <div className={styles.authButtonContainer}>
            <Button onClick={this.handleLogIn} outlined>
              Log In or Sign Up
            </Button>
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
        <div className="mdc-typography--headline6">
          Respond {canContinueAsSignedInUser ? 'as someone else' : 'with a pseudonym'}
        </div>
        <div className={classnames(styles.descText, 'mdc-typography--caption')}>
          Quicky and easily respond to a poll. Your responses can be changed by anyone.
        </div>
        <TextField label="Enter Your Name" className={styles.nameField} outlined>
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
