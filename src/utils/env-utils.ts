export const getBooleanEnv = (key: string, defaultValue: boolean): boolean =>
    process.env[key] !== undefined ? process.env[key] === 'true' : defaultValue;

export const getNumberEnv = (key: string, defaultValue: number): number =>
    Number(process.env[key]) || defaultValue;

export const getStringEnv = (key: string, defaultValue: string): string =>
    process.env[key] || defaultValue;
