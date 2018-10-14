import React, { Component } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import _ from 'lodash';
import Timeline from './Timeline';
import { respondentToUserIdOrName, respondentsToDict } from '../utils/response';
import { datesFromRange } from '../utils/datetime';

import styles from './ShowResults.module.scss';

function ShowAttendees({ respondents, renderableRespondents, time }) {
  const respondersRespondentsObj = _.zipObject(
    respondents.map(respondentToUserIdOrName),
    respondents,
  );
  const responders = Object.keys(respondersRespondentsObj);
  const respondersAtTime = new Set(renderableRespondents.get(time));

  const [attending, possiblyNotAttending] = _.partition(responders, (r) => respondersAtTime.has(r));
  // TODO: Partition possiblyNotAttending further into non-responses and not attendings
  const notAttending = possiblyNotAttending;

  // TODO: Display respondents differently depending on whether the user is
  // logged in, has admin rights, and whether the respondent has responded
  function renderRespondent(responder, respondent) {
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;
    return <li key={responder}>{displayName}</li>;
  }

  return (
    <div className="col-4">
      <section className={classnames(styles.attendees, 'flex-item')}>
        {time ? (
          <h2 className={styles.pollTime}>{moment(time).format('Do MMM YYYY hh:mma')}</h2>
        ) : null}
        <section id="attending">
          <h3>Attending</h3>
          <ol>
            {attending.map((responder) => {
              const respondent = respondersRespondentsObj[responder];
              return renderRespondent(responder, respondent);
            })}
          </ol>
        </section>
        <section id="notAttending">
          <h3>Not Attending</h3>
          <ol>
            {notAttending.map((responder) => {
              const respondent = respondersRespondentsObj[responder];
              return renderRespondent(responder, respondent);
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

    const respondents = show.respondents || [];
    const renderableRespondents = respondentsToDict(respondents);

    const calcMaxSelectable = () => {
      let max = 0;
      for (let r of renderableRespondents.values()) {
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
          respondents={respondents}
          maxSelectable={maxSelectable}
          onCellHover={this.handleCellHover}
        />
        <ShowAttendees
          respondents={respondents}
          renderableRespondents={renderableRespondents}
          time={selectedTime}
        />
      </div>
    );
  }
}

export default ShowResults;
