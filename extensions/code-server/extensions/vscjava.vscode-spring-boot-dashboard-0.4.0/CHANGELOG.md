# Change Log
All notable changes to the "vscode-spring-boot-dashboard" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 0.4.0
- Visualize beans and endpoint mappings. [#164](https://github.com/microsoft/vscode-spring-boot-dashboard/issues/164)

## 0.3.1
- Support to use a custom context-path. [#162](https://github.com/microsoft/vscode-spring-boot-dashboard/pull/162)

## 0.3.0
- Add "envFile" to default launch configuration. [#142](https://github.com/microsoft/vscode-spring-boot-dashboard/pull/142)
- Support to open apps in VS Code's integrated browser, controlled by setting `spring.dashboard.openWith`. [#160](https://github.com/microsoft/vscode-spring-boot-dashboard/pull/160)
- Support to stop multiple running apps. [#158](https://github.com/microsoft/vscode-spring-boot-dashboard/pull/158)

## 0.2.0
 - Align with VS Code native UX. [#116](https://github.com/microsoft/vscode-spring-boot-dashboard/pull/116)
 - Hide dashboard in non-Java workspaces. [#115](https://github.com/microsoft/vscode-spring-boot-dashboard/pull/115)

## 0.1.10
- Update dependencies to fix vulnerability and telemetry issues.

## 0.1.9
### Fixed
- Cannot debug from command palette. [#101](https://github.com/microsoft/vscode-spring-boot-dashboard/issues/101)

## 0.1.8
### Fixed
- Invalid vmArgument merging when `launch.json` has a list of `vmArgs`. [#95](https://github.com/microsoft/vscode-spring-boot-dashboard/issues/95)

## 0.1.7
### Changed
- Enable JMX by default for launched apps. [#93](https://github.com/microsoft/vscode-spring-boot-dashboard/issues/93)
- No need to select when there is only one app. [#90](https://github.com/microsoft/vscode-spring-boot-dashboard/issues/90)

## 0.1.6
### Fixed
- Wrong `cwd` for starting submodule apps. [#71](https://github.com/microsoft/vscode-spring-boot-dashboard/issues/71)

## 0.1.5
### Fixed
- Fix vulnerability issue of event-stream. [#PR61](https://github.com/Microsoft/vscode-spring-boot-dashboard/pull/61)

## 0.1.4
### Added
- Allow to start multiple apps together. [#28](https://github.com/Microsoft/vscode-spring-boot-dashboard/issues/28)

## 0.1.3
### Fixed
- Fix the issue that dashboard starts wrong apps. [#45](https://github.com/Microsoft/vscode-spring-boot-dashboard/issues/45)

### Changed
- Change project icons for better user experience. [PR#48](https://github.com/Microsoft/vscode-spring-boot-dashboard/pull/48)

## 0.1.2
### Added
- Show a message in status bar when starting an app. [#40](https://github.com/Microsoft/vscode-spring-boot-dashboard/pull/40)

## 0.1.1
### Fixed
- Remove unused files to reduce extension size.

## 0.1.0
### Added
- Identify and show Spring Boot projects in VS Code. [#3](https://github.com/Microsoft/vscode-spring-boot-dashboard/issues/3) [#4](https://github.com/Microsoft/vscode-spring-boot-dashboard/issues/4)
- Support to start/debug/stop a Spring Boot project. [#5](https://github.com/Microsoft/vscode-spring-boot-dashboard/issues/5)
- Provide shortcut to open a running project in web browser. [#6](https://github.com/Microsoft/vscode-spring-boot-dashboard/issues/6)
