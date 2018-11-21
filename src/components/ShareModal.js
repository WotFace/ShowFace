import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import Card from '@material/react-card';
import Button from '@material/react-button';
import classnames from 'classnames';
import TextField, { Input } from '@material/react-text-field';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MaterialIcon from '@material/react-material-icon';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import WhatsAppIcon from '../icons/whatsapp.svg'; // https://fontawesome.com/icons/whatsapp?style=brands
import TelegramIcon from '../icons/telegram.svg'; // https://fontawesome.com/icons/facebook-messenger?style=brands
import { ReactMultiEmail } from 'react-multi-email';
import '../styles/MultiEmailOverride.scss';
import sharedStyles from '../styles/SharedStyles.module.scss';
import styles from './ShareModal.module.scss';

class ShareModal extends Component {
  state = {
    activeIndex: 0,
    emails: [],
    sent: false,
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
    this.props.sendEmailInvites(this.state.emails);
    this.setState({ emails: [] });
    this.setState({ sent: true });
    this.timeout = setTimeout(() => {
      this.setState({ sent: false });
    }, 2000);
  };

  render() {
    const linkShareContent = (
      <div className={styles.tabDiv}>
        <div className={classnames(styles.descText, 'mdc-typography--body2')}>
          Anyone with this link can respond to this poll.
        </div>

        <div id={styles.linkShareRow}>
          <TextField outlined className={styles.copyUrlInput} label="">
            <Input type="text" value={this.props.link} />
          </TextField>
          <CopyToClipboard text={this.props.link}>
            <Button className={styles.clipboardButton} unelevated>
              Copy
            </Button>
          </CopyToClipboard>
        </div>

        <div className={styles.shareRow}>
          <Button
            icon={<img className={styles.socialIcon} src={TelegramIcon} alt="Telegram logo" />}
            onClick={this.openTelegram}
            outlined
          >
            Telegram
          </Button>

          <Button
            icon={<img className={styles.socialIcon} src={WhatsAppIcon} alt="WhatsApp logo" />}
            onClick={this.openWhatsApp}
            outlined
          >
            WhatsApp
          </Button>
        </div>
      </div>
    );

    const { emails } = this.state;
    const { modalHeadline, isAdmin, isSignedIn } = this.props;
    const submitButtonMessage = this.state.sent ? 'Sent Invites!' : 'Send Invitations';

    let emailTabContent;
    if (!isSignedIn) {
      emailTabContent = (
        <div>
          <p className={styles.messageText}>You must be signed in to invite others by email.</p>
          <Link
            to={{ pathname: '/login', state: { from: this.props.location } }}
            className={sharedStyles.buttonLink}
          >
            <Button outlined>Log In / Sign Up</Button>
          </Link>
        </div>
      );
    } else if (isAdmin) {
      emailTabContent = (
        <div className={styles.tabDiv}>
          <div className={classnames(styles.descText, 'mdc-typography--body2')}>
            Email your respondents with a link to this poll.
          </div>

          <ReactMultiEmail
            placeholder="Enter email addresses"
            emails={emails}
            onChange={(emails) => {
              this.setState({ emails });
              this.setState({ sent: false });
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
            id={styles.inviteButton}
            onClick={this.sendInvites}
            icon={<MaterialIcon icon="send" />}
            disabled={this.state.emails.length === 0}
            raised
          >
            {submitButtonMessage}
          </Button>
        </div>
      );
    } else {
      emailTabContent = (
        <div>
          <p className={styles.messageText}>
            You must be the creator of the poll to invite respondents by email.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <div className="mdc-typography--headline6">{modalHeadline}</div>
          <div className="mdc-typography--headline6">Invite respondents via...</div>
          <TabBar
            activeIndex={this.state.activeIndex}
            handleActiveIndexUpdate={(activeIndex) => this.setState({ activeIndex })}
          >
            <Tab>
              <span>Link</span>
            </Tab>
            <Tab>Email</Tab>
          </TabBar>
          {this.state.activeIndex === 0 ? linkShareContent : emailTabContent}
        </Card>
      </div>
    );
  }
}

export default withRouter(ShareModal);
