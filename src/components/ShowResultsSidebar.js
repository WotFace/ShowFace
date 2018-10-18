import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import _ from 'lodash';
import { respondentToEmailOrName } from '../utils/response';

import styles from './ShowResultsSidebar.module.scss';

function ShowAttendees({ respondents, renderableRespondents, time }) {
  const respondersRespondentsObj = _.zipObject(
    respondents.map(respondentToEmailOrName),
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
    <div>
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

export default function ShowResultsSidebar({
  className,
  respondents,
  renderableRespondents,
  time,
}) {
  return (
    <div className={className}>
      <ShowAttendees
        respondents={respondents}
        renderableRespondents={renderableRespondents}
        time={time}
      />
    </div>
  );
}
