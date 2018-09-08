import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
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

  handleSelect = (startTime) => {
    console.log('DINGDINGDING');
    if (this.state.name.length === 0) return;
    console.log('DONGDONGDOESN');
  };

  render() {
    const { poll, onPollChange } = this.props;
    const allowedDates = datesFromRange(poll.dateRange);
    // console.log('poll', poll);

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
              value={this.state.name}
              onChange={(e) => this.setState({ name: e.target.value })}
            />
          </div>
        </section>

        <Timeline
          allowedDates={allowedDates}
          startTime={moment().startOf('day')}
          endTime={moment().endOf('day')}
          responses={poll.responses || []}
          onSelect={this.handleSelect}
        />
      </React.Fragment>
    );
  }
}

export default PollRespond;
