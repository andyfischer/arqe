"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function default_1(snapshot) {
    snapshot.implement('def-function', (query) => {
        const name = query.args[0];
        query.snapshot.modifyGlobal('functionDatabase', (db) => {
            if (!db) {
                db = {
                    byName: {}
                };
            }
            if (db.byName[name]) {
                utils_1.print('warning: function already defined: ' + name);
                return db;
            }
            db.byName[name] = {
                name
            };
            return db;
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=def-function.js.map