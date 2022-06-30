"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveProcess = void 0;
const apps_1 = require("../views/apps");
class LiveProcess {
    constructor(liveProcess) {
        this.liveProcess = liveProcess;
    }
    get processKey() {
        return this.liveProcess.processKey;
    }
    get pid() {
        return this.liveProcess.pid;
    }
    get appName() {
        var _a;
        const mainClass = this.liveProcess.processName;
        const runningApp = apps_1.appsProvider.manager.getAppByMainClass(mainClass);
        return (_a = runningApp === null || runningApp === void 0 ? void 0 : runningApp.name) !== null && _a !== void 0 ? _a : mainClass;
    }
}
exports.LiveProcess = LiveProcess;
//# sourceMappingURL=liveProcess.js.map