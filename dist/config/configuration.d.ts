declare const _default: () => {
    app: {
        nodeEnv: string;
        port: number;
        apiPrefix: string;
        apiVersion: string;
    };
    database: {
        uri: string;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        ttl: number;
    };
    jwt: {
        secret: string;
        expiration: string;
        refreshSecret: string;
        refreshExpiration: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    swagger: {
        title: string;
        description: string;
        version: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    s3: {
        region: string;
        bucket: string;
        accessKeyId: string;
        secretAccessKey: string;
    };
    admin: {
        secretKey: string;
    };
};
export default _default;
