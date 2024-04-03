# Node Native Keychain

![GitHub package.json version](https://img.shields.io/github/package-json/v/mikescops/node-native-keychain)
![npm](https://img.shields.io/npm/v/native-keychain)
![npm](https://img.shields.io/npm/dw/native-keychain)
![GitHub](https://img.shields.io/github/license/mikescops/node-native-keychain)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/mikescops/node-native-keychain/pr-validation.yml)

This is a TypeScript library to store and retrieve secure information from the macos keychain. It is a wrapper around the native keychain APIs on macOS built in Swift and bindings with Koffi.

## Installation

```bash
npm install native-keychain
```

## Usage

> **Note:** For the moment, we only store [Generic passwords](https://developer.apple.com/documentation/security/ksecclassgenericpassword) in the keychain.

```typescript
import * as keychain from 'native-keychain';

keychain.setPassword({ service: 'my-service', password: 'my-password' });

const secret = await keychain.getPassword({ service: 'my-service', requireBiometrics: true }); // 'my-password'
```

## Available methods

| Method                  | Description                            |
| ----------------------- | -------------------------------------- |
| `getPassword`           | Retrieve a password from the keychain. |
| `setPassword`           | Store a password in the keychain.      |
| `deletePassword`        | Delete a password from the keychain.   |
| `isBiometricsSupported` | Check if biometrics is supported.      |

## Maintainer

| [![twitter/mikescops](https://avatars0.githubusercontent.com/u/4266283?s=100&v=4)](https://pixelswap.fr 'Personal Website') |
| --------------------------------------------------------------------------------------------------------------------------- |
| [Corentin Mors](https://pixelswap.fr/)                                                                                      |
