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
const CommandDatabase_1 = require("../types/CommandDatabase");
function default_1(snapshot) {
    snapshot.implement('help', (query) => __awaiter(this, void 0, void 0, function* () {
        const db = CommandDatabase_1.getCommandDatabase(query);
        const lines = [];
        const commands = [];
        for (const commandName in db.byName) {
            const command = db.byName[commandName];
            if (command.notForHumans)
                continue;
            commands.push(commandName);
        }
        commands.sort();
        query.respond({ title: "Available commands:", items: commands });
    }));
}
exports.default = default_1;
//# sourceMappingURL=help.js.map