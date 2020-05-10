"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../storage");
function default_1(query) {
    if (query.type === 'relation' && query.isInteractive) {
        storage_1.appendToLog('facts', query.syntax.originalStr);
    }
}
exports.default = default_1;
//# sourceMappingURL=writeFactsToLog.js.map