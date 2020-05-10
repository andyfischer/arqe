"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const CommandDatabase_1 = require("../types/CommandDatabase");
function default_1(snapshot) {
    snapshot.implement('define-toggle', (query) => __awaiter(this, void 0, void 0, function* () {
        const enableCommand = query.get('name');
        const db = CommandDatabase_1.getCommandDatabase(query);
        if (!enableCommand.startsWith('enable-')) {
            query.respond(__1.error("define-toggle command should start with 'enable-'"));
            return;
        }
        const disableCommand = enableCommand.replace('enable-', 'disable-');
        db.byName[enableCommand] = {
            name: enableCommand,
            args: {},
            mainArgs: [],
            run: (query) => {
                query.respond({
                    effects: [{ type: 'assign-global', name: enableCommand, value: true }],
                    message: `set ${enableCommand} to true`
                });
            }
        };
        db.byName[disableCommand] = {
            name: disableCommand,
            mainArgs: [],
            args: {},
            run: (query) => {
                query.respond({
                    effects: [{ type: 'assign-global', name: enableCommand, value: false }],
                    message: `set ${enableCommand} to false`
                });
            }
        };
        query.respond(__1.done());
    }));
}
exports.default = default_1;
//# sourceMappingURL=define-toggle.js.map