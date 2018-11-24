import React, { Component } from 'react';
import { startOfToday } from 'date-fns';

import Card from '@material/react-card';
import Select from '@material/react-select';
import _ from 'lodash';

import styles from './TimePicker.module.scss';
import containerStyles from '../create/CreatePage.module.scss'; // TODO: Refactor so that CreatePage actually handles create page layout and styles

class TimePicker extends Component {
  constructor(props) {
    super(props);

    const { startTime, endTime } = this.props;

    this.state = {
      startHour: startTime ? startTime.getHours() : 9,
      startMin: startTime ? startTime.getMinutes() : 0,
      endHour: endTime ? endTime.getHours() : 17,
      endMin: endTime ? endTime.getHours() : 0,
      interval: this.props.interval || 15,
    };

    this.props.updateStartTime(this.startTime());
    this.props.updateEndTime(this.endTime());
  }

  resetEndTime = () => {
    var { startHour, endHour, endMin } = this.state;
    if (startHour >= endHour && startHour <= 22) {
      endHour = startHour + 1;
    }
    this.setState({ endHour: endHour });
    this.props.updateEndTime(this.endTime());
  };

  resetStartTime = () => {
    this.setState({ startMin: 0 });
    this.props.updateStartTime(this.startTime());
  };

  setToDefaultTimes = () => {
    this.setState({ startHour: 9 });
    this.setState({ startMin: 17 });
    this.setState({ endHour: 0 });
    this.setState({ endMin: 0 });
    this.props.updateStartTime(this.startTime());
    this.props.updateEndTime(this.endTime());
  };

  dateForTime = (hour, min) => {
    var startOfDay = startOfToday();
    startOfDay.setHours(hour);
    startOfDay.setMinutes(min);
    return startOfDay;
  };

  startTime = () => {
    return this.dateForTime(this.state.startHour, this.state.startMin);
  };

  endTime = () => {
    return this.dateForTime(this.state.endHour, this.state.endMin);
  };

  setStartHour = (event) => {
    const value = parseInt(event.target.value);
    this.setState({ startHour: value });
    this.props.updateStartTime(this.startTime());
    this.resetEndTime();
  };

  setStartMin = (event) => {
    const value = parseInt(event.target.value);
    this.setState({ startMin: value });
    this.props.updateStartTime(this.startTime());
  };

  setEndHour = (event) => {
    const value = parseInt(event.target.value);
    this.setState({ endHour: value });

    // Special case for last hour
    if (value === 24) {
      this.setState({ endMin: 0 });
    }
    this.props.updateEndTime(this.endTime());
  };

  setEndMin = (event) => {
    const value = parseInt(event.target.value);
    this.setState({ endMin: value });
    this.props.updateEndTime(this.endTime());
  };

  setInterval = (interval) => {
    this.setState({ interval: interval });

    // Reset the minutes which now may be inaccurate
    this.resetStartTime();
    this.resetEndTime();
    this.props.updateInterval(interval);
  };

  getstartHours = () => {
    return _.range(0, 24);
  };

  getstartMins() {
    const interval = this.state.interval;
    return _.range(0, 60, interval);
  }

  getEndHour() {
    const { startHour, startMin } = this.state;
    if (startMin === this.getstartMins().slice(-1)[0]) {
      return _.range(startHour + 1, 25);
    } else {
      return _.range(startHour, 25);
    }
  }

  getEndMins = () => {
    const { startHour, startMin, endHour, interval } = this.state;

    if (endHour === 24) {
      return [0];
    }

    if (startHour < endHour) {
      return this.getstartMins();
    } else {
      return _.range(startMin + interval, 60, interval);
    }
  };

  render() {
    const startHourOptions = this.getstartHours().map((hour) => ({ value: hour, label: hour }));
    const startMinOptions = this.getstartMins().map((min) => ({ value: min, label: min }));
    const endHourOptions = this.getEndHour().map((hour) => ({ value: hour, label: hour }));
    const endMinOptions = this.getEndMins().map((min) => ({ value: min, label: min }));

    const wrapper = (children) => {
      if (this.props.card) {
        return <Card>{children}</Card>;
      } else {
        return <div>{children}</div>;
      }
    };

    let intervalDiv;
    if (this.props.withInterval) {
      intervalDiv = (
        <section className={containerStyles.formSection}>
          {wrapper(
            <div>
              <div className={styles.cardTitle}>Select Time Interval</div>
              <div className={styles.radioRow}>
                <div className={styles.radioGroup}>
                  <div className="mdc-radio" onChange={() => this.setInterval(15)}>
                    <input
                      className="mdc-radio__native-control"
                      type="radio"
                      name="radios"
                      id="radio-1"
                      readOnly
                      checked={this.state.interval === 15}
                    />
                    <div className="mdc-radio__background">
                      <div className="mdc-radio__outer-circle" />
                      <div className="mdc-radio__inner-circle" />
                    </div>
                  </div>
                  <label>15 mins</label>
                </div>

                <div className={styles.radioGroup}>
                  <div className="mdc-radio" onChange={() => this.setInterval(30)}>
                    <input
                      className="mdc-radio__native-control"
                      type="radio"
                      name="radios"
                      id="radio-2"
                      readOnly
                      checked={this.state.interval === 30}
                    />
                    <div className="mdc-radio__background">
                      <div className="mdc-radio__outer-circle" />
                      <div className="mdc-radio__inner-circle" />
                    </div>
                  </div>
                  <label>30 mins</label>
                </div>
              </div>
            </div>,
          )}
        </section>
      );
    }

    return (
      <div>
        {intervalDiv}
        <section className={containerStyles.formSection}>
          {wrapper(
            <div className={styles.timePickerContainer}>
              <div className={styles.timePickerRow}>
                <div>Select Start time</div>
                <div className={styles.timePickerSelectContainer}>
                  <div>
                    <Select
                      outlined
                      className={styles.timeSelect}
                      value={this.state.startHour}
                      label=""
                      onChange={this.setStartHour}
                      options={startHourOptions}
                    />
                    hours
                  </div>
                  <div>
                    <Select
                      outlined
                      className={styles.timeSelect}
                      value={this.state.startMin}
                      label=""
                      onChange={this.setStartMin}
                      options={startMinOptions}
                    />
                    mins &nbsp;
                  </div>
                </div>
              </div>
              <div className={styles.timePickerRow}>
                <div>Select End time</div>
                <div className={styles.timePickerSelectContainer}>
                  <div>
                    <Select
                      outlined
                      className={styles.timeSelect}
                      value={this.state.endHour}
                      label=""
                      onChange={this.setEndHour}
                      options={endHourOptions}
                    />
                    hours
                  </div>
                  <div>
                    <Select
                      outlined
                      className={styles.timeSelect}
                      value={this.state.endMin}
                      label=""
                      onChange={this.setEndMin}
                      options={endMinOptions}
                    />
                    mins &nbsp;
                  </div>
                </div>
              </div>
            </div>,
          )}
        </section>
      </div>
    );
  }
}

export default TimePicker;
