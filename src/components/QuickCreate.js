import React, { Component } from 'react';
import Button from '@material/react-button';
import { NavLink } from 'react-router-dom';
import TextField, { Input } from '@material/react-text-field';
import queryString from 'query-string';

import styles from './QuickCreate.module.scss';

class QuickCreate extends Component {
  state = {
    name: '',
  };

  handleInputChange = (event) => {
    this.setState({ name: event.target.value });
  };

  render() {
    const { name } = this.state;
    return (
      <div id={styles.formContainer}>
        <TextField label="Meet for what?" className={styles.pollNameField}>
          <Input
            type="text"
            name="name"
            value={name}
            autoComplete="off"
            onChange={this.handleInputChange}
          />
        </TextField>
        <NavLink
          id={styles.buttonContainer}
          to={{
            pathname: '/new',
            search: queryString.stringify({ name }),
          }}
        >
          <Button id={styles.createPollButton} raised>
            Create new meeting
          </Button>
        </NavLink>
      </div>
    );
  }
}

export default QuickCreate;
