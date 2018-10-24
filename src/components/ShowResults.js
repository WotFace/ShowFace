import React, { Component } from 'react';
import Timeline from './Timeline';
import { respondentsToDict } from '../utils/response';
import ShowResultsSidebar from './ShowResultsSidebar';
import ShowResultsBottomBar from './ShowResultsBottomBar';
import styles from './ShowResults.module.scss';

class ShowResults extends Component {
  state = {};
  handleCellHover = (selectedTime) => this.setState({ selectedTime });

  render() {
    const { show } = this.props;
    const { selectedTime } = this.state;

    const { dates, startTime, endTime, interval } = show;
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
    // TODO: Deduplicate dates, startTime, endTime between ShowResults and ShowRespond
    return (
      <div>
        <div className={styles.resultsContainer}>
          <Timeline
            className={styles.timeline}
            dates={dates}
            startTime={startTime}
            endTime={endTime}
            interval={interval}
            respondents={respondents}
            maxSelectable={maxSelectable}
            onCellHover={this.handleCellHover}
          />
          <div>
            <ShowResultsSidebar
              className={styles.sidebar}
              respondents={respondents}
              renderableRespondents={renderableRespondents}
              time={selectedTime}
            />
          </div>
        </div>
        <ShowResultsBottomBar
          className={styles.bottomBar}
          respondents={respondents}
          renderableRespondents={renderableRespondents}
          time={selectedTime}
          fabOnClick={() => {console.log("insert func here")}}
        />
      </div>
    );
  }
}

export default ShowResults;
