import React, { Component, createRef } from 'react';
import IconButton from '@material/react-icon-button';
import MaterialIcon from '@material/react-material-icon';
import { format } from 'date-fns';
import classnames from 'classnames';
import Timeline from './Timeline';
import BottomAppBar from './BottomAppBar';
import {
  respondentToEmailOrName,
  respondentsToDict,
  partitionRespondentsByAttendance,
} from '../utils/response';
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

  renderBottomBar(partitionedRespondents) {
    const { selectedTime, isShowingDetails } = this.state;
    const { attending, notAttending } = partitionedRespondents;

    const attendingCount = attending.length === 0 ? 0 : attending.length;
    const notAttendingCount = notAttending.length === 0 ? 0 : notAttending.length;

    return (
      <BottomAppBar className={styles.bottomBar}>
        <div className={styles.bottomBarContent}>
          <IconButton onClick={this.handleDetailToggleClick}>
            <MaterialIcon icon={isShowingDetails ? 'grid_on' : 'format_list_bulleted'} />
          </IconButton>
          <span className={styles.mainText}>
            {format(selectedTime, 'D MMM hh:mmA')}
            <br />
            {attendingCount} attending, {notAttendingCount} not attending
          </span>
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
    const renderableRespondents = respondentsToDict(respondents);
    const partitionedRespondents = partitionRespondentsByAttendance(
      respondents,
      renderableRespondents,
      selectedTime,
      hiddenResponders,
    );
    const nonHiddenRespondents = this.getNonHiddenRespondents(respondents);
    const nonHiddenRenderableRespondents = respondentsToDict(nonHiddenRespondents);
    const calcMaxSelectable = () => {
      let max = 0;
      for (let r of nonHiddenRenderableRespondents.values()) {
        if (r.size > max) max = r.size;
      }
      return max;
    };
    const maxSelectable = calcMaxSelectable();

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
              renderableRespondents={renderableRespondents}
              partitionedRespondents={partitionedRespondents}
              time={selectedTime}
              onHideUnhideUser={this.handleHideUnhideUser}
              onDeleteResponse={this.props.onDeleteResponse}
              onDeleteRespondents={this.props.onDeleteRespondents}
              onEditRespondentStatus={this.props.onEditRespondentStatus}
              interval={interval}
            />
          </div>
        </div>
        {this.renderBottomBar(partitionedRespondents)}
      </div>
    );
  }
}

export default ShowResults;
