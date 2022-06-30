"use strict";
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
exports.requestWorkspaceSymbols = exports.getMainClass = exports.getPid = exports.getContextPath = exports.getPort = exports.getMappings = exports.getBeanDetail = exports.getBeans = exports.getBeansDependingOn = exports.initialize = exports.stsApi = void 0;
const cp = require("child_process");
const os = require("os");
const util_1 = require("util");
const vscode = require("vscode");
const path = require("path");
const execFile = (0, util_1.promisify)(cp.execFile);
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.stsApi === undefined) {
            const stsExt = vscode.extensions.getExtension("pivotal.vscode-spring-boot");
            exports.stsApi = yield (stsExt === null || stsExt === void 0 ? void 0 : stsExt.activate());
        }
    });
}
exports.initialize = initialize;
function getBeansDependingOn(processKey, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const beans = yield exports.stsApi.getLiveProcessData({
            processKey,
            endpoint: "beans",
            dependingOn: id
        });
        return beans;
    });
}
exports.getBeansDependingOn = getBeansDependingOn;
function getBeans(processKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.stsApi.getLiveProcessData({
            processKey: processKey,
            endpoint: "beans"
        });
        return result;
    });
}
exports.getBeans = getBeans;
function getBeanDetail(processKey, beanName) {
    return __awaiter(this, void 0, void 0, function* () {
        const bean = yield exports.stsApi.getLiveProcessData({
            processKey,
            endpoint: "beans",
            beanName
        });
        return bean;
    });
}
exports.getBeanDetail = getBeanDetail;
function getMappings(processKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.stsApi.getLiveProcessData({
            processKey: processKey,
            endpoint: "mappings"
        });
        return result;
    });
}
exports.getMappings = getMappings;
function getPort(processKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.stsApi.getLiveProcessData({
            processKey: processKey,
            endpoint: "port"
        });
        return result;
    });
}
exports.getPort = getPort;
function getContextPath(processKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.stsApi.getLiveProcessData({
            processKey: processKey,
            endpoint: "contextPath"
        });
        return result;
    });
}
exports.getContextPath = getContextPath;
/**
 * below are workaround for spring-tools v1.33 as `processKey` equals to `pid`.
 */
function getPid(processKey) {
    var _a;
    return (_a = processKey.split(" - ")) === null || _a === void 0 ? void 0 : _a[0];
}
exports.getPid = getPid;
function getMainClass(processKey) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const mainClass = (_a = processKey.split(" - ")) === null || _a === void 0 ? void 0 : _a[1];
        if (!mainClass) {
            const pid = getPid(processKey);
            return yield getMainClassFromPid(pid);
        }
        return mainClass;
    });
}
exports.getMainClass = getMainClass;
function getMainClassFromPid(pid) {
    return __awaiter(this, void 0, void 0, function* () {
        // workaround: parse output from  `jps -l`
        const jreHome = yield getJreHome();
        if (jreHome) {
            const jpsExecRes = yield execFile(path.join(jreHome, "bin", "jps"), ["-l"]);
            const targetLine = jpsExecRes.stdout.split(os.EOL).find(line => line.startsWith(pid));
            if (targetLine) {
                const segments = targetLine.trim().split(/\s+/);
                return segments[segments.length - 1];
            }
        }
        return "";
    });
}
function getJreHome() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const javaExt = vscode.extensions.getExtension("redhat.java");
        if (!javaExt) {
            return undefined;
        }
        return (_a = javaExt.exports.javaRequirement) === null || _a === void 0 ? void 0 : _a.tooling_jre;
    });
}
function requestWorkspaceSymbols(_projectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const beans = yield exports.stsApi.client.sendRequest("workspace/symbol", { "query": "@+" });
        const mappings = yield exports.stsApi.client.sendRequest("workspace/symbol", { "query": "@/" });
        return { beans, mappings };
    });
}
exports.requestWorkspaceSymbols = requestWorkspaceSymbols;
//# sourceMappingURL=stsApi.js.map