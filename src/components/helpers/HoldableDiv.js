import React, { Component } from 'react';

export default class HoldableDiv extends Component {
  holding = null; // Shape: { timeout: setInterval return value, event: touch start event }

  stopHolding() {
    if (this.holding) {
      clearTimeout(this.holding.timeout);
      this.holding = null;
    }
  }

  handleTouchStart = (event) => {
    if (this.holding) {
      this.stopHolding();
      return;
    }
    this.holding = {
      timeout: setTimeout(this.handleLongPress, this.props.holdFor),
      event,
    };
  };

  handleLongPress = () => {
    this.props.onLongPress(this.holding.event);
    this.holding = null;
  };

  handleTouchMove = () => {
    // TODO: Only cancel above a certain threshold
    this.stopHolding();
  };

  handleTouchStop = () => this.stopHolding();

  render() {
    const { holdFor, onLongPress, ...otherProps } = this.props;
    return (
      <div
        {...otherProps}
        ref={this.divRef}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchStop}
        onTouchCancel={this.handleTouchStop}
      />
    );
  }
}
