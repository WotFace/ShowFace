import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';

import PollRespond from './PollRespond';
import PollResults from './PollResults';

import ReactLoading from 'react-loading';

import copyToClipboard from '../utils/copyToClipboard';
import { withAlert } from 'react-alert';

import db from '../db';

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
          isLoaded: true
        });
      } else {
        console.log('no such document');
        console.log(doc);
      }
    });
  }

  handlePollChange = (newPoll) => {
    this.pollDoc.update(newPoll);
    this.setState({ poll: newPoll }); // Optimistically update the local state
  };

  render() {
    const { match } = this.props;
    const { isLoaded, poll } = this.state;
    if (!isLoaded) {
      return (
        <section className="full-page flex">
          <h2>Loading</h2>
          <ReactLoading type="bubbles" color="#111"/>
        </section>
      );
    } else {
      return (
        <section id="poll">
          <section id="header">
            <h1>
              {poll && poll.name}{' '}
              <span className="link" onClick={this.copyUrlToClipboard}>
                Copy to Clipboard
              </span>
            </h1>
            <nav>
              <ul>
                <Link to={`${match.url}/respond`}>Respond</Link>
                <Link to={`${match.url}/results`}>Results</Link>
              </ul>
            </nav>
          </section>
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
      );
    }
  }
}

export default withAlert(Poll);
