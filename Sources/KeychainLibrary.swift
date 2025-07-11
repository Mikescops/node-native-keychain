import Foundation
@preconcurrency import LocalAuthentication
import Security

// Function to add data to keychain with biometrics protection
@_cdecl("addToKeychain")
public func addToKeychain(cStringData: UnsafePointer<Int8>, cStringService: UnsafePointer<Int8>)
    -> Bool
{
    let data = String(cString: cStringData).data(using: .utf8)!
    let service = String(cString: cStringService)

    if #available(macOS 10.13.4, *) {
        let context = LAContext()

        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        else {
            print(
                "Biometric authentication not available: \(error?.localizedDescription ?? "Unknown error")"
            )
            return false
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecValueData as String: data,
            kSecUseAuthenticationContext as String: context,
        ]

        // Delete existing item if exists
        SecItemDelete(query as CFDictionary)

        let status = SecItemAdd(query as CFDictionary, nil)
        // print(SecCopyErrorMessageString(status, nil)!)

        return status == errSecSuccess
    }

    return false
}

// Function to retrieve data from keychain with biometrics protection
@_cdecl("getFromKeychain")
public func getFromKeychain(
    cStringService: UnsafePointer<Int8>,
    requireBiometrics: Bool,
    callback: @escaping @convention(c) (
        UnsafePointer<Int8>?, UnsafePointer<Int8>?
    ) -> Void
) {
    let semaphore = DispatchSemaphore(value: 0)

    do {
        let service = String(cString: cStringService)
        try _getFromKeychain(service: service, requireBiometrics: requireBiometrics) { result in
            switch result {
            case .success(let data):
                callback(nil, data)
            case .failure(let error):
                callback(error.localizedDescription, nil)
            }
            semaphore.signal()
        }
    } catch {
        callback(error.localizedDescription, nil)
        semaphore.signal()
    }

    semaphore.wait()
}

enum BiometricAuthenticationError: Error {
    case notAvailable(String)
    case failed(String)
    case cannotRetrieve(String)
    case unknown(String)
}

func _getFromKeychain(
    service: String, requireBiometrics: Bool,
    completion: @escaping @Sendable (Result<String, BiometricAuthenticationError>) -> Void
) throws {
    let context = LAContext()

    // Check if biometric authentication is available
    var error: NSError?
    guard
        !requireBiometrics
            || context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    else {
        completion(
            .failure(
                .notAvailable(
                    "Biometric authentication not available: \(error?.localizedDescription ?? "Unknown error")"
                )))
        return
    }

    // Check biometric authentication
    let policy: LAPolicy = .deviceOwnerAuthenticationWithBiometrics

    if requireBiometrics {
        context.evaluatePolicy(policy, localizedReason: "Access to your secret") {
            success, evaluateError in
            if success {
                _getPassword(context: context, service: service, completion: completion)
            } else {
                if let error = evaluateError {
                    completion(
                        .failure(
                            .failed(
                                "Biometric authentication failed: \(error.localizedDescription)")))
                } else {
                    completion(.failure(.failed("Biometric authentication failed")))
                }
            }
        }
    } else {
        _getPassword(context: context, service: service, completion: completion)
    }
}

func _getPassword(
    context: LAContext, service: String,
    completion: @escaping @Sendable (Result<String, BiometricAuthenticationError>) -> Void
) {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: service,
        kSecUseAuthenticationContext as String: context,
        kSecReturnData as String: true,
    ]

    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)

    if status == errSecSuccess, let data = result as? Data {
        if let dataString = String(data: data, encoding: .utf8) {
            completion(.success(dataString))
        } else {
            completion(.failure(.cannotRetrieve("Failed to retrieve data from keychain")))
        }
    } else {
        completion(.failure(.cannotRetrieve("Failed to retrieve data from keychain")))
    }
}

@_cdecl("deleteFromKeychain")
public func deleteFromKeychain(cStringService: UnsafePointer<Int8>) -> Bool {
    let service = String(cString: cStringService)

    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: service,
    ]

    let status = SecItemDelete(query as CFDictionary)
    return status == errSecSuccess
}

@_cdecl("isBiometricsSupported")
public func isBiometricsSupported() -> Bool {
    let context = LAContext()
    return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
}

@_cdecl("requestBiometricsVerification")
public func requestBiometricsVerification(
    cStringReason: UnsafePointer<Int8>, callback: @escaping @convention(c) (Bool) -> Void
) {
    let semaphore = DispatchSemaphore(value: 0)
    let reason = String(cString: cStringReason)
    let context = LAContext()

    // Check if biometric authentication is available
    var error: NSError?
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        callback(false)
        return
    }

    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) {
        success, evaluateError in
        if success {
            callback(true)
        } else {
            callback(false)
        }
        semaphore.signal()
    }

    semaphore.wait()
}
