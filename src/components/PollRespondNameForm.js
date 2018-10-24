import React, { Component } from 'react';
import Button from '@material/react-button';
import TextField, { HelperText, Input } from '@material/react-text-field';
import styles from './PollRespondNameForm.module.scss';

export default class PollRespondNameForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name || '',
    };
  }

  handleNameChange = (e) => {
    this.setState({ name: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSetName(this.state.name);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className={styles.formGroup}>
          <TextField
            label="Enter Your Name"
            className={styles.formInput}
            helperText={
              <HelperText className={styles.formHelperText}>
                Enter your name so that you can select your availability
              </HelperText>
            }
            outlined
          >
            <Input
              type="text"
              name="name"
              value={this.state.name}
              onChange={this.handleNameChange}
              autoComplete="off"
            />
          </TextField>
        </div>
        <Button type="submit" disabled={!this.state.name || this.state.name.length === 0}>
          Continue
        </Button>
      </form>
    );
  }
}
