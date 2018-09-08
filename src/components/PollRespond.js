import React from 'react';
import moment from 'moment';
import Timeline from './Timeline';

const PollRespond = ({ poll }) => {
  const allowedDates = [moment().subtract(2, 'days'), moment().subtract(1, 'days')];
  return (
    <React.Fragment>
      <h2>Responde to {poll.name}</h2>
      <Timeline
        allowedDates={allowedDates}
        startTime={moment().startOf('day')}
        endTime={moment().endOf('day')}
        responses={[]}
      />
    </React.Fragment>
  );
};

export default PollRespond;
