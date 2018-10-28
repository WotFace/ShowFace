import React, { Component } from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import _ from 'lodash';
import { respondentToEmailOrName } from '../utils/response';
import MaterialIcon from '@material/react-material-icon';
import Fab from '@material/react-fab';
import ShowResultsSideBar from './ShowResultsSidebar';

import styles from './ShowResultsBottomBar.module.scss';

function renderShortMessage(time, attending, notAttending) {
  let attendingCount, notAttendingCount;

  attendingCount = attending.length === 0 ? 0 : attending.length;
  notAttendingCount = notAttending.length === 0 ? 0 : notAttending.length;

  return (
    <div>
      {format(time, 'Do MMM YYYY hh:mma')} <br /> {attendingCount} attending, {notAttendingCount}{' '}
      not attending
    </div>
  );
}

class ShowResultsBottomBar extends Component {
  state = {
    isOpen: false,
  };

  handleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const { className, respondents, renderableRespondents, time, fabOnClick } = this.props;
    const { isOpen } = this.state;

    // this one might need to change cos it's just copied over
    const respondersRespondentsObj = _.zipObject(
      respondents.map(respondentToEmailOrName),
      respondents,
    );
    const responders = Object.keys(respondersRespondentsObj);
    const respondersAtTime = new Set(renderableRespondents.get(time));

    const [attending, possiblyNotAttending] = _.partition(responders, (r) =>
      respondersAtTime.has(r),
    );

    const notAttending = possiblyNotAttending;
    // copying ends here

    return (
      <div
        className={classnames(className, {
          [styles.slideForward]: isOpen,
          [styles.scrollable]: isOpen,
          [styles.slideBackward]: !isOpen,
        })}
      >
        <div className={classnames(styles.header, isOpen ? styles.sticky : null)}>
          <MaterialIcon
            icon={isOpen ? 'clear' : 'more_vert'}
            className={classnames(styles.icon, isOpen ? styles.rotateOut : styles.rotateIn)}
            onClick={this.handleOpen}
          />
          {renderShortMessage(time, attending, notAttending)}
        </div>
        <ShowResultsSideBar
          respondents={respondents}
          renderableRespondents={renderableRespondents}
          time={time}
        />
        <Fab
          className={classnames(styles.bottomBarFab, { [styles.hidden]: !isOpen })}
          icon={<MaterialIcon icon="add" />}
          onClick={fabOnClick}
        />
      </div>
    );
  }
}

export default ShowResultsBottomBar;
