import axios from 'axios';
import { OAuthProvider, OAuthToken, OAuthUserInfo } from '../index';
import config from '../../../config';

export class DiscordOAuthProvider implements OAuthProvider {
    private clientId: string;
    private clientSecret: string;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    async getAccessToken(code: string, redirectUrl: string): Promise<OAuthToken> {
        const params = new URLSearchParams();

        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', redirectUrl);
        params.append('code', code);

        const response = await axios.post('https://discord.com/api/v10/oauth2/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: this.clientId,
                password: this.clientSecret
            }
        });

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresAt: Math.floor(new Date().getTime() / 1000) + response.data.expires_in
        };
    }

    async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
        const response = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    
        return {
            accountId: response.data.id,
            email: response.data.email,
            profileName: response.data.global_name ?? response.data.username
        };
    }
}

const provider = new DiscordOAuthProvider(
    config.oauth.discord.clientId,
    config.oauth.discord.clientSecret
);

export default provider;
