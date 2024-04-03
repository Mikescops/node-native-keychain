import * as koffi from 'koffi';
import { promisify } from 'util';
import path from 'path';

const lib = koffi.load(path.join(__dirname, '../dist/libKeychainLibrary.dylib'));

export interface SetPasswordParams {
    password: string;
    service: string;
}

export const setPassword = (params: SetPasswordParams): boolean => {
    const { password, service } = params;

    const addToKeychain = lib.func('addToKeychain', 'bool', ['string', 'string']);

    return addToKeychain(password, service) as boolean;
};

export interface GetPasswordParams {
    service: string;
    requireBiometry?: boolean;
}

export const getPassword = async (params: GetPasswordParams): Promise<string> => {
    const { service, requireBiometry } = params;

    const protoCallback = koffi.proto('keychainCallback', 'void', ['string', 'string']);

    let errorResult: string | undefined;
    let secretResult: string | undefined;

    const contentCallback = (error: string, secret: string) => {
        if (error) {
            errorResult = error;
        } else {
            secretResult = secret;
        }
    };

    const getFromKeychain = lib.func('getFromKeychain', 'void', ['string', 'bool', koffi.pointer(protoCallback)]);

    const getFromKeychainAsync = promisify(getFromKeychain.async);

    await getFromKeychainAsync(service, requireBiometry ? true : false, contentCallback);

    if (errorResult) {
        throw new Error(errorResult);
    }

    return secretResult;
};
