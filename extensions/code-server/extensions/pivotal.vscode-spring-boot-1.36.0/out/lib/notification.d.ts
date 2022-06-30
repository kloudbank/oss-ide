import { NotificationType } from "vscode-languageclient";
/**
 * Common information provided by all live process notifications, for all types
 * of events and for all types of processes.
 */
export interface LiveProcess {
    type: string;
    processKey: string;
    processName: string;
}
/**
 * Specialized interface for type 'local' LiveProcess.
 */
export interface LocalLiveProcess extends LiveProcess {
    type: "local";
    pid: string;
}
export declare namespace LiveProcessConnectedNotification {
    const type: NotificationType<LiveProcess>;
}
export declare namespace LiveProcessDisconnectedNotification {
    const type: NotificationType<LiveProcess>;
}
export declare namespace LiveProcessUpdatedNotification {
    const type: NotificationType<LiveProcess>;
}
