import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { DateRange } from 'react-date-range';
import Button from '@material/react-button';
import classnames from 'classnames';
import generateName from '../utils/generateName';
import { db } from '../db';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import styles from './CreatePage.module.scss';

import logo from '../logo.png';

class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      dateRanges: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    const pollId = generateName();
    const docRef = db.collection('polls').doc(pollId);
    const self = this;

    const data = {
      name: this.state.name,
      dateRange: {
        startDate: this.state.dateRanges.selection.startDate,
        endDate: this.state.dateRanges.selection.endDate,
      },
    };

    docRef
      .set(data)
      .then((doc) => {
        const path = `/poll/${pollId}`;
        this.props.alert.show('Poll successfully created!', {
          type: 'success',
        });
        const location = {
          pathname: path,
        };
        self.props.history.push(location);
      })
      .catch((error) => {
        console.log(error);
      });

    event.preventDefault();
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleRangeChange(which, payload) {
    this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
    });
  }

  render() {
    return (
      <div className={classnames(styles.container, 'container')}>
        <section id="form-header">
          <img className="content-logo" alt="" src={logo} />
          <h1 id="header">Create a new poll</h1>
        </section>
        <section id="form" className="row">
          <div className="col">
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input
                  name="name"
                  className="form-control"
                  type="text"
                  placeholder="Poll Name"
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="form-group">
                <DateRange
                  onChange={this.handleRangeChange.bind(this, 'dateRanges')}
                  moveRangeOnFirstSelection={false}
                  ranges={[this.state.dateRanges.selection]}
                  minDate={new Date()}
                />
              </div>
              <Button raised>Submit</Button>
            </form>
          </div>
        </section>
      </div>
    );
  }
}

export default withAlert(CreatePage);
