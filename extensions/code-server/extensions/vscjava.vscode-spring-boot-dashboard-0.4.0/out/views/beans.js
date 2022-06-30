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
exports.openBeanHandler = exports.beansProvider = void 0;
const vscode = require("vscode");
const BootApp_1 = require("../BootApp");
const contextUtils_1 = require("../contextUtils");
const SymbolsController_1 = require("../controllers/SymbolsController");
const liveProcess_1 = require("../models/liveProcess");
const stsApi_1 = require("../models/stsApi");
class BeansDataProvider {
    constructor() {
        this.store = new Map();
        this.staticData = new Map();
        this._showAll = false;
        this.onDidRefreshBeans = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidRefreshBeans.event;
        vscode.commands.executeCommand("setContext", "spring.beans:showMode", "defined");
    }
    get showAll() {
        return this._showAll;
    }
    set showAll(value) {
        this._showAll = value;
        vscode.commands.executeCommand("setContext", "spring.beans:showMode", this._showAll ? "all" : "defined");
        this.onDidRefreshBeans.fire(undefined);
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
            const label = element.id;
            const item = new vscode.TreeItem(label);
            item.collapsibleState = vscode.TreeItemCollapsibleState.None;
            if (isLive) {
                item.iconPath = (0, contextUtils_1.getPathToExtensionRoot)("resources", "bean-live.svg");
            }
            else {
                item.iconPath = {
                    light: (0, contextUtils_1.getPathToExtensionRoot)("resources", "bean-light.svg"),
                    dark: (0, contextUtils_1.getPathToExtensionRoot)("resources", "bean-dark.svg")
                };
            }
            item.contextValue = isLive ? "spring:bean" : "spring:staticBean";
            item.command = {
                command: isLive ? "spring.dashboard.bean.open" : "spring.dashboard.bean.navigate",
                title: "Open",
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
            // all beans
            if (element instanceof liveProcess_1.LiveProcess) {
                const liveBeans = this.store.get(element);
                if (!this.showAll) {
                    // TODO: inaccurate match with project name. should use some unique identifier like path.
                    const correspondingApp = Array.from(this.staticData.keys()).find(app => app.name === element.appName);
                    if (correspondingApp) {
                        const staticBeans = this.staticData.get(correspondingApp);
                        if (staticBeans === null || staticBeans === void 0 ? void 0 : staticBeans.length) {
                            return liveBeans === null || liveBeans === void 0 ? void 0 : liveBeans.filter(lb => staticBeans === null || staticBeans === void 0 ? void 0 : staticBeans.find(sb => sb.id === lb.id));
                        }
                    }
                }
                return liveBeans;
            }
            else if (element instanceof BootApp_1.BootApp) {
                return this.staticData.get(element);
            }
            /*
            TODO: should move to reference view
                // dependencies
                const beans = await getBeansDependingOn(element.processKey, element.id);
                element.dependents = beans.map((b:any) => {return {processKey: element.processKey, ...b}});
                return element.dependents;
            */
            return undefined;
        });
    }
    refresh(item) {
        this.onDidRefreshBeans.fire(item);
    }
    refreshLive(liveProcess, beanIds) {
        var _a;
        if (beanIds === undefined) {
            // remove
            const targetLiveProcess = Array.from(this.store.keys()).find(lp => lp.processKey === liveProcess.processKey);
            if (targetLiveProcess) {
                this.store.delete(targetLiveProcess);
            }
        }
        else {
            // add/update
            const targetLiveProcess = (_a = Array.from(this.store.keys()).find(lp => lp.processKey === liveProcess.processKey)) !== null && _a !== void 0 ? _a : new liveProcess_1.LiveProcess(liveProcess);
            const beans = beanIds.map(b => { return { processKey: liveProcess.processKey, id: b }; }).sort((a, b) => a.id.localeCompare(b.id));
            this.store.set(targetLiveProcess, beans);
        }
        this.onDidRefreshBeans.fire(undefined);
    }
    refreshStatic(app, mappingsRaw) {
        this.updateStaticData(app, mappingsRaw);
        this.onDidRefreshBeans.fire(undefined);
    }
    updateStaticData(app, mappingsRaw) {
        const mappings = mappingsRaw.map(raw => parseStaticBean(raw)).sort((a, b) => a.id.localeCompare(b.id));
        this.staticData.set(app, mappings);
    }
}
exports.beansProvider = new BeansDataProvider();
function openBeanHandler(bean) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: extract logic in sts.java.javadocHoverLink into jdtls as a utility
        if (!bean.type) {
            const details = yield (0, stsApi_1.getBeanDetail)(bean.processKey, bean.id);
            if (details && details.length > 0) {
                bean = Object.assign(Object.assign({}, bean), details[0]);
            }
        }
        if (bean.type) {
            const bindingKey = `L${bean.type.replace(/\./g, "/")};`;
            const uriString = yield vscode.commands.executeCommand("sts.java.javadocHoverLink", {
                bindingKey,
                lookInOtherProjects: true
            });
            if (uriString) {
                yield vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(uriString));
                return;
            }
        }
        vscode.window.showWarningMessage(`Fail to open bean. ${JSON.stringify(bean)}`);
    });
}
exports.openBeanHandler = openBeanHandler;
function parseStaticBean(raw) {
    const m = raw.name.match(/^@\+ '(.+?)'/);
    let id = m ? m[1] : "unknown";
    return Object.assign({ id }, raw);
}
//# sourceMappingURL=beans.js.map