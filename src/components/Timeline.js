import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import './Timeline.css';

// Props
// allowedDates
// startTime, endTime
// responses

const Tick = ({ range }) => {
  const { startTime, endTime } = range;
  const format = 'h:mm';
  return (
    <span className="Timeline-Tick">
      {startTime.format(format)} - {endTime.format(format)}
    </span>
  );
};

const DateHeader = ({ date }) => {
  return <h4>{date.format('L')}</h4>;
};

const TimeBox = ({ date, range, responses }) => {
  const { startTime, endTime } = range;
  return (
    <div className="Timeline-TimeBox">
      {startTime.format('lll')} - {endTime.format('h:mm')}
    </div>
  );
};

function getTimeRanges(startTime, endTime) {
  const numMin = moment.duration(endTime.diff(startTime)).asMinutes();
  const mins = _.range(0, _.round(numMin), 15);
  const startTimes = mins.map((min) => startTime.clone().add(min, 'minutes'));
  const endTimes = startTimes.slice(1);
  endTimes.push(endTime);
  const ranges = _.zipWith(startTimes, endTimes, (startTime, endTime) => ({ startTime, endTime }));
  return ranges;
}

function moveTimeRangeToDate(date, range) {
  const { startTime, endTime } = range;
  return {
    startTime: startTime.clone().dayOfYear(date.dayOfYear()),
    endTime: endTime.clone().dayOfYear(date.dayOfYear()),
  };
}

class Timeline extends Component {
  render() {
    const { allowedDates, startTime, endTime, responses } = this.props;

    const timeRanges = getTimeRanges(startTime, endTime);

    const rows = timeRanges.map((range) => {
      return (
        <React.Fragment key={range.startTime.toISOString() + range.endTime.toISOString()}>
          <Tick range={range} />
          {allowedDates.map((date) => (
            <TimeBox
              date={date}
              range={moveTimeRangeToDate(date, range)}
              key={date.toISOString() + range.startTime.toISOString() + range.endTime.toISOString()}
            />
          ))}
        </React.Fragment>
      );
    });

    const headerCells = allowedDates.map((date) => <DateHeader date={date} key={date} />);

    return (
      <div
        className="Timeline"
        style={{ gridTemplateColumns: `auto repeat(${allowedDates.length}, 1fr)` }}
      >
        <span className="Timeline-filler" />
        {headerCells}
        {rows}
      </div>
    );
  }
}

export default Timeline;
