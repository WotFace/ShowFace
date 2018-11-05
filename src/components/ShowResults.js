import React, { Component, createRef } from 'react';
import IconButton from '@material/react-icon-button';
import MaterialIcon from '@material/react-material-icon';
import { format } from 'date-fns';
import classnames from 'classnames';
import { bestMeetings } from '../utils/bestTime';
import {
  respondentToEmailOrName,
  respondentsToDict,
  partitionRespondentsAtTime,
  partitionRespondentsByAttendance,
} from '../utils/response';
import Timeline from './Timeline';
import BottomAppBar from './BottomAppBar';
import ShowResultsSidebar from './ShowResultsSidebar';
import styles from './ShowResults.module.scss';

class ShowResults extends Component {
  state = {
    selectedTime: null,
    isShowingDetails: false, // Only has effect on mobile

    // State to restore scroll position when back button pressed
    bodyScrollTop: 0,
    hiddenResponders: new Set(),
  };

  sidebarRef = createRef();

  handleCellHover = (selectedTime) => this.setState({ selectedTime });

  handleDeselectClick = () => this.setState({ selectedTime: null });

  handleDetailToggleClick = () => {
    const { isShowingDetails, bodyScrollTop } = this.state;
    const shouldShowDetails = !isShowingDetails;

    // Store scroll positions
    if (shouldShowDetails) {
      this.setState({ bodyScrollTop: window.pageYOffset || document.documentElement.scrollTop });
    }

    this.setState({ isShowingDetails: shouldShowDetails });

    // Scroll appropriate elems into position
    if (shouldShowDetails) {
      this.sidebarRef.current.scrollIntoView(true);
    } else {
      // Hack to scroll body after rerender, otherwise the document might not be at its final height
      setTimeout(() => (document.documentElement.scrollTop = bodyScrollTop), 0);
    }
  };

  renderAttendingLine(partitionedRespondents) {
    const { attending, notAttending } = partitionedRespondents;
    const attendingCount = attending.length === 0 ? 0 : attending.length;
    const notAttendingCount = notAttending.length === 0 ? 0 : notAttending.length;
    return (
      <>
        {attendingCount} attending, {notAttendingCount} not attending
      </>
    );
  }

  renderBottomBar(partitionedRespondents, bestTime) {
    const { selectedTime, isShowingDetails } = this.state;
    const useBestTime = !selectedTime;

    const dateFormat = 'D MMM hh:mmA';
    let textContent;

    if (useBestTime) {
      if (bestTime) {
        textContent = (
          <>
            <strong>Best Time to Meet</strong>
            <br />
            {format(bestTime.interval.start, dateFormat)} -{' '}
            {format(bestTime.interval.end, dateFormat)}
            <br />
            {this.renderAttendingLine(partitionedRespondents)}
          </>
        );
      } else {
        textContent = 'No best time to meet. Select a time slot to view responses at that time.';
      }
    } else {
      textContent = (
        <>
          <strong>Selecting</strong>
          <br />
          {format(selectedTime, dateFormat)}
          <br />
          {this.renderAttendingLine(partitionedRespondents)}
        </>
      );
    }

    return (
      <BottomAppBar className={styles.bottomBar}>
        <div className={styles.bottomBarContent}>
          <IconButton onClick={this.handleDetailToggleClick}>
            <MaterialIcon icon={isShowingDetails ? 'grid_on' : 'format_list_bulleted'} />
          </IconButton>
          <span className={styles.mainText}>{textContent}</span>
          {selectedTime && (
            <IconButton onClick={this.handleDeselectClick}>
              <MaterialIcon icon="close" />
            </IconButton>
          )}
        </div>
      </BottomAppBar>
    );
  }

  handleHideUnhideUser = (responder) => {
    const { hiddenResponders } = this.state;
    if (hiddenResponders.has(responder)) {
      hiddenResponders.delete(responder);
    } else {
      hiddenResponders.add(responder);
    }
    this.setState({ hiddenResponders });
  };

  getNonHiddenRespondents(respondents) {
    const { hiddenResponders } = this.state;
    return respondents.filter((r) => !hiddenResponders.has(respondentToEmailOrName(r)));
  }

  render() {
    const { show } = this.props;
    const { selectedTime, isShowingDetails, hiddenResponders } = this.state;

    const { dates, startTime, endTime, interval } = show;
    const respondents = show.respondents || [];
    const totalNumResponders = respondents.length;
    const renderableRespondents = respondentsToDict(respondents);

    let bestTime;
    if (!selectedTime) {
      const entries = Array.from(renderableRespondents.entries());
      const bestTimes = bestMeetings(entries, totalNumResponders, interval);
      if (bestTimes.length > 0) bestTime = bestTimes[0];
    }

    const partitionedRespondents =
      selectedTime || !bestTime
        ? partitionRespondentsAtTime(
            respondents,
            renderableRespondents,
            selectedTime,
            hiddenResponders,
          )
        : partitionRespondentsByAttendance(respondents, bestTime.attendees, hiddenResponders);
    const nonHiddenRespondents = this.getNonHiddenRespondents(respondents);

    const numHidden = partitionedRespondents.hidden.length;
    // TODO: Subtract yet to responds as well
    const maxSelectable = totalNumResponders - numHidden;

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
            respondents={nonHiddenRespondents}
            maxSelectable={maxSelectable}
            onCellHover={this.handleCellHover}
          />
          <div ref={this.sidebarRef}>
            <ShowResultsSidebar
              className={classnames(
                styles.sidebar,
                isShowingDetails ? null : styles.hiddenOnMobile,
              )}
              partitionedRespondents={partitionedRespondents}
              time={selectedTime}
              bestTime={bestTime}
              showBestTime={selectedTime && bestTime}
              onHideUnhideUser={this.handleHideUnhideUser}
              onDeleteResponse={this.props.onDeleteResponse}
              onDeleteRespondents={this.props.onDeleteRespondents}
              onEditRespondentStatus={this.props.onEditRespondentStatus}
              onDeselectClick={this.handleDeselectClick}
            />
          </div>
        </div>
        {this.renderBottomBar(partitionedRespondents, bestTime)}
      </div>
    );
  }
}

export default ShowResults;
