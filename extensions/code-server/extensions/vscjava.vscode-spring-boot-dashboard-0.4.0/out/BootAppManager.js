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
exports.BootAppManager = void 0;
const BootApp_1 = require("./BootApp");
const path = require("path");
const uuid = require("uuid");
const vscode = require("vscode");
const SymbolsController_1 = require("./controllers/SymbolsController");
const beans_1 = require("./views/beans");
const mappings_1 = require("./views/mappings");
function isBootAppClasspath(cp) {
    if (cp.entries) {
        let entries = cp.entries;
        for (let i = 0; i < entries.length; i++) {
            const cpe = entries[i];
            let filename = path.basename(cpe.path);
            if (filename.endsWith('.jar') && filename.startsWith('spring-boot')) {
                return true;
            }
        }
    }
    return false;
}
function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
class BootAppManager {
    constructor() {
        this._boot_projects = new Map();
        this._bindedSessions = new Map();
        this._onDidChangeApps = new vscode.EventEmitter();
        //We have to do something with the errors here because constructor cannot
        // be declared as `async`.
        this._startAppListSynchronisation()
            .catch((error) => {
            console.error(error);
        });
    }
    get onDidChangeApps() {
        return this._onDidChangeApps.event;
    }
    fireDidChangeApps(element) {
        this._onDidChangeApps.fire(element);
    }
    getAppList() {
        return Array.from(this._boot_projects.values()).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
    }
    getAppBySession(session) {
        const location = Array.from(this._bindedSessions.keys()).find(key => this._bindedSessions.get(key) === session);
        if (location) {
            return this._boot_projects.get(location);
        }
        else {
            return undefined;
        }
    }
    getSessionByApp(app) {
        return this._bindedSessions.get(app.path);
    }
    bindDebugSession(app, session) {
        app.activeSessionName = session.name;
        this._bindedSessions.set(app.path, session);
    }
    getAppByMainClass(mainClass) {
        return this.getAppList().find(app => { var _a; return (_a = app.mainClasses) === null || _a === void 0 ? void 0 : _a.find((mcd) => mcd.mainClass === mainClass); });
    }
    /**
     * Registers for classpath change events (from redhat.java and pivotal.spring-boot extension).
     * These events are used to keep the list of boot apps in sync with the workspace projects.
     */
    _startAppListSynchronisation() {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: The code below will fail if jdt language server has not yet been started
            //  How should we deal with that?
            const callbackId = uuid.v4();
            vscode.commands.registerCommand(callbackId, (location, name, isDeleted, entries, ..._args) => {
                if (isDeleted) {
                    this._boot_projects.delete(location);
                }
                else {
                    if (entries && isBootAppClasspath(entries)) {
                        const current = this._boot_projects.get(location);
                        if (current) {
                            current.name = name;
                            current.classpath = entries;
                        }
                        else {
                            this._boot_projects.set(location, new BootApp_1.BootApp(location, name, entries, BootApp_1.AppState.INACTIVE));
                        }
                    }
                    else {
                        this._boot_projects.delete(location);
                    }
                }
                this.fireDidChangeApps(undefined);
                // update workspace symbols for beans/mappings
                (0, SymbolsController_1.initSymbols)(5000).then(() => {
                    beans_1.beansProvider.refresh(undefined);
                    mappings_1.mappingsProvider.refresh(undefined);
                });
            });
            function registerClasspathListener() {
                return __awaiter(this, void 0, void 0, function* () {
                    const MAX_RETRIES = 10;
                    const WAIT_IN_SECONDS = 2;
                    let available_tries = MAX_RETRIES;
                    while (available_tries > 0) {
                        available_tries--;
                        try {
                            yield vscode.commands.executeCommand('java.execute.workspaceCommand', 'sts.java.addClasspathListener', callbackId);
                            return;
                        }
                        catch (error) {
                            if (available_tries > 0) {
                                yield sleep(WAIT_IN_SECONDS * 1000);
                            }
                            else {
                                throw new Error(`Failed to register classpath listener after ${MAX_RETRIES} retries.`);
                            }
                        }
                    }
                });
            }
            return yield registerClasspathListener();
        });
    }
}
exports.BootAppManager = BootAppManager;
//# sourceMappingURL=BootAppManager.js.map