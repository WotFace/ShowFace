import React, { Component } from 'react';
import { startOfToday, endOfToday } from 'date-fns';

import Card from '@material/react-card';
import Select from '@material/react-select';
import _ from 'lodash';

import styles from './TimePicker.module.scss';
import containerStyles from './CreatePage.module.scss';

class TimePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: startOfToday(),
      endTime: endOfToday(),
      interval: this.props.interval || 15,
    };
  }

  resetEndTime = () => {
    this.setState({ endTime: startOfToday() })
    this.props.updateEndTime(this.state.endTime);
  }

  setStartHour = (event) => {
    const value = event.target.value;
    this.setState({ [event.target.value]: value });
    if (value) {
      this.state.startTime.setHours(value);
    }
    this.props.updateStartTime(this.state.startTime);
    this.resetEndTime();
  };

  setStartMin = (event) => {
    const value = event.target.value;
    this.setState({ [event.target.value]: value });
    if (value) {
      this.state.startTime.setMinutes(value);
    }
    this.props.updateStartTime(this.state.startTime);
    this.resetEndTime();
  };

  setEndHour = (event) => {
    const value = event.target.value;
    this.setState({ [event.target.value]: value });
    if (value) {
      this.state.endTime.setHours(value);
    }
    this.props.updateEndTime(this.state.endTime);
  };

  setEndMin = (event) => {
    const value = event.target.value;
    this.setState({ [event.target.value]: value });
    if (value) {
      this.state.endTime.setMinutes(value);
    }
    this.props.updateEndTime(this.state.endTime);
  };

  setInterval = (interval) => {
    this.setState({ interval: interval });
  };

  getstartHours = () => {
    return _.range(0, 24)
  }

  getstartMins() {
    return _.range(0, 60, this.state.interval)
  }

  getEndMins = () => {
    const startHour = this.state.startTime.getHours()
    const endHour = this.state.endTime.getHours()

    if (endHour === 24) {
      return [0]
    }

    if (startHour !== endHour) {
      return this.getstartMins()
    } else {
      return _.range(this.state.startTime.getMinutes() + this.state.interval, 60, this.state.interval);
    }
  }

  render() {
    const unselectedOption = {
      label: '-',
      value: -1,
      // disabled: true,
      selected: true,
      // hidden: true,
    }

    const startHourOptions = this.getstartHours().map((hour) => ({ value: hour, label: hour }));
    const startMinOptions = this.getstartMins().map((min) => ({ value: min, label: min }));
    var endHourOptions = _.range(this.state.startTime.getHours(), 25).map((hour) => ({ value: hour, label: hour }));

    // Hack for now
    if (this.state.startTime.getMinutes() === startMinOptions[startMinOptions.length - 1].value) {
      endHourOptions.splice(1, 1);
    }

    const endMinOptions = this.getEndMins().map((min) => ({ value: min, label: min }));
    
    console.log("MINS");
    console.log(this.getstartMins());
    console.log(this.getEndMins()); 

    console.log(endHourOptions);
    console.log(endMinOptions);
    // console.log(differentHour);

    return (
      <div>
        <section className={containerStyles.formSection}>
          <Card>
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
          </Card>
        </section>
        <section className={containerStyles.formSection}>
          <Card>
            <div>
              Select Start time
              <Select outlined defaultValue={19}
                className={styles.timeSelect}
                value={this.state.startTime.getHours()}
                label=""
                onChange={this.setStartHour}
                options={startHourOptions}
              />
              hours
              <Select outlined defaultValue={19}
                className={styles.timeSelect}
                value={this.state.startTime.getMinutes()}
                label=""
                onChange={this.setStartMin}
                options={startMinOptions}
              />
              minutes
            </div>
            <div>
              Select End time
              <Select outlined defaultValue={19}
                className={styles.timeSelect}
                value={this.state.endTime.getHours()}
                label=""
                onChange={this.setEndHour}
                options={endHourOptions}
              />
              hours
              <Select outlined defaultValue={19}
                className={styles.timeSelect}
                value={this.state.endTime.getMinutes()}
                label=""
                onChange={this.setEndMin}
                options={endMinOptions}
              />
              minutes
            </div>
          </Card>
        </section>
      </div>
    );
  }
}

export default TimePicker;
