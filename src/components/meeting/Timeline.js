import React, { Component } from 'react';
import classnames from 'classnames';
import { isWithinRange, differenceInMinutes, addMinutes, format } from 'date-fns';
import _ from 'lodash';
import memoize from 'memoize-one';
import { respondentsToDict } from '../../utils/response';
import DateMap from '../../utils/DateMap';
import { disableMobileScroll, enableMobileScroll } from '../../utils/scrollToggle';
import HoldableDiv from '../helpers/HoldableDiv';
import styles from './Timeline.module.scss';

// Return start times between 2 times
const getStartTimes = memoize(
  (startTime, endTime, interval) => {
    const numMin = differenceInMinutes(endTime, startTime);
    const mins = _.range(0, _.round(numMin), interval);
    const startTimes = mins.map((min) => addMinutes(startTime, min));
    return startTimes;
  },
  (newTime, oldTime) => newTime === oldTime,
);

// All start times on all dates
const getAllStartTimes = memoize(
  (startTimes, dates) => {
    return new DateMap(
      _.zip(
        startTimes,
        startTimes.map((time) => {
          return new DateMap(_.zip(dates, dates.map((date) => moveDateTimeToDate(date, time))));
        }),
      ),
    );
  },
  (newTimes, oldTimes) =>
    _.zip(newTimes, oldTimes)
      .map(([newTime, oldTime]) => newTime === oldTime)
      .includes(true),
);

function moveDateTimeToDate(date, dateTime) {
  const newDate = new Date(dateTime);
  newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  return newDate;
}

const Tick = React.memo(({ startTime, hideByDefault }) => {
  const tickText = !hideByDefault ? format(startTime, 'h:mma') : null;
  return (
    <div className={classnames(styles.tick, styles.timelineLabel)}>
      <div className={styles.tickContent}>{tickText}</div>
    </div>
  );
});

const DateHeader = React.memo(({ date }) => {
  return (
    <span className={classnames(styles.dateHeading, styles.timelineLabel)}>
      {format(date, 'ddd')}
      <br />
      {format(date, 'D MMM')}
    </span>
  );
});

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

  handlePointerEvent = (callbackFn) => (e) => callbackFn(this.props.startTimeWithDate, e);
  handleLongPress = this.handlePointerEvent(this.props.onLongPress);
  handlePointerDown = this.handlePointerEvent(this.props.onPointerDown);
  handlePointerMove = this.handlePointerEvent(this.props.onPointerMove);
  handlePointerUp = this.handlePointerEvent(this.props.onPointerUp);
  handlePointerEnter = this.handlePointerEvent(this.props.onPointerEnter);
  handlePointerCancel = this.handlePointerEvent(this.props.onPointerCancel);

  // On some browsers, the component will automatically capture the pointer,
  // but we need the pointer events to be sent to the component that's under
  // the cursor.
  onGotPointerCapture = (e) => e.target.releasePointerCapture(e.pointerId);

  render() {
    const { responseCount, maxSelectable, isSelecting, isDeselecting, isOddCol } = this.props;

    const lightness = this.getLightnessValue(maxSelectable, responseCount);
    const divStyle =
      responseCount > 0
        ? {
            backgroundColor: `hsl(107, 60%, ${lightness}%)`,
          }
        : null;

    return (
      <HoldableDiv
        holdFor={200}
        className={classnames(
          styles.timeBox,
          isSelecting && styles.selecting,
          isDeselecting && styles.deselecting,
          isOddCol && styles.oddCol,
        )}
        style={divStyle}
        onLongPress={this.handleLongPress}
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
        onPointerEnter={this.handlePointerEnter}
        onPointerLeave={this.handlePointerLeave}
        onPointerCancel={this.handlePointerCancel}
        onGotPointerCapture={this.onGotPointerCapture}
      />
    );
  }
}

const DragStateEnum = Object.freeze({
  none: 0,
  dragSelecting: 1,
  dragDeselecting: 2,
});

