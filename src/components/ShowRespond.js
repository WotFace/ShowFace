import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Timeline from './Timeline';
import { datesFromRange } from '../utils/datetime';
import { anonNameToId } from '../utils/response';
import { getFirebaseUserInfo } from '../utils/auth';

import TextField, { HelperText, Input } from '@material/react-text-field';

import styles from './ShowRespond.module.scss';
class ShowRespond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      placeholderName: '',
    };
  }

  shouldUseName() {
    const { name } = this.state;
    return name && name.length > 0;
  }

  userResponseKey() {
    const firebaseUser = getFirebaseUserInfo();
    if (this.shouldUseName()) return anonNameToId(this.state.name);
    else if (firebaseUser) return firebaseUser.email;
    return null;
  }

  filteredRespondents() {
    const { show } = this.props;
    if (!show) return [];

    const respondents = show.respondents || [];

    if (this.shouldUseName()) {
      const { name } = this.state;
      return respondents.filter((r) => r.anonymousName === name);
    }

    const firebaseUser = getFirebaseUserInfo();
    if (!firebaseUser) return [];

    return respondents.filter((r) => r.user && r.user.email === firebaseUser.email);
  }

  handleSelect = (startTimes) => {
    const { name } = this.state;
    this.userResponseKey() && this.props.onSelectTimes(startTimes, name);
  };
  handleDeselect = (startTimes) => {
    const { name } = this.state;
    this.userResponseKey() && this.props.onDeselectTimes(startTimes, name);
  };

  debouncedSetState = _.debounce((state) => this.setState(state), 250);

  handleNameChange = (e) => {
    this.setState({ placeholderName: e.target.value });
    this.debouncedSetState({ name: e.target.value });
  };

  render() {
    const { show } = this.props;
    const allowedDates = datesFromRange(show.startDate, show.endDate);
    const userResponseKey = this.userResponseKey();
    const ourRespondents = this.filteredRespondents();

    return (
      <React.Fragment>
        <section id="form">
          <div className={styles.formGroup}>
            <TextField
              label="Enter Your Name"
              className={styles.formInput}
              helperText={
                <HelperText className={styles.formHelperText}>
                  Enter your name so that you can select your availability
                </HelperText>
              }
              onChange={this.handleNameChange}
              outlined
            >
              <Input
                type="text"
                name="name"
                value={this.state.placeholderName}
                onChange={this.handleNameChange}
                autoComplete="off"
              />
            </TextField>
          </div>
        </section>

        {userResponseKey && (
          <Timeline
            allowedDates={allowedDates}
            startTime={moment().startOf('day')}
            endTime={moment().endOf('day')}
            respondents={ourRespondents}
            maxSelectable={1}
            userResponseKey={userResponseKey}
            onSelect={this.handleSelect}
            onDeselect={this.handleDeselect}
          />
        )}
      </React.Fragment>
    );
  }
}

export default ShowRespond;
