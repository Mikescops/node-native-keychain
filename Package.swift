// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "KeychainLibrary",
    products: [
        .library(
            name: "KeychainLibrary",
            type: .dynamic,
            targets: ["KeychainLibrary"]),
    ],
    targets: [
        .target(
            name: "KeychainLibrary",
            dependencies: [])
    ]
)

