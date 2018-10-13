import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import update from 'immutability-helper';
import Timeline from './Timeline';
import { datesFromRange } from '../utils/datetime';

class ShowRespond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  handleSelect = (startTime) => this.handleSelectDeselect(startTime, true);
  handleDeselect = (startTime) => this.handleSelectDeselect(startTime, false);

  handleSelectDeselect(startTime, isSelect) {
    const { name } = this.state;
    if (name.length === 0) return;

    // const startFirebaseTimestamp = firestore.Timestamp.fromDate(startTime.toDate());
    // let newShow = Object.assign({ responses: {} }, this.props.show);
    // newShow = update(newShow, {
    // responses: {
    // [name]: (currentTimes) => {
    // if (isSelect) {
    // const newTimes = (currentTimes || []).concat([startFirebaseTimestamp]);
    // return _.uniqBy(newTimes, (date) => date.seconds);
    // } else {
    // return _.filter(
    // currentTimes || [],
    // (date) => date.seconds !== startFirebaseTimestamp.seconds,
    // );
    // }
    // },
    // },
    // });
    this.props.onShowChange(null);
  }

  render() {
    const { show } = this.props;
    const { name } = this.state;
    const allowedDates = datesFromRange(show.startDate, show.endDate);

    const ourResponses = show.responses ? show.responses[name] : {};
    const responses = ourResponses ? { [name]: ourResponses } : {};

    const debouncedSetState = _.debounce((state) => this.setState(state), 100);

    return (
      <React.Fragment>
        <section id="form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              name="name"
              type="text"
              className="form-control"
              placeholder="Tony Stark"
              onChange={(e) => debouncedSetState({ name: e.target.value })}
            />
            <small className="form-text text-muted">
              Enter your name so that you can select your availability
            </small>
          </div>
        </section>

        {name && (
          <Timeline
            allowedDates={allowedDates}
            startTime={moment().startOf('day')}
            endTime={moment().endOf('day')}
            responses={responses}
            maxSelectable={1}
            name={name}
            onSelect={this.handleSelect}
            onDeselect={this.handleDeselect}
          />
        )}
      </React.Fragment>
    );
  }
}

export default ShowRespond;
