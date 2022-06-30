import { LanguageClient } from "vscode-languageclient/node";
import { ExtensionAPI } from "./api";
export declare class ApiManager {
    api: ExtensionAPI;
    private onDidLiveProcessConnectEmitter;
    private onDidLiveProcessDisconnectEmitter;
    private onDidLiveProcessUpdateEmitter;
    constructor(client: LanguageClient);
}
