import React, { Component } from 'react';
import { connect } from 'react-redux';
import IconButton from '@material/react-icon-button';
import MaterialIcon from '@material/react-material-icon';
import { auth } from '../firebase';
import { anonNameToId } from '../utils/response';
import { getFirebaseUserInfo, isSignedIn } from '../utils/auth';
import { setRespondName } from '../actions/userData';
import BottomAppBar from './BottomAppBar';
import Timeline from './Timeline';
import PollRespondNameForm from './PollRespondNameForm';
import styles from './ShowRespond.module.scss';

class ShowRespond extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState();
  }

  // Return initialized state. Does not set state as this method will be used
  // in the constructor.
  getInitState() {
    return {
      // If user is logged out, prompt user with prefilled name box, else only
      // prompt if user presses back button in the bottom bar. Store an
      // isAskingForName state field.
      isAskingForName: !isSignedIn() && !this.props.hasSetName,
    };
  }

  componentDidMount() {
    // Reinitialize state if auth state changes.
    auth().onAuthStateChanged(() => {
      this.setState(this.getInitState());
      if (isSignedIn()) {
        this.props.setRespondName(null);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.state.saved && !this.props.isSaving && prevProps.isSaving) {
      this.startSavedTimer();
    }
  }

  startSavedTimer() {
    this.setState({ saved: true });
    this.savedTimer = setTimeout(this.stopSavedTimer, 2000);
  }

  stopSavedTimer = () => {
    if (!this.savedTimer) return;
    clearTimeout(this.savedTimer);
    this.savedTimer = null;
    this.setState({ saved: false });
  };

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

  loggedInUserName() {
    const firebaseUser = getFirebaseUserInfo();
    if (!firebaseUser) return null;
    // TODO: Use display name from user's User record
    return firebaseUser.displayName || firebaseUser.email;
  }

  responseName() {
    if (this.shouldUseName()) return this.props.name;
    return this.loggedInUserName();
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
    this.stopSavedTimer();
    const { name } = this.props;
    this.userResponseKey() && this.props.onSelectTimes(startTimes, name);
  };
  handleDeselect = (startTimes) => {
    this.stopSavedTimer();
    const { name } = this.props;
    this.userResponseKey() && this.props.onDeselectTimes(startTimes, name);
  };

  handleSetName = (name) => {
    this.props.setRespondName(name);
    this.setState({ isAskingForName: false });
    this.props.onSetName(true);
  };

  handleContinueAsSignedInUser = () => {
    this.props.setRespondName(null);
    this.setState({ isAskingForName: false });
  };

  handleBackClick = () => {
    this.setState({ isAskingForName: true });
    this.props.onSetName(false);
  };

  renderBottomBar() {
    const { isSaving } = this.props;
    const { saved } = this.state;

    let mainText;

    if (isSaving) {
      mainText = 'Saving...';
    } else if (saved) {
      mainText = 'Saved!';
    } else {
      mainText = (
        <>
          Hold and drag on the timeline to select your availability. Responding as{' '}
          <strong>{this.responseName()}</strong>
        </>
      );
    }

    return (
      <BottomAppBar className={styles.bottomBar}>
        <div className={styles.bottomBarContent}>
          <IconButton onClick={this.handleBackClick}>
            <MaterialIcon icon="arrow_back" />
          </IconButton>
          <span className={styles.mainText}>{mainText}</span>
        </div>
      </BottomAppBar>
    );
  }

  render() {
    const { show, name } = this.props;
    const { isAskingForName } = this.state;
    const { dates, startTime, endTime, interval } = show;
    const userResponseKey = this.userResponseKey();
    const ourRespondents = this.filteredRespondents();

    if (isAskingForName) {
      return (
        <PollRespondNameForm
          name={name}
          onSetName={this.handleSetName}
          signedInName={this.loggedInUserName()}
          canContinueAsSignedInUser={isSignedIn()}
          onContinueAsSignedInUser={this.handleContinueAsSignedInUser}
        />
      );
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
        {this.renderBottomBar()}
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
