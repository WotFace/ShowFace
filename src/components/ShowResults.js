import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Timeline from './Timeline';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import responsesToDict from '../utils/response';
import { datesFromRange } from '../utils/datetime';

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

    return (
      <div>
        <p className="Show-Slider-label">Filter by attendance:</p>
        <Range {...sliderConfig} className="Show-slider" />
        <Timeline
          allowedDates={allowedDates}
          startTime={moment().startOf('day')}
          endTime={moment().endOf('day')}
          responses={show.responses}
          onSelect={() => {}}
          onDeselect={() => {}}
          minCount={this.state.sliderValues[0]}
          maxCount={this.state.sliderValues[1]}
          showAttendees={true}
        />
      </div>
    );
  }
}

export default ShowResults;
