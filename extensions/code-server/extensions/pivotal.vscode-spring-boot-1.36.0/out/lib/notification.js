"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveProcessUpdatedNotification = exports.LiveProcessDisconnectedNotification = exports.LiveProcessConnectedNotification = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
var LiveProcessConnectedNotification;
(function (LiveProcessConnectedNotification) {
    LiveProcessConnectedNotification.type = new vscode_languageclient_1.NotificationType('sts/liveprocess/connected');
})(LiveProcessConnectedNotification = exports.LiveProcessConnectedNotification || (exports.LiveProcessConnectedNotification = {}));
var LiveProcessDisconnectedNotification;
(function (LiveProcessDisconnectedNotification) {
    LiveProcessDisconnectedNotification.type = new vscode_languageclient_1.NotificationType('sts/liveprocess/disconnected');
})(LiveProcessDisconnectedNotification = exports.LiveProcessDisconnectedNotification || (exports.LiveProcessDisconnectedNotification = {}));
var LiveProcessUpdatedNotification;
(function (LiveProcessUpdatedNotification) {
    LiveProcessUpdatedNotification.type = new vscode_languageclient_1.NotificationType('sts/liveprocess/updated');
})(LiveProcessUpdatedNotification = exports.LiveProcessUpdatedNotification || (exports.LiveProcessUpdatedNotification = {}));
//# sourceMappingURL=notification.js.map