import React, { Component } from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import TextField, { Input } from '@material/react-text-field';

import { cleanName } from '../utils/string';
import BottomAppBar from './BottomAppBar';
import TimePicker from './TimePicker';

import styles from './EditShowPage.module.scss';

class EditShowPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.show.name,
      selectedDays: this.props.show.dates,
      startTime: this.props.show.startTime,
      endTime: this.props.show.endTime,
      interval: this.props.show.interval,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
  }

  handleSubmit(event) {
    const { name, selectedDays, startTime, endTime, interval } = this.state;
    this.props.updateShow(cleanName(name), selectedDays, startTime, endTime, interval);
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleDayClick(day, { selected, disabled }) {
    const { selectedDays } = this.state;
    if (disabled) {
      return;
    }
    if (!disabled && selected) {
      const selectedIndex = selectedDays.findIndex((selectedDay) =>
        DateUtils.isSameDay(selectedDay, day),
      );
      selectedDays.splice(selectedIndex, 1);
    } else {
      selectedDays.push(day);
    }
    this.setState({ selectedDays });
  }

  updateStartTime = (time) => {
    this.setState({ startTime: time });
  };

  updateEndTime = (time) => {
    this.setState({ endTime: time });
  };


  renderBottomBar() {

    // TODO: Implement isSaving and saved for bottomappbar prompts
    const { isSaving } = this.props;
    const { saved } = this.state;
    
    const { selectedDays, name } = this.state;
    const noSelectedDay = selectedDays.length === 0;

    let mainText;

    if (isSaving) {
      mainText = <>Saving&hellip;</>;
    } else if (saved) {
      mainText = <>Updated Settings!</>;
    }

    return (
      <BottomAppBar className={styles.bottomBar}>
        <div className={styles.bottomBarContent}>
          <Button
            className={styles.submitButton}
            onClick={this.handleSubmit}
            disabled={
              noSelectedDay ||
              cleanName(name).length === 0 ||
              this.state.startTime === null ||
              this.state.endTime === null
            }
            icon={<MaterialIcon icon="arrow_forward" />}
            raised
          >
            Update
      </Button>
          <span className={styles.mainText}>{mainText}</span>
        </div>
      </BottomAppBar>
    );
  }

  render() {
    const today = new Date();
    const { selectedDays, name } = this.state;

    return (
      <div id={styles.pageContainer}>
        <form>
          <section className={styles.formSection}>
            <p>Change the Meeting's name</p>
            <TextField label="Change the Meeting's name" className={styles.formInput} outlined>
              <Input
                type="text"
                name="name"
                value={name}
                autoComplete="off"
                onChange={this.handleInputChange}
              />
            </TextField>
          </section>
          <section className={styles.formSection}>
            <div className={styles.noFocus}>
              <p>Change to one or more dates for your meeting.</p>
              <DayPicker
                fromMonth={today}
                numberOfMonths={2}
                disabledDays={{ before: today }}
                selectedDays={selectedDays}
                onDayClick={this.handleDayClick}
              />
            </div>
          </section>
          <p className={styles.center}>Update the start and end time for each day</p>
          <TimePicker
            updateStartTime={this.updateStartTime}
            updateEndTime={this.updateEndTime}
            interval={this.state.interval}
            startTime={this.state.startTime}
            endTime={this.state.endTime}
          />
          {this.renderBottomBar()}
        </form>
      </div>
    );
  }
}

export default EditShowPage;
