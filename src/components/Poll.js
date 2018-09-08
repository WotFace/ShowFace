import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';

import PollRespond from './PollRespond';
import PollResults from './PollResults';

import copyToClipboard from '../utils/copyToClipboard';
import { withAlert } from 'react-alert';

import db from '../db';

class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isNew: false,
    };

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
    const pollId = this.props.match.params.pollId;

    db.collection('polls')
      .doc(pollId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          self.setState({ poll: doc.data() });
        } else {
          console.log('no such document');
          console.log(doc);
        }
      });
  }

  render() {
    const { match } = this.props;
    const { poll } = this.state;

    return (
      <section id="poll">
        <section id="header">
          <h1>
            {poll && poll.name}{' '}
            <span class="link" onClick={this.copyUrlToClipboard}>
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
            <Route path={match.url + '/respond'} render={() => <PollRespond poll={poll} />} />
            <Route path={match.url + '/results'} render={() => <PollResults poll={poll} />} />
          </React.Fragment>
        )}
      </section>
    );
  }
}

export default withAlert(Poll);
