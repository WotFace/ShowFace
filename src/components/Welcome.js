import React, { Component } from 'react';

import { Link } from 'react-router-dom';

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
        <div>
          <h1>Welcome to ShowFace</h1>
          <form onSubmit={this.handleSubmit}>
            <label for="pollId">Enter poll id</label>
            <input name="pollId" type="text" value={this.state.pollId} onChange={this.handleChange}/>
          </form>

          <Link to="/create">Create new poll</Link>
        </div>
      );
    }
}

export default Welcome;
