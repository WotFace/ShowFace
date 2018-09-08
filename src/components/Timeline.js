import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import responsesToDict from '../utils/response';
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
  return dateTime.dayOfYear(date.dayOfYear());
}

const Tick = ({ startTime }) => {
  const format = 'h:mm';
  return <span className="Timeline-Tick">{startTime.format(format)}</span>;
};

const DateHeader = ({ date }) => {
  return <h4 className="date-heading">{date.format('DD/MM')}</h4>;
};

class TimeBox extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    const keysToOmit = ['onMouseDown', 'onMouseMove', 'onMouseUp'];
    const yes = !_.isEqual(_.omit(this.props, keysToOmit), _.omit(nextProps, keysToOmit));
    // yes && console.log('BLAH');
    return yes;
  }

  render() {
    const { date, selected, responseCount, onMouseDown, onMouseMove, onMouseUp } = this.props;

    return (
      <div
        className={`Timeline-TimeBox${selected ? ' Timeline-TimeBox-selected' : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
    );
  }
}

const DragStateEnum = Object.freeze({
  none: 0,
  dragSelecting: 1,
  dragDeselecting: 2,
});

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragState: DragStateEnum.none,
    };
  }

  isSelected(startTime) {
    const responsesForDate = this.renderableResponses[startTime] || new Set();
    return responsesForDate.has(this.props.name);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  handleMouseEvent(startTime, shouldStart) {
    let dragState = this.state.dragState;
    const startMoment = moment(startTime);
    if (shouldStart) {
      const isSelected = this.isSelected(startTime);
      dragState = isSelected ? DragStateEnum.dragDeselecting : DragStateEnum.dragSelecting;
      this.setState({ dragState });
    }

    switch (dragState) {
      case DragStateEnum.dragSelecting:
        // console.log('Select', startMoment.toISOString());
        this.props.onSelect(startMoment);
        break;
      case DragStateEnum.dragDeselecting:
        // console.log('Deselect', startMoment.toISOString());
        this.props.onDeselect(startMoment);
        break;
    }
  }

  render() {
    const { allowedDates, startTime, endTime, responses, name } = this.props;

    const startTimes = getStartTimes(startTime, endTime);

    this.renderableResponses = responsesToDict(responses || {});

    const rows = startTimes.map((time) => {
      return (
        <React.Fragment key={`row ${time.toISOString()}`}>
          <Tick startTime={time} />
          {allowedDates.map((date) => {
            const startMomentWithDate = moveDateTimeToDate(date, time);
            const startTimeWithDate = startMomentWithDate.toDate();

            return (
              <TimeBox
                date={date.toDate()}
                startTime={startTimeWithDate}
                key={`timebox ${startMomentWithDate.toISOString()}`}
                selected={this.isSelected(startTimeWithDate)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  this.handleMouseEvent(startTimeWithDate, true);
                }}
                onMouseMove={(e) => {
                  e.preventDefault();
                  this.handleMouseEvent(startTimeWithDate, false);
                }}
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
