"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Graph_1 = require("./Graph");
exports.Graph = Graph_1.default;
__export(require("./receivers"));
if (require.main === module) {
    require('./startServer.js');
}
//# sourceMappingURL=index.js.map