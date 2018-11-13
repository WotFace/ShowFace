import React, { Component, createRef } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import IconButton from '@material/react-icon-button';
import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import classnames from 'classnames';
import { getRegistration } from '../serviceWorker';
import { isSignedIn } from '../utils/auth';
import { auth } from '../firebase';
import { BoomzButton, BoomzMenuItem, BoomzIconButton } from './BoomzButton';

import sharedStyles from './SharedStyles.module.scss';
import styles from './AppBar.module.scss';
import logo from '../logo.png';

class AppBar extends Component {
  state = {
    isMenuOpen: false,
  };

  menuAnchorRef = createRef();

  openMenu = () => this.setState({ isMenuOpen: true });
  closeMenu = () => this.setState({ isMenuOpen: false });

  handleUpdateClick = () => {
    // Source: https://github.com/nusmodifications/nusmods/pull/1047/files#diff-9d6bd6e0b057775fc0d2e9603db2b5f5R33
    const registration = getRegistration();
    if (!registration || !registration.waiting) {
      // Just to ensure registration.waiting is available before
      // calling postMessage()
      return;
    }
    registration.waiting.postMessage('skipWaiting');
  };

  componentDidMount() {
    auth().onAuthStateChanged(() => this.forceUpdate());
  }

  // Remove after STePS
  renderSTePSButton() {
    return (
      <BoomzButton
        className={styles.barButton}
        onClick={() => window.open('http://isteps.comp.nus.edu.sg/event/13th-steps/vote', '_blank')}
      >
        Vote for ShowFace at STePS!
      </BoomzButton>
    );
  }

  renderDefaultSharedButtonSet() {
    return (
      <>
        {this.renderSTePSButton()}
        {this.props.promptRefresh && (
          <BoomzButton className={styles.barButton} onClick={this.handleUpdateClick}>
            Update ShowFace!
          </BoomzButton>
        )}
      </>
    );
  }

  renderDefaultSharedMenuItems() {
    return (
      <>
        {this.props.promptRefresh && (
          <BoomzMenuItem onClick={this.handleUpdateClick}>
            <span className="mdc-list-item__text">Update ShowFace!</span>
          </BoomzMenuItem>
        )}
      </>
    );
  }

  renderDefaultSignedInButtonSet() {
    return (
      <>
        {this.renderDefaultSharedButtonSet()}
        <Link to="/dashboard" className={sharedStyles.buttonLink}>
          <Button>Dashboard</Button>
        </Link>
        <Button
          onClick={() => {
            auth().signOut();
          }}
        >
          Log out
        </Button>
      </>
    );
  }

  renderDefaultSignedInMenuList() {
    // Use raw MDC Web list as MDC React doesn't have dividers and support for Links.
    return (
      <ul
        className="mdc-list"
        role="menu"
        aria-hidden="true"
        aria-orientation="vertical"
        onClick={this.closeMenu}
      >
        {this.renderDefaultSharedMenuItems()}
        <Link to="/dashboard" className={sharedStyles.buttonLink}>
          <li className="mdc-list-item" role="menuitem">
            <span className="mdc-list-item__text">Dashboard</span>
          </li>
        </Link>
        <li
          className="mdc-list-item"
          role="menuitem"
          onClick={() => {
            auth().signOut();
          }}
        >
          <span className="mdc-list-item__text">Log out</span>
        </li>
      </ul>
    );
  }

  renderDefaultSignedOutButtonSet() {
    return (
      <>
        {this.renderDefaultSharedButtonSet()}
        <Link to="/login" className={classnames(sharedStyles.buttonLink, styles.barButton)}>
          <Button>Log In</Button>
        </Link>
      </>
    );
  }

  renderDefaultSignedOutMenuList() {
    return (
      <ul
        className="mdc-list"
        role="menu"
        aria-hidden="true"
        aria-orientation="vertical"
        onClick={this.closeMenu}
      >
        {this.renderDefaultSharedMenuItems()}
        <Link to="/login" className={classnames(sharedStyles.buttonLink, 'mdc-list-item__text')}>
          <li className="mdc-list-item" role="menuitem">
            <span className="mdc-list-item__text">Log In</span>
          </li>
        </Link>
        <Link to="/signup" className={classnames(sharedStyles.buttonLink, 'mdc-list-item__text')}>
          <li className="mdc-list-item" role="menuitem">
            <span className="mdc-list-item__text">Sign Up</span>
          </li>
        </Link>
      </ul>
    );
  }

  render() {
    // Don't render AppBar on blacklisted pages
    const { pathBlacklist } = this.props;
    const pathname = this.props.location.pathname.toLowerCase();
    if (pathBlacklist.includes(pathname)) return null;

    // TODO: Change buttons on login/signup/dashboard pages

    const signedIn = isSignedIn();

    const MenuIconButton = this.props.promptRefresh ? BoomzIconButton : IconButton;

    return (
      <div className={styles.container}>
        <Link to={signedIn ? '/dashboard' : '/'}>
          <img className={styles.contentLogo} alt="ShowFace Logo" src={logo} />
        </Link>
        <div className={styles.buttonContainer}>
          {signedIn
            ? this.renderDefaultSignedInButtonSet()
            : this.renderDefaultSignedOutButtonSet()}
        </div>
        <div
          className={classnames(styles.menuContainer, 'mdc-menu-surface--anchor')}
          ref={this.menuAnchorRef}
        >
          {/* Wrap icon button in div to fix React insertBefore crash on rerender */}
          <div>
            <MenuIconButton className={styles.menuButton} onClick={this.openMenu}>
              <MaterialIcon icon="menu" />
            </MenuIconButton>
          </div>
          <MenuSurface
            className="mdc-menu"
            open={this.state.isMenuOpen}
            anchorCorner={Corner.TOP_LEFT}
            onClose={this.closeMenu}
            anchorElement={this.menuAnchorRef.current}
          >
            {signedIn
              ? this.renderDefaultSignedInMenuList()
              : this.renderDefaultSignedOutMenuList()}
          </MenuSurface>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    promptRefresh: state.ui.promptRefresh,
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps),
)(AppBar);
