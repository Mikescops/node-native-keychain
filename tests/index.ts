import * as keychain from '../src';

void (async () => {
    if (!keychain.isBiometricsSupported()) {
        console.error(`Keychain is not supported on this platform`);
        process.exit(1);
    }

    const authCheck = await keychain.requestBiometricsVerification({ reason: 'Are you who you are?' });

    console.log(`Biometrics verification result: ${authCheck ? '👍' : '👎'}`);

    console.log('Testing with account...');

    const addAccount = keychain.setPassword({
        password: 'toto',
        service: 'com.example.toto.secret',
        account: 'myAccount'
    });
    if (addAccount) {
        console.log('add');
    } else {
        console.error('Failed to add with account');
        process.exit(1);
    }

    const getAccount = await keychain.getPassword({
        service: 'com.example.toto.secret',
        account: 'myAccount'
    });
    if (getAccount === 'toto') {
        console.log('get', getAccount);
    } else {
        console.error('Failed to get with account');
        process.exit(1);
    }

    const deleteAccount = keychain.deletePassword({
        service: 'com.example.toto.secret',
        account: 'myAccount'
    });
    if (deleteAccount) {
        console.log('delete');
    } else {
        console.error('Failed to delete with account');
        process.exit(1);
    }

    console.log(`Adding to keychain...`);

    const isSuccess2 = keychain.setPassword({
        password: 'toto',
        service: 'com.example.toto.secret'
    });

    if (isSuccess2) {
        console.log(`Successfully added to keychain`);
    } else {
        console.error(`Failed to add to keychain`);
        process.exit(1);
    }

    console.log(`Retrieving from keychain...`);

    let mySecret: string | undefined;

    // this is just for testing purposes, do not do this in production
    void keychain.getPassword({ service: 'com.example.toto.secret', requireBiometry: true }).then((secret) => {
        mySecret = secret;
    });

    // console log every seconds to keep the process alive
    console.log(`Let's count seconds until we get the secret:`);
    let i = 0;
    setInterval(() => {
        console.log(`I'm alive ${i++}`);
        if (i === 10 || mySecret) {
            console.log('My secret:', mySecret ?? "Couldn't get it in time");

            const isDeleted = keychain.deletePassword({ service: 'com.example.toto.secret' });

            if (isDeleted) {
                console.log(`Successfully deleted from keychain`);
            } else {
                console.error(`Failed to delete from keychain`);
                process.exit(1);
            }

            console.log(`Exiting...`);
            process.exit(0);
        }
    }, 1000);
})();
