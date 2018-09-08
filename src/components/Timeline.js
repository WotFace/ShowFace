import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import './Timeline.css';

// Props
// allowedDates
// startTime, endTime
// responses

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

const TimeBox = ({ date, range, selected, responseCount, onMouseDown, onMouseMove, onMouseUp }) => {
  const { startTime, endTime } = range;
  // {startTime.format('lll')} - {endTime.format('h:mm')}
  return (
    <div
      className={`Timeline-TimeBox${selected ? ' Timeline-TimeBox-selected' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
};

const DragStateEnum = Object.freeze({
  none: 0,
  dragSelecting: 1,
  dragCanceling: 2,
});

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragState: DragStateEnum.none,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  handleMouseEvent(range, shouldStart) {
    let dragState = this.state.dragState;
    if (shouldStart) {
      // TODO: Set drag state properly
      // const isSelected = isSelected(range);
      const isSelected = false;
      dragState = isSelected ? DragStateEnum.dragCanceling : DragStateEnum.dragSelecting;
      this.setState({ dragState });
    }

    switch (dragState) {
      case DragStateEnum.dragSelecting:
        console.log('Select', range.startTime.toISOString());
        this.props.onSelect(range.startTime);
        break;
      case DragStateEnum.dragCanceling:
        console.log('Cancel', range.startTime.toISOString());
        break;
    }
  }

  render() {
    const { allowedDates, startTime, endTime, responses } = this.props;

    const timeRanges = getTimeRanges(startTime, endTime);

    const rows = timeRanges.map((range) => {
      return (
        <React.Fragment key={range.startTime.toISOString() + range.endTime.toISOString()}>
          <Tick range={range} />
          {allowedDates.map((date) => {
            const dateRange = moveTimeRangeToDate(date, range);
            return (
              <TimeBox
                date={date}
                range={dateRange}
                key={dateRange.startTime.toISOString() + dateRange.endTime.toISOString()}
                onMouseDown={() => this.handleMouseEvent(dateRange, true)}
                onMouseMove={() => this.handleMouseEvent(dateRange, false)}
                onMouseUp={() => this.setState({ dragState: DragStateEnum.none })}
              />
            );
          })}
        </React.Fragment>
      );
    });

    const headerCells = allowedDates.map((date) => <DateHeader date={date} key={date} />);

    return (
      <div
        className="Timeline"
        style={{ gridTemplateColumns: `auto repeat(${allowedDates.length}, 1fr)` }}
        onMouseLeave={() => this.setState({ dragState: DragStateEnum.none })}
      >
        <span className="Timeline-filler" />
        {headerCells}
        {rows}
      </div>
    );
  }
}

export default Timeline;
