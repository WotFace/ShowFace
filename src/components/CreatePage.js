import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import classnames from 'classnames';
import { Mutation } from 'react-apollo';
import ReactLoading from 'react-loading';
import { startOfToday, endOfToday } from 'date-fns';
import gql from 'graphql-tag';
import { getAuthInput } from '../utils/auth';

import styles from './CreatePage.module.scss';

import TextField, { Input } from '@material/react-text-field';
import Button from '@material/react-button';
import BottomAppBar from './BottomAppBar';

class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      selectedDays: [],
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
  }

  handleSubmit(event) {
    console.log('handling');
    // TODO: Add interval option to UI and retrieve from state
    const interval = 15;
    const { name, selectedDays } = this.state;
    const startTime = startOfToday();
    const endTime = endOfToday();
    this.props.createShow(name, selectedDays, startTime, endTime, interval);
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

  renderContent() {
    const {
      createShowResult: { loading, data, error },
    } = this.props;
    const hasSelectedDay = this.state.selectedDays.length === 0;

    if (loading) {
      // TODO: Beautify
      return (
        <section className="full-page flex">
          <h2>Creating</h2>
          <ReactLoading type="bubbles" color="#111" />
        </section>
      );
    } else if (data) {
      return <Redirect to={`/show/${data.createNewShow.slug}`} />;
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
          <section id={styles.form_header}>
            <h1 id={styles.header}>Create a new Meeting</h1>
          </section>
          <section>
            <div className={styles.create_page_form}>
              <form>
                <div className={styles.formGroup}>
                  <TextField label="Meet for what?" className={styles.form_input} disabled>
                    <Input
                      type="text"
                      name="name"
                      value={this.state.name}
                      autoComplete="off"
                      onChange={this.handleInputChange}
                    />
                  </TextField>
                </div>
                <div className={styles.formGroup}>
                  <DayPicker
                    fromMonth={today}
                    disabledDays={{ before: today }}
                    selectedDays={this.state.selectedDays}
                    onDayClick={this.handleDayClick}
                  />
                </div>
              </form>
              <BottomAppBar>
                <Button className={styles.submitButton} onClick={this.handleSubmit} raised>
                  Submit
                </Button>
              </BottomAppBar>
            </div>
          </section>
        </div>
      );
    }
  }

  render() {
    return (
      <div className={classnames(styles.container, 'container')}>
        <section>
          <div>{this.renderContent()}</div>
          <div id={styles.appBarBottom} />
        </section>
      </div>
    );
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
