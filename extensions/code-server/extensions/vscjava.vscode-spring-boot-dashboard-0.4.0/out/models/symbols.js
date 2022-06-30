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
exports.navigateToLocation = exports.getMappings = exports.getBeans = exports.init = void 0;
const stsApi_1 = require("./stsApi");
const vscode = require("vscode");
const utils_1 = require("../utils");
let beans;
let mappings;
function init(timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const INTERVAL = 500; //ms
        const TIMEOUT = timeout !== null && timeout !== void 0 ? timeout : 0;
        let retry = 0;
        do {
            if (retry !== 0) {
                yield (0, utils_1.sleep)(INTERVAL);
                retry++;
            }
            const symbols = yield (0, stsApi_1.requestWorkspaceSymbols)();
            beans = symbols.beans;
            mappings = symbols.mappings;
        } while (!(beans === null || beans === void 0 ? void 0 : beans.length) && !(mappings === null || mappings === void 0 ? void 0 : mappings.length) && retry * INTERVAL < TIMEOUT);
    });
}
exports.init = init;
function getBeans(projectPath) {
    if (!projectPath) {
        return beans;
    }
    const path = sanitizeFilePath(projectPath);
    return beans.filter(b => sanitizeFilePath(b.location.uri).startsWith(path));
}
exports.getBeans = getBeans;
function getMappings(projectPath) {
    if (!projectPath) {
        return beans;
    }
    const path = sanitizeFilePath(projectPath);
    return mappings.filter(b => sanitizeFilePath(b.location.uri).startsWith(path));
}
exports.getMappings = getMappings;
function sanitizeFilePath(uri) {
    return uri.replace(/^file:\/+/, "");
}
function navigateToLocation(symbol) {
    var _a, _b;
    const { uri, range } = (_a = symbol.location) !== null && _a !== void 0 ? _a : (_b = symbol.corresponding) === null || _b === void 0 ? void 0 : _b.location;
    const line = range.start.line + 1; // zero-base in range.
    const uriString = `${uri}#${line}`;
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(uriString));
}
exports.navigateToLocation = navigateToLocation;
//# sourceMappingURL=symbols.js.map