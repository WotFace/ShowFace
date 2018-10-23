import styles from './BottomAppBar.module.scss';

import React, { Component } from 'react';

class BottomAppBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAtBottom: true,
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    this.setState({ isAtBottom: this.isAtBottom() });
  };

  isAtBottom = () => {
    const appBarBottom = document
      .getElementsByClassName(styles.appBarBottom)[0]
      .getBoundingClientRect().bottom;
    const windowBottom = window.innerHeight;
    return appBarBottom >= windowBottom - 0.01;
  };

  render() {
    let classes = [styles.appBarBottom];
    if (this.state.isAtBottom) {
      classes.push(styles.noBorderRadius);
    }

    return <div className={classes.join(' ')}>{this.props.children}</div>;
  }
}

export default BottomAppBar;
