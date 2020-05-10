"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function default_1(query) {
    query.snapshot.modifyGlobal('lastIncompleteClause', (value) => {
        if (query.command === 'eof')
            return null;
        if (query.isIncomplete) {
            return utils_1.freeze(query.syntax);
        }
        if (query.syntax.indent > 0)
            return value;
        return null;
    });
}
exports.default = default_1;
//# sourceMappingURL=lastIncompleteClause.js.map