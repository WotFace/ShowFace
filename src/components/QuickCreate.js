import React, { Component } from 'react';
import Button from '@material/react-button';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import queryString from 'query-string';
import NoLabelTextField from './NoLabelTextField';

import styles from './QuickCreate.module.scss';
import sharedStyles from './SharedStyles.module.scss';

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
        <div className={styles.pollNameField}>
          <NoLabelTextField
            placeholder="Meet For What?"
            name="name"
            value={name}
            autoComplete="off"
            onChange={this.handleInputChange}
          />
        </div>
        <NavLink
          className={classnames(sharedStyles.buttonLink, styles.buttonContainer)}
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
