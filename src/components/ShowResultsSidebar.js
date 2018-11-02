import React, { createRef } from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import { auth } from '../firebase';
import _ from 'lodash';
import MaterialIcon from '@material/react-material-icon';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import List, { ListItem, ListItemText, ListItemGraphic } from '@material/react-list';

import styles from './ShowResultsSidebar.module.scss';

class ShowResultsSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      anchorElement: null,
      selectedRespondentKey: '',
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

  renderRespondent(responder, respondent) {
    const displayName = respondent.user ? respondent.user.name : respondent.anonymousName;

    return (
      <ListItem onClick={() => {this.setState({ isMenuOpen: true, selectedRespondentKey: responder }) }}>
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
  }

  renderMenuContents(respondent) {
    if (respondent) {
      const currentUser = auth().currentUser;
      // TODO: make it possible to hide respondents dynamically
      const isRespondentHidden = false;

      return (
        <List>
          <ListItem onClick={this.closeMenu}>
            <ListItemGraphic graphic={<MaterialIcon icon={isRespondentHidden ? 'visibility_off' : 'visibility'} />} />
            <ListItemText primaryText={isRespondentHidden ? 'Un-hide' : 'Hide'} />
          </ListItem>
          <ListItem onClick={this.closeMenu}>
            <ListItemGraphic graphic={<MaterialIcon icon={(respondent.isKeyRespondent ? true : false) ? 'star_border' : 'star'} />} />
            <ListItemText primaryText={(respondent.isKeyRespondent ? true : false) ? 'Remove key respondent' : 'Make key respondent'} />
          </ListItem>
          <ListItem onClick={this.closeMenu}>
            <ListItemGraphic graphic={<MaterialIcon icon={(respondent.role == 'admin') ? 'person_add_disabled' : 'person_add'} />} />
            <ListItemText primaryText={(respondent.role == 'admin') ? 'Revoke admin' : 'Make admin'} />
          </ListItem>
          <ListItem onClick={this.closeMenu}>
            <ListItemGraphic graphic={<MaterialIcon icon="clear_all" />} />
            <ListItemText primaryText="Clear response" />
          </ListItem>
          <ListItem onClick={this.closeMenu}>
            <ListItemGraphic graphic={<MaterialIcon icon="delete" />} />
            <ListItemText primaryText="Remove" />
          </ListItem>
        </List>
      );
    }
  }

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
                  return this.renderRespondent(responder, respondent);
                })}
              </List>
            </section>
            <section className={styles.attendeeListSection}>
              <h3>Not Available</h3>
              <List twoLine>
                {notAttending.map((responder) => {
                  const respondent = respondersRespondentsObj[responder];
                  return this.renderRespondent(responder, respondent);
                })}
              </List>
            </section>
          </section>
          <MenuSurface
            open={isMenuOpen}
            onClose={this.closeMenu}
            anchorCorner={Corner.BOTTOM_RIGHT}
            anchorElement={anchorElement}
          >
            {this.renderMenuContents(respondersRespondentsObj[selectedRespondentKey])}
          </MenuSurface>
        </div>
      </div>
    );
  }
}

export default ShowResultsSidebar;
