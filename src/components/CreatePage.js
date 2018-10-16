import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withAlert } from 'react-alert';
import { DateRange } from 'react-date-range';
import classnames from 'classnames';
import { Mutation } from 'react-apollo';
import ReactLoading from 'react-loading';
import gql from 'graphql-tag';
import { auth } from '../firebase';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import styles from './CreatePage.module.scss';

import TextField, { Input } from '@material/react-text-field';
import Button from '@material/react-button';

class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      auth: null,
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

  componentDidMount() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user });
        // TODO: change to actual auth object when DO is up
        this.setState({ auth: { uid: 'trang', token: 'stupidtoken' } });
      } else {
        this.setState({ user: null });
        this.setState({ auth: null });
      }
    });
  }

  handleSubmit(event) {
    // TODO: Add interval option to UI and retrieve from state
    const interval = 15;
    const { name, dateRanges, auth } = this.state;
    const { startDate, endDate } = dateRanges.selection;
    this.props.createShow(name, startDate, endDate, interval, auth);
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

  renderContent() {
    const {
      createShowResult: { loading, data, error },
    } = this.props;

    if (loading) {
      // TODO: Beautify
      return (
        <section className="full-page flex">
          <h2>Creating</h2>
          <ReactLoading type="bubbles" color="#111" />
        </section>
      );
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
        <div>
          <section id={styles.form_header}>
            <h1 id={styles.header}>Create a new Show</h1>
          </section>
          <section>
            <div className={styles.create_page_form}>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <TextField label="Enter Show Name" className={styles.form_input} outlined>
                    <Input
                      type="text"
                      name="name"
                      value={this.state.name}
                      autoComplete="off"
                      onChange={this.handleInputChange}
                    />
                  </TextField>
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

  render() {
    return (
      <div className={classnames(styles.container, 'container')}>
        <section>
          <div>{this.renderContent()}</div>
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
    $auth: AuthInput
  ) {
    createNewShow(
      auth: $auth
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
        createShow={(name, startDate, endDate, interval, auth) =>
          createNewShow({ variables: { name, startDate, endDate, interval, auth } })
        }
        createShowResult={result}
      />
    )}
  </Mutation>
));
