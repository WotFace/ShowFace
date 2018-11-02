import React, { Component } from 'react';
import Card from '@material/react-card';
import Button from '@material/react-button';
import classnames from 'classnames';
import TextField, { Input } from '@material/react-text-field';
import copyToClipboard from '../utils/copyToClipboard';
import { withAlert } from 'react-alert';
import MaterialIcon from '@material/react-material-icon';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import WhatsAppIcon from '../icons/whatsapp.svg'; // https://fontawesome.com/icons/whatsapp?style=brands
import TelegramIcon from '../icons/telegram.svg'; // https://fontawesome.com/icons/facebook-messenger?style=brands
import { ReactMultiEmail } from 'react-multi-email';
import './MultiEmailOverride.scss';
import styles from './ShareModal.module.scss';

class ShareModal extends Component {
  state = {
    activeIndex: 0,
    emails: [],
  };

  copyUrlToClipboard = () => {
    copyToClipboard(this.props.link);
    // this.props.alert.success('URL Copied To Clipboard');
  };

  openWhatsApp = () => {
    const urlEncodedText = 'Respond%20to%20ShowFace%20poll!%20' + this.props.link;
    const url = 'https://wa.me/?text=' + urlEncodedText;
    window.open(url, '_blank');
  };

  openTelegram = () => {
    const url =
      'https://telegram.me/share/url?url=' +
      this.props.link +
      '&text=' +
      'Respond to ShowFace poll!';
    window.open(url, '_blank');
  };

  sendInvites = () => {
    // TODO: Send invites to this.emails
    this.setState({ emails: [] });
  };

  render() {
    const linkShareDiv = (
      <div className={styles.tabDiv}>
        <div className={classnames(styles.descText, 'mdc-typography--body2')}>
          Everyone with the link can respond to this poll.
        </div>

        <div id={styles.linkShareRow}>
          <TextField outlined className={styles.copyUrlInput} label="">
            <Input type="text" value={this.props.link} />
          </TextField>
          <Button className={styles.clipboardButton} onClick={this.copyUrlToClipboard} unelevated>
            Copy
          </Button>
        </div>

        <div className={styles.shareRow}>
          <Button
            icon={<img className={styles.socialIcon} src={TelegramIcon} />}
            onClick={this.openTelegram}
            outlined
          >
            Telegram
          </Button>

          <Button
            icon={<img className={styles.socialIcon} src={WhatsAppIcon} />}
            onClick={this.openWhatsApp}
            outlined
          >
            WhatsApp
          </Button>
        </div>
      </div>
    );

    const { emails } = this.state;
    const inputEmailDiv = (
      <div className={styles.tabDiv}>
        <div className={classnames(styles.descText, 'mdc-typography--body2')}>
          Email your respondents with a link to this poll.
        </div>

        <ReactMultiEmail
          placeholder="Enter email addresses"
          emails={emails}
          onChange={(emails) => {
            this.setState({ emails });
          }}
          getLabel={(email, index, removeEmail) => {
            return (
              <div data-tag key={index}>
                {email}
                <span data-tag-handle onClick={() => removeEmail(index)}>
                  ×
                </span>
              </div>
            );
          }}
        />
        <Button
          className={styles.clipboardButton}
          onClick={this.sendInvites}
          icon={<MaterialIcon icon="send" />}
          disabled={this.state.emails.length === 0}
          raised
        >
          Send Invitations
        </Button>
      </div>
    );

    return (
      <Card className={styles.container}>
        <div className="mdc-typography--headline6">Invite respondents via...</div>
        <TabBar
          activeIndex={this.state.activeIndex}
          handleActiveIndexUpdate={(activeIndex) => this.setState({ activeIndex })}
        >
          <Tab>
            <span>Link</span>
          </Tab>
          <Tab>
            <span>Email</span>
          </Tab>
        </TabBar>
        {this.state.activeIndex === 0 ? linkShareDiv : inputEmailDiv}
      </Card>
    );
  }
}

export default withAlert(ShareModal);