// type Props = {
//   dates: [Date],
//   startTime: Date,
//   endTime: Date,
//   interval: Date,
//   userResponseKey: String,
//
// };
//
// type State = {
//   dragState: number,
//   dragStartTime: ?number,
//   dragCurrentTime: ?number,
// };
class Timeline extends Component {
  state = {
    dragState: DragStateEnum.none,
    dragStartTime: null,
    dragCurrentTime: null,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  isSelected(startTime) {
    const responsesForDate = this.renderableResponses.get(startTime) || new Set();
    const { userResponseKey } = this.props;
    if (userResponseKey) {
      return responsesForDate.has(userResponseKey);
    }
    return false;
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

  handlePointerEvent(startTime, shouldStart) {
    let dragState = this.state.dragState;
    if (shouldStart && this.props.userResponseKey && this.state.dragState === DragStateEnum.none) {
      const isSelected = this.isSelected(startTime);
      dragState = isSelected ? DragStateEnum.dragDeselecting : DragStateEnum.dragSelecting;
      this.setState({ dragState, dragStartTime: startTime, dragCurrentTime: startTime });
      disableMobileScroll();
    }

    if (this.state.dragState !== DragStateEnum.none) {
      this.setState({ dragCurrentTime: startTime });
    }
  }

  handlePointerDown = (startTimeWithDate, e) => {
    // Ignore touch downs. Handle long touches instead.
    if (e.pointerType === 'touch') return;
    e.preventDefault(); // Don't disable touches to enable scroll on mobile
    this.handlePointerEvent(startTimeWithDate, true);
  };

  handleLongPress = (startTimeWithDate) => {
    this.handlePointerEvent(startTimeWithDate, true);
  };

  handlePointerMove = (startTimeWithDate, e) => {
    // Prevent scroll when dragging, among other things
    if (this.state.dragState !== DragStateEnum.none) {
      e.preventDefault();
    }
    this.handlePointerEvent(startTimeWithDate, false);
  };

  handlePointerEnter = (startTimeWithDate) => {
    const { onCellHover } = this.props;
    onCellHover && onCellHover(startTimeWithDate);
  };

  handlePointerEnd = () => {
    // Calculate selected times and call callbacks
    const { onSelect, onDeselect, startTime, endTime, dates, interval } = this.props;
    const startTimes = getStartTimes(startTime, endTime, interval);
    const allStartTimes = getAllStartTimes(startTimes, dates);
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
    enableMobileScroll();
  };

  render() {
    const {
      className,
      dates,
      startTime,
      endTime,
      interval,
      respondents,
      maxSelectable,
    } = this.props;
    const { dragState } = this.state;

    const sortedDates = _.sortBy(dates, (d) => d.getTime());
    const startTimes = getStartTimes(startTime, endTime, interval);
    const allStartTimes = getAllStartTimes(startTimes, sortedDates);
    this.renderableResponses = respondentsToDict(respondents);
    const selectingDates = this.selectingDates(allStartTimes);

    const rows = startTimes.map((time, idx) => {
      return (
        <React.Fragment key={`row ${time.valueOf()}`}>
          <Tick startTime={time} hideByDefault={idx % 2 !== 0} />
          {sortedDates.map((date, idx) => {
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
                isOddCol={idx % 2 === 1}
                onTouchStart={this.handleTouchStart}
                onPointerDown={this.handlePointerDown}
                onPointerMove={this.handlePointerMove}
                onPointerUp={this.handlePointerEnd}
                onPointerEnter={this.handlePointerEnter}
                onPointerCancel={this.handlePointerEnd}
                onLongPress={this.handleLongPress}
              />
            );
          })}
        </React.Fragment>
      );
    });

    const headerCells = sortedDates.map((date) => <DateHeader date={date} key={date} />);

    // Specifying touch-action none here is necessary as Safari does not
    // support the touch-action CSS attribute.
    const touchAction = dragState === DragStateEnum.none ? 'auto' : 'none';

    return (
      <div
        touch-action={touchAction}
        id="timeline"
        className={classnames(className, styles.timelineWrapper)}
      >
        <div
          className={styles.timeline}
          style={{
            gridTemplateColumns: `auto repeat(${sortedDates.length}, minmax(4em, 7em))`,
          }}
          onPointerLeave={this.handlePointerEnd}
        >
          <span className={classnames(styles.timelineLabel, styles.cornerHeaderCell)} />
          {headerCells}
          {rows}
        </div>
      </div>
    );
  }
}

export default Timeline;
