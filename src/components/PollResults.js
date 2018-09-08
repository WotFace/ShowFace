import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Timeline from './Timeline';

function datesFromRange({ startDate, endDate }) {
  const timestamps = _.range(startDate.seconds, endDate.seconds, 86400);
  timestamps.push(endDate.seconds); // As _.range excludes endDate, we need to add it back
  return timestamps.map((timestamp) => moment.unix(timestamp));
}

const PollResults = ({ poll }) => {
  const allowedDates = datesFromRange(poll.dateRange);
  const responses = poll.responses;
  return (
    <Timeline
      allowedDates={allowedDates}
      startTime={moment().startOf('day')}
      endTime={moment().endOf('day')}
      responses={responses}
      onSelect={() => {}}
      onDeselect={() => {}}
    />
  );
};

export default PollResults;
