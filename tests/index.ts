import * as keychain from '../dist/main.js';

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
        console.log(`Exiting...`);
        process.exit(0);
    }
}, 1000);
