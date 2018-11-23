import React, { Component } from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { withRouter } from 'react-router-dom';

import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import TextField, { Input } from '@material/react-text-field';

import { cleanName } from '../../utils/string';
import BottomAppBar from '../common/BottomAppBar';
import TimePicker from '../common/TimePicker';

import styles from './EditShowPage.module.scss';
import errorStyles from '../common/errors-loaders/ErrorsLoaders.module.scss';

class EditShowPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.show.name,
      selectedDays: this.props.show.dates,
      startTime: this.props.show.startTime,
      endTime: this.props.show.endTime,
      interval: this.props.show.interval,
      hasChanged: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
  }

  updateBottomBar() {
    this.setState({ saved: false });
    this.setState({ hasChanged: true });
  }

  handleSubmit(event) {
    const { name, selectedDays, startTime, endTime, interval } = this.state;
    this.props.updateShow(cleanName(name), selectedDays, startTime, endTime, interval);
    this.setState({ saved: true });
    this.setState({ hasChanged: false });
    event.preventDefault();
  }

  handleInputChange(event) {
    this.updateBottomBar();
    this.setState({ [event.target.name]: event.target.value });
  }

  handleDayClick(day, { selected, disabled }) {
    this.updateBottomBar();
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
    this.updateBottomBar();
    this.setState({ startTime: time });
  };

  updateEndTime = (time) => {
    this.updateBottomBar();
    this.setState({ endTime: time });
  };

  renderBottomBar() {
    // TODO: Implement isSaving and saved for bottomappbar prompts
    const { saved, hasChanged } = this.state;

    const { selectedDays, name } = this.state;
    const noSelectedDay = selectedDays.length === 0;

    let mainText = saved ? 'Updated Settings!' : '';
    return (
      <BottomAppBar className={styles.bottomBar}>
        <div className={styles.bottomBarContent}>
          <span className={styles.mainText}>{mainText}</span>
          <Button
            className={styles.submitButton}
            onClick={this.handleSubmit}
            disabled={
              !hasChanged &&
              (noSelectedDay ||
                cleanName(name).length === 0 ||
                this.state.startTime === null ||
                this.state.endTime === null)
            }
            icon={<MaterialIcon icon="arrow_upward" />}
            raised
          >
            Update
          </Button>
        </div>
      </BottomAppBar>
    );
  }

  handleLogIn = () => {
    // Show log in dialog/page, and make auth page redirect back to this page
    const { history } = this.props;
    history.push('/login', { from: history.location });
  };

  renderLoginPrompt = () => {
    return (
      <>
        <h2>You're not logged in!</h2>
        <div class={styles.textWithMargin}>Please log in to make changes to this poll.</div>
        <Button onClick={this.handleLogIn} outlined>
          Log In or Sign Up
        </Button>
      </>
    );
  };

  render() {
    const today = new Date();
    const { selectedDays, name, startTime, endTime, interval } = this.state;

    const contentIfAccessDisallowed = (
      <section className={errorStyles.container}>
        {this.props.isSignedIn ? (
          <>
            <h2>You're not the admin for this poll!</h2>
            <div>Please contact the admin of the poll if you want to make changes.</div>
          </>
        ) : (
          this.renderLoginPrompt()
        )}
      </section>
    );

    const contentIfAccessAllowed = (
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
          interval={interval}
          startTime={startTime}
          endTime={endTime}
        />
        {this.renderBottomBar()}
      </form>
    );

    return (
      <div id={styles.pageContainer}>
        {this.props.accessAllowed ? contentIfAccessAllowed : contentIfAccessDisallowed}
      </div>
    );
  }
}

export default withRouter(EditShowPage);
