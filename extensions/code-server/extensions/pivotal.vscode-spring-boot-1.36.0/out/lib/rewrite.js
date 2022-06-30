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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const VSCode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function getWorkspaceFolderName(file) {
    if (file) {
        const wf = VSCode.workspace.getWorkspaceFolder(file);
        if (wf) {
            return wf.name;
        }
    }
    return '';
}
function getRelativePathToWorkspaceFolder(file) {
    if (file) {
        const wf = VSCode.workspace.getWorkspaceFolder(file);
        if (wf) {
            return path.relative(wf.uri.fsPath, file.fsPath);
        }
    }
    return '';
}
function getTargetPomXml() {
    return __awaiter(this, void 0, void 0, function* () {
        if (VSCode.window.activeTextEditor) {
            const activeUri = VSCode.window.activeTextEditor.document.uri;
            if ("pom.xml" === path.basename(activeUri.path).toLowerCase()) {
                return activeUri;
            }
        }
        const candidates = yield VSCode.workspace.findFiles("**/pom.xml");
        if (candidates.length > 0) {
            if (candidates.length === 1) {
                return candidates[0];
            }
            else {
                return yield VSCode.window.showQuickPick(candidates.map((c) => ({ value: c, label: getRelativePathToWorkspaceFolder(c), description: getWorkspaceFolderName(c) })), { placeHolder: "Select the target project." }).then(res => res && res.value);
            }
        }
        return undefined;
    });
}
const ROOT_RECIPES_BUTTON = {
    iconPath: new VSCode.ThemeIcon('home'),
    tooltip: 'Root Recipes'
};
const SUB_RECIPES_BUTTON = {
    iconPath: new VSCode.ThemeIcon('type-hierarchy'),
    tooltip: 'Sub-Recipes'
};
function liveHoverConnectHandler(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uri) {
            uri = yield getTargetPomXml();
        }
        const cmds = yield VSCode.commands.executeCommand('sts/rewrite/list', uri.toString(true));
        const choices = cmds.map(convertToQuickPickItem);
        yield showCurrentPathQuickPick(choices, []);
        const recipeDescriptors = choices.filter(i => i.selected).map(convertToRecipeDescriptor);
        if (recipeDescriptors.length) {
            const aggregateRecipeDescriptor = recipeDescriptors.length === 1 ? recipeDescriptors[0] : {
                name: `${recipeDescriptors.length} recipes`,
                displayName: `${recipeDescriptors.length} recipes`,
                description: recipeDescriptors.map(d => d.description).join('\n'),
                tags: [...new Set(recipeDescriptors.flatMap(d => d.tags))],
                languages: [...new Set(recipeDescriptors.flatMap(d => d.languages))],
                options: [],
                recipeList: recipeDescriptors,
                estimatedEffortPerOccurrence: recipeDescriptors.filter(d => d.estimatedEffortPerOccurrence).map(d => d.estimatedEffortPerOccurrence).reduce((p, c) => p + c, 0)
            };
            if (aggregateRecipeDescriptor.estimatedEffortPerOccurrence === 0) {
                delete aggregateRecipeDescriptor.estimatedEffortPerOccurrence;
            }
            VSCode.commands.executeCommand('sts/rewrite/execute', uri.toString(true), aggregateRecipeDescriptor);
        }
        else {
            VSCode.window.showErrorMessage('No Recipes were selected!');
        }
    });
}
function convertToRecipeDescriptor(i) {
    return Object.assign(Object.assign({}, i.recipeDescriptor), { recipeList: i.children.filter(c => c.selected).map(convertToRecipeDescriptor) });
}
function convertToQuickPickItem(i) {
    return {
        id: i.name,
        label: i.displayName,
        detail: i.options.filter(o => !!o.value).map(o => `${o.name}: ${JSON.stringify(o.value)}`).join('\n\n'),
        description: i.description,
        selected: false,
        children: i.recipeList ? i.recipeList.map(convertToQuickPickItem) : [],
        buttons: i.recipeList && i.recipeList.length ? [SUB_RECIPES_BUTTON] : undefined,
        recipeDescriptor: i
    };
}
function showCurrentPathQuickPick(items, itemsPath) {
    return new Promise((resolve, reject) => {
        let currentItems = items;
        let parent;
        itemsPath.forEach(p => {
            parent = currentItems.find(i => i === p);
            currentItems = parent.children;
        });
        const quickPick = VSCode.window.createQuickPick();
        quickPick.items = currentItems;
        quickPick.title = 'Select Recipes';
        quickPick.canSelectMany = true;
        if (itemsPath.length) {
            quickPick.buttons = [ROOT_RECIPES_BUTTON];
        }
        quickPick.selectedItems = currentItems.filter(i => i.selected);
        quickPick.onDidTriggerItemButton(e => {
            if (e.button === SUB_RECIPES_BUTTON) {
                currentItems.forEach(i => i.selected = quickPick.selectedItems.includes(i));
                itemsPath.push(e.item);
                showCurrentPathQuickPick(items, itemsPath).then(resolve, reject);
            }
        });
        quickPick.onDidTriggerButton(b => {
            if (b === ROOT_RECIPES_BUTTON) {
                currentItems.forEach(i => i.selected = quickPick.selectedItems.includes(i));
                itemsPath.splice(0, itemsPath.length);
                showCurrentPathQuickPick(items, itemsPath).then(resolve, reject);
            }
        });
        quickPick.onDidAccept(() => {
            currentItems.forEach(i => i.selected = quickPick.selectedItems.includes(i));
            if (itemsPath.length) {
                itemsPath.pop();
                showCurrentPathQuickPick(items, itemsPath).then(resolve, reject);
            }
            else {
                quickPick.hide();
                resolve();
            }
        });
        quickPick.onDidChangeSelection(selected => {
            currentItems.forEach(i => {
                const isSelectedItem = selected.includes(i);
                if (i.selected !== isSelectedItem) {
                    selectItemRecursively(i, isSelectedItem);
                }
            });
            updateParentSelection(itemsPath.slice());
        });
        quickPick.show();
    });
}
function updateParentSelection(hierarchy) {
    if (hierarchy.length) {
        const parent = hierarchy.pop();
        const isSelected = !!parent.children.find(i => i.selected);
        if (parent.selected !== isSelected) {
            parent.selected = isSelected;
            updateParentSelection(hierarchy);
        }
    }
}
function selectItemRecursively(i, isSelectedItem) {
    i.selected = isSelectedItem;
    if (i.children) {
        i.children.forEach(c => selectItemRecursively(c, isSelectedItem));
    }
}
/** Called when extension is activated */
function activate(client, options, context) {
    context.subscriptions.push(VSCode.commands.registerCommand('vscode-spring-boot.rewrite.list', liveHoverConnectHandler));
}
exports.activate = activate;
//# sourceMappingURL=rewrite.js.map