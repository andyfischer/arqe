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
const utils_1 = require("../utils");
function default_1(snapshot) {
    snapshot.implement('def-type', (query) => __awaiter(this, void 0, void 0, function* () {
        const name = query.args[0];
        query.snapshot.modifyGlobal('typeDatabase', (db) => {
            if (!db) {
                db = {
                    byName: {}
                };
            }
            if (db.byName[name]) {
                utils_1.print('warning: type already defined: ' + name);
                return db;
            }
            db.byName[name] = {
                name
            };
            return db;
        });
    }));
}
exports.default = default_1;
//# sourceMappingURL=def-type.js.map