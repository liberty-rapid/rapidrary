export interface EmailVerification {
    verificationId: string;
    expiresAt: string;
}

export interface EmailAuthentication {
    verificationId: string;
    email: string;
    code: string;
}

export interface OAuthAuthorization {
    provider: 'github' | 'discord';
    authorizationCode: string;
    redirectUrl: string;
}
