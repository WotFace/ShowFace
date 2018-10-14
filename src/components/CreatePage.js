import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import { DateRange } from 'react-date-range';
import Button from '@material/react-button';
import TextField from '@material-ui/core/TextField';
import classnames from 'classnames';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

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
    // TODO: Add interval option to UI and retrieve from state
    const interval = 15;
    const { name, dateRanges } = this.state;
    const { startDate, endDate } = dateRanges.selection;
    this.props.createShow(name, startDate, endDate, interval);
    event.preventDefault();
  }

  handleInputChange(event) {
    console.log(event.target.value)
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

  renderContent() {
    const {
      createShowResult: { loading, data, error },
    } = this.props;

    if (loading) {
      // TODO: Beautify
      return <span>Creating...</span>;
    } else if (data) {
      return <Redirect to={`/show/${data.createNewShow.slug}`} />;
    } else {
      // Not loading. Render form
      // TODO: Display error if it exists
      if (error) {
        console.log('Show creation got error', error);
      }

      // TODO: Validate input and disable submit button if necessary
      return (
        <div className="create-show__form">
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <TextField 
                className="create-show__form--textfield"
                label="Show Name" placeholder="Show Name"
                onChange={this.handleInputChange}
                type="string"
                variant="outlined"
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
      );
    }
  }

  render() {
    return (
      <div className={classnames(styles.container, 'container')}>
        <section id="create-show__header">
          <img className="content-logo" alt="" src={logo} />
          <h1 id="header">Create a new Show</h1>
        </section>
        <section id="form" className="row">
          <div className="col">{this.renderContent()}</div>
        </section>
      </div>
    );
  }
}

const CREATE_NEW_SHOW_MUTATION = gql`
  mutation CreateNewShow(
    $name: String!
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: Int!
  ) {
    createNewShow(
      data: { name: $name, startDate: $startDate, endDate: $endDate, interval: $interval }
    ) {
      slug
    }
  }
`;

export default withAlert((props) => (
  <Mutation mutation={CREATE_NEW_SHOW_MUTATION}>
    {(createNewShow, result) => (
      <CreatePage
        {...props}
        createShow={(name, startDate, endDate, interval) =>
          createNewShow({ variables: { name, startDate, endDate, interval } })
        }
        createShowResult={result}
      />
    )}
  </Mutation>
));
