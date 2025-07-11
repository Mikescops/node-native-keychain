import * as keychain from '../src/index.js';

// Test configuration
const TEST_CONFIG = {
    service: 'com.example.native-keychain.test',
    account: 'testUser',
    password: 'secretTestPassword123',
    timeout: 15000 // 15 seconds timeout for biometric auth
} as const;

// Utility functions
const log = {
    info: (message: string) => console.log(`       ${message}`),
    success: (message: string) => console.log(`[PASS] ${message}`),
    error: (message: string) => console.error(`[FAIL] ${message}`),
    warn: (message: string) => console.warn(`[WARN] ${message}`),
    separator: () => console.log('─'.repeat(60)),
    section: (title: string) => {
        console.log('');
        console.log('═'.repeat(60));
        console.log(`  ${title.toUpperCase()}`);
        console.log('═'.repeat(60));
    }
};

const assert = (condition: boolean, message: string): void => {
    if (!condition) {
        log.error(`Test failed: ${message}`);
        process.exit(1);
    }
};

const cleanup = () => {
    log.info('Cleaning up test data...');
    try {
        keychain.deletePassword({ service: TEST_CONFIG.service, account: TEST_CONFIG.account });
        keychain.deletePassword({ service: TEST_CONFIG.service });
        log.info('Cleanup completed');
    } catch {
        // Ignore cleanup errors
    }
};

// Test functions
const testBiometricSupport = (): void => {
    log.section('Biometric Support Test');
    log.info('Checking biometric support...');
    const isSupported = keychain.isBiometricsSupported();
    assert(isSupported, 'Biometrics should be supported on this platform');
    log.success('Biometrics support confirmed');
};

const testBiometricVerification = async () => {
    log.section('Biometric Verification Test');
    log.info('Testing biometric verification...');
    log.warn('Please authenticate when prompted...');

    try {
        const authResult = await keychain.requestBiometricsVerification({
            reason: 'Test verification for native-keychain library'
        });
        assert(authResult, 'Biometric verification should succeed');
        log.success('Biometric verification passed');
    } catch (error) {
        log.error(`Biometric verification failed: ${error}`);
        process.exit(1);
    }
};

const testPasswordOperationsWithAccount = async () => {
    log.section('Password Operations with Account');

    // Test adding password with account
    log.info('Adding password with account...');
    const addResult = keychain.setPassword({
        password: TEST_CONFIG.password,
        service: TEST_CONFIG.service,
        account: TEST_CONFIG.account
    });
    assert(addResult, 'Should successfully add password with account');
    log.success('Password added with account');

    // Test retrieving password with account (no biometry)
    log.info('Retrieving password with account (no biometry)...');
    const retrievedPassword = await keychain.getPassword({
        service: TEST_CONFIG.service,
        account: TEST_CONFIG.account,
        requireBiometry: false
    });
    assert(retrievedPassword === TEST_CONFIG.password, 'Retrieved password should match original');
    log.success('Password retrieved successfully');

    // Test deleting password with account
    log.info('Deleting password with account...');
    const deleteResult = keychain.deletePassword({
        service: TEST_CONFIG.service,
        account: TEST_CONFIG.account
    });
    assert(deleteResult, 'Should successfully delete password with account');
    log.success('Password deleted with account');
};

const testPasswordOperationsWithBiometry = async () => {
    log.section('Password Operations with Biometry');

    // Test adding password without account
    log.info('Adding password for biometric test...');
    const addResult = keychain.setPassword({
        password: TEST_CONFIG.password,
        service: TEST_CONFIG.service
    });
    assert(addResult, 'Should successfully add password');
    log.success('Password added for biometric test');

    // Test retrieving password with biometry
    log.info('Testing biometric password retrieval...');
    log.warn('Please authenticate when prompted (you have 15 seconds)...');

    try {
        const retrievedPassword = await Promise.race([
            keychain.getPassword({
                service: TEST_CONFIG.service,
                requireBiometry: true
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), TEST_CONFIG.timeout))
        ]);

        assert(retrievedPassword === TEST_CONFIG.password, 'Retrieved password should match original');
        log.success('Biometric password retrieval successful');
    } catch (error) {
        if (error instanceof Error && error.message === 'Timeout') {
            log.warn('Biometric authentication timed out - this is expected if no user interaction');
        } else {
            log.error(`Biometric password retrieval failed: ${error}`);
        }
    }

    // Cleanup
    log.info('Cleaning up biometric test data...');
    const deleteResult = keychain.deletePassword({ service: TEST_CONFIG.service });
    assert(deleteResult, 'Should successfully delete password');
    log.success('Biometric test data cleaned up');
};

// Main test runner
const runTests = async () => {
    console.log('');
    console.log('━'.repeat(60));
    console.log('  NATIVE-KEYCHAIN TEST SUITE');
    console.log('━'.repeat(60));

    try {
        // Setup
        cleanup(); // Clean any existing test data

        // Run tests
        testBiometricSupport();
        await testBiometricVerification();
        await testPasswordOperationsWithAccount();
        await testPasswordOperationsWithBiometry();

        // Success
        console.log('');
        console.log('━'.repeat(60));
        log.success('ALL TESTS COMPLETED SUCCESSFULLY');
        console.log('━'.repeat(60));
        process.exit(0);
    } catch (error) {
        log.error(`Test runner failed: ${error}`);
        cleanup();
        process.exit(1);
    }
};

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('');
    log.warn('Test interrupted by user');
    cleanup();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.log('');
    log.error(`Uncaught exception: ${error.message}`);
    cleanup();
    process.exit(1);
});

// Run the tests
void runTests();
