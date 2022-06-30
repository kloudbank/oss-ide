"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDebugSupport = void 0;
const path = __importStar(require("path"));
const VSCode = __importStar(require("vscode"));
const vscode_1 = require("vscode");
const ps_list_1 = __importDefault(require("ps-list"));
const launch_util_1 = require("@pivotal-tools/commons-vscode/lib/launch-util");
const JMX_VM_ARG = '-Dspring.jmx.enabled=';
const ADMIN_VM_ARG = '-Dspring.application.admin.enabled=';
const BOOT_PROJECT_ARG = '-Dspring.boot.project.name=';
class SpringBootDebugConfigProvider {
    resolveDebugConfigurationWithSubstitutedVariables(folder, debugConfiguration, token) {
        if (isActuatorOnClasspath(debugConfiguration)) {
            if (debugConfiguration.vmArgs) {
                if (debugConfiguration.vmArgs.indexOf(JMX_VM_ARG) < 0) {
                    debugConfiguration.vmArgs += ` ${JMX_VM_ARG}true`;
                }
                if (debugConfiguration.vmArgs.indexOf(ADMIN_VM_ARG) < 0) {
                    debugConfiguration.vmArgs += ` ${ADMIN_VM_ARG}true`;
                }
                if (debugConfiguration.vmArgs.indexOf(BOOT_PROJECT_ARG) < 0) {
                    debugConfiguration.vmArgs += ` ${BOOT_PROJECT_ARG}${debugConfiguration.projectName}`;
                }
            }
            else {
                debugConfiguration.vmArgs = `${JMX_VM_ARG}true ${ADMIN_VM_ARG}true ${BOOT_PROJECT_ARG}${debugConfiguration.projectName}`;
            }
        }
        return debugConfiguration;
    }
}
function hookListenerToBooleanPreference(setting, listenerCreator) {
    const listenableSetting = new launch_util_1.ListenablePreferenceSetting(setting);
    let listener = listenableSetting.value ? listenerCreator() : undefined;
    listenableSetting.onDidChangeValue(() => {
        if (listenableSetting.value) {
            if (!listener) {
                listener = listenerCreator();
            }
        }
        else {
            if (listener) {
                listener.dispose();
                listener = undefined;
            }
        }
    });
    return {
        dispose: () => {
            if (listener) {
                listener.dispose();
            }
            listenableSetting.dispose();
        }
    };
}
function startDebugSupport() {
    return hookListenerToBooleanPreference('boot-java.live-information.automatic-connection.on', () => vscode_1.Disposable.from(VSCode.debug.onDidReceiveDebugSessionCustomEvent(handleCustomDebugEvent), VSCode.debug.registerDebugConfigurationProvider('java', new SpringBootDebugConfigProvider(), VSCode.DebugConfigurationProviderTriggerKind.Initial)));
}
exports.startDebugSupport = startDebugSupport;
function handleCustomDebugEvent(e) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (((_a = e.session) === null || _a === void 0 ? void 0 : _a.type) === 'java' && ((_b = e === null || e === void 0 ? void 0 : e.body) === null || _b === void 0 ? void 0 : _b.type) === 'processid') {
            const debugConfiguration = e.session.configuration;
            if (canConnect(debugConfiguration)) {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    const pid = yield getAppPid(e.body);
                    const processKey = pid.toString();
                    VSCode.commands.executeCommand('sts/livedata/connect', { processKey });
                }), 500);
            }
        }
    });
}
function getAppPid(e) {
    return __awaiter(this, void 0, void 0, function* () {
        if (e.pid) {
            return e.pid;
        }
        else if (e.shellProcessId) {
            const processes = yield (0, ps_list_1.default)();
            const appProcess = processes.find(p => p.ppid === e.shellProcessId);
            if (appProcess) {
                return appProcess.pid;
            }
            throw Error(`No child process found for parent shell process with pid = ${e.shellProcessId}`);
        }
        else {
            throw Error('No pid or parent shell process id available');
        }
    });
}
function isActuatorOnClasspath(debugConfiguration) {
    if (Array.isArray(debugConfiguration.classPaths)) {
        return !!debugConfiguration.classPaths.find(isActuatorJarFile);
    }
    return false;
}
function isActuatorJarFile(f) {
    const fileName = path.basename(f || "");
    if (/^spring-boot-actuator-\d+\.\d+\.\d+(.*)?.jar$/.test(fileName)) {
        return true;
    }
    return false;
}
function canConnect(debugConfiguration) {
    if (isActuatorOnClasspath(debugConfiguration)) {
        return debugConfiguration.vmArgs
            && debugConfiguration.vmArgs.indexOf(`${JMX_VM_ARG}true`) >= 0
            && debugConfiguration.vmArgs.indexOf(`${ADMIN_VM_ARG}true`) >= 0;
    }
    return false;
}
//# sourceMappingURL=debug-config-provider.js.map