import React, { Component, createRef } from 'react';
import { Link } from 'react-router-dom';
import MenuSurface, { Corner } from '@material/react-menu-surface';
import IconButton from '@material/react-icon-button';
import Button from '@material/react-button';
import MaterialIcon from '@material/react-material-icon';
import classnames from 'classnames';
import { isSignedIn } from '../utils/auth';

import sharedStyles from './SharedStyles.module.scss';
import styles from './AppBar.module.scss';
import logo from '../logo.png';

export default class AppBar extends Component {
  state = {
    isMenuOpen: false,
  };

  menuAnchorRef = createRef();

  openMenu = () => this.setState({ isMenuOpen: true });
  closeMenu = () => this.setState({ isMenuOpen: false });

  renderDefaultSignedInButtonSet() {
    return (
      <>
        <Link to="/dashboard" className={sharedStyles.buttonLink}>
          <Button>Dashboard</Button>
        </Link>
      </>
    );
  }

  renderDefaultSignedInMenuList() {
    // Use raw MDC Web list as MDC React doesn't have dividers and support for Links.
    return (
      <ul className="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
        <Link to="/dashboard" className={sharedStyles.buttonLink}>
          <li className="mdc-list-item" role="menuitem">
            <span className="mdc-list-item__text">Dashboard</span>
          </li>
        </Link>
        <li className="mdc-list-item" role="menuitem">
          <span className="mdc-list-item__text">My Account TODO</span>
        </li>
      </ul>
    );
  }

  renderDefaultSignedOutButtonSet() {
    return (
      <>
        <Link to="/login" className={sharedStyles.buttonLink}>
          <Button>Log In</Button>
        </Link>
        <Link to="/signup" className={sharedStyles.buttonLink}>
          <Button>Sign Up</Button>
        </Link>
      </>
    );
  }

  renderDefaultSignedOutMenuList() {
    return (
      <ul className="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
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
    // TODO: Change buttons on login/signup/dashboard pages
    // TODO: Consider putting AppBar in every page instead, and allow pages to provide buttons

    const signedIn = isSignedIn();

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
          <IconButton className={styles.menuButton} onClick={this.openMenu}>
            <MaterialIcon icon="menu" />
          </IconButton>
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
