import React, { Component } from 'react';
import IconButton from '@material/react-icon-button';
import MaterialIcon from '@material/react-material-icon';
import { format } from 'date-fns';
import classnames from 'classnames';
import Timeline from './Timeline';
import BottomAppBar from './BottomAppBar';
import { respondentsToDict, partitionRespondentsByAttendance } from '../utils/response';
import ShowResultsSidebar from './ShowResultsSidebar';
import styles from './ShowResults.module.scss';

class ShowResults extends Component {
  state = {
    selectedTime: null,
    isShowingDetails: false, // Only has effect on mobile
  };

  handleCellHover = (selectedTime) => this.setState({ selectedTime });

  handleDetailToggleClick = () => {
    this.setState({ isShowingDetails: !this.state.isShowingDetails });
  };

  renderBottomBar(partitionedRespondents) {
    const { selectedTime, isShowingDetails } = this.state;
    const { attending, notAttending } = partitionedRespondents;

    const attendingCount = attending.length === 0 ? 0 : attending.length;
    const notAttendingCount = notAttending.length === 0 ? 0 : notAttending.length;

    const pluralize = (count) => (count === 1 ? '' : 's');

    return (
      <BottomAppBar className={styles.bottomBar}>
        <div className={styles.bottomBarContent}>
          <IconButton onClick={this.handleDetailToggleClick}>
            <MaterialIcon icon={isShowingDetails ? 'arrow_back' : 'more_vert'} />
          </IconButton>
          <span className={styles.mainText}>
            {format(selectedTime, 'D MMM hh:mmA')}
            <br />
            {attendingCount} show
            {pluralize(attendingCount)}, {notAttendingCount} no show
            {pluralize(notAttendingCount)}
          </span>
        </div>
      </BottomAppBar>
    );
  }

  render() {
    const { show } = this.props;
    const { selectedTime, isShowingDetails } = this.state;

    const { dates, startTime, endTime, interval } = show;
    const respondents = show.respondents || [];
    const renderableRespondents = respondentsToDict(respondents);
    const partitionedRespondents = partitionRespondentsByAttendance(
      respondents,
      renderableRespondents,
      selectedTime,
    );

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
            className={classnames(styles.timeline, isShowingDetails ? styles.hiddenOnMobile : null)}
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
              className={classnames(
                styles.sidebar,
                isShowingDetails ? null : styles.hiddenOnMobile,
              )}
              partitionedRespondents={partitionedRespondents}
              time={selectedTime}
            />
          </div>
        </div>
        {this.renderBottomBar(partitionedRespondents)}
      </div>
    );
  }
}

export default ShowResults;
