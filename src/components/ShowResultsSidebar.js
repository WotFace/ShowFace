import React, { createRef } from 'react';
import { format } from 'date-fns';
import classnames from 'classnames';
import { withAlert } from 'react-alert';
import { Mutation } from 'react-apollo';
import MaterialIcon from '@material/react-material-icon';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import List, { ListItem, ListItemText, ListItemGraphic } from '@material/react-list';
import { getAuthInput } from '../utils/auth';

import _ from 'lodash';
import { getFirebaseUserInfo } from '../utils/auth';
import gql from 'graphql-tag';

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
      <ListItem onClick={() => { this.setState({ isMenuOpen: true, selectedRespondentKey: responder }) }}>
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

  renderMenuContents(respondent, respondersRespondentsObj) {
    if (respondent) {
      const currentUser = getFirebaseUserInfo;
      // TODO: make it possible to hide respondents dynamically
      const isRespondentHidden = false;
      console.log(respondersRespondentsObj);
      let userInMeeting = null;
      if (currentUser != null) {
        userInMeeting = _.findKey(respondersRespondentsObj, function (a) {
          return a.user && a.user.email == currentUser.email;
        });
        console.log(userInMeeting);
      }

      return (
        <List>
          <ListItem onClick={this.closeMenu}>
            <ListItemGraphic graphic={<MaterialIcon icon={isRespondentHidden ? 'visibility_off' : 'visibility'} />} />
            <ListItemText primaryText={isRespondentHidden ? 'Un-hide' : 'Hide'} />
          </ListItem>
          {(userInMeeting && userInMeeting.role == 'admin') ? (
            <ListItem onClick={this.closeMenu}>
              <ListItemGraphic graphic={<MaterialIcon icon={(respondent.isKeyRespondent ? true : false) ? 'star_border' : 'star'} />} />
              <ListItemText primaryText={(respondent.isKeyRespondent ? true : false) ? 'Remove key respondent' : 'Make key respondent'} />
            </ListItem>
          ) : <div />}
          {(userInMeeting && userInMeeting.role == 'admin') ? (
            <ListItem onClick={this.closeMenu}>
              <ListItemGraphic graphic={<MaterialIcon icon={(respondent.role == 'admin') ? 'person_add_disabled' : 'person_add'} />} />
              <ListItemText primaryText={(respondent.role == 'admin') ? 'Revoke admin' : 'Make admin'} />
            </ListItem>
          ) : <div />}
          {((userInMeeting && userInMeeting.role == 'admin') || (!respondent.user && respondent.anonymousName)) ? (
            <ListItem onClick={this.closeMenu}>
              <ListItemGraphic graphic={<MaterialIcon icon="clear_all" />} />
              <ListItemText primaryText="Clear response" />
            </ListItem>
          ) : <div />}
          {((userInMeeting && userInMeeting.role == 'admin') || (!respondent.user && respondent.anonymousName)) ? (
            <ListItem onClick={this.closeMenu}>
              <ListItemGraphic graphic={<MaterialIcon icon="delete" />} />
              <ListItemText primaryText="Remove" />
            </ListItem>
          ) : <div />}
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

const UPDATE_SHOW_RESPONDENT_STATUS = gql`
  mutation EditShowRespondentStatus(
    $slug: String!
    $id: String!
    $role: String
    $isKeyRespondent: Boolean
    $auth: AuthInput
  ) {
    editShowRespondentStatus(
      auth: $auth
      where: {
        slug: $slug 
        id: $id 
      }
      data: {
        role: $role
        isKeyRespondent: $isKeyRespondent
      }
    ) {
      slug
    }
  }
`;

const DELETE_RESPONDENTS = gql`
  mutation DeleteRespondents(
    $slug: String!
    $id: [String!]!
    $auth: AuthInput
  ) {
    deleteRespondents(
      auth: $auth
      where: { 
        slug: $slug 
        id: $id 
      }
    ) {
      slug
    }
  }
`;

const DELETE_RESPONSE = gql`
  mutation DeleteResponse(
    $slug: String!
    $id: String!
    $auth: AuthInput
  ) {
    deleteResponse(
      auth: $auth
      where: {
        slug: $slug
        id: $id
      }
    ) {
      slug
    }
  }
`;

// export default ShowResultsSidebar;

// export default withAlert((props) => {
//   return (
//     <Mutation mutation={DELETE_RESPONDENTS}>
//       {(deleteRespondents, deleteRespondentsResult) => (
//         <Mutation mutation={UPDATE_SHOW_RESPONDENT_STATUS}>
//           {(editShowRespondentStatus, editShowRespondentStatusResult) => (
//             <Mutation mutation={DELETE_RESPONSE}>
//               {(deleteResponse, deleteResponseResult) => (
//                 <ShowResultsSidebar
//                   {...props}
//                   deleteResponse={async (slug, id) => {
//                     const auth = await getAuthInput();
//                     deleteResponse({ variables: { slug, id, auth } });
//                   }}
//                   deleteResponseResult={deleteResponseResult}
//                   deleteRespondents={async (slug, id) => {
//                     const auth = await getAuthInput();
//                     deleteRespondents({ variables: { slug, id, auth } });
//                   }}
//                   deleteRespondentsResult={deleteRespondentsResult}
//                   editShowRespondentStatus={async (slug, id, role, isKeyRespondent) => {
//                     const auth = await getAuthInput();
//                     editShowRespondentStatus({
//                       variables: { slug, id, role, isKeyRespondent, auth },
//                     });
//                   }}
//                   editShowRespondentStatusResult={editShowRespondentStatusResult}
//                 />
//               )}
//             </Mutation>
//           )}
//           )}
//         </Mutation>
//       )}
//     </Mutation>
//   );
// });

export default withAlert((props) => {
  return (
    <Mutation mutation={UPDATE_SHOW_RESPONDENT_STATUS}>
      {(editShowRespondentStatus, editShowRespondentStatusResult) => (
        <ShowResultsSidebar
          {...props}
          // deleteResponse={async (slug, id) => {
          //   const auth = await getAuthInput();
          //   deleteResponse({ variables: { slug, id, auth } });
          // }}
          // deleteResponseResult={deleteResponseResult}
          // deleteRespondents={async (slug, id) => {
          //   const auth = await getAuthInput();
          //   deleteRespondents({ variables: { slug, id, auth } });
          // }}
          // deleteRespondentsResult={deleteRespondentsResult}
          editShowRespondentStatus={async (slug, id, role, isKeyRespondent) => {
            const auth = await getAuthInput();
            editShowRespondentStatus({
              variables: { slug, id, role, isKeyRespondent, auth },
            });
          }}
          editShowRespondentStatusResult={editShowRespondentStatusResult}
        />
      )}
    </Mutation>
  );
});
