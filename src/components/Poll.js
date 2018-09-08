import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
import _ from 'lodash';
import { withAlert } from 'react-alert';
import ReactLoading from 'react-loading';

import db from '../db';

import copyToClipboard from '../utils/copyToClipboard';

import PollRespond from './PollRespond';
import PollResults from './PollResults';

import logo from '../logo.png';
import clipboardIcon from '../clipboard-regular.svg'; // https://fontawesome.com/license
import './Poll.css';

class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
    };

    const pollId = this.props.match.params.pollId;
    this.pollDoc = db.collection('polls').doc(pollId);

    this.copyUrlToClipboard = this.copyUrlToClipboard.bind(this);
  }

  copyUrlToClipboard() {
    copyToClipboard(window.location.href);
    this.props.alert.show('Url copied to clipboard.', {
      type: 'success',
    });
  }

  componentDidMount() {
    const self = this;
    this.pollDoc.onSnapshot((doc) => {
      if (doc.exists) {
        self.setState({
          poll: doc.data(),
          isLoaded: true,
        });
      } else {
        console.log('no such document');
        console.log(doc);
      }
    });
  }

  uploadPoll = _.debounce(() => {
    this.pollDoc.update(this.state.poll);
  }, 500);

  handlePollChange = (newPoll) => {
    this.uploadPoll();
    this.setState({ poll: newPoll }); // Optimistically update the local state
  };

  render() {
    const { match } = this.props;
    const { isLoaded, poll } = this.state;
    if (!isLoaded) {
      return (
        <section className="full-page flex">
          <h2>Loading</h2>
          <ReactLoading type="bubbles" color="#111" />
        </section>
      );
    } else {
      return (
        <div className="container Poll-container">
          <section id="form-header">
            <img className="content-logo" alt="" src={logo} />
            <div className="Poll-header">
              <h1 className="Poll-name">{poll && poll.name}</h1>
              <button className="btn btn-link" onClick={this.copyUrlToClipboard}>
                Copy link <img src={clipboardIcon} className="font-icon" />
              </button>
            </div>
            <nav>
              <ul className="nav nav-tabs nav-fill">
                <NavLink
                  to={`${match.url}/respond`}
                  className="nav-item nav-link"
                  activeClassName="active"
                >
                  Respond
                </NavLink>
                <NavLink
                  to={`${match.url}/results`}
                  className="nav-item nav-link"
                  activeClassName="active"
                >
                  Results
                </NavLink>
              </ul>
            </nav>
          </section>
          <section id="poll">
            {poll && (
              <React.Fragment>
                <Route
                  path={match.url + '/respond'}
                  render={() => <PollRespond poll={poll} onPollChange={this.handlePollChange} />}
                />
                <Route
                  path={match.url + '/results'}
                  render={() => <PollResults poll={poll} onPollChange={this.handlePollChange} />}
                />
              </React.Fragment>
            )}
          </section>
        </div>
      );
    }
  }
}

export default withAlert(Poll);
