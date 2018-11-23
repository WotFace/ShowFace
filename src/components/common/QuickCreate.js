import React, { Component } from 'react';
import Button from '@material/react-button';
import { Redirect } from 'react-router-dom';
import queryString from 'query-string';
import NoLabelTextField from './NoLabelTextField';

import styles from './QuickCreate.module.scss';

class QuickCreate extends Component {
  state = {
    name: '',
    redirectTo: null,
  };

  handleInputChange = (event) => {
    this.setState({ name: event.target.value });
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    const { name } = this.state;
    this.setState({
      redirectTo: {
        pathname: '/new',
        search: queryString.stringify({ name }),
      },
    });
  };

  render() {
    const { name, redirectTo } = this.state;
    if (redirectTo) {
      return <Redirect to={redirectTo} />;
    }

    return (
      <form id={styles.formContainer} onSubmit={this.handleFormSubmit}>
        <div className={styles.pollNameField}>
          <NoLabelTextField
            placeholder="What are you meeting for?"
            name="name"
            value={name}
            autoComplete="off"
            onChange={this.handleInputChange}
            maxLength="80"
          />
        </div>
        <Button type="submit" id={styles.createPollButton} raised>
          Create meeting
        </Button>
      </form>
    );
  }
}

export default QuickCreate;
