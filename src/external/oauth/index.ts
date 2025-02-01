import githubOAuthProvider from "./providers/github-oauth-provider";
import discordOAuthProvider from "./providers/discord-oauth-provider";

export interface OAuthUserInfo {
    accountId: string;
    email?: string;
    profileName?: string;
}

export interface OAuthToken {
    accessToken: string;
    expiresAt?: number;
    refreshToken?: string;
}

export interface OAuthProvider {
    getAccessToken(code: string, redirectUrl: string): Promise<OAuthToken>;
    getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
    refreshToken?(refreshToken: string): Promise<OAuthToken>;
}

export function lookupOAuthProvider(name: string): OAuthProvider | null {
    if (name === 'github') {
        return githubOAuthProvider;
    } else if (name === 'discord') {
        return discordOAuthProvider;
    } else {
        return null;
    }
}
