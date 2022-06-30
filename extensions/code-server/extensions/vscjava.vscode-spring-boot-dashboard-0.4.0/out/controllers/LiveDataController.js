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
exports.init = void 0;
const BootApp_1 = require("../BootApp");
const stsApi_1 = require("../models/stsApi");
const utils_1 = require("../utils");
const apps_1 = require("../views/apps");
const beans_1 = require("../views/beans");
const mappings_1 = require("../views/mappings");
class LiveInformationStore {
    constructor() {
        this.data = new Map();
    }
}
let store;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, stsApi_1.initialize)();
        store = new LiveInformationStore();
        stsApi_1.stsApi.onDidLiveProcessConnect(updateProcessInfo);
        stsApi_1.stsApi.onDidLiveProcessDisconnect(resetProcessInfo);
        stsApi_1.stsApi.onDidLiveProcessUpdate(updateProcessInfo);
    });
}
exports.init = init;
function updateProcessInfo(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const liveProcess = yield parsePayload(payload);
        const { processKey, processName, pid } = liveProcess;
        const beans = yield (0, stsApi_1.getBeans)(processKey);
        beans_1.beansProvider.refreshLive(liveProcess, beans);
        const mappings = yield (0, stsApi_1.getMappings)(processKey);
        mappings_1.mappingsProvider.refreshLive(liveProcess, mappings);
        const port = yield (0, stsApi_1.getPort)(processKey);
        const contextPath = yield (0, stsApi_1.getContextPath)(processKey);
        store.data.set(processKey, { processName, pid, beans, mappings, port });
        const runningApp = apps_1.appsProvider.manager.getAppByMainClass(processName);
        if (runningApp) {
            runningApp.pid = parseInt(pid);
            runningApp.port = parseInt(port);
            runningApp.contextPath = contextPath;
            runningApp.state = BootApp_1.AppState.RUNNING; // will refresh tree item
        }
    });
}
function resetProcessInfo(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const liveProcess = yield parsePayload(payload);
        store.data.delete(liveProcess.processKey);
        beans_1.beansProvider.refreshLive(liveProcess, undefined);
        mappings_1.mappingsProvider.refreshLive(liveProcess, undefined);
        const disconnectedApp = apps_1.appsProvider.manager.getAppByMainClass(liveProcess.processName);
        // Workaound for: app is still running if manually disconnect from live process connection.
        if (disconnectedApp && !(yield (0, utils_1.isAlive)(disconnectedApp.pid))) {
            disconnectedApp.reset();
        }
    });
}
/**
 *
 * Fix complatibility of lower versions.
 *
 * @param payload string for v1.33, LocalLiveProcess for v1.34
 * @returns
 */
function parsePayload(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof payload === "string") {
            const processKey = payload;
            const processName = yield (0, stsApi_1.getMainClass)(processKey);
            const pid = (0, stsApi_1.getPid)(processKey);
            return {
                type: "local",
                processKey,
                processName,
                pid
            };
        }
        else {
            return payload;
        }
    });
}
//# sourceMappingURL=LiveDataController.js.map