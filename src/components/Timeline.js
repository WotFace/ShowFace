import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import './Timeline.css';

// Props
// allowedDates
// startTime, endTime
// responses

function getStartTimes(startTime, endTime) {
  const numMin = moment.duration(endTime.diff(startTime)).asMinutes();
  const mins = _.range(0, _.round(numMin), 15);
  const startTimes = mins.map((min) => startTime.clone().add(min, 'minutes'));
  return startTimes;
}

function moveDateTimeToDate(date, dateTime) {
  return dateTime.clone().dayOfYear(date.dayOfYear());
}

const Tick = ({ startTime }) => {
  const format = 'h:mm';
  return <span className="Timeline-Tick">{startTime.format(format)}</span>;
};

const DateHeader = ({ date }) => {
  return <h4>{date.format('L')}</h4>;
};

const TimeBox = ({
  date,
  startTime,
  selected,
  responseCount,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
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

  handleMouseEvent(startTime, shouldStart) {
    let dragState = this.state.dragState;
    if (shouldStart) {
      // TODO: Set drag state properly
      // const isSelected = isSelected(startTime);
      const isSelected = false;
      dragState = isSelected ? DragStateEnum.dragCanceling : DragStateEnum.dragSelecting;
      this.setState({ dragState });
    }

    switch (dragState) {
      case DragStateEnum.dragSelecting:
        console.log('Select', startTime.toISOString());
        setTimeout(() => this.props.onSelect(startTime), 0);
        break;
      case DragStateEnum.dragCanceling:
        console.log('Cancel', startTime.toISOString());
        break;
    }
  }

  render() {
    const { allowedDates, startTime, endTime, responses } = this.props;

    const startTimes = getStartTimes(startTime, endTime);

    const rows = startTimes.map((time) => {
      return (
        <React.Fragment key={`row ${time.toISOString()}`}>
          <Tick startTime={time} />
          {allowedDates.map((date) => {
            const startTimeWithDate = moveDateTimeToDate(date, time);
            return (
              <TimeBox
                date={date}
                startTime={startTimeWithDate}
                key={`timebox ${startTimeWithDate.toISOString()}`}
                onMouseDown={() => this.handleMouseEvent(startTimeWithDate, true)}
                onMouseMove={() => this.handleMouseEvent(startTimeWithDate, false)}
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
