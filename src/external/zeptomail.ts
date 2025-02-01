import axios from 'axios';

import config from '../config';

export const sendEmailTemplate = async (data: unknown) => {
    const url = 'https://api.zeptomail.com/v1.1/email/template';

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': config.email.sendMailToken
    };

    await axios.post(url, data, { headers });
};

export default {
    sendEmailTemplate
};
