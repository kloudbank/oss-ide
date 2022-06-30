"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const jvm_launch_utils_1 = require("@pivotal-tools/jvm-launch-utils");
const path = require("path");
const vscode = require("vscode");
const BootApp_1 = require("./BootApp");
const utils_1 = require("./utils");
const getPort = require("get-port");
class Controller {
    constructor(manager, context) {
        this._manager = manager;
        this._context = context;
    }
    getAppList() {
        return this._manager.getAppList();
    }
    runBootApps(debug) {
        return __awaiter(this, void 0, void 0, function* () {
            const appList = this.getAppList();
            if (appList.length === 1 && appList[0].state !== BootApp_1.AppState.RUNNING) {
                this.runBootApp(appList[0], debug);
            }
            else {
                const appsToRun = yield vscode.window.showQuickPick(appList.filter(app => app.state !== BootApp_1.AppState.RUNNING).map(app => ({ label: app.name, path: app.path })), /** items */ { canPickMany: true, placeHolder: `Select apps to ${debug ? "debug" : "run"}.` } /** options */);
                if (appsToRun !== undefined) {
                    const appPaths = appsToRun.map(elem => elem.path);
                    yield Promise.all(appList.filter(app => appPaths.indexOf(app.path) > -1).map(app => this.runBootApp(app, debug)));
                }
            }
        });
    }
    runBootApp(app, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            const mainClasData = yield vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: `Resolving main classes for ${app.name}...` }, () => __awaiter(this, void 0, void 0, function* () {
                const mainClassList = yield app.getMainClasses();
                if (mainClassList && mainClassList instanceof Array && mainClassList.length > 0) {
                    return mainClassList.length === 1 ? mainClassList[0] :
                        yield vscode.window.showQuickPick(mainClassList.map(x => Object.assign({ label: x.mainClass }, x)), { placeHolder: `Specify the main class for ${app.name}` });
                }
                return null;
            }));
            if (mainClasData === null) {
                vscode.window.showWarningMessage("No main class is found.");
                return;
            }
            if (mainClasData === undefined) {
                return;
            }
            let targetConfig = this._getLaunchConfig(mainClasData);
            if (!targetConfig) {
                targetConfig = yield this._createNewLaunchConfig(mainClasData);
            }
            app.activeSessionName = targetConfig.name;
            let jmxport = yield getPort();
            app.jmxPort = jmxport;
            let vmArgs = [
                '-Dcom.sun.management.jmxremote',
                `-Dcom.sun.management.jmxremote.port=${jmxport}`,
                '-Dcom.sun.management.jmxremote.authenticate=false',
                '-Dcom.sun.management.jmxremote.ssl=false',
                '-Djava.rmi.server.hostname=localhost',
                '-Dspring.application.admin.enabled=true',
                '-Dspring.jmx.enabled=true',
                `-Dspring.boot.project.name=${targetConfig.projectName}`
            ];
            if (targetConfig.vmArgs) {
                var mergeArgs;
                // TODO: smarter merge? What if user is trying to enable jmx themselves on a specific port they choose, for example?
                if (typeof targetConfig.vmArgs === 'string') {
                    mergeArgs = targetConfig.vmArgs.split(/\s+/);
                }
                else { // array case
                    mergeArgs = targetConfig.vmArgs;
                }
                vmArgs.splice(vmArgs.length, 0, ...mergeArgs);
            }
            const cwdUri = vscode.Uri.parse(app.path);
            yield vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(cwdUri), Object.assign({}, targetConfig, {
                noDebug: !debug,
                cwd: cwdUri.fsPath,
                vmArgs
            }));
        });
    }
    onDidStartBootApp(session) {
        const app = this._manager.getAppList().find((elem) => elem.activeSessionName === session.name);
        if (app) {
            this._manager.bindDebugSession(app, session);
            this._setState(app, BootApp_1.AppState.LAUNCHING);
        }
    }
    stopBootApps() {
        return __awaiter(this, void 0, void 0, function* () {
            const appList = this.getAppList();
            if (appList.length === 1 && appList[0].state !== BootApp_1.AppState.INACTIVE) {
                this.stopBootApp(appList[0]);
            }
            else {
                const appsToStop = yield vscode.window.showQuickPick(appList.filter(app => app.state !== BootApp_1.AppState.INACTIVE).map(app => ({ label: app.name, path: app.path })), /** items */ { canPickMany: true, placeHolder: "Select apps to stop." } /** options */);
                if (appsToStop !== undefined) {
                    const appPaths = appsToStop.map(elem => elem.path);
                    yield Promise.all(appList.filter(app => appPaths.indexOf(app.path) > -1).map(app => this.stopBootApp(app)));
                }
            }
        });
    }
    stopBootApp(app, restart) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: How to send a shutdown signal to the app instead of killing the process directly?
            const session = this._manager.getSessionByApp(app);
            if (session) {
                if (isRunInTerminal(session) && app.pid) {
                    // kill corresponding process launched in terminal
                    try {
                        process.kill(app.pid);
                    }
                    catch (error) {
                        console.log(error);
                        app.reset();
                    }
                }
                else {
                    yield session.customRequest("disconnect", { restart: !!restart });
                }
            }
        });
    }
    onDidStopBootApp(session) {
        const app = this._manager.getAppBySession(session);
        if (app) {
            this._setState(app, BootApp_1.AppState.INACTIVE);
        }
    }
    getOpenUrlFromJMX(app) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!app.jmxPort) {
                return undefined;
            }
            let jvm = yield (0, jvm_launch_utils_1.findJvm)();
            if (!jvm) {
                return undefined;
            }
            let jmxurl = `service:jmx:rmi:///jndi/rmi://localhost:${app.jmxPort}/jmxrmi`;
            let javaProcess = jvm.jarLaunch(path.resolve(this._context.extensionPath, "lib", "java-extension.jar"), [
                "-Djmxurl=" + jmxurl
            ]);
            let stdout = javaProcess.stdout ? yield (0, utils_1.readAll)(javaProcess.stdout) : null;
            let port = undefined;
            let contextPath = undefined;
            READ_JMX_EXTENSION_RESPONSE: {
                if (stdout !== null) {
                    let jmxExtensionResponse;
                    try {
                        jmxExtensionResponse = JSON.parse(stdout);
                    }
                    catch (ex) {
                        console.log(ex);
                        break READ_JMX_EXTENSION_RESPONSE;
                    }
                    if (jmxExtensionResponse['local.server.port'] !== null && typeof jmxExtensionResponse['local.server.port'] === 'number') {
                        port = jmxExtensionResponse['local.server.port'];
                    }
                    if (jmxExtensionResponse['server.servlet.context-path'] !== null) {
                        contextPath = jmxExtensionResponse['server.servlet.context-path'];
                    }
                    if (jmxExtensionResponse['status'] !== null && jmxExtensionResponse['status'] === "failure") {
                        this._printJavaProcessError(javaProcess);
                    }
                }
            }
            if (contextPath === undefined) {
                contextPath = ""; //if no context path is defined then fallback to root path
            }
            return port ? constructOpenUrl(contextPath, port) : undefined;
        });
    }
    openBootApp(app) {
        return __awaiter(this, void 0, void 0, function* () {
            let openUrl;
            if (app.contextPath !== undefined && app.port !== undefined) {
                openUrl = constructOpenUrl(app.contextPath, app.port);
            }
            else {
                openUrl = yield this.getOpenUrlFromJMX(app);
            }
            if (openUrl !== undefined) {
                const openWithExternalBrowser = vscode.workspace.getConfiguration("spring.dashboard").get("openWith") === "external";
                const browserCommand = openWithExternalBrowser ? "vscode.open" : "simpleBrowser.api.open";
                vscode.commands.executeCommand(browserCommand, vscode.Uri.parse(openUrl));
            }
            else {
                vscode.window.showErrorMessage("Couldn't determine port app is running on");
            }
        });
    }
    _printJavaProcessError(javaProcess) {
        return __awaiter(this, void 0, void 0, function* () {
            if (javaProcess.stderr) {
                let err = yield (0, utils_1.readAll)(javaProcess.stderr);
                console.log(err);
            }
        });
    }
    _setState(app, state) {
        app.state = state;
        this._manager.fireDidChangeApps(undefined);
    }
    _getLaunchConfig(mainClasData) {
        const launchConfigurations = vscode.workspace.getConfiguration("launch", vscode.Uri.file(mainClasData.filePath));
        const rawConfigs = launchConfigurations.configurations;
        return rawConfigs.find(conf => conf.type === "java" && conf.request === "launch" && conf.mainClass === mainClasData.mainClass && conf.projectName === mainClasData.projectName);
    }
    _constructLaunchConfigName(mainClass, projectName) {
        const prefix = "Spring Boot-";
        let name = prefix + mainClass.substr(mainClass.lastIndexOf(".") + 1);
        if (projectName !== undefined) {
            name += `<${projectName}>`;
        }
        return name;
    }
    _createNewLaunchConfig(mainClasData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newConfig = {
                type: "java",
                name: this._constructLaunchConfigName(mainClasData.mainClass, mainClasData.projectName),
                request: "launch",
                cwd: "${workspaceFolder}",
                mainClass: mainClasData.mainClass,
                projectName: mainClasData.projectName,
                args: "",
                envFile: "${workspaceFolder}/.env"
            };
            const launchConfigurations = vscode.workspace.getConfiguration("launch", vscode.Uri.file(mainClasData.filePath));
            const configs = launchConfigurations.configurations;
            configs.push(newConfig);
            yield launchConfigurations.update("configurations", configs, vscode.ConfigurationTarget.WorkspaceFolder);
            return newConfig;
        });
    }
}
exports.Controller = Controller;
function isRunInTerminal(session) {
    return session.configuration.noDebug === true && session.configuration.console !== "internalConsole";
}
function constructOpenUrl(contextPath, port) {
    const configOpenUrl = vscode.workspace.getConfiguration("spring.dashboard").get("openUrl");
    let openUrl;
    if (configOpenUrl === undefined) {
        openUrl = `http://localhost:${port}${contextPath}/`;
    }
    else {
        openUrl = configOpenUrl
            .replace("{port}", String(port))
            .replace("{contextPath}", contextPath.toString());
    }
    return openUrl;
}
//# sourceMappingURL=Controller.js.map