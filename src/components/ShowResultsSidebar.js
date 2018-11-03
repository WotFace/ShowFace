import React, { createRef } from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import MaterialIcon from '@material/react-material-icon';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import List, { ListItem, ListItemText, ListItemGraphic } from '@material/react-list';
import { getAuthInput } from '../utils/auth';

import _ from 'lodash';
import { getFirebaseUserInfo } from '../utils/auth';

import styles from './ShowResultsSidebar.module.scss';

class ShowResultsSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      anchorElement: null,
      selectedRespondentKey: '',
      selectedRespondent: null,
    };

    this.setAnchorElement = this.setAnchorElement.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.renderRespondent = this.renderRespondent.bind(this);
  }

  setAnchorElement = (element) => {
    if (this.state.anchorElement) {
      return;
    }
    this.setState({ anchorElement: element });
  };

  openMenu = () => this.setState({ isMenuOpen: true });
  closeMenu = () => this.setState({ isMenuOpen: false });

  renderRespondent = (responder, respondent, respondersRespondentsObj) => {
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;

    return (
      <ListItem
        onClick={() => {
          this.setState({
            isMenuOpen: true,
            selectedRespondentKey: responder,
            selectedRespondentId: respondersRespondentsObj[responder].id,
            selectedRespondent: respondersRespondentsObj[responder],
          });
        }}
      >
        <ListItemGraphic
          graphic={
            <MaterialIcon
              icon={respondent.isKeyRespondent ? 'star' : 'star_border'}
              className={respondent.isKeyRespondent ? styles.keyRespondentActive : styles.keyRespondentInactive} />
          }
        />
        <ListItemText
          className={styles.listText}
          primaryText={displayName}
          secondaryText={(respondent.user ? (respondent.user.email + ' • ') : '') + (respondent.role) + (' • ' + ((respondent.response.length == 0) ? 'not responded' : 'responded'))}
        />
      </ListItem>
    );
  };

  handleDeleteResponse = () => {
    const { selectedRespondent } = this.state;
    //TODO: add dialog box to confirm choice
    this.closeMenu();
    this.props.onDeleteResponse(selectedRespondent.id);
  };

  handleDeleteRespondents = () => {
    const { selectedRespondent } = this.state;
    this.closeMenu();
    this.props.onDeleteRespondents(selectedRespondent.id);
  };

  handleEditKeyRespondentStatus = () => {
    const { selectedRespondent } = this.state;
    const isKeyRespondent = !selectedRespondent.isKeyRespondent;
    this.closeMenu();
    this.props.onEditRespondentStatus(
      selectedRespondent.id,
      selectedRespondent.role,
      isKeyRespondent,
    );
  };

  handleEditRespondentRoleStatus = () => {
    const { selectedRespondent } = this.state;
    const respondentRole = selectedRespondent.role === 'member' ? 'admin' : 'member';
    this.closeMenu();
    this.props.onEditRespondentStatus(
      selectedRespondent.id,
      respondentRole,
      selectedRespondent.isKeyRespondent,
    );
  };

  handleHideUser = () => {
    this.closeMenu();
  };

  handleEditResponse = () => {
    const { selectedRespondent } = this.state;
    this.closeMenu();
    // route to edit user info
  }

  renderMenuContents = (respondent, respondersRespondentsObj) => {
    if (respondent) {
      const currentUser = getFirebaseUserInfo();
      // TODO: make it possible to hide respondents dynamically
      const isRespondentHidden = false;
      let userInMeeting = null;
      if (currentUser != null) {
        userInMeeting = _.findKey(respondersRespondentsObj, function (a) {
          return a.user && a.user.email === currentUser.email;
        });
      }

      return (
        <List>
          <ListItem onClick={this.handleHideUser}>
            <ListItemGraphic graphic={<MaterialIcon icon={isRespondentHidden ? 'visibility_off' : 'visibility'} />} />
            <ListItemText primaryText={isRespondentHidden ? 'Un-hide' : 'Hide'} />
          </ListItem>
          {(!respondent.user || (userInMeeting && userInMeeting.user.role == 'admin')) ? (
            <ListItem onClick={() => {}}>
              <ListItemGraphic graphic={<MaterialIcon icon='edit' />} />
              <ListItemText primaryText='Edit response' />
            </ListItem>
          ) : <div />}
          {(userInMeeting && userInMeeting.role == 'admin') ? (
            <ListItem onClick={this.handleEditKeyRespondentStatus}>
              <ListItemGraphic graphic={<MaterialIcon icon={(respondent.isKeyRespondent ? true : false) ? 'star_border' : 'star'} />} />
              <ListItemText primaryText={(respondent.isKeyRespondent ? true : false) ? 'Remove key respondent' : 'Make key respondent'} />
            </ListItem>
          ) : <div />}
          {(userInMeeting && userInMeeting.role == 'admin') ? (
            <ListItem onClick={this.handleEditRespondentRoleStatus}>
              <ListItemGraphic graphic={<MaterialIcon icon={(respondent.role == 'admin') ? 'person_add_disabled' : 'person_add'} />} />
              <ListItemText primaryText={(respondent.role == 'admin') ? 'Revoke admin' : 'Make admin'} />
            </ListItem>
          ) : <div />}
          {((userInMeeting && userInMeeting.role == 'admin') || (!respondent.user && respondent.anonymousName)) ? (
            <ListItem onClick={this.handleDeleteResponse}>
              <ListItemGraphic graphic={<MaterialIcon icon="clear_all" />} />
              <ListItemText primaryText="Clear response" />
            </ListItem>
          ) : <div />}
          {((userInMeeting && userInMeeting.role == 'admin') || (!respondent.user && respondent.anonymousName)) ? (
            <ListItem onClick={this.handleDeleteRespondents}>
              <ListItemGraphic graphic={<MaterialIcon icon="delete" />} />
              <ListItemText primaryText="Remove" />
            </ListItem>
          ) : <div />}
        </List>
      );
    }
  };

  render() {
    const { className, partitionedRespondents, time } = this.props;
    const { anchorElement, selectedRespondentKey, isMenuOpen } = this.state;

    const { attending, notAttending, respondersRespondentsObj } = partitionedRespondents;

    return (
      <div className={className}>
        <div className={styles.sidebarContainer} ref={this.setAnchorElement}>
          <section className={styles.attendees}>
            {time ? <h2 className={styles.pollTime}>{format(time, 'D MMM hh:mmA')}</h2> : null}
            <section className={styles.attendeeListSection}>
              <h3>Available</h3>
              <List twoLine>
                {attending.map((responder) => {
                  const respondent = respondersRespondentsObj[responder];
                  return this.renderRespondent(responder, respondent, respondersRespondentsObj);
                })}
              </List>
            </section>
            <section className={styles.attendeeListSection}>
              <h3>Not Available</h3>
              <List twoLine>
                {notAttending.map((responder) => {
                  const respondent = respondersRespondentsObj[responder];
                  return this.renderRespondent(responder, respondent, respondersRespondentsObj);
                })}
              </List>
            </section>
          </section>
          <MenuSurface
            open={isMenuOpen}
            onClose={this.closeMenu}
            anchorCorner={Corner.TOP_LEFT}
            anchorElement={anchorElement}
          >
            {this.renderMenuContents(
              respondersRespondentsObj[selectedRespondentKey],
              respondersRespondentsObj,
            )}
          </MenuSurface>
        </div>
      </div>
    );
  }
}

export default ShowResultsSidebar;
