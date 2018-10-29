import React from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import MaterialIcon from '@material/react-material-icon';
import List, { ListItem, ListItemText, ListItemGraphic } from '@material/react-list';

import styles from './ShowResultsSidebar.module.scss';

function ShowAttendees({ partitionedRespondents, time }) {
  const { attending, notAttending, respondersRespondentsObj } = partitionedRespondents;

  // TODO: Display respondents differently depending on whether the user is
  // logged in, has admin rights, and whether the respondent has responded
  function renderRespondent(responder, respondent, attending) {
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;

    return (
      <ListItem>
        <ListItemGraphic graphic={<MaterialIcon icon='account_circle'/>} />
        <ListItemText
          className={styles.listText}
          primaryText={displayName}
          secondaryText={respondent.user ? respondent.user.email : 'Anonymous User'}
          //TODO: add button press callback, dropdown menu
          onClick={() => {}}
        />
      </ListItem>
    );
  }

  return (
    <div className={styles.sidebarContainer}>
      <section className={styles.attendees}>
        {time ? <h2 className={styles.pollTime}>{format(time, 'D MMM hh:mmA')}</h2> : null}
        <section className={styles.attendeeListSection}>
          <h3>Attending</h3>
          <List twoLine>
            {attending.map((responder) => {
              const respondent = respondersRespondentsObj[responder];
              return renderRespondent(responder, respondent, true);
            })}
          </List>
        </section>
        <section className={styles.attendeeListSection}>
          <h3>Not Attending</h3>
          <List twoLine>
            {notAttending.map((responder) => {
              const respondent = respondersRespondentsObj[responder];
              return renderRespondent(responder, respondent, false);
            })}
          </List>
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
