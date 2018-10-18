import styles from './BottomAppBar.module.scss';

import React, { Component } from 'react';

class BottomAppBar extends Component {
  render() {
    var className = styles.appBarBottom;
    if (this.props.align) {
        className += this.props.align.toLowerCase()
    }

    return ( 
        <div className={styles.appBarBottom}>
            {this.props.content}
        </div>
    );
  }
};

export default BottomAppBar;