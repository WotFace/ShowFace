import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import update from 'immutability-helper';
import { firestore } from 'firebase';
import Timeline from './Timeline';

function datesFromRange({ startDate, endDate }) {
  const timestamps = _.range(startDate.seconds, endDate.seconds, 86400);
  timestamps.push(endDate.seconds); // As _.range excludes endDate, we need to add it back
  return timestamps.map((timestamp) => moment.unix(timestamp));
}

class PollRespond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  handleSelectDeselect = (startTime, isSelect) => {
    const { name } = this.state;
    if (name.length === 0) return;

    const startFirebaseTimestamp = firestore.Timestamp.fromDate(startTime.toDate());
    let newPoll = Object.assign({ responses: {} }, this.props.poll);
    newPoll = update(newPoll, {
      responses: {
        [name]: (currentTimes) => {
          if (isSelect) {
            const newTimes = (currentTimes || []).concat([startFirebaseTimestamp]);
            return _.uniqBy(newTimes, (date) => date.seconds);
          } else {
            return _.filter(
              currentTimes || [],
              (date) => date.seconds !== startFirebaseTimestamp.seconds,
            );
          }
        },
      },
    });
    this.props.onPollChange(newPoll);
  };

  render() {
    const { poll } = this.props;
    const { name } = this.state;
    const allowedDates = datesFromRange(poll.dateRange);
    // console.log('poll', poll);

    const ourResponses = poll.responses ? poll.responses[name] : {};
    const responses = ourResponses ? { [name]: ourResponses } : {};

    const debouncedSetState = _.debounce((state) => this.setState(state), 100);

    return (
      <React.Fragment>
        <h2>Respond to {poll.name}</h2>

        <section id="form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              name="name"
              type="text"
              placeholder="Tony Stark"
              onChange={(e) => debouncedSetState({ name: e.target.value })}
            />
          </div>
        </section>

        <Timeline
          allowedDates={allowedDates}
          startTime={moment().startOf('day')}
          endTime={moment().endOf('day')}
          responses={responses}
          name={this.state.name}
          onSelect={(startTime) => this.handleSelectDeselect(startTime, true)}
          onDeselect={(startTime) => this.handleSelectDeselect(startTime, false)}
        />
      </React.Fragment>
    );
  }
}

export default PollRespond;
