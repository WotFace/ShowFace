import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Timeline from './Timeline';
import { datesFromRange } from '../utils/datetime';

import TextField, { HelperText, Input } from '@material/react-text-field';
import Button from '@material/react-button';

import styles from './ShowRespond.module.scss';
class ShowRespond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      placeholderName: null,
    };
  }

  handleSelect = (startTimes) => {
    const { name } = this.state;
    const { auth } = this.props;
    (auth || name.length > 0) && this.props.onSelectTimes(startTimes, name);
  };
  handleDeselect = (startTimes) => {
    const { name } = this.state;
    const { auth } = this.props;
    (auth || name.length > 0) && this.props.onDeselectTimes(startTimes, name);
  };

  debouncedSetState = _.debounce((state) => this.setState(state), 250);

  handleNameChange = (e) => {
    this.setState({ placeholderName: e.target.value });
    this.debouncedSetState({ name: e.target.value });
  };

  render() {
    const { show, auth } = this.props;
    const { name } = this.state;
    const allowedDates = datesFromRange(show.startDate, show.endDate);

    const respondents = show.respondents || [];
    // TODO: Filter by logged-in user if present
    const ourRespondents = respondents.filter((r) => r.anonymousName === name);

    return (
      <React.Fragment>
        <section id="form">
          <div className={styles.form_group}>
            <TextField
              label="Enter Your Name"
              className={styles.form_input}
              helperText={
                <HelperText className={styles.form_helper_text}>
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

        {(name || auth) && (
          <Timeline
            allowedDates={allowedDates}
            startTime={moment().startOf('day')}
            endTime={moment().endOf('day')}
            respondents={ourRespondents}
            maxSelectable={1}
            name={name}
            auth={auth}
            onSelect={this.handleSelect}
            onDeselect={this.handleDeselect}
          />
        )}
      </React.Fragment>
    );
  }
}

export default ShowRespond;
