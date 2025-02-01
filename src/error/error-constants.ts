export interface ErrorConstant {
    message: string;
    status: number;
    code: string;
}

export const errorConstants: { [key: string]: ErrorConstant } = {
    COMMON_BAD_REQUEST: {
        message: 'Bad Request',
        status: 400,
        code: 'COMMON_BAD_REQUEST'
    },
    COMMON_UNAUTHORIZED: {
        message: 'Unauthorized',
        status: 401,
        code: 'COMMON_UNAUTHORIZED'
    },
    COMMON_FORBIDDEN: {
        message: 'Forbidden',
        status: 403,
        code: 'COMMON_FORBIDDEN'
    },
    AUTH_EMAIL_VERIFICATION_LIMIT_EXCEEDED: {
        message: 'Email verification limit exceeded',
        status: 400,
        code: 'AUTH_EMAIL_VERIFICATION_LIMIT_EXCEEDED'
    },
    AUTH_INVALID_OAUTH_PROVIDER: {
        message: 'Invalid OAuth Provider',
        status: 400,
        code: 'AUTH_INVALID_OAUTH_PROVIDER'
    },
    OAUTH_ERROR_EMAIL_ACCESS_DENIED: {
        message: 'Email access denied by OAuth Provider',
        status: 400,
        code: 'OAUTH_ERROR_EMAIL_ACCESS_DENIED'
    },
    AUTH_VERIFICATION_NOT_FOUND: {
        message: 'Verification not found',
        status: 404,
        code: 'AUTH_VERIFICATION_NOT_FOUND'
    },
    AUTH_INVALID_EMAIL_VERIFICATION_CODE: {
        message: 'Invalid email verification code',
        status: 401,
        code: 'AUTH_INVALID_EMAIL_VERIFICATION_CODE'
    },
    BOOK_NOT_FOUND: {
        message: 'Book not found',
        status: 404,
        code: 'BOOK_NOT_FOUND'
    },
    BOOK_FILE_NOT_FOUND: {
        message: 'The file was not found in the book',
        status: 404,
        code: 'BOOK_FILE_NOT_FOUND'
    },
    ORDER_INVALID: {
        message: 'Invalid order',
        status: 400,
        code: 'ORDER_INVALID'
    },
    PAYMENT_CONFIRM_INVALID: {
        message: 'Unable to confirm payment',
        status: 400,
        code: 'PAYMENT_CONFIRM_INVALID'
    }
};
