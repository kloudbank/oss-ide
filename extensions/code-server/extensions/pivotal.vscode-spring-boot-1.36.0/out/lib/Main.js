'use strict';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const OS = __importStar(require("os"));
const VSCode = __importStar(require("vscode"));
const vscode_1 = require("vscode");
const commons = __importStar(require("@pivotal-tools/commons-vscode"));
const liveHoverUi = __importStar(require("./live-hover-connect-ui"));
const rewrite = __importStar(require("./rewrite"));
const debug_config_provider_1 = require("./debug-config-provider");
const apiManager_1 = require("./apiManager");
const PROPERTIES_LANGUAGE_ID = "spring-boot-properties";
const YAML_LANGUAGE_ID = "spring-boot-properties-yaml";
const JAVA_LANGUAGE_ID = "java";
const XML_LANGUAGE_ID = "xml";
const NEVER_SHOW_AGAIN = "Do not show again";
/** Called when extension is activated */
function activate(context) {
    // registerPipelineGenerator(context);
    let options = {
        DEBUG: false,
        CONNECT_TO_LS: false,
        extensionId: 'vscode-spring-boot',
        preferJdk: true,
        checkjvm: (context, jvm) => {
            if (!jvm.isJdk()) {
                VSCode.window.showWarningMessage('JAVA_HOME or PATH environment variable seems to point to a JRE. A JDK is required, hence Boot Hints are unavailable.', NEVER_SHOW_AGAIN).then(selection => {
                    if (selection === NEVER_SHOW_AGAIN) {
                        options.workspaceOptions.update('checkJVM', false);
                    }
                });
            }
        },
        explodedLsJarData: {
            lsLocation: 'language-server',
            mainClass: 'org.springframework.ide.vscode.boot.app.BootLanguageServerBootApp',
            configFileName: 'application.properties'
        },
        workspaceOptions: VSCode.workspace.getConfiguration("spring-boot.ls"),
        clientOptions: {
            uriConverters: {
                code2Protocol: (uri) => {
                    /*
    * Workaround for docUri coming from vscode-languageclient on Windows
    *
    * It comes in as "file:///c%3A/Users/ab/spring-petclinic/src/main/java/org/springframework/samples/petclinic/owner/PetRepository.java"
    *
    * While symbols index would have this uri instead:
    * - "file:///C:/Users/ab/spring-petclinic/src/main/java/org/springframework/samples/petclinic/owner/PetRepository.java"
    *
    * i.e. lower vs upper case drive letter and escaped drive colon
    */
                    if (OS.platform() === "win32" && uri.scheme === 'file') {
                        let uriStr = uri.toString(true);
                        const idx = uriStr.indexOf(':', 5);
                        if (idx > 5 && idx < 10) {
                            uriStr = `${uriStr.substring(0, idx - 1)}${uriStr.charAt(idx - 1).toUpperCase()}${uriStr.substring(idx)}`;
                        }
                        return uriStr;
                    }
                    return uri.toString();
                },
                protocol2Code: uri => VSCode.Uri.parse(uri)
            },
            // See PT-158992999 as to why a scheme is added to the document selector
            // documentSelector: [ PROPERTIES_LANGUAGE_ID, YAML_LANGUAGE_ID, JAVA_LANGUAGE_ID ],
            documentSelector: [
                {
                    language: PROPERTIES_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: YAML_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: JAVA_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: JAVA_LANGUAGE_ID,
                    scheme: 'jdt'
                },
                {
                    language: XML_LANGUAGE_ID,
                    scheme: 'file'
                }
            ],
            synchronize: {
                configurationSection: 'boot-java'
            },
            initializationOptions: () => {
                var _a, _b;
                return ({
                    workspaceFolders: vscode_1.workspace.workspaceFolders ? vscode_1.workspace.workspaceFolders.map(f => f.uri.toString()) : null,
                    enableJdtClasspath: ((_b = (_a = VSCode.extensions.getExtension('redhat.java')) === null || _a === void 0 ? void 0 : _a.exports) === null || _b === void 0 ? void 0 : _b.serverMode) === 'Standard'
                });
            }
        },
        highlightCodeLensSettingKey: 'boot-java.highlight-codelens.on',
        vmArgs: [
            '--add-modules=ALL-SYSTEM',
            '--add-exports',
            'jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED',
            '--add-exports',
            'jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED',
            '--add-exports',
            'jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED',
            '--add-exports',
            'jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED',
            '--add-exports',
            'jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED',
            '--add-exports',
            'jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED'
        ]
    };
    // Register launch config contributior to java debug launch to be able to connect to JMX
    context.subscriptions.push((0, debug_config_provider_1.startDebugSupport)());
    return commons.activate(options, context).then(client => {
        liveHoverUi.activate(client, options, context);
        rewrite.activate(client, options, context);
        return new apiManager_1.ApiManager(client).api;
    });
}
exports.activate = activate;
//# sourceMappingURL=Main.js.map