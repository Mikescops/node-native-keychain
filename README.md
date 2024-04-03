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

```typescript
import * as keychain from 'native-keychain';

keychain.setPassword({ service: 'my-service', password: 'my-password' });

const secret = await keychain.getPassword({ service: 'my-service', requireBiometrics: true }); // 'my-password'
```

## Maintainer

| [![twitter/mikescops](https://avatars0.githubusercontent.com/u/4266283?s=100&v=4)](https://pixelswap.fr 'Personal Website') |
| --------------------------------------------------------------------------------------------------------------------------- |
| [Corentin Mors](https://pixelswap.fr/)                                                                                      |
