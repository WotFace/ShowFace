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

const Tick = ({ startTime }) => {
  const format = 'h:mm';
  return (
    <span className={classnames(styles.tick, styles.timelineLabel)}>
      {startTime.format(format)}
    </span>
  );
};

const DateHeader = ({ date }) => {
  return (
    <span className={classnames(styles.dateHeading, styles.timelineLabel)}>
      {date.format('DD/MM')}
    </span>
  );
};

const ShowAttendees = ({ responses, allAttendees, time }) => {
  let attendees = time ? responses.get(time) || [] : [];
  attendees = Array.from(attendees);
  const notAttending = allAttendees.filter((x) => !new Set(attendees).has(x));

  return (
    <div className="col-4">
      <section className={classnames(styles.attendees, 'flex-item')}>
        {time ? (
          <h2 className={styles.pollTime}>{moment(time).format('Do MMM YYYY hh:mma')}</h2>
        ) : null}
        <section id="attending">
          <h3>Attending</h3>
          <ol>
            {attendees.map((attendee) => {
              return <li key={attendee}>{attendee}</li>;
            })}
          </ol>
        </section>
        <section id="notAttending">
          <h3>Not Attending</h3>
          <ol>
            {notAttending.map((notAttendee) => {
              return <li key={notAttendee}>{notAttendee}</li>;
            })}
          </ol>
        </section>
      </section>
    </div>
  );
};

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

    switch (dragState) {
      case DragStateEnum.dragSelecting:
        // console.log('Select', startMoment.toISOString());
        this.props.onSelect(startMoment);
        break;
      case DragStateEnum.dragDeselecting:
        // console.log('Deselect', startMoment.toISOString());
        this.props.onDeselect(startMoment);
        break;
      default:
        break;
    }
  }

  render() {
    const {
      allowedDates,
      startTime,
      endTime,
      responses,
      name,
      minCount,
      maxCount,
      showAttendees,
    } = this.props;

    const allAttendees = Object.keys(responses || {});

    const startTimes = getStartTimes(startTime, endTime);
    const momentsForDates = getMomentsForDates(startTimes, allowedDates);
    const allResponses = responsesToDict(responses || {});
    this.renderableResponses = allResponses;

    if (minCount !== undefined) {
      for (let [k, v] of this.renderableResponses) {
        if (v.size < minCount) {
          this.renderableResponses.delete(k);
        }
      }
    }

    if (maxCount !== undefined) {
      for (let [k, v] of this.renderableResponses) {
        if (v.size > maxCount) {
          this.renderableResponses.delete(k);
        }
      }
    }

    const calcMaxSelectable = () => {
      if (name) return 1;
      let max = 0;
      for (let r of allResponses.values()) {
        if (r.size > max) max = r.size;
      }
      return max;
    };
    const maxSelectable = calcMaxSelectable();

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
                onMouseDown={(e) => {
                  e.preventDefault();
                  this.handleMouseEvent(startTimeWithDate, true);
                }}
                onMouseMove={(e) => {
                  e.preventDefault();
                  this.handleMouseEvent(startTimeWithDate, false);
                }}
                onMouseUp={() => this.setState({ dragState: DragStateEnum.none })}
                onMouseEnter={() => {
                  this.setState({ selectedTime: startTimeWithDate });
                }}
              />
            );
          })}
        </React.Fragment>
      );
    });

    const headerCells = allowedDates.map((date) => <DateHeader date={date} key={date} />);

    return (
      <section id="timeline" className="flex-container">
        <div className="row">
          <div
            className={classnames(styles.timeline, `col-${showAttendees ? 8 : 12}`)}
            style={{ gridTemplateColumns: `auto repeat(${allowedDates.length}, 1fr)` }}
            onMouseLeave={() => this.setState({ dragState: DragStateEnum.none })}
          >
            <span className="Timeline-filler" />
            {headerCells}
            {rows}
          </div>
          {showAttendees ? (
            <ShowAttendees
              responses={allResponses}
              allAttendees={allAttendees}
              time={this.state.selectedTime}
            />
          ) : null}
        </div>
      </section>
    );
  }
}

export default Timeline;
