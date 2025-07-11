import koffi from 'koffi';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lib = koffi.load(path.join(__dirname, '../dist/libKeychainLibrary.dylib'));

export interface SetPasswordParams {
    password: string;
    service: string;
    account?: string;
}

export const setPassword = (params: SetPasswordParams): boolean => {
    const { password, service, account = '' } = params;

    const addToKeychain = lib.func('addToKeychain', 'bool', ['string', 'string', 'string']);

    return addToKeychain(password, service, account) as boolean;
};

export interface GetPasswordParams {
    service: string;
    account?: string;
    requireBiometry?: boolean;
}

const protoCallback = koffi.proto('keychainCallback', 'void', ['string', 'string']);
export const getPassword = async (params: GetPasswordParams) => {
    const { service, account = '', requireBiometry = false } = params;

    let errorResult: string | undefined;
    let secretResult: string | undefined;

    const contentCallback = (error: string, secret: string) => {
        if (error) {
            errorResult = error;
        } else {
            secretResult = secret;
        }
    };

    const getFromKeychain = lib.func('getFromKeychain', 'void', [
        'string',
        'string',
        'bool',
        koffi.pointer(protoCallback)
    ]);

    const getFromKeychainAsync = promisify(getFromKeychain.async);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await getFromKeychainAsync(service, account, Boolean(requireBiometry), contentCallback);

    if (errorResult) {
        throw new Error(errorResult);
    }

    return secretResult;
};

interface DeletePasswordParams {
    service: string;
    account?: string;
}

export const deletePassword = (params: DeletePasswordParams): boolean => {
    const { service, account = '' } = params;
    const deleteFromKeychain = lib.func('deleteFromKeychain', 'bool', ['string', 'string']);

    return deleteFromKeychain(service, account) as boolean;
};

export const isBiometricsSupported = (): boolean => {
    const biometricsSupported = lib.func('isBiometricsSupported', 'bool', []);

    return biometricsSupported() as boolean;
};

interface RequestBiometricsVerificationParams {
    reason: string;
}

export const requestBiometricsVerification = async (params: RequestBiometricsVerificationParams) => {
    const protoCallback = koffi.proto('biometricsCallback', 'void', ['bool']);

    let result: boolean | undefined;

    const resultCallback = (cb: boolean) => {
        result = cb;
    };

    const requestBiometricsVerification = lib.func('requestBiometricsVerification', 'void', [
        'string',
        koffi.pointer(protoCallback)
    ]);

    const requestBiometricsVerificationAsync = promisify(requestBiometricsVerification.async);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await requestBiometricsVerificationAsync(params.reason, resultCallback);

    if (result === undefined) {
        throw new Error(`Biometrics verification failed`);
    }

    return result;
};
