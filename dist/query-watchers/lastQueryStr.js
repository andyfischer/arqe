"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(query) {
    const str = query.syntax.originalStr;
    query.snapshot.globalScope.set('lastQueryStr', query.snapshot.globalScope.getOptional('thisQueryStr', null));
    query.snapshot.globalScope.set('thisQueryStr', str);
}
exports.default = default_1;
//# sourceMappingURL=lastQueryStr.js.map