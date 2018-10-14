import React, { Component } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { isWithinRange } from 'date-fns';
import _ from 'lodash';
import memoize from 'memoize-one';
import { respondentsToDict } from '../utils/response';
import DateMap from '../utils/DateMap';
import styles from './Timeline.module.scss';

// Return start times between 2 times
const getStartTimes = memoize(
  (startTime, endTime) => {
    const numMin = moment.duration(endTime.diff(startTime)).asMinutes();
    const mins = _.range(0, _.round(numMin), 15);
    const startTimes = mins.map((min) => startTime.clone().add(min, 'minutes'));
    return startTimes;
  },
  (newTime, oldTime) => newTime.isSame(oldTime),
);

// All start times on all allowedDates
const getAllStartTimes = memoize(
  (startTimes, allowedDates) => {
    return new DateMap(
      _.zip(
        startTimes,
        startTimes.map((time) => {
          return new DateMap(
            _.zip(
              allowedDates,
              allowedDates.map((date) => moveDateTimeToDate(date, time).toDate()),
            ),
          );
        }),
      ),
    );
  },
  (newTimes, oldTimes) =>
    _.zip(newTimes, oldTimes)
      .map(([newTime, oldTime]) => newTime.isSame(oldTime))
      .includes(true),
);

function moveDateTimeToDate(date, dateTime) {
  return dateTime.clone().set({ year: date.year(), month: date.month(), date: date.date() });
}

function Tick({ startTime }) {
  const format = 'h:mm';
  return (
    <span className={classnames(styles.tick, styles.timelineLabel)}>
      {startTime.format(format)}
    </span>
  );
}

function DateHeader({ date }) {
  return (
    <span className={classnames(styles.dateHeading, styles.timelineLabel)}>
      {date.format('DD/MM')}
    </span>
  );
}

class TimeBox extends Component {
  // Dates can't be compared correctly by React.PureComponent. We subclass
  // React.Component instead and diff the props ourselves to prevent
  // unnecessary renders.
  shouldComponentUpdate(nextProps) {
    const keysToOmit = ['startTimeWithDate'];
    const shouldUpdate =
      // Update if any non-date prop changes
      !_.isEqual(_.omit(this.props, keysToOmit), _.omit(nextProps, keysToOmit)) ||
      // Update if date changes. Dates are assumed to be native Date objects.
      +this.props.startTimeWithDate !== +nextProps.startTimeWithDate;
    return shouldUpdate;
  }

  getLightnessValue(maxSelectable, count) {
    return Math.floor(100 - (65 / maxSelectable) * count);
  }

  handleMouseEvent = (callbackFn) => (e) => callbackFn(this.props.startTimeWithDate, e);
  handleMouseDown = this.handleMouseEvent(this.props.onMouseDown);
  handleMouseMove = this.handleMouseEvent(this.props.onMouseMove);
  handleMouseUp = this.handleMouseEvent(this.props.onMouseUp);
  handleMouseEnter = this.handleMouseEvent(this.props.onMouseEnter);

  render() {
    const { responseCount, maxSelectable, isSelecting, isDeselecting } = this.props;

    const lightness = this.getLightnessValue(maxSelectable, responseCount);
    const divStyle = {
      backgroundColor: `hsla(107, 60%, ${lightness}%, 1)`,
    };

    return (
      <div
        className={classnames(
          styles.timeBox,
          isSelecting && styles.selecting,
          isDeselecting && styles.deselecting,
        )}
        style={divStyle}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseEnter={this.handleMouseEnter}
      />
    );
  }
}

const DragStateEnum = Object.freeze({
  none: 0,
  dragSelecting: 1,
  dragDeselecting: 2,
});

