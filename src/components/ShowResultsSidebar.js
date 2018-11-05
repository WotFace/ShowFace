import React from 'react';
import { format } from 'date-fns';
import MaterialIcon from '@material/react-material-icon';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import List, { ListItem, ListItemText, ListItemGraphic } from '@material/react-list';
import _ from 'lodash';
import { getFirebaseUserInfo } from '../utils/auth';
import Divider from './Divider';
import styles from './ShowResultsSidebar.module.scss';

class ShowResultsSidebar extends React.Component {
  state = {
    isMenuOpen: false,
    selectedRespondentKey: '',
    selectedRespondent: null,
  };

  activeItemRef = React.createRef();

  openMenu = () => this.setState({ isMenuOpen: true });
  closeMenu = () => this.setState({ isMenuOpen: false });

  renderRespondent = (responder, respondent, respondersRespondentsObj, isHidden) => {
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;

    return (
      <ListItem
        key={responder}
        onClick={() => {
          if (this.state.isMenuOpen) return;
          this.setState(
            {
              selectedRespondentKey: responder,
              selectedRespondentId: respondersRespondentsObj[responder].id,
              selectedRespondent: respondersRespondentsObj[responder],
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
    const { selectedRespondentKey } = this.state;
    this.props.onHideUnhideUser(selectedRespondentKey);
    this.closeMenu();
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
    const { selectedRespondentKey } = this.state;
    const currentUser = getFirebaseUserInfo();
    // TODO: make it possible to hide respondents dynamically
    const isHidden = hidden.includes(selectedRespondentKey);
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
        <ListItem key="keyrespondent" onClick={this.handleEditKeyRespondentStatus}>
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
        <ListItem key="admintoggle" onClick={this.handleEditRespondentRoleStatus}>
          <ListItemGraphic
            graphic={
              <MaterialIcon
                icon={respondent.role === 'admin' ? 'person_add_disabled' : 'person_add'}
              />
            }
          />
          <ListItemText primaryText={respondent.role === 'admin' ? 'Revoke admin' : 'Make admin'} />
        </ListItem>,
      );
    }

    if (
      !isHidden &&
      ((userInMeeting && userInMeeting.role === 'admin') ||
        (!respondent.user && respondent.anonymousName))
    ) {
      listItems.push(
        <ListItem key="clearresp" onClick={this.handleDeleteResponse}>
          <ListItemGraphic graphic={<MaterialIcon icon="clear_all" />} />
          <ListItemText primaryText="Clear response" />
        </ListItem>,
      );

      listItems.push(
        <ListItem key="rmresp" onClick={this.handleDeleteRespondents}>
          <ListItemGraphic graphic={<MaterialIcon icon="delete" />} />
          <ListItemText primaryText="Remove" />
        </ListItem>,
      );
    }

    return (
      <div>
        <div className={styles.listItemHeader}>
          <p>
            {respondent.user ? respondent.user.name : respondent.anonymousName} <br />
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

  render() {
    const { className, partitionedRespondents, time } = this.props;
    const { selectedRespondentKey, isMenuOpen } = this.state;

    const { hidden, attending, notAttending, respondersRespondentsObj } = partitionedRespondents;
    return (
      <div className={className}>
        <div className={styles.sidebarContainer}>
          <section className={styles.attendees}>
            {time ? <h2 className={styles.pollTime}>{format(time, 'D MMM hh:mmA')}</h2> : null}
            {attending.length > 0 && (
              <section className={styles.attendeeListSection}>
                <h3>Available</h3>
                <List twoLine>
                  {attending.map((responder) => {
                    const respondent = respondersRespondentsObj[responder];
                    return this.renderRespondent(
                      responder,
                      respondent,
                      respondersRespondentsObj,
                      false,
                    );
                  })}
                </List>
              </section>
            )}
            {notAttending.length > 0 && (
              <section className={styles.attendeeListSection}>
                <h3>Not Available</h3>
                <List twoLine>
                  {notAttending.map((responder) => {
                    const respondent = respondersRespondentsObj[responder];
                    return this.renderRespondent(
                      responder,
                      respondent,
                      respondersRespondentsObj,
                      false,
                    );
                  })}
                </List>
              </section>
            )}
            {hidden.length > 0 && (
              <section className={styles.attendeeListSection}>
                <h3>Hidden</h3>
                <List twoLine>
                  {hidden.map((responder) => {
                    const respondent = respondersRespondentsObj[responder];
                    return this.renderRespondent(
                      responder,
                      respondent,
                      respondersRespondentsObj,
                      true,
                    );
                  })}
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
              respondersRespondentsObj[selectedRespondentKey],
              respondersRespondentsObj,
              selectedRespondentKey,
            )}
          </MenuSurface>
        </div>
      </div>
    );
  }
}

export default ShowResultsSidebar;
