import React, { Component } from 'react';
import Card from '@material/react-card';
import Button from '@material/react-button';
import classnames from 'classnames';
import TextField, { Input } from '@material/react-text-field';
import copyToClipboard from '../utils/copyToClipboard';
import { withAlert } from 'react-alert';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import WhatsappIcon from '../icons/whatsapp.svg'; // https://fontawesome.com/icons/whatsapp?style=brands
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
    this.props.alert.success("URL Copied To Clipboard");
  };

  openWhatsapp = () => {
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
        <div className={classnames(styles.descText, 'mdc-typography--caption')}>
          Everyone with the link can vote– no account required.
        </div>

        <div id={styles.linkShareRow}>
          <TextField outlined className={styles.copyUrlInput} label="">
            <Input type="text" value={this.props.link} />
          </TextField>
          <Button className={styles.clipboardButton} onClick={this.copyUrlToClipboard} raised>
            Copy
          </Button>
        </div>

        <div className={styles.shareRow}>
          <Button
            icon={<img className={styles.socialIcon} src={TelegramIcon} />}
            onClick={this.openTelegram}
          >
            Telegram
          </Button>

          <Button
            icon={<img className={styles.socialIcon} src={WhatsappIcon} />}
            onClick={this.openWhatsapp}
          >
            Whatsapp
          </Button>
        </div>
      </div>
    );

    const { emails } = this.state;
    const inputEmailDiv = (
      <div className={styles.tabDiv}>
        <ReactMultiEmail
          placeholder="Input Email Addresses"
          emails={emails}
          onChange={(_emails) => {
            this.setState({ emails: _emails });
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
        <Button className={styles.clipboardButton} onClick={this.sendInvites} raised>
          Send Invites
        </Button>
      </div>
    );

    return (
      <Card className={styles.container}>
        <div>
          <div className="mdc-typography--headline6">Invite your respondents via...</div>
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
        </div>
        {this.state.activeIndex === 0 ? linkShareDiv : inputEmailDiv}
      </Card>
    );
  }
}

export default withAlert(ShareModal);
