// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
'use strict';
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
exports.deactivate = exports.initializeExtension = exports.activate = void 0;
const vscode = require("vscode");
const vscode_extension_telemetry_wrapper_1 = require("vscode-extension-telemetry-wrapper");
const contextUtils_1 = require("./contextUtils");
const Controller_1 = require("./Controller");
const LiveDataController_1 = require("./controllers/LiveDataController");
const SymbolsController_1 = require("./controllers/SymbolsController");
const stsApi_1 = require("./models/stsApi");
const symbols_1 = require("./models/symbols");
const apps_1 = require("./views/apps");
const beans_1 = require("./views/beans");
const mappings_1 = require("./views/mappings");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, contextUtils_1.loadPackageInfo)(context);
        // Usage data statistics.
        if ((0, contextUtils_1.getAiKey)()) {
            (0, vscode_extension_telemetry_wrapper_1.initialize)((0, contextUtils_1.getExtensionId)(), (0, contextUtils_1.getExtensionVersion)(), (0, contextUtils_1.getAiKey)(), { firstParty: true });
        }
        yield (0, vscode_extension_telemetry_wrapper_1.instrumentOperation)("activation", initializeExtension)(context);
    });
}
exports.activate = activate;
function initializeExtension(_oprationId, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const controller = new Controller_1.Controller(apps_1.appsProvider.manager, context);
        context.subscriptions.push(vscode.window.registerTreeDataProvider('spring-boot-dashboard', apps_1.appsProvider));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.refresh", () => {
            apps_1.appsProvider.manager.fireDidChangeApps(undefined);
        }));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.localapp.run", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.runBootApp(app);
        })));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.localapp.debug", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.runBootApp(app, true);
        })));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.localapp.stop", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.stopBootApp(app);
        })));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.localapp.open", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.openBootApp(app);
        })));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.localapp.run-multiple", () => __awaiter(this, void 0, void 0, function* () {
            yield controller.runBootApps();
        })));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.localapp.debug-multiple", () => __awaiter(this, void 0, void 0, function* () {
            yield controller.runBootApps(true);
        })));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring-boot-dashboard.localapp.stop-multiple", () => __awaiter(this, void 0, void 0, function* () {
            yield controller.stopBootApps();
        })));
        vscode.debug.onDidStartDebugSession((session) => {
            if (session.type === "java") {
                controller.onDidStartBootApp(session);
            }
        });
        vscode.debug.onDidTerminateDebugSession((session) => {
            if (session.type === "java") {
                controller.onDidStopBootApp(session);
            }
        });
        // live data
        context.subscriptions.push(vscode.window.createTreeView('spring.beans', { treeDataProvider: beans_1.beansProvider, showCollapseAll: true }));
        context.subscriptions.push(vscode.window.createTreeView('spring.mappings', { treeDataProvider: mappings_1.mappingsProvider, showCollapseAll: true }));
        yield (0, LiveDataController_1.init)();
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.endpoint.open", mappings_1.openEndpointHandler));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.endpoint.navigate", symbols_1.navigateToLocation));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.bean.open", beans_1.openBeanHandler));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.bean.navigate", symbols_1.navigateToLocation));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.mapping.showAll", () => mappings_1.mappingsProvider.showAll = true));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.mapping.showDefined", () => mappings_1.mappingsProvider.showAll = false));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.bean.showAll", () => beans_1.beansProvider.showAll = true));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.dashboard.bean.showDefined", () => beans_1.beansProvider.showAll = false));
        context.subscriptions.push((0, vscode_extension_telemetry_wrapper_1.instrumentOperationAsVsCodeCommand)("spring.staticData.refresh", () => (0, SymbolsController_1.initSymbols)(0, true)));
        // console.log
        context.subscriptions.push(vscode.commands.registerCommand("_spring.console.log", console.log));
        context.subscriptions.push(vscode.commands.registerCommand("_spring.symbols", stsApi_1.requestWorkspaceSymbols));
    });
}
exports.initializeExtension = initializeExtension;
// this method is called when your extension is deactivated
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, vscode_extension_telemetry_wrapper_1.dispose)();
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map