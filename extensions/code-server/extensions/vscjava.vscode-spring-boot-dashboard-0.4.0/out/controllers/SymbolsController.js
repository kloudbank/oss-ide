"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
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
exports.initSymbols = void 0;
const symbols_1 = require("../models/symbols");
const apps_1 = require("../views/apps");
const beans_1 = require("../views/beans");
const mappings_1 = require("../views/mappings");
function initSymbols(maxTimeout, refresh) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, symbols_1.init)(maxTimeout);
        apps_1.appsProvider.manager.getAppList().forEach(app => {
            if (refresh) {
                mappings_1.mappingsProvider.refreshStatic(app, (0, symbols_1.getMappings)(app.path));
                beans_1.beansProvider.refreshStatic(app, (0, symbols_1.getBeans)(app.path));
            }
            else {
                mappings_1.mappingsProvider.updateStaticData(app, (0, symbols_1.getMappings)(app.path));
                beans_1.beansProvider.updateStaticData(app, (0, symbols_1.getBeans)(app.path));
            }
        });
    });
}
exports.initSymbols = initSymbols;
//# sourceMappingURL=SymbolsController.js.map