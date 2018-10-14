import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Timeline from './Timeline';
import { datesFromRange } from '../utils/datetime';

class ShowRespond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  handleSelect = (startTimes) => {
    const { name } = this.state;
    name.length > 0 && this.props.onSelectTimes(startTimes, name);
  };
  handleDeselect = (startTimes) => {
    const { name } = this.state;
    name.length > 0 && this.props.onDeselectTimes(startTimes, name);
  };

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
