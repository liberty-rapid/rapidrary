import axios from 'axios';
import { OAuthProvider, OAuthToken, OAuthUserInfo } from '../index';
import config from '../../../config';

export class GithubOAuthProvider implements OAuthProvider {
    private clientId: string;
    private clientSecret: string;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    async getAccessToken(code: string, redirectUrl: string): Promise<OAuthToken> {
        const response = await axios.post('https://github.com/login/oauth/access_token', null, {
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                redirect_uri: redirectUrl
            },
            headers: {
                Accept: 'application/json',
            },
        });

        return { accessToken: response.data.access_token };
    }

    async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const { id, name } = response.data;

        const emailResponse = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const email: any = emailResponse.data.sort((a: any, b: any) => b.primary - a.primary)[0];

        return {
            accountId: id.toString(),
            email: email.email,
            profileName: name,
        };
    }
}

const provider = new GithubOAuthProvider(
    config.oauth.github.clientId,
    config.oauth.github.clientSecret
);

export default provider;
