import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import logo from "../logo.png";

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "pollId": "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({"pollId": event.target.value});
  }

  handleSubmit(event) {
    this.props.history.push(`/poll/${this.state.pollId}`);
    event.preventDefault();
  }

    render() {
      return (
        <div id="fullscreen" class="flex">
          <img id="logo" src={logo} alt="logo" class="center"/>

          <form onSubmit={this.handleSubmit}>
            <input name="pollId" type="text" value={this.state.pollId} onChange={this.handleChange} class="poll-input" placeholder="Enter Poll ID"/>
          </form>

          <p>or <Link to="/create">Create new poll</Link></p>
        </div>
      );
    }
}

export default Welcome;
