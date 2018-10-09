import React, { Component } from 'react';
import logo from '../logo.png';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { DateRange } from 'react-date-range';

import generateName from '../utils/generateName';

import { withAlert } from 'react-alert';

import { db } from '../db';

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
      <div className="container CreatePage-container">
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
              <input type="submit" className="btn btn-primary" value="Submit" />
            </form>
          </div>
        </section>
      </div>
    );
  }
}

export default withAlert(CreatePage);
