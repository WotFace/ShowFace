import React, { Component } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import Timeline from './Timeline';
import responsesToDict from '../utils/response';
import { datesFromRange } from '../utils/datetime';

import styles from './ShowResults.module.scss';

function ShowAttendees({ responses, allAttendees, time }) {
  let attendees = time ? responses.get(time) || [] : [];
  attendees = Array.from(attendees);
  const notAttending = allAttendees.filter((x) => !new Set(attendees).has(x));

  return (
    <div className="col-4">
      <section className={classnames(styles.attendees, 'flex-item')}>
        {time ? (
          <h2 className={styles.pollTime}>{moment(time).format('Do MMM YYYY hh:mma')}</h2>
        ) : null}
        <section id="attending">
          <h3>Attending</h3>
          <ol>
            {attendees.map((attendee) => {
              return <li key={attendee}>{attendee}</li>;
            })}
          </ol>
        </section>
        <section id="notAttending">
          <h3>Not Attending</h3>
          <ol>
            {notAttending.map((notAttendee) => {
              return <li key={notAttendee}>{notAttendee}</li>;
            })}
          </ol>
        </section>
      </section>
    </div>
  );
}

class ShowResults extends Component {
  state = {};
  handleCellHover = (selectedTime) => this.setState({ selectedTime });

  render() {
    const { show } = this.props;
    const { selectedTime } = this.state;
    const allowedDates = datesFromRange(show.startDate, show.endDate);

    const responses = show.responses || {};
    const allAttendees = Object.keys(responses);
    const renderableResponses = responsesToDict(responses);

    const calcMaxSelectable = () => {
      let max = 0;
      for (let r of renderableResponses.values()) {
        if (r.size > max) max = r.size;
      }
      return max;
    };
    const maxSelectable = calcMaxSelectable();

    return (
      <div>
        <Timeline
          allowedDates={allowedDates}
          startTime={moment().startOf('day')}
          endTime={moment().endOf('day')}
          responses={show.responses}
          maxSelectable={maxSelectable}
          onCellHover={this.handleCellHover}
        />
        <ShowAttendees
          responses={renderableResponses}
          allAttendees={allAttendees}
          time={selectedTime}
        />
      </div>
    );
  }
}

export default ShowResults;
