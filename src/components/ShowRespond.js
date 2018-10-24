import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '@material/react-button';
import { anonNameToId } from '../utils/response';
import { getFirebaseUserInfo } from '../utils/auth';
import { setRespondName } from '../actions/userData';
import BottomAppBar from './BottomAppBar';
import Timeline from './Timeline';
import PollRespondNameForm from './PollRespondNameForm';
import styles from './ShowRespond.module.scss';

class ShowRespond extends Component {
  shouldUseName() {
    const { name } = this.props;
    return name && name.length > 0;
  }

  userResponseKey() {
    const firebaseUser = getFirebaseUserInfo();
    if (this.shouldUseName()) return anonNameToId(this.props.name);
    else if (firebaseUser) return firebaseUser.email;
    return null;
  }

  filteredRespondents() {
    const { show } = this.props;
    if (!show) return [];

    const respondents = show.respondents || [];

    if (this.shouldUseName()) {
      const { name } = this.props;
      return respondents.filter((r) => r.anonymousName === name);
    }

    const firebaseUser = getFirebaseUserInfo();
    if (!firebaseUser) return [];

    return respondents.filter((r) => r.user && r.user.email === firebaseUser.email);
  }

  handleSelect = (startTimes) => {
    const { name } = this.props;
    this.userResponseKey() && this.props.onSelectTimes(startTimes, name);
  };
  handleDeselect = (startTimes) => {
    const { name } = this.props;
    this.userResponseKey() && this.props.onDeselectTimes(startTimes, name);
  };

  handleSetName = (name) => {
    this.props.setRespondName(name);
  };

  render() {
    const { show, name } = this.props;
    const { dates, startTime, endTime, interval } = show;
    const userResponseKey = this.userResponseKey();
    const ourRespondents = this.filteredRespondents();

    // Ask for name if logged out and we don't have a cached name.
    // TODO: With a 2 step flow, if user is logged out, prompt user with
    // prefilled name box, else only prompt if user presses back button in
    // the bottom bar. Store an isAskingForName state field.
    if (!userResponseKey) {
      return <PollRespondNameForm name={name} onSetName={this.handleSetName} />;
    }

    return (
      <>
        <Timeline
          dates={dates}
          startTime={startTime}
          endTime={endTime}
          interval={interval}
          respondents={ourRespondents}
          maxSelectable={1}
          userResponseKey={userResponseKey}
          onSelect={this.handleSelect}
          onDeselect={this.handleDeselect}
        />
        <BottomAppBar>
          <div className={styles.bottomBarContent}>
            <Button onClick={this.handleBackClick} outlined>
              ←
            </Button>
            <span className={styles.mainText}>
              Responding as <strong>{name}</strong>
            </span>
            <Button onClick={this.handleSubmit} raised>
              Submit
            </Button>
          </div>
        </BottomAppBar>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    name: state.userData.name,
  };
}

export default connect(
  mapStateToProps,
  { setRespondName },
)(ShowRespond);
