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
exports.BootApp = exports.AppState = void 0;
const vscode = require("vscode");
const stsApi_1 = require("./models/stsApi");
const utils_1 = require("./utils");
const apps_1 = require("./views/apps");
var AppState;
(function (AppState) {
    AppState["INACTIVE"] = "inactive";
    AppState["RUNNING"] = "running";
    AppState["LAUNCHING"] = "launching"; // TODO: Distinguish launching & running via JMX.
})(AppState = exports.AppState || (exports.AppState = {}));
class BootApp {
    constructor(_path, _name, _classpath, _state) {
        this._path = _path;
        this._name = _name;
        this._classpath = _classpath;
        this._state = _state;
        this.getWorkspaceSymbols();
    }
    get activeSessionName() {
        return this._activeSessionName;
    }
    set activeSessionName(session) {
        this._activeSessionName = session;
    }
    get path() {
        return this._path;
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
    }
    set jmxPort(port) {
        this._jmxPort = port;
    }
    get jmxPort() {
        return this._jmxPort;
    }
    get classpath() {
        return this._classpath;
    }
    set classpath(classpath) {
        this._classpath = classpath;
    }
    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
        apps_1.appsProvider.refresh(this);
        if (this._state === AppState.INACTIVE) {
            this.clearWatchdog();
        }
    }
    get port() {
        return this._port;
    }
    set port(port) {
        this._port = port;
        apps_1.appsProvider.refresh(this);
    }
    get pid() {
        return this._pid;
    }
    set pid(pid) {
        this._pid = pid;
        if (pid !== undefined) {
            this.setWatchdog();
        }
    }
    get contextPath() {
        return this._contextPath;
    }
    set contextPath(contextPath) {
        this._contextPath = contextPath !== null && contextPath !== void 0 ? contextPath : "";
        apps_1.appsProvider.refresh(this);
    }
    reset() {
        this._port = undefined;
        this._contextPath = undefined;
        this.pid = undefined;
        this._state = AppState.INACTIVE;
        apps_1.appsProvider.refresh(this);
    }
    setWatchdog() {
        const watchdog = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const alive = yield (0, utils_1.isAlive)(this.pid);
            if (!alive) {
                clearInterval(watchdog);
                this.reset();
            }
        }), 2000);
        this._watchdog = watchdog;
    }
    clearWatchdog() {
        if (this._watchdog) {
            clearInterval(this._watchdog);
            this._watchdog = undefined;
        }
    }
    getMainClasses() {
        return __awaiter(this, void 0, void 0, function* () {
            // Note: Command `vscode.java.resolveMainClass` is implemented in extension java-debugger
            const mainClassList = yield vscode.commands.executeCommand('java.execute.workspaceCommand', 'vscode.java.resolveMainClass', this.path);
            if (mainClassList && mainClassList instanceof Array) {
                this.mainClasses = mainClassList;
                return mainClassList;
            }
            else {
                return [];
            }
        });
    }
    /**
     * getWorkspaceSymbols
     */
    getWorkspaceSymbols() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.symbols) {
                this.symbols = yield (0, stsApi_1.requestWorkspaceSymbols)(this.path);
            }
            return this.symbols;
        });
    }
}
exports.BootApp = BootApp;
//# sourceMappingURL=BootApp.js.map