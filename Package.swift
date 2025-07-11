// swift-tools-version: 6.1

import PackageDescription

let package = Package(
    name: "KeychainLibrary",
    platforms: [
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "KeychainLibrary",
            type: .dynamic,
            targets: ["KeychainLibrary"])
    ],
    targets: [
        .target(
            name: "KeychainLibrary",
            dependencies: [],
            swiftSettings: [
                .swiftLanguageMode(.v5)
            ])
    ],
    swiftLanguageModes: [.v5]
)
