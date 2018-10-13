import React, { Component } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import memoize from 'memoize-one';
import responsesToDict from '../utils/response';
import DateMap from '../utils/DateMap';
import styles from './Timeline.module.scss';

// Props
// allowedDates
// startTime, endTime
// responses

const getStartTimes = memoize(
  (startTime, endTime) => {
    const numMin = moment.duration(endTime.diff(startTime)).asMinutes();
    const mins = _.range(0, _.round(numMin), 15);
    const startTimes = mins.map((min) => startTime.clone().add(min, 'minutes'));
    return startTimes;
  },
  (newTime, oldTime) => newTime.isSame(oldTime),
);

const getMomentsForDates = memoize(
  (startTimes, allowedDates) => {
    return new DateMap(
      _.zip(
        startTimes,
        startTimes.map((time) => {
          return new DateMap(
            _.zip(allowedDates, allowedDates.map((date) => moveDateTimeToDate(date, time))),
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

function TimeBox({
  responseCount,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseEnter,
  maxSelectable,
}) {
  function getLightnessValue(maxSelectable, count) {
    return Math.floor(100 - (65 / maxSelectable) * count);
  }

  const divStyle = {
    backgroundColor: `hsla(107, 60%, ${getLightnessValue(maxSelectable, responseCount)}%, 1)`,
  };

  return (
    <div
      className={styles.timeBox}
      style={divStyle}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
    />
  );
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
    const responsesForDate = this.renderableResponses.get(startTime) || new Set();
    return responsesForDate.has(this.props.name);
  }

  getResponseCount(startTime) {
    const responsesForDate = this.renderableResponses.get(startTime) || new Set();
    return responsesForDate.size;
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

    const { onSelect, onDeselect } = this.props;
    switch (dragState) {
      case DragStateEnum.dragSelecting:
        // console.log('Select', startMoment.toISOString());
        onSelect && onSelect(startMoment);
        break;
      case DragStateEnum.dragDeselecting:
        // console.log('Deselect', startMoment.toISOString());
        onDeselect && onDeselect(startMoment);
        break;
      default:
        break;
    }
  }

  handleMouseDown = (startTimeWithDate) => (e) => {
    e.preventDefault();
    this.handleMouseEvent(startTimeWithDate, true);
  };

  handleMouseMove = (startTimeWithDate) => (e) => {
    e.preventDefault();
    this.handleMouseEvent(startTimeWithDate, false);
  };

  handleMouseEnter = (startTimeWithDate) => () => {
    const { onCellHover } = this.props;
    onCellHover && onCellHover(startTimeWithDate);
  };

  handleMouseEnd = () => {
    this.setState({ dragState: DragStateEnum.none });
  };

  render() {
    const { allowedDates, startTime, endTime, responses, maxSelectable } = this.props;

    const startTimes = getStartTimes(startTime, endTime);
    const momentsForDates = getMomentsForDates(startTimes, allowedDates);
    this.renderableResponses = responsesToDict(responses || {});

    const rows = startTimes.map((time) => {
      return (
        <React.Fragment key={`row ${time.valueOf()}`}>
          <Tick startTime={time} />
          {allowedDates.map((date) => {
            const startMomentWithDate = momentsForDates.get(time).get(date);
            const startTimeWithDate = startMomentWithDate.toDate();

            return (
              <TimeBox
                startTime={startTimeWithDate}
                key={`timebox ${startMomentWithDate.valueOf()}`}
                maxSelectable={maxSelectable}
                responseCount={this.getResponseCount(startTimeWithDate)}
                onMouseDown={this.handleMouseDown(startTimeWithDate)}
                onMouseMove={this.handleMouseMove(startTimeWithDate)}
                onMouseUp={this.handleMouseEnd}
                onMouseEnter={this.handleMouseEnter(startTimeWithDate)}
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
