import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Timeline from './Timeline';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import responsesToDict from '../utils/response';

function datesFromRange({ startDate, endDate }) {
  const timestamps = _.range(startDate.seconds, endDate.seconds, 86400);
  timestamps.push(endDate.seconds); // As _.range excludes endDate, we need to add it back
  return timestamps.map((timestamp) => moment.unix(timestamp));
}

class PollResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxSelectable: 0,
      sliderValues: [0, 0],
    };

    this.onSliderChange = this.onSliderChange.bind(this);
  }

  componentDidMount() {
    const responses = this.props.poll.responses || {};
    const renderableResponses = responsesToDict(responses || {});
    const maxSelectable = _.reduce(
      renderableResponses,
      (maxLen, dates, name) => {
        return Math.max(maxLen, dates.size);
      },
      0,
    );
    this.setState({
      renderableResponses,
      maxSelectable,
      sliderValues: [0, maxSelectable],
    });
  }

  onSliderChange(sliderValues) {
    this.setState({
      sliderValues: sliderValues,
    });
  }

  render() {
    const { poll } = this.props;
    const allowedDates = datesFromRange(poll.dateRange);

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

    return (
      <div>
        <Range {...sliderConfig} className="slider" />
        <Timeline
          allowedDates={allowedDates}
          startTime={moment().startOf('day')}
          endTime={moment().endOf('day')}
          responses={poll.responses}
          onSelect={() => {}}
          onDeselect={() => {}}
          minCount={this.state.sliderValues[0]}
          maxCount={this.state.sliderValues[1]}
        />
      </div>
    );
  }
}

export default PollResults;
