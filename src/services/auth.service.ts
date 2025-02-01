import { v4 as uuidv4 } from 'uuid';

import prisma from '../clients/prisma';

import config from "../config";

import { ServiceError } from '../error/service-error';
import { errorConstants } from '../error/error-constants';
import { sendEmailTemplate } from '../external/zeptomail';
import { lookupOAuthProvider, OAuthProvider, OAuthToken, OAuthUserInfo } from '../external/oauth';

import { EmailVerification, EmailAuthentication, OAuthAuthorization } from '../dto/auth.dto';
import { UserResponse } from '../dto/account.dto';

import { isAxiosError } from 'axios';
import { OAuthAccount, User, UserBook } from '@prisma/client';

const EMAIL_VERIFICATION_LIMIT = 5;

class AuthService {
    private generateVerificationCode = (): string => {
        let randomNumber = 0;

        const bannedCodes = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            111111, 222222, 333333, 444444, 555555, 666666, 777777, 888888, 999999,
            12345, 123456, 234567, 345678, 456789, 567890,
            98765, 987654, 876543, 765432, 654321, 543210
        ];

        while (bannedCodes.includes(randomNumber)) {
            randomNumber = Math.floor(Math.random() * 1000000);
        }

        return String(randomNumber).padStart(6, '0');
    }

    public requestEmailVerification = async (email: string): Promise<EmailVerification> => {
        const isTestEmailAddress = (config.devMode && email.endsWith('@test.fake'));

        const code = isTestEmailAddress
            ? '000000'
            : this.generateVerificationCode();

        const emailVerification = await prisma.emailVerification.create({
            data: {
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                email,
                code,
                attemptCount: 0
            }
        });

        if (!isTestEmailAddress) {
            try {
                await sendEmailTemplate({
                    template_alias: "otp",
                    from: {
                        address: config.email.fromAddress,
                        name: config.email.fromName
                    },
                    to: [{ email_address: { address: email } }],
                    merge_info: { code }
                });
            } catch (error: any) {
                throw error;
            }
        }

        return {
            verificationId: emailVerification.verificationId,
            expiresAt: emailVerification.expiresAt.toISOString()
        };
    }

    public verifyCode = async (request: EmailAuthentication): Promise<void> => {
        const verification = await prisma.emailVerification.findFirst({
            where: {
                expiresAt: {
                    gt: new Date()
                },
                attemptCount: {
                    lt: EMAIL_VERIFICATION_LIMIT
                },              
                verificationId: request.verificationId
            }
        });

        if (verification === null) {
            throw new ServiceError(errorConstants.AUTH_VERIFICATION_NOT_FOUND);
        }

        if (verification.code === request.code) {
            await prisma.emailVerification.delete({
                where: {
                    verificationId: verification.verificationId
                }
            });
        } else {
            verification.attemptCount += 1;
            
            await prisma.emailVerification.update({
                where: {
                    verificationId: verification.verificationId
                },
                data: verification
            });

            if (verification.attemptCount === EMAIL_VERIFICATION_LIMIT) {
                throw new ServiceError(errorConstants.AUTH_EMAIL_VERIFICATION_LIMIT_EXCEEDED);
            }

            throw new ServiceError(errorConstants.AUTH_INVALID_EMAIL_VERIFICATION_CODE);
        }
    }

    public signInByEmail = async (request: EmailAuthentication): Promise<UserResponse> => {
        await this.verifyCode(request);

        let user = await prisma.user.findFirst({
            where: {
                email: request.email
            },
            include: {
                books: true,
                oauthAccounts: true
            }
        });

        if (user === null) {
            user = await prisma.user.create({
                data: {
                    email: request.email,
                    displayName: request.email
                },
                include: {
                    books: true,
                    oauthAccounts: true
                }
            });
        }

        return {
            ...user,
            books: user.books.map(book => book.bookId),
            oauthAccounts: user.oauthAccounts.map(account => ({
                provider: account.provider
            }))
        };
    }

    public signInByOAuth = async (request: OAuthAuthorization): Promise<UserResponse> => {
        const provider: OAuthProvider | null = lookupOAuthProvider(request.provider);

        if (!provider) {
            throw new ServiceError(errorConstants.AUTH_INVALID_OAUTH_PROVIDER);
        }

        let oauthToken: OAuthToken;
        let oauthUserInfo: OAuthUserInfo;

        try {
            oauthToken = await provider.getAccessToken(request.authorizationCode, request.redirectUrl);
            oauthUserInfo = await provider.getUserInfo(oauthToken.accessToken);
        } catch (e) {
            if (isAxiosError(e) && e.response && e.response.status.toString().startsWith('4')) {
                throw new ServiceError(errorConstants.COMMON_UNAUTHORIZED);
            }

            throw e;
        }

        const oauthAccount = await prisma.oAuthAccount.findFirst({
            where: {
                provider: request.provider,
                providerAccountId: oauthUserInfo.accountId
            },
            include: {
                user: {
                    include: {
                        books: true,
                        oauthAccounts: true                        
                    }
                }
            }
        });

        let user: any = null;

        if (oauthAccount) {
            user = oauthAccount.user;

            await prisma.oAuthAccount.update({
                where: {
                    id: oauthAccount.id
                },
                data: {
                    accessToken: oauthToken.accessToken,
                    refreshToken: oauthToken.refreshToken,
                    expiresAt: oauthToken.expiresAt
                }
            });
        } else {
            if (!oauthUserInfo.email) {
                throw new ServiceError(errorConstants.OAUTH_ERROR_EMAIL_ACCESS_DENIED);
            }

            const emailUser = await prisma.user.findFirst({
                where: {
                    email: oauthUserInfo.email
                }
            });

            await prisma.$transaction(async (tx) => {
                let newUser: User;
    
                if (emailUser === null) {
                    newUser = await tx.user.create({
                        data: {
                            email: oauthUserInfo.email!,
                            displayName: oauthUserInfo.profileName ?? oauthUserInfo.email!
                        }
                    });
                }

                await tx.oAuthAccount.create({
                    data: {
                        provider: request.provider,
                        providerAccountId: oauthUserInfo.accountId,
                        userId: emailUser?.id ?? newUser!.id,
                        accessToken: oauthToken.accessToken,
                        refreshToken: oauthToken.refreshToken,
                        expiresAt: oauthToken.expiresAt
                    }
                });
            });

            user = await prisma.user.findFirst({
                where: {
                    email: oauthUserInfo.email!
                },
                include: {
                    books: true,
                    oauthAccounts: true
                }
            });            
        }

        return {
            ...user,
            books: user.books.map((book: UserBook) => book.bookId),
            oauthAccounts: user.oauthAccounts.map((account: OAuthAccount) => ({
                provider: account.provider
            }))
        };
    }
}

const authService = new AuthService();

export default authService;
