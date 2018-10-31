import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import DayPicker, { DateUtils } from 'react-day-picker';
import Card from '@material/react-card';
import 'react-day-picker/lib/style.css';
import { Mutation } from 'react-apollo';
import queryString from 'query-string';
import { startOfToday, endOfToday } from 'date-fns';
import gql from 'graphql-tag';
import { getAuthInput } from '../utils/auth';
import { cleanName } from '../utils/string';
import Loading from './Loading';

import styles from './CreatePage.module.scss';

import TextField, { Input } from '@material/react-text-field';
import Button from '@material/react-button';
import BottomAppBar from './BottomAppBar';

class CreatePage extends Component {
  constructor(props) {
    super(props);
    const { name } = queryString.parse(props.location.search);
    this.state = {
      name: name || '',
      selectedDays: [],
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
  }

  handleSubmit(event) {
    // TODO: Add interval option to UI and retrieve from state
    const interval = 15;
    const { name, selectedDays } = this.state;
    const startTime = startOfToday();
    const endTime = endOfToday();
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
      return <Redirect to={`/meeting/${data.createNewShow.slug}`} />;
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
                    disabledDays={{ before: today }}
                    selectedDays={selectedDays}
                    onDayClick={this.handleDayClick}
                  />
                </div>
              </Card>
            </section>
            <BottomAppBar>
              <div className={styles.bottomBarContent}>
                <Button
                  className={styles.submitButton}
                  onClick={this.handleSubmit}
                  disabled={noSelectedDay || cleanName(name).length === 0}
                  raised
                >
                  Submit
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
