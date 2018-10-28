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
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isClosed: false,
    };
    this.handleOpen = this.handleOpen.bind(this);
  }

  handleOpen() {
    if (this.state.isOpen) {
      this.setState({ isOpen: false });
      this.setState({ isClosed: true });
    } else {
      this.setState({ isOpen: true });
      this.setState({ isClosed: false });
    }
  }

  render() {
    const { className, respondents, renderableRespondents, time, fabOnClick } = this.props;
    const { isOpen, isClosed } = this.state;

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
        className={classnames(
          className,
          isOpen ? styles.slideForward : null,
          isOpen ? styles.scrollable : null,
          isClosed ? styles.slideBackward : null,
        )}
      >
        <div className={classnames(styles.header, isOpen ? styles.sticky : null)}>
          <MaterialIcon
            icon={isOpen ? 'clear' : 'more_vert'}
            className={classnames(
              styles.icon,
              isOpen ? styles.rotateOut : null,
              isClosed ? styles.rotateIn : null,
            )}
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
          className={classnames(
            styles.bottomBarFab,
            isOpen ? styles.scaleIn : null,
            isClosed ? styles.scaleOut : null,
          )}
          icon={<MaterialIcon className={styles.fabIcon} icon="add" />}
          onClick={fabOnClick}
        />
      </div>
    );
  }
}

export default ShowResultsBottomBar;
