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
exports.ApiManager = void 0;
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const notification_1 = require("./notification");
class ApiManager {
    constructor(client) {
        this.onDidLiveProcessConnectEmitter = new node_1.Emitter();
        this.onDidLiveProcessDisconnectEmitter = new node_1.Emitter();
        this.onDidLiveProcessUpdateEmitter = new node_1.Emitter();
        const onDidLiveProcessConnect = this.onDidLiveProcessConnectEmitter.event;
        const onDidLiveProcessDisconnect = this.onDidLiveProcessDisconnectEmitter.event;
        const onDidLiveProcessUpdate = this.onDidLiveProcessUpdateEmitter.event;
        const COMMAND_LIVEDATA_GET = "sts/livedata/get";
        const getLiveProcessData = (query) => __awaiter(this, void 0, void 0, function* () {
            return yield vscode_1.commands.executeCommand(COMMAND_LIVEDATA_GET, query);
        });
        const COMMAND_LIVEDATA_LIST_CONNECTED = "sts/livedata/listConnected";
        const listConnectedProcesses = () => __awaiter(this, void 0, void 0, function* () {
            return yield vscode_1.commands.executeCommand(COMMAND_LIVEDATA_LIST_CONNECTED);
        });
        client.onNotification(notification_1.LiveProcessConnectedNotification.type, (process) => this.onDidLiveProcessConnectEmitter.fire(process));
        client.onNotification(notification_1.LiveProcessDisconnectedNotification.type, (process) => this.onDidLiveProcessDisconnectEmitter.fire(process));
        client.onNotification(notification_1.LiveProcessUpdatedNotification.type, (process) => this.onDidLiveProcessUpdateEmitter.fire(process));
        this.api = {
            client,
            onDidLiveProcessConnect,
            onDidLiveProcessDisconnect,
            onDidLiveProcessUpdate,
            getLiveProcessData,
            listConnectedProcesses,
        };
    }
}
exports.ApiManager = ApiManager;
//# sourceMappingURL=apiManager.js.map