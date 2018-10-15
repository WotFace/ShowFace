import React, { Component } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import _ from 'lodash';
import { kMaxRanges } from '../utils/bestTime';
import { respondentToUserIdOrName } from '../utils/response';

import styles from './ShowResultsSidebar.module.scss';

class BestTime extends Component {
  // TODO: Override shouldComponentUpdate to fix unnecessary renders
  render() {
    const { renderableRespondents, interval } = this.props;
    console.log('sntoe', renderableRespondents);

    const entries = Array.from(renderableRespondents.entries());
    entries.sort((a, b) => b[0] - a[0]);
    const intervalMs = interval * 60 * 1000;

    const dividedEntries = [];
    for (const entry of entries) {
      if (dividedEntries.length === 0) {
        dividedEntries.push(entry);
        continue;
      }

      const lastTime = dividedEntries[dividedEntries.length - 1][0];
      if (lastTime - entry[0] > intervalMs) {
        dividedEntries.push([0, Number.MIN_SAFE_INTEGER]);
      }
      dividedEntries.push(entry);
    }

    const sizes = dividedEntries.map(
      ([time, responders]) => (responders instanceof Set ? responders.size : responders),
    );
    const bestRanges = kMaxRanges(3, sizes);

    // TODO: Only process the stuff below for the selected best index
    // TODO: Clean up the fugly code below
    const bestTimes = bestRanges.map((r) => dividedEntries.slice(r.start, r.end + 1));
    const bestIntervals = bestTimes.map((t) => ({ start: t[t.length - 1][0], end: t[0][0] }));
    // TODO: Split into attendees who will arrive late, leave early, pop by, or stay throughout
    const bestAttendees = bestTimes.map(
      (interval) => new Set(_.flatten(interval.map((i) => Array.from(i[1])))),
    );
    console.log('snteo', bestIntervals, bestAttendees, bestTimes);

    const selectedBestInterval = bestIntervals[0];
    const selectedBestAttendees = bestAttendees[0];

    return (
      <div>
        Best time to meet
        {new Date(selectedBestInterval.start).toISOString()} to{' '}
        {new Date(selectedBestInterval.end).toISOString()}
      </div>
    );
  }
}

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

export default function ShowResultsSidebar({ respondents, renderableRespondents, time }) {
  // TODO: Pass in interval
  return (
    <div className="col-4">
      <BestTime renderableRespondents={renderableRespondents} interval={15} />
      <ShowAttendees
        respondents={respondents}
        renderableRespondents={renderableRespondents}
        time={time}
      />
    </div>
  );
}
