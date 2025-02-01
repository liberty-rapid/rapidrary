export interface Config {
    port: number;
    devMode: boolean;

    site: {
        description: string;
    },

    log: {
        directory: string
    };

    email: {
        fromName: string,
        fromAddress: string,
        sendMailToken: string
    };

    oauth: {
        github: {
            clientId: string,
            clientSecret: string
        },
        discord: {
            clientId: string,
            clientSecret: string
        }
    }

    https: {
        useHttps: boolean,
        keyFile: string,
        certFile: string
    };

    session: {
        secret: string
    };

    redis: {
        url: string
    };

    tossPayments: {
        secretKey: string
    };

    books: {
        directory: string
    };
}
