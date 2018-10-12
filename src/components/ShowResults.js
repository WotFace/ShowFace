import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import classnames from 'classnames';
import Timeline from './Timeline';
import { Range } from 'rc-slider';
import responsesToDict from '../utils/response';
import { datesFromRange } from '../utils/datetime';

import 'rc-slider/assets/index.css';
import styles from './ShowResults.module.scss';

function ShowAttendees({ responses, allAttendees, time }) {
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
}

class ShowResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxSelectable: 0,
      sliderValues: [0, 0],
      slided: false,
    };

    this.onSliderChange = this.onSliderChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const responses = props.show.responses || {};
    const renderableResponses = responsesToDict(responses || {});

    const calcMaxSelectable = () => {
      let max = 0;
      for (let r of renderableResponses.values()) {
        if (r.size > max) max = r.size;
      }
      return max;
    };
    const maxSelectable = calcMaxSelectable();

    if (maxSelectable === state.maxSelectable) {
      return {
        renderableResponses,
      };
    } else if (state.slided) {
      return {
        renderableResponses,
        maxSelectable,
      };
    } else {
      return {
        renderableResponses,
        maxSelectable,
        sliderValues: [0, maxSelectable],
      };
    }
  }

  onSliderChange(sliderValues) {
    this.setState({
      sliderValues: sliderValues,
      slided: true,
    });
  }

  render() {
    const { show } = this.props;
    const allowedDates = datesFromRange(show.startDate, show.endDate);

    const sliderConfig = {
      min: 0,
      max: this.state.maxSelectable,
      value: this.state.sliderValues,
      marks: _.reduce(
        _.range(this.state.maxSelectable + 1),
        (hm, v) => {
          hm[v] = `${v}`;
          return hm;
        },
        {},
      ),
      defaultValue: [0, this.state.maxSelectable],
      onChange: this.onSliderChange,
    };

    const allAttendees = Object.keys(show.responses || {});

    return (
      <div>
        <p className={styles.sliderLabel}>Filter by attendance:</p>
        <Range {...sliderConfig} className={styles.slider} />
        <div>
          <Timeline
            allowedDates={allowedDates}
            startTime={moment().startOf('day')}
            endTime={moment().endOf('day')}
            responses={show.responses}
            onSelect={() => {}}
            onDeselect={() => {}}
            minCount={this.state.sliderValues[0]}
            maxCount={this.state.sliderValues[1]}
            onCellHover={(selectedTime) => this.setState({ selectedTime })}
          />
          <ShowAttendees
            responses={this.state.renderableResponses}
            allAttendees={allAttendees}
            time={this.state.selectedTime}
          />
        </div>
      </div>
    );
  }
}

export default ShowResults;
