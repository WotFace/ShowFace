import React, { Component } from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import _ from 'lodash';
import { respondentToEmailOrName } from '../utils/response';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import MaterialIcon from '@material/react-material-icon';

import styles from './ShowResultsBottomBar.module.scss';

function renderShortMessage(time, attending, notAttending) {
  let attendingCount, notAttendingCount;

  attendingCount = attending.length === 0 ? 0 : attending.length;
  notAttendingCount = notAttending.length === 0 ? 0 : notAttending.length;

  return (
    <div className={styles.header}>{format(time, 'Do MMM YYYY hh:mma')} <br /> {attendingCount} attending, {notAttendingCount} not attending</div>
  );
}

function renderRespondent(responder, respondent) {
  const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;
  return (
    <div className={styles.respondents} key={responder}>
      {displayName}
      <MaterialIcon
        icon="visibility"
        className={styles.interactives}
        hasRipple={true}
        onClick={() => {}}
      />
    </div>
  );
}

class BottomBar extends Component {
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
    const { className, respondents, renderableRespondents, time } = this.props;
    const { isOpen, isClosed } = this.state;

    const respondersRespondentsObj = _.zipObject(
      respondents.map(respondentToEmailOrName),
      respondents,
    );
    const responders = Object.keys(respondersRespondentsObj);
    const respondersAtTime = new Set(renderableRespondents.get(time));

    const [attending, possiblyNotAttending] = _.partition(responders, (r) =>
      respondersAtTime.has(r),
    );
    // TODO: Partition possiblyNotAttending further into non-responses and not attendings
    const notAttending = possiblyNotAttending;

    return (
      <div className={className}>
        <div
          className={classnames(styles.ribbon,
            (isOpen ? styles.slideForward : null),
            (isOpen ? styles.scrollable : null),
            (isClosed ? styles.slideBackward : null),
          )}
        >
          <MaterialIcon
            icon={isOpen ? "clear" : "more_vert"}
            className={classnames(styles.icon, isOpen ? styles.rotateOut : null, isClosed ? styles.rotateIn : null)}
            hasRipple={true}
            onClick={this.handleOpen}
          />
          {renderShortMessage(time, attending, notAttending)}
          <div className={styles.scrollable}>
            <section className={styles.attendees}>
              <h3>Attending</h3>
              {attending.map((responder) => {
                const respondent = respondersRespondentsObj[responder]
                return renderRespondent(responder, respondent);
              })}
            </section>
            <section className={styles.attendees} id="notAttending">
              <h3>Not Attending</h3>
              {notAttending.map((responder) => {
                const respondent = respondersRespondentsObj[responder];
                return renderRespondent(responder, respondent);
              })}
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default BottomBar;

// function ShowAttendees({ respondents, renderableRespondents, time }) {
//   const respondersRespondentsObj = _.zipObject(
//     respondents.map(respondentToEmailOrName),
//     respondents,
//   );
//   const responders = Object.keys(respondersRespondentsObj);
//   const respondersAtTime = new Set(renderableRespondents.get(time));

//   const [attending, possiblyNotAttending] = _.partition(responders, (r) => respondersAtTime.has(r));
//   // TODO: Partition possiblyNotAttending further into non-responses and not attendings
//   const notAttending = possiblyNotAttending;

//   // TODO: Display respondents differently depending on whether the user is
//   // logged in, has admin rights, and whether the respondent has responded
//   function renderRespondent(responder, respondent) {
//     const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;
//     return <li key={responder}>{displayName}</li>;
//   }

//   return (
//     <div>
//       <section className={classnames(styles.attendees, 'flex-item')}>
//         {time ? <h2 className={styles.pollTime}>{format(time, 'Do MMM YYYY hh:mma')}</h2> : null}
//         <section id="attending">
//           <h3>Attending</h3>
//           <ol>
//             {attending.map((responder) => {
//               const respondent = respondersRespondentsObj[responder];
//               return renderRespondent(responder, respondent);
//             })}
//           </ol>
//         </section>
//         <section id="notAttending">
//           <h3>Not Attending</h3>
//           <ol>
//             {notAttending.map((responder) => {
//               const respondent = respondersRespondentsObj[responder];
//               return renderRespondent(responder, respondent);
//             })}
//           </ol>
//         </section>
//       </section>
//     </div>
//   );
// }

// export default function ShowResultsBottomBar({
//   className,
//   respondents,
//   renderableRespondents,
//   time,
// }) {
//   return (
//     <div className={className}>
//       <ShowAttendees
//         respondents={respondents}
//         renderableRespondents={renderableRespondents}
//         time={time}
//       />
//     </div>
//   );
// }
