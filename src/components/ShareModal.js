import React, { Component } from 'react';
import Card from '@material/react-card';
import Button from '@material/react-button';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import TextField, { Input } from '@material/react-text-field';
import styles from './ShareModal.module.scss';
import copyToClipboard from '../utils/copyToClipboard';
import { withAlert } from 'react-alert';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import WhatsappIcon from '../icons/whatsapp.svg' // https://fontawesome.com/icons/whatsapp?style=brands
import MessengerIcon from '../icons/messenger.svg' // https://fontawesome.com/icons/telegram-plane?style=brands
import TelegramIcon from '../icons/telegram.svg' // https://fontawesome.com/icons/facebook-messenger?style=brands


class ShareModal extends Component {

copyUrlToClipboard = () => {
  copyToClipboard(this.props.link);
  this.props.alert.show('Url copied to clipboard.', {
    type: 'success',
  });
};

openWhatsapp = () => {
    const urlEncodedText = "Respond%20to%20ShowFace%20poll!%20" + this.props.link;
    const url = "https://wa.me/?text=" + urlEncodedText;
    window.open(url, '_blank')
}

openTelegram = () => {
  const url = "https://telegram.me/share/url?url=" + this.props.link +"&text=" + "Respond to ShowFace poll!"
  window.open(url, '_blank')
}

openMessenger = () => {
  window.open('fb-messenger://share/?link=' +  encodeURIComponent(this.props.link), '_blank')
}

  render() {
    return (
      <Card className={styles.container}>
        <div className="mdc-typography--headline6">Invite your respondents via...</div>
        <div>
            <TabBar
                activeIndex={0}
            >
                <Tab>
                    <span>Link</span>
                </Tab>
                <Tab>
                    <span>Email</span>
                </Tab>
            </TabBar>
        </div>
        <div className={classnames(styles.descText, 'mdc-typography--caption')}>
            Everyone with the link can vote– no account required.
        </div>

        <div id={styles.linkShareRow}>
            <TextField outlined className={styles.copyUrlInput} label="">
                <Input type="text" value={this.props.link} />
            </TextField>
            <Button
                className={styles.clipboardButton}
                onClick={this.copyUrlToClipboard}
                raised
            >Copy</Button>
        </div>

        <div className={styles.shareRow}>
        <Button 
            icon={<img className={styles.socialIcon} src={TelegramIcon}/> }
            onClick={this.openTelegram}
        >
            Telegram
        </Button>
        <Button 
            icon={<img className={styles.socialIcon} src={WhatsappIcon}/>}
            onClick={this.openWhatsapp}
        >
            Whatsapp
        </Button>
        <Button icon={<img className={styles.socialIcon} src={MessengerIcon}/>}>
            Messenger
        </Button>
        </div>
      </Card>
    );
  }
}

export default withAlert(ShareModal);
