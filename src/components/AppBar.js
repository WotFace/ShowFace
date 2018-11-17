import React, { Component, createRef } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import IconButton from '@material/react-icon-button';
import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import classnames from 'classnames';
import { updateServiceWorker } from '../serviceWorker';
import { isSignedIn } from '../utils/auth';
import { auth } from '../firebase';
import { BoomzButton } from './BoomzButton';

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

  componentDidMount() {
    auth().onAuthStateChanged(() => this.forceUpdate());
  }

  renderDefaultSignedInButtonSet() {
    return (
      <>
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
    const blacklisted = pathBlacklist.includes(pathname);
    const signedIn = isSignedIn();

    const menu = (
      <div
        className={classnames(styles.menuContainer, 'mdc-menu-surface--anchor')}
        ref={this.menuAnchorRef}
      >
        {/* Wrap button in div to fix React insertBefore crash on rerender */}
        <div>
          {blacklisted || (
            <IconButton className={styles.menuButton} onClick={this.openMenu}>
              <MaterialIcon icon="menu" />
            </IconButton>
          )}
        </div>
        <MenuSurface
          className="mdc-menu"
          open={this.state.isMenuOpen}
          anchorCorner={Corner.TOP_LEFT}
          onClose={this.closeMenu}
          anchorElement={this.menuAnchorRef.current}
        >
          {signedIn ? this.renderDefaultSignedInMenuList() : this.renderDefaultSignedOutMenuList()}
        </MenuSurface>
      </div>
    );

    const content = blacklisted || (
      <>
        <Link to={signedIn ? '/dashboard' : '/'}>
          <img className={styles.contentLogo} alt="ShowFace Logo" src={logo} />
        </Link>
        <div className={styles.buttonContainer}>
          {signedIn
            ? this.renderDefaultSignedInButtonSet()
            : this.renderDefaultSignedOutButtonSet()}
        </div>
      </>
    );

    return (
      <>
        {this.props.promptRefresh && (
          <BoomzButton id={styles.topBannerButton} onClick={updateServiceWorker}>
            A new version of ShowFace is available. Update now!
          </BoomzButton>
        )}
        <div
          className={classnames(styles.container, {
            [styles.blacklisted]: blacklisted,
          })}
        >
          {content}
          {menu}
        </div>
      </>
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
