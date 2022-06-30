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
exports.openEndpointHandler = exports.mappingsProvider = void 0;
const vscode = require("vscode");
const BootApp_1 = require("../BootApp");
const SymbolsController_1 = require("../controllers/SymbolsController");
const liveProcess_1 = require("../models/liveProcess");
const stsApi_1 = require("../models/stsApi");
class MappingsDataProvider {
    constructor() {
        this.store = new Map();
        this.staticData = new Map();
        this._showAll = false;
        this.onDidRefreshMappings = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidRefreshMappings.event;
        vscode.commands.executeCommand("setContext", "spring.mappings:showMode", "defined");
    }
    get showAll() {
        return this._showAll;
    }
    set showAll(value) {
        this._showAll = value;
        vscode.commands.executeCommand("setContext", "spring.mappings:showMode", this._showAll ? "all" : "defined");
        this.onDidRefreshMappings.fire(undefined);
    }
    getTreeItem(element) {
        if (element instanceof liveProcess_1.LiveProcess) {
            const item = new vscode.TreeItem(element.appName);
            item.description = `pid: ${element.pid}`;
            item.iconPath = new vscode.ThemeIcon("pulse", new vscode.ThemeColor("charts.green"));
            item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            item.contextValue = "liveProcess";
            return item;
        }
        else if (element instanceof BootApp_1.BootApp) {
            const item = new vscode.TreeItem(element.name);
            item.iconPath = new vscode.ThemeIcon("pulse");
            item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            item.contextValue = "bootApp";
            return item;
        }
        else {
            const isLive = !!element.processKey;
            const label = element.label;
            const item = new vscode.TreeItem(label);
            item.tooltip = element.handler;
            item.collapsibleState = vscode.TreeItemCollapsibleState.None;
            const themeColor = isLive ? new vscode.ThemeColor("charts.green") : undefined;
            item.iconPath = new vscode.ThemeIcon("link", themeColor);
            item.contextValue = isLive ? "spring:endpoint" : "spring:staticEndpoint";
            if (element.method) {
                item.contextValue += `+${element.method}`;
            }
            item.command = {
                command: "spring.dashboard.endpoint.navigate",
                title: "Go to definition",
                arguments: [element]
            };
            return item;
        }
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            // top-level
            if (!element) {
                const ret = [];
                const liveProcesses = Array.from(this.store.keys());
                ret.push(...liveProcesses);
                const staticApps = Array.from(this.staticData.keys());
                const appsWithoutLiveProcess = staticApps.filter(app => !liveProcesses.find(lp => lp.appName === app.name));
                ret.push(...appsWithoutLiveProcess);
                ret.sort((a, b) => { var _a, _b; return ((_a = a.appName) !== null && _a !== void 0 ? _a : a.name).localeCompare((_b = b.appName) !== null && _b !== void 0 ? _b : b.name); });
                return ret;
            }
            yield (0, SymbolsController_1.initSymbols)();
            // all mappings
            if (element instanceof liveProcess_1.LiveProcess) {
                const liveMappings = this.store.get(element);
                // TODO: inaccurate match with project name. should use some unique identifier like path.
                const correspondingApp = Array.from(this.staticData.keys()).find(app => app.name === element.appName);
                let fullList = liveMappings;
                if (correspondingApp) {
                    const staticMappings = this.staticData.get(correspondingApp);
                    fullList = liveMappings === null || liveMappings === void 0 ? void 0 : liveMappings.map(lm => (Object.assign({ corresponding: staticMappings === null || staticMappings === void 0 ? void 0 : staticMappings.find(sm => sm.label === lm.label) }, lm)));
                    if (!this.showAll && (staticMappings === null || staticMappings === void 0 ? void 0 : staticMappings.length)) {
                        return fullList === null || fullList === void 0 ? void 0 : fullList.filter(elem => elem.corresponding);
                    }
                }
                return fullList;
            }
            else if (element instanceof BootApp_1.BootApp) {
                return this.staticData.get(element);
            }
            return undefined;
        });
    }
    refresh(item) {
        this.onDidRefreshMappings.fire(item);
    }
    refreshLive(liveProcess, mappingsRaw) {
        var _a;
        if (mappingsRaw === undefined) {
            // remove
            const targetLiveProcess = Array.from(this.store.keys()).find(lp => lp.processKey === liveProcess.processKey);
            if (targetLiveProcess) {
                this.store.delete(targetLiveProcess);
            }
        }
        else {
            // add / update
            const targetLiveProcess = (_a = Array.from(this.store.keys()).find(lp => lp.processKey === liveProcess.processKey)) !== null && _a !== void 0 ? _a : new liveProcess_1.LiveProcess(liveProcess);
            const mappings = mappingsRaw.map(raw => parseMapping(raw, liveProcess.processKey)).sort((a, b) => a.label.localeCompare(b.label));
            this.store.set(targetLiveProcess, mappings);
        }
        this.onDidRefreshMappings.fire(undefined);
    }
    refreshStatic(app, mappingsRaw) {
        this.updateStaticData(app, mappingsRaw);
        this.onDidRefreshMappings.fire(undefined);
    }
    updateStaticData(app, mappingsRaw) {
        const mappings = mappingsRaw.map(raw => parseStaticMapping(raw)).sort((a, b) => a.label.localeCompare(b.label));
        this.staticData.set(app, mappings);
    }
}
function parseMapping(raw, processKey) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const pattern = (_e = (_d = (_c = (_b = (_a = raw.data.map) === null || _a === void 0 ? void 0 : _a.details) === null || _b === void 0 ? void 0 : _b.map.requestMappingConditions) === null || _c === void 0 ? void 0 : _c.map.patterns) === null || _d === void 0 ? void 0 : _d.myArrayList) === null || _e === void 0 ? void 0 : _e[0];
    const method = (_k = (_j = (_h = (_g = (_f = raw.data.map) === null || _f === void 0 ? void 0 : _f.details) === null || _g === void 0 ? void 0 : _g.map.requestMappingConditions) === null || _h === void 0 ? void 0 : _h.map.methods) === null || _j === void 0 ? void 0 : _j.myArrayList) === null || _k === void 0 ? void 0 : _k[0];
    let label = (_m = pattern !== null && pattern !== void 0 ? pattern : (_l = raw.data.map) === null || _l === void 0 ? void 0 : _l.predicate) !== null && _m !== void 0 ? _m : "unknown";
    if (method) {
        label += ` [${method}]`;
    }
    return Object.assign({ processKey,
        label,
        method,
        pattern }, raw.data.map);
}
function parseStaticMapping(raw) {
    const [pattern, method] = raw.name.replace(/^@/, "").split(" -- ");
    let label = pattern !== null && pattern !== void 0 ? pattern : "unknown";
    if (method) {
        label += ` [${method}]`;
    }
    return Object.assign({ label,
        method,
        pattern }, raw);
}
exports.mappingsProvider = new MappingsDataProvider();
function openEndpointHandler(endpoint) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const port = yield (0, stsApi_1.getPort)(endpoint.processKey);
        const contextPath = (_a = yield (0, stsApi_1.getContextPath)(endpoint.processKey)) !== null && _a !== void 0 ? _a : "";
        const url = `http://localhost:${port}${contextPath}${endpoint.pattern}`;
        const openWithExternalBrowser = vscode.workspace.getConfiguration("spring.dashboard").get("openWith") === "external";
        const browserCommand = openWithExternalBrowser ? "vscode.open" : "simpleBrowser.api.open";
        vscode.commands.executeCommand(browserCommand, vscode.Uri.parse(url));
    });
}
exports.openEndpointHandler = openEndpointHandler;
//# sourceMappingURL=mappings.js.map