import React from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import MaterialIcon from '@material/react-material-icon';

import styles from './ShowResultsSidebar.module.scss';

function ShowAttendees({ partitionedRespondents, time }) {
  const { attending, notAttending, respondersRespondentsObj } = partitionedRespondents;

  // TODO: Display respondents differently depending on whether the user is
  // logged in, has admin rights, and whether the respondent has responded
  function renderRespondent(responder, respondent, attending) {
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;
    return (
      <div
        className={classnames(
          styles.respondents,
          attending ? styles.borderAccept : styles.borderReject,
        )}
        key={responder}
      >
        {displayName}
        <MaterialIcon icon="visibility" className={styles.icon} onClick={() => {}} />
      </div>
    );
  }

  return (
    <div>
      <section className={classnames(styles.attendees, 'flex-item')}>
        {time ? <h2 className={styles.pollTime}>{format(time, 'D MMM hh:mmA')}</h2> : null}
        <section id="attending">
          <h3>Shows</h3>
          {attending.map((responder) => {
            const respondent = respondersRespondentsObj[responder];
            return renderRespondent(responder, respondent, true);
          })}
        </section>
        <section id="notAttending">
          <h3>No Shows</h3>
          {notAttending.map((responder) => {
            const respondent = respondersRespondentsObj[responder];
            return renderRespondent(responder, respondent, false);
          })}
        </section>
      </section>
    </div>
  );
}

export default function ShowResultsSidebar({ className, partitionedRespondents, time }) {
  return (
    <div className={className}>
      <ShowAttendees partitionedRespondents={partitionedRespondents} time={time} />
    </div>
  );
}
