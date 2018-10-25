import React, { Component, createRef } from 'react';
import classnames from 'classnames';

import styles from './BottomAppBar.module.scss';

class BottomAppBar extends Component {
  state = {
    isAtBottom: false,
  };

  containerRef = createRef();

  isAtBottom() {
    const appBarBottom = this.containerRef.current.getBoundingClientRect().bottom;
    const windowBottom = window.innerHeight;
    return appBarBottom >= windowBottom - 0.01;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleScroll);
  }

  handleScroll = () => {
    this.setState({ isAtBottom: this.isAtBottom() });
  };

  render() {
    const { children, className } = this.props;
    const { isAtBottom } = this.state;
    return (
      <div
        className={classnames(
          className,
          styles.barContainer,
          isAtBottom ? styles.stuck : 'mdc-card',
        )}
        ref={this.containerRef}
      >
        <div className={styles.bar}>{children}</div>
      </div>
    );
  }
}

export default BottomAppBar;
