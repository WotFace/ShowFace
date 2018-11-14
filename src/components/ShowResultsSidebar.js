import React, { Component } from 'react';
import { format } from 'date-fns';
import IconButton from '@material/react-icon-button';
import MaterialIcon from '@material/react-material-icon';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import List, { ListItem, ListItemText, ListItemGraphic } from '@material/react-list';
import classnames from 'classnames';
import _ from 'lodash';
import { getFirebaseUserInfo } from '../utils/auth';
import {
  sortedRespondents,
  respondentToEmailOrName,
  getRespondentName,
  getRespondentDisplayName,
} from '../utils/response';
import { ConfirmationDialog, DialogButton } from './helpers/MDCDialog';
import Divider from './Divider';
import styles from './ShowResultsSidebar.module.scss';

class ShowResultsSidebar extends Component {
  state = {
    isMenuOpen: false,
    isModalOpen: false,
    selectedAction: '',
    selectedResponder: '',
    selectedRespondent: null,
  };

  activeItemRef = React.createRef();

  openMenu = () => this.setState({ isMenuOpen: true });
  closeMenu = () => this.setState({ isMenuOpen: false });

  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false });

  renderRespondent = (respondent, isHidden) => {
    const displayName = getRespondentDisplayName(respondent);

    return (
      <ListItem
        key={respondent.id}
        onClick={() => {
          if (this.state.isMenuOpen) return;
          this.setState(
            {
              selectedResponder: respondentToEmailOrName(respondent),
              selectedRespondent: respondent,
            },
            // Open menu after setting the selected respondent and before
            // opening the menu so that a ref to the anchor element will be
            // bound when the menu opens.
            this.openMenu,
          );
        }}
      >
        <ListItemGraphic
          graphic={
            <MaterialIcon
              icon={respondent.isKeyRespondent ? 'star' : 'star_border'}
              className={
                respondent.isKeyRespondent
                  ? styles.keyRespondentActive
                  : styles.keyRespondentInactive
              }
            />
          }
        />
        <ListItemText
          className={styles.listText}
          primaryText={displayName}
          secondaryText={
            (respondent.user ? respondent.user.email + ' • ' : '') +
            respondent.role +
            (' • ' + (respondent.response.length === 0 ? 'not responded' : 'responded'))
          }
        />
        {respondent.id ===
        (this.state.selectedRespondent ? this.state.selectedRespondent.id : false) ? (
          <div ref={this.activeItemRef} />
        ) : (
          <div />
        )}
        {isHidden ? <MaterialIcon className={styles.hiddenIcon} icon="visibility_off" /> : <div />}
      </ListItem>
    );
  };

  handleDeleteResponse = () => {
    const { selectedRespondent } = this.state;
    this.closeModal();
    this.props.onDeleteResponse(selectedRespondent.id);
  };

  handleDeleteRespondents = () => {
    const { selectedRespondent } = this.state;
    this.setState({ selectedAction: 'delete' });
    this.closeModal();
    this.props.onDeleteRespondents(selectedRespondent.id);
  };

  handleEditKeyRespondentStatus = () => {
    const { selectedRespondent } = this.state;
    const isKeyRespondent = !selectedRespondent.isKeyRespondent;
    this.closeModal();
    this.props.onEditRespondentStatus(
      selectedRespondent.id,
      selectedRespondent.role,
      isKeyRespondent,
    );
  };

  handleEditRespondentRoleStatus = () => {
    const { selectedRespondent } = this.state;
    const respondentRole = selectedRespondent.role === 'member' ? 'admin' : 'member';
    this.closeModal();
    this.props.onEditRespondentStatus(
      selectedRespondent.id,
      respondentRole,
      selectedRespondent.isKeyRespondent,
    );
  };

  handleHideUser = () => {
    const { selectedResponder } = this.state;
    this.closeMenu();
    this.props.onHideUnhideUser(selectedResponder);
  };

  // handleEditResponse = () => {
  //   const { selectedRespondent } = this.state;
  //   this.closeMenu();
  //   // route to edit user info
  // };

  renderMenuContents = (respondent, respondersRespondentsObj) => {
    if (!respondent) {
      // console.log('renderMenuContents: No respondent!');
      return <div />;
    }

    const {
      partitionedRespondents: { hidden },
    } = this.props;
    const { selectedResponder } = this.state;
    const currentUser = getFirebaseUserInfo();
    // TODO: make it possible to hide respondents dynamically
    const isHidden = hidden.includes(selectedResponder);
    let userInMeeting = null;
    if (currentUser != null) {
      userInMeeting = _.findKey(respondersRespondentsObj, function(a) {
        return a.user && a.user.email === currentUser.email;
      });
    }

    const listItems = [];

    listItems.push(
      <ListItem key="hideunhide" onClick={this.handleHideUser}>
        <ListItemGraphic
          graphic={<MaterialIcon icon={isHidden ? 'visibility' : 'visibility_off'} />}
        />
        <ListItemText primaryText={isHidden ? 'Unhide' : 'Hide'} />
      </ListItem>,
    );

    // TODO: Implement this
    // if (!respondent.user || (userInMeeting && userInMeeting.user.role === 'admin')) {
    // listItems.push(
    // <ListItem key="edit" onClick={this.handleEditResponse}>
    // <ListItemGraphic graphic={<MaterialIcon icon="edit" />} />
    // <ListItemText primaryText="Edit response" />
    // </ListItem>,
    // );
    // }

    if (userInMeeting && userInMeeting.role === 'admin') {
      listItems.push(
        <ListItem key="keyrespondent" onClick={this.handleClickKeyRespondentAction}>
          <ListItemGraphic
            graphic={<MaterialIcon icon={respondent.isKeyRespondent ? 'star_border' : 'star'} />}
          />
          <ListItemText
            primaryText={
              respondent.isKeyRespondent ? 'Remove key respondent' : 'Make key respondent'
            }
          />
        </ListItem>,
      );
    }

    if (userInMeeting && userInMeeting.role === 'admin') {
      listItems.push(
        <ListItem key="admintoggle" onClick={this.handleClickAdminAction}>
          <ListItemGraphic
            graphic={
              <MaterialIcon
                icon={respondent.role === 'admin' ? 'person_add_disabled' : 'person_add'}
              />
            }
          />
          <ListItemText
            primaryText={
              respondent.role === 'admin'
                ? 'Revoke organizer privileges'
                : 'Grant organizer privileges'
            }
          />
        </ListItem>,
      );
    }

    if (
      !isHidden &&
      ((userInMeeting && userInMeeting.role === 'admin') ||
        (!respondent.user && respondent.anonymousName))
    ) {
      listItems.push(
        <ListItem key="clearresp" onClick={this.handleClickClearAction}>
          <ListItemGraphic graphic={<MaterialIcon icon="clear_all" />} />
          <ListItemText primaryText="Clear response" />
        </ListItem>,
      );

      listItems.push(
        <ListItem key="rmresp" onClick={this.handleClickDeleteAction}>
          <ListItemGraphic graphic={<MaterialIcon icon="delete" />} />
          <ListItemText primaryText="Remove" />
        </ListItem>,
      );
    }

    return (
      <div>
        <div className={styles.listItemHeader}>
          <p>
            {getRespondentDisplayName(respondent)} <br />
            <span className={styles.listItemSubText}>
              {(respondent.user ? respondent.user.email + ' • ' : '') + respondent.role}
            </span>
          </p>
        </div>
        <Divider />
        <List>{listItems}</List>
      </div>
    );
  };

  renderModalContents = () => {
    const { isModalOpen, selectedRespondent, selectedAction } = this.state;
    const userName = getRespondentDisplayName(selectedRespondent);

    let title;
    let body;
    let actionButton;

    switch (selectedAction) {
      case 'clear':
        title = 'Clear ' + userName + "'s response?";
        body = `Are you sure you want to clear all responses entered by ${userName}? This will not remove them from the attendee list. This action cannot be undone.`;
        actionButton = <DialogButton onClick={this.handleDeleteResponse}>OK</DialogButton>;
        break;
      case 'delete':
        title = 'Remove ' + userName + ' permanently from the meeting?';
        body = 'This action cannot be undone.';
        actionButton = <DialogButton onClick={this.handleDeleteRespondents}>OK</DialogButton>;
        break;
      case 'keyRespondent':
        title = selectedRespondent.isKeyRespondent
          ? 'Remove ' + userName + ' as key respondent?'
          : 'Make ' + userName + ' a key respondent?';
        body = 'Key respondents are attendees who must be present in meetings.';
        actionButton = <DialogButton onClick={this.handleEditKeyRespondentStatus}>OK</DialogButton>;
        break;
      case 'admin':
        title =
          selectedRespondent.role === 'admin'
            ? 'Remove ' + userName + "'s organizer privileges?"
            : 'Make ' + userName + ' an organizer of this meeting?';
        body =
          'Organizers are able to delete responses and respondents, and change the settings on this meeting.';
        actionButton = (
          <DialogButton onClick={this.handleEditRespondentRoleStatus}>OK</DialogButton>
        );
        break;
      default:
        break;
    }

    return (
      <ConfirmationDialog
        isOpen={isModalOpen}
        title={title}
        body={body}
        onDialogClose={() => this.setState({ isModalOpen: false })}
      >
        <DialogButton autoclose>Cancel</DialogButton>
        {actionButton}
      </ConfirmationDialog>
    );
  };

  handleClickKeyRespondentAction = () => {
    this.setState({ selectedAction: 'keyRespondent' });
    this.closeMenu();
    this.openModal();
  };

  handleClickAdminAction = () => {
    this.setState({ selectedAction: 'admin' });
    this.closeMenu();
    this.openModal();
  };

  handleClickClearAction = () => {
    this.setState({ selectedAction: 'clear' });
    this.closeMenu();
    this.openModal();
  };

  handleClickDeleteAction = () => {
    this.setState({ selectedAction: 'delete' });
    this.closeMenu();
    this.openModal();
  };

  render() {
    const { className, partitionedRespondents, time, bestTime, interval } = this.props;
    const { selectedResponder, isMenuOpen } = this.state;

    const { hidden, attending, notAttending, respondersRespondentsObj } = partitionedRespondents;

    const dateFormat = 'D MMM hh:mmA';
    let header;
    if (time) {
      header = (
        <div className={styles.header}>
          <div className={styles.hoveringHeaderContainer}>
            <div className={styles.hoveringTextContainer}>
              <div className="mdc-typography--overline">Hovering</div>
              <h2 className={classnames('mdc-typography--headline5', styles.pollTime)}>
                {format(time, dateFormat)}
              </h2>
            </div>
            <IconButton onClick={this.props.onDeselectClick}>
              <MaterialIcon icon="close" />
            </IconButton>
          </div>
        </div>
      );
    } else if (bestTime) {
      header = (
        <div className={styles.header}>
          <div className="mdc-typography--overline">Best Time to Meet</div>
          <h2 className={classnames('mdc-typography--headline5', styles.pollTime)}>
            {format(bestTime.interval.start, dateFormat)} -{' '}
            {format(bestTime.interval.end + interval * 60 * 1000, dateFormat)}
          </h2>
        </div>
      );
    } else {
      header = (
        <div className={styles.header}>
          <div className="mdc-typography--overline">Best Time to Meet</div>
          <h2 className={classnames('mdc-typography--subtitle1', styles.pollTime)}>
            No best time to meet. Hover your cursor over a time slot to view responses at that time.
          </h2>
        </div>
      );
    }

    return (
      <>
        {this.renderModalContents()}
        <div className={className}>
          <div className={styles.sidebarContainer}>
            <section className={styles.attendees}>
              {header}
              {attending.length > 0 && (
                <section className={styles.attendeeListSection}>
                  <h3
                    className={classnames('mdc-typography--headline6', styles.attendeeListHeader)}
                  >
                    Available
                  </h3>
                  <List twoLine>
                    {sortedRespondents(
                      attending.map((responder) => respondersRespondentsObj[responder]),
                    ).map((respondent) => this.renderRespondent(respondent, false))}
                  </List>
                </section>
              )}
              {notAttending.length > 0 && (
                <section className={styles.attendeeListSection}>
                  <h3
                    className={classnames('mdc-typography--headline6', styles.attendeeListHeader)}
                  >
                    Not Available
                  </h3>
                  <List twoLine>
                    {sortedRespondents(
                      notAttending.map((responder) => respondersRespondentsObj[responder]),
                    ).map((respondent) => this.renderRespondent(respondent, false))}
                  </List>
                </section>
              )}
              {hidden.length > 0 && (
                <section className={styles.attendeeListSection}>
                  <h3
                    className={classnames('mdc-typography--headline6', styles.attendeeListHeader)}
                  >
                    Hidden
                  </h3>
                  <List twoLine>
                    {sortedRespondents(
                      hidden.map((responder) => respondersRespondentsObj[responder]),
                    ).map((respondent) => this.renderRespondent(respondent, true))}
                  </List>
                </section>
              )}
            </section>
            <MenuSurface
              className={styles.menuSurface}
              open={isMenuOpen}
              onClose={this.closeMenu}
              anchorCorner={Corner.TOP_LEFT}
              anchorElement={this.activeItemRef.current}
            >
              {this.renderMenuContents(
                respondersRespondentsObj[selectedResponder],
                respondersRespondentsObj,
                selectedResponder,
              )}
            </MenuSurface>
          </div>
        </div>
      </>
    );
  }
}

export default ShowResultsSidebar;