// Props
// allowedDates
// startTime, endTime
// respondents
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

  isSelected(startTime) {
    const responsesForDate = this.renderableResponses.get(startTime) || new Set();
    return responsesForDate.has(this.props.name);
  }

  getResponseCount(startTime) {
    const responsesForDate = this.renderableResponses.get(startTime) || new Set();
    return responsesForDate.size;
  }

  selectingDates(allStartTimes) {
    const { dragState, dragStartTime, dragCurrentTime } = this.state;
    if (dragState === DragStateEnum.none || !dragStartTime || !dragCurrentTime) return [];

    // To check if start time's *date* is between dragStartTime and dragCurrentTime
    let date1;
    let date2;
    const nullifyTime = (date) => new Date(date).setHours(0, 0, 0, 0);
    date1 = nullifyTime(dragStartTime);
    date2 = nullifyTime(dragCurrentTime);
    if (date1 > date2) {
      const tmp = date2;
      date2 = date1;
      date1 = tmp;
    }

    // To check if start time's *time* is between dragStartTime and dragCurrentTime
    let time1;
    let time2;
    const nullifyDate = (date) => new Date(date).setFullYear(0, 0, 1);
    time1 = nullifyDate(dragStartTime);
    time2 = nullifyDate(dragCurrentTime);
    if (time1 > time2) {
      const tmp = time2;
      time2 = time1;
      time1 = tmp;
    }

    const selectings = [];
    for (let dates of allStartTimes.values()) {
      for (let date of dates.values()) {
        const thisDate = nullifyTime(date);
        const thisTime = nullifyDate(date);
        if (isWithinRange(thisDate, date1, date2) && isWithinRange(thisTime, time1, time2)) {
          selectings.push(date);
        }
      }
    }

    return selectings;
  }

  handleMouseEvent(startTime, shouldStart) {
    let dragState = this.state.dragState;
    // const startMoment = moment(startTime);
    if (shouldStart && this.props.name && this.state.dragState === DragStateEnum.none) {
      const isSelected = this.isSelected(startTime);
      dragState = isSelected ? DragStateEnum.dragDeselecting : DragStateEnum.dragSelecting;
      this.setState({ dragState, dragStartTime: startTime, dragCurrentTime: startTime });
    }

    if (this.state.dragState !== DragStateEnum.none) {
      this.setState({ dragCurrentTime: startTime });
    }
  }

  handleMouseDown = (startTimeWithDate, e) => {
    e.preventDefault();
    this.handleMouseEvent(startTimeWithDate, true);
  };

  handleMouseMove = (startTimeWithDate, e) => {
    e.preventDefault();
    this.handleMouseEvent(startTimeWithDate, false);
  };

  handleMouseEnter = (startTimeWithDate) => {
    const { onCellHover } = this.props;
    onCellHover && onCellHover(startTimeWithDate);
  };

  handleMouseEnd = () => {
    // Calculate selected times and call callbacks
    const { onSelect, onDeselect, startTime, endTime, allowedDates } = this.props;
    const startTimes = getStartTimes(startTime, endTime);
    const allStartTimes = getAllStartTimes(startTimes, allowedDates);
    const selectingDates = this.selectingDates(allStartTimes);
    switch (this.state.dragState) {
      case DragStateEnum.dragSelecting:
        onSelect && onSelect(selectingDates);
        break;
      case DragStateEnum.dragDeselecting:
        onDeselect && onDeselect(selectingDates);
        break;
      default:
        break;
    }

    this.setState({
      dragState: DragStateEnum.none,
      dragStartTime: null,
      dragCurrentTime: null,
    });
  };

  render() {
    const { allowedDates, startTime, endTime, respondents, maxSelectable, dragState } = this.props;

    const startTimes = getStartTimes(startTime, endTime);
    const allStartTimes = getAllStartTimes(startTimes, allowedDates);
    this.renderableResponses = respondentsToDict(respondents);
    const selectingDates = this.selectingDates(allStartTimes);

    const rows = startTimes.map((time) => {
      return (
        <React.Fragment key={`row ${time.valueOf()}`}>
          <Tick startTime={time} />
          {allowedDates.map((date) => {
            const startTimeWithDate = allStartTimes.get(time).get(date);
            const isSelecting = selectingDates.includes(startTimeWithDate);
            return (
              <TimeBox
                startTimeWithDate={startTimeWithDate}
                key={`timebox ${startTimeWithDate.getTime()}`}
                maxSelectable={maxSelectable}
                isSelecting={isSelecting && dragState === DragStateEnum.dragSelecting}
                isDeselecting={isSelecting && dragState === DragStateEnum.dragDeselecting}
                responseCount={this.getResponseCount(startTimeWithDate)}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseEnd}
                onMouseEnter={this.handleMouseEnter}
              />
            );
          })}
        </React.Fragment>
      );
    });

    const headerCells = allowedDates.map((date) => <DateHeader date={date} key={date} />);

    return (
      <section id="timeline" className="flex-container">
        <div
          className={classnames(styles.timeline)}
          style={{ gridTemplateColumns: `auto repeat(${allowedDates.length}, 1fr)` }}
          onMouseLeave={this.handleMouseEnd}
        >
          <span className="Timeline-filler" />
          {headerCells}
          {rows}
        </div>
      </section>
    );
  }
}

export default Timeline;
