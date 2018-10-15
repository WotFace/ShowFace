import React, { Component } from 'react';
import moment from 'moment';
import Timeline from './Timeline';
import { respondentsToDict } from '../utils/response';
import { datesFromRange } from '../utils/datetime';
import ShowResultsSidebar from './ShowResultsSidebar';

class ShowResults extends Component {
  state = {};
  handleCellHover = (selectedTime) => this.setState({ selectedTime });

  render() {
    const { show } = this.props;
    const { selectedTime } = this.state;
    const allowedDates = datesFromRange(show.startDate, show.endDate);

    const respondents = show.respondents || [];
    const renderableRespondents = respondentsToDict(respondents);

    const calcMaxSelectable = () => {
      let max = 0;
      for (let r of renderableRespondents.values()) {
        if (r.size > max) max = r.size;
      }
      return max;
    };
    const maxSelectable = calcMaxSelectable();

    // TODO: Pass startTime and endTime in from show, and make Timeline handle them.
    // TODO: Deduplicate allowedDates, startTime, endTime between ShowResults and ShowRespond
    return (
      <div>
        <Timeline
          allowedDates={allowedDates}
          startTime={moment().startOf('day')}
          endTime={moment().endOf('day')}
          respondents={respondents}
          maxSelectable={maxSelectable}
          onCellHover={this.handleCellHover}
        />
        <ShowResultsSidebar
          respondents={respondents}
          renderableRespondents={renderableRespondents}
          time={selectedTime}
        />
      </div>
    );
  }
}

export default ShowResults;
