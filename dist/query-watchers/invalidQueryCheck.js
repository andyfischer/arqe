"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const SourcePos_1 = require("../types/SourcePos");
function default_1(query) {
    if (query.type === 'unknown') {
        let msg = `warning: unrecognized query: '${query.syntax.originalStr}'`;
        if (query.syntax.sourcePos && query.syntax.sourcePos.filename)
            msg += ` (from ${SourcePos_1.sourcePosToString(query.syntax.sourcePos)})`;
        utils_1.print(msg);
    }
}
exports.default = default_1;
//# sourceMappingURL=invalidQueryCheck.js.map