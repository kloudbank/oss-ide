"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.appsProvider = void 0;
const vscode = require("vscode");
const BootAppManager_1 = require("../BootAppManager");
class BootAppItem {
    constructor(app) {
        this._app = app;
    }
    get label() {
        return this._app.name;
    }
    get description() {
        const list = [];
        if (this._app.port) {
            list.push(`:${this._app.port}`);
        }
        if (this._app.contextPath) {
            list.push(this._app.contextPath);
        }
        if (list.length > 0) {
            return `[${list.join(", ")}]`;
        }
        return undefined;
    }
    get iconPath() {
        const green = new vscode.ThemeColor("charts.green");
        switch (this.state) {
            case "running":
                return new vscode.ThemeIcon("circle-filled", green);
            case "launching":
                return new vscode.ThemeIcon("sync~spin");
            default:
                return new vscode.ThemeIcon("circle-filled");
        }
    }
    get state() {
        return this._app.state;
    }
    get contextValue() {
        return `BootApp_${this._app.state}`;
    }
}
class LocalAppTreeProvider {
    constructor() {
        this.manager = new BootAppManager_1.BootAppManager();
        this.onDidChangeTreeData = this.manager.onDidChangeApps;
        this.manager.fireDidChangeApps(undefined);
    }
    getTreeItem(element) {
        return new BootAppItem(element);
    }
    getChildren(element) {
        if (!element) {
            return this.manager.getAppList();
        }
        else {
            return [];
        }
    }
    refresh(element) {
        this.manager.fireDidChangeApps(element);
    }
}
exports.appsProvider = new LocalAppTreeProvider();
//# sourceMappingURL=apps.js.map