import React from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import MaterialIcon from '@material/react-material-icon';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import List, { ListItem, ListItemText, ListItemGraphic } from '@material/react-list';
import Divider from './Divider';

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
      hiddenRespondentIds: [],
    };

    this.setAnchorElement = this.setAnchorElement.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.renderRespondent = this.renderRespondent.bind(this);
  }

  setAnchorElement = (element) => {
    this.setState({ anchorElement: element });
  };

  openMenu = () => this.setState({ isMenuOpen: true });
  closeMenu = () => this.setState({ isMenuOpen: false });

  renderRespondent = (responder, respondent, respondersRespondentsObj) => {
    const { hiddenRespondentIds } = this.state;
    const indexIfHidden = _.findIndex(hiddenRespondentIds, function(a) {
      return a == respondent.id;
    });
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;

    if (indexIfHidden == -1) {
      return (
        <ListItem
          onClick={() => {
            this.setState(
              {
                selectedRespondentKey: responder,
                selectedRespondentId: respondersRespondentsObj[responder].id,
                selectedRespondent: respondersRespondentsObj[responder],
              }, () => {
                this.setState({
                  isMenuOpen: true,
                });
              },
            );
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
          {respondent.id == (this.state.selectedRespondent ? this.state.selectedRespondent.id : false) ?
            (<div ref={this.setAnchorElement} />) :
            (<div ref={null} />)}
        </ListItem>
      );
    } else {
      return <div />;
    }
  };

  renderHiddenRespondent = (responder, respondent, respondersRespondentsObj) => {
    const { hiddenRespondentIds } = this.state;
    const indexIfHidden = _.findIndex(hiddenRespondentIds, function(a) {
      return a == respondent.id;
    });
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;
    if (indexIfHidden == -1) {
      return <div />;
    } else {
      return (
        <ListItem
          onClick={() => {
            this.setState(
              {
                selectedRespondentKey: responder,
                selectedRespondentId: respondersRespondentsObj[responder].id,
                selectedRespondent: respondersRespondentsObj[responder],
              }, () => {
                this.setState({
                  isMenuOpen: true,
                });
              },
            );
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
          {respondent.id == (this.state.selectedRespondent ? this.state.selectedRespondent.id : false) ?
            (<div ref={this.setAnchorElement} />) :
            (<div ref={null} />)}
          <MaterialIcon className={styles.hiddenIcon} icon='visibility_off' />
        </ListItem>
      );
    }
  }

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

  handleHideUser = async () => {
    const { hiddenRespondentIds, selectedRespondent } = this.state;
    const hiddenRespondentIndex = _.findIndex(hiddenRespondentIds, function(a) {
      return a == selectedRespondent.id;
    });
    if (hiddenRespondentIndex == -1) {
      const hiddenRespondentIdAdded = await _.concat(hiddenRespondentIds, selectedRespondent.id);
      this.setState({ hiddenRespondentIds: hiddenRespondentIdAdded }, () => {
        this.props.onHideUser(hiddenRespondentIdAdded);
      });
    } else {
      const hiddenRespondentIdRemoved = await _.remove(hiddenRespondentIds, function(a) {
        return a != selectedRespondent.id;
      });
      this.setState(
        {
          hiddenRespondentIds: hiddenRespondentIdRemoved,
        },
        () => {
          this.props.onHideUser(hiddenRespondentIdRemoved);
        },
      );
    }
    this.closeMenu();
  };

  // handleEditResponse = () => {
  //   const { selectedRespondent } = this.state;
  //   this.closeMenu();
  //   // route to edit user info
  // };

  renderMenuContents = (respondent, respondersRespondentsObj) => {
    if (respondent) {
      const { hiddenRespondentIds, selectedRespondent } = this.state;
      const currentUser = getFirebaseUserInfo();
      // TODO: make it possible to hide respondents dynamically
      const hiddenRespondentIndex = _.findIndex(hiddenRespondentIds, function(a) {
        return a == selectedRespondent.id;
      });
      let userInMeeting = null;
      if (currentUser != null) {
        userInMeeting = _.findKey(respondersRespondentsObj, function (a) {
          return a.user && a.user.email === currentUser.email;
        });
      }

      return (
        <div>
          <div className={styles.listItemHeader}>
            <p>{respondent.user ? respondent.user.name : respondent.anonymousName} <br />
            <span className={styles.listItemSubText}>{(respondent.user ? (respondent.user.email + ' • ') : '') + respondent.role}</span></p>
          </div>
          <Divider />
          <List>
            <ListItem onClick={this.handleHideUser}>
              <ListItemGraphic graphic={<MaterialIcon icon={(hiddenRespondentIndex == -1) ? 'visibility_off' : 'visibility'} />} />
              <ListItemText primaryText={(hiddenRespondentIndex == -1) ? 'Hide' : 'Un-hide'} />
            </ListItem>
            {/* {(!respondent.user || (userInMeeting && userInMeeting.user.role == 'admin')) ? (
              <ListItem onClick={this.handleEditResponse}>
                <ListItemGraphic graphic={<MaterialIcon icon='edit' />} />
                <ListItemText primaryText='Edit response' />
              </ListItem>
            ) : <div />} */}
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
        </div>
      );
    }
  };

  render() {
    const { className, partitionedRespondents, time } = this.props;
    const { anchorElement, selectedRespondentKey, isMenuOpen, hiddenRespondentIds } = this.state;

    const { attending, notAttending, respondersRespondentsObj } = partitionedRespondents;

    return (
      <div className={className}>
        <div className={styles.sidebarContainer}>
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
            {hiddenRespondentIds.length != 0 ? (
              <section className={styles.attendeeListSection}>
                <h3>Hidden</h3>
                <List twoLine>
                  {attending.map((responder) => {
                    const respondent = respondersRespondentsObj[responder];
                    return this.renderHiddenRespondent(responder, respondent, respondersRespondentsObj);
                  })}
                  {notAttending.map((responder) => {
                    const respondent = respondersRespondentsObj[responder];
                    return this.renderHiddenRespondent(responder, respondent, respondersRespondentsObj);
                  })}
                </List>
              </section>
            ) : (
              <div />
            )}
          </section>
          <MenuSurface
            className={styles.menuSurface}
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
