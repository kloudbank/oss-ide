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
exports.getPathToWorkspaceStorage = exports.getPathToExtensionRoot = exports.getPathToTempFolder = exports.getAiKey = exports.getExtensionVersion = exports.getExtensionId = exports.loadPackageInfo = void 0;
const os = require("os");
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
let EXTENSION_CONTEXT;
let EXTENSION_PUBLISHER;
let EXTENSION_NAME;
let EXTENSION_VERSION;
let EXTENSION_AI_KEY;
let TEMP_FOLDER_PER_USER;
function loadPackageInfo(context) {
    return __awaiter(this, void 0, void 0, function* () {
        EXTENSION_CONTEXT = context;
        const raw = yield fs.promises.readFile(context.asAbsolutePath("./package.json"), { encoding: 'utf-8' });
        const { publisher, name, version, aiKey } = JSON.parse(raw);
        EXTENSION_AI_KEY = aiKey;
        EXTENSION_PUBLISHER = publisher;
        EXTENSION_NAME = name;
        EXTENSION_VERSION = version;
        TEMP_FOLDER_PER_USER = path.join(os.tmpdir(), `${EXTENSION_NAME}-${os.userInfo().username}`);
    });
}
exports.loadPackageInfo = loadPackageInfo;
function getExtensionId() {
    return `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
}
exports.getExtensionId = getExtensionId;
function getExtensionVersion() {
    return EXTENSION_VERSION;
}
exports.getExtensionVersion = getExtensionVersion;
function getAiKey() {
    return EXTENSION_AI_KEY;
}
exports.getAiKey = getAiKey;
function getPathToTempFolder(...args) {
    return path.join(TEMP_FOLDER_PER_USER, ...args);
}
exports.getPathToTempFolder = getPathToTempFolder;
function getPathToExtensionRoot(...args) {
    const ext = vscode_1.extensions.getExtension(getExtensionId());
    if (!ext) {
        throw new Error("Cannot identify extension root.");
    }
    return path.join(ext.extensionPath, ...args);
}
exports.getPathToExtensionRoot = getPathToExtensionRoot;
function getPathToWorkspaceStorage(...args) {
    if (EXTENSION_CONTEXT.storageUri === undefined) {
        return undefined;
    }
    return vscode_1.Uri.joinPath(EXTENSION_CONTEXT.storageUri, ...args);
}
exports.getPathToWorkspaceStorage = getPathToWorkspaceStorage;
//# sourceMappingURL=contextUtils.js.map