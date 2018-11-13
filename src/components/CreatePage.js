import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import { Mutation } from 'react-apollo';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import queryString from 'query-string';
import gql from 'graphql-tag';

import Button from '@material/react-button';
import Card from '@material/react-card';
import MaterialIcon from '@material/react-material-icon';
import TextField, { Input } from '@material/react-text-field';

import { getAuthInput } from '../utils/auth';
import { cleanName } from '../utils/string';
import Loading from './errorsLoaders/Loading';
import BottomAppBar from './BottomAppBar';
import TimePicker from './TimePicker';

import styles from './CreatePage.module.scss';

class CreatePage extends Component {
  constructor(props) {
    super(props);
    const { name } = queryString.parse(props.location.search);
    this.state = {
      name: name || '',
      selectedDays: [],
      interval: 15,
      startTime: null,
      endTime: null,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
  }

  handleSubmit(event) {
    const { name, selectedDays, interval, startTime, endTime } = this.state;
    this.props.createShow(cleanName(name), selectedDays, startTime, endTime, interval);
    event.preventDefault();
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

  updateStartTime = (date) => {
    this.setState({ startTime: date });
  };

  updateEndTime = (date) => {
    this.setState({ endTime: date });
  };

  updateInterval = (interval) => {
    this.setState({ interval: interval });
  };

  render() {
    const {
      createShowResult: { loading, data, error },
    } = this.props;
    const { selectedDays, name } = this.state;
    const noSelectedDay = selectedDays.length === 0;

    if (loading) {
      // TODO: Beautify
      return <Loading text="Creating" />;
    } else if (data) {
      return (
        <Redirect
          to={{
            pathname: `/meeting/${data.createNewShow.slug}`,
            state: { inviteImmediately: true },
          }}
        />
      );
    } else {
      // Not loading. Render form
      // TODO: Display error if it exists
      if (error) {
        console.log('Show creation got error', error);
      }

      // TODO: uncomment following lines if want to show last few months
      // const lastMonth = new Date();
      // lastMonth.setMonth(lastMonth.getMonth() - 2);
      const today = new Date();

      // TODO: Validate input and disable submit button if necessary
      return (
        <div id={styles.pageContainer}>
          <section>
            <h1 id={styles.header}>Create a new Meeting</h1>
          </section>
          <form>
            <section className={styles.formSection}>
              <Card>
                <TextField label="What are you meeting for?" className={styles.formInput}>
                  <Input
                    type="text"
                    name="name"
                    value={name}
                    autoComplete="off"
                    onChange={this.handleInputChange}
                  />
                </TextField>
              </Card>
            </section>
            <section className={styles.formSection}>
              <Card>
                <div className={styles.noFocus}>
                  <p>Select one or more dates for your meeting.</p>
                  <DayPicker
                    fromMonth={today}
                    numberOfMonths={2}
                    disabledDays={{ before: today }}
                    selectedDays={selectedDays}
                    onDayClick={this.handleDayClick}
                  />
                </div>
              </Card>
            </section>
            <TimePicker
              updateStartTime={this.updateStartTime}
              updateEndTime={this.updateEndTime}
              updateInterval={this.updateInterval}
              interval={this.state.interval}
            />
            <BottomAppBar>
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
                  Create
                </Button>
              </div>
            </BottomAppBar>
          </form>
        </div>
      );
    }
  }
}

const CREATE_NEW_SHOW_MUTATION = gql`
  mutation CreateNewShow(
    $name: String!
    $dates: [DateTime!]
    $startTime: DateTime!
    $endTime: DateTime!
    $interval: Int!
    $auth: AuthInput
  ) {
    createNewShow(
      auth: $auth
      data: {
        name: $name
        dates: $dates
        startTime: $startTime
        endTime: $endTime
        interval: $interval
      }
    ) {
      slug
    }
  }
`;

export default withAlert((props) => (
  <Mutation mutation={CREATE_NEW_SHOW_MUTATION}>
    {(createNewShow, result) => (
      <CreatePage
        {...props}
        createShow={async (name, dates, startTime, endTime, interval) => {
          const auth = await getAuthInput();
          createNewShow({ variables: { name, dates, startTime, endTime, interval, auth } });
        }}
        createShowResult={result}
      />
    )}
  </Mutation>
));
